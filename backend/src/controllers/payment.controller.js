const FinternetService = require('../services/finternet.service');
const supabase = require('../services/supabase');

const PaymentController = {
    /**
     * Initiates a Payment Intent for a specific work order
     */
    createIntentForWorkOrder: async (req, res) => {
        const { orderId } = req.params;
        const { amount, description } = req.body;

        try {
            // 1. Check if intent already exists in DB for this work order
            const { data: order, error: fetchError } = await supabase
                .from('work_orders')
                .select('finternet_intent_id, estimated_cost')
                .eq('id', orderId)
                .single();

            if (fetchError) throw fetchError;
            if (order.finternet_intent_id) {
                return res.status(400).json({ message: 'Payment intent already exists for this work order.' });
            }

            // 2. Call Finternet Service
            const intent = await FinternetService.createPaymentIntent({
                amount: (amount || order.estimated_cost).toString(),
                description: description || `Escrow for Work Order #${orderId}`,
                metadata: { orderId }
            });

            // 3. Store Payment Intent ID in DB
            const { error: updateError } = await supabase
                .from('work_orders')
                .update({ finternet_intent_id: intent.data.id })
                .eq('id', orderId);

            if (updateError) throw updateError;

            res.status(201).json(intent);
        } catch (error) {
            console.error('Create Intent Error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Syncs milestones from the work_order JSONB column to Finternet Escrow
     */
    syncMilestones: async (req, res) => {
        const { orderId } = req.params;

        try {
            // 1. Get work order and milestones from JSONB
            const { data: order, error: orderError } = await supabase
                .from('work_orders')
                .select('finternet_intent_id, milestones')
                .eq('id', orderId)
                .single();

            if (orderError || !order.finternet_intent_id) {
                return res.status(404).json({ message: 'Payment intent not found for this work order.' });
            }

            if (!order.milestones || !Array.isArray(order.milestones)) {
                return res.status(400).json({ message: 'No milestones found to synchronize.' });
            }

            // 2. Push each milestone to Finternet using its array index
            const syncResults = [];
            for (let i = 0; i < order.milestones.length; i++) {
                const ms = order.milestones[i];
                const result = await FinternetService.createMilestone(order.finternet_intent_id, {
                    milestoneIndex: i, // Use array index as Finternet milestone index
                    description: ms.title || `Phase ${i + 1}`,
                    amount: (ms.amount || 0).toString()
                });
                syncResults.push(result);
            }

            res.status(200).json({ message: 'Milestones synchronized with escrow', results: syncResults });
        } catch (error) {
            console.error('Milestone Sync Error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Submits proof for a milestone (indexed within the work_order array)
     */
    submitMilestoneProof: async (req, res) => {
        const { orderId, index } = req.params; // index is the milestone array position
        const { proofHash, proofURI, contractorAddress } = req.body;

        try {
            // 1. Fetch work order
            const { data: order, error: orderError } = await supabase
                .from('work_orders')
                .select('finternet_intent_id, milestones')
                .eq('id', orderId)
                .single();

            if (orderError || !order.finternet_intent_id) {
                return res.status(404).json({ message: 'Work order or Payment Intent not found.' });
            }

            const milestoneIndex = parseInt(index);
            if (isNaN(milestoneIndex) || !order.milestones[milestoneIndex]) {
                return res.status(400).json({ message: 'Invalid milestone index.' });
            }

            // 2. Submit proof to Finternet
            const result = await FinternetService.submitProof(order.finternet_intent_id, {
                proofHash,
                proofURI,
                submittedBy: contractorAddress
            });

            // 3. Update specific milestone status in JSONB array to 'REVIEW'
            const updatedMilestones = [...order.milestones];
            updatedMilestones[milestoneIndex].status = 'REVIEW';
            updatedMilestones[milestoneIndex].proof_submitted_at = new Date().toISOString();

            await supabase
                .from('work_orders')
                .update({ milestones: updatedMilestones })
                .eq('id', orderId);

            res.status(200).json({
                message: 'Proof submitted to escrow',
                finternetResponse: result,
                milestoneIndex
            });
        } catch (error) {
            console.error('Proof Submission Error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Fetches the global payment ledger entries
     */
    getLedger: async (req, res) => {
        try {
            const { limit, offset } = req.query;
            const ledger = await FinternetService.getLedgerEntries(limit, offset);
            res.status(200).json(ledger);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = PaymentController;
