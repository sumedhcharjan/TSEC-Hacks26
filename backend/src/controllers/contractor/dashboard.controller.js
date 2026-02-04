const supabase = require('../../services/supabase');
const FinternetService = require('../../services/finternet.service');

/**
 * Get aggregated data for the Contractor Dashboard
 * Expects 'user-id' in headers
 */
const getDashboardData = async (req, res) => {
    try {
        const contractorId = req.headers['user-id'];

        if (!contractorId) {
            return res.status(401).json({ error: 'Unauthorized: Missing user-id header' });
        }

        // 1. Fetch assigned orders with joined reports
        const { data: orders, error: ordersError } = await supabase
            .from('work_orders')
            .select(`
                *,
                finternet_intent_id,
                reports:report_id (*),
                contractor:profiles!contractor_id(full_name, email)
            `)
            .eq('contractor_id', contractorId)
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // 2. Calculate Statistics
        const stats = {
            total_earnings: orders
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + (parseFloat(o.estimated_cost) || 0), 0),
            pending_works: orders.filter(o => o.status !== 'completed').length,
            completed_works: orders.filter(o => o.status === 'completed').length,
            assigned_orders: orders
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching contractor dashboard:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update the status of a specific work order
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateData = { status };
        if (status === 'completed') {
            updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('work_orders')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;

        // If completed, optionally update the original report back to resolved?
        // For now, we'll keep it simple as requested.

        res.json({ success: true, order: data[0] });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Request verification for a specific milestone
 */
const requestMilestoneVerification = async (req, res) => {
    try {
        const { orderId, milestoneIndex, imageUrl } = req.body;

        // 1. Fetch current order
        const { data: order, error: fetchError } = await supabase
            .from('work_orders')
            .select('milestones')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) throw new Error('Work order not found');

        const milestones = [...order.milestones];
        if (!milestones[milestoneIndex]) throw new Error('Milestone index out of bounds');

        // 2. Update status to 'review' and store image locally
        milestones[milestoneIndex].status = 'review';
        milestones[milestoneIndex].evidence_url = imageUrl || null;

        const { error: updateError } = await supabase
            .from('work_orders')
            .update({ milestones })
            .eq('id', orderId);

        if (updateError) throw updateError;
        console.log(`📤 [DB] Work Order ${orderId} milestone ${milestoneIndex} updated to 'review'.`);

        // 💰 FINRENET INTEGRATION: Trigger Proof Submission automatically
        if (order.finternet_intent_id) {
            try {
                console.log(`📡 [Finternet] Triggering automated proof submission for internal verification request...`);
                await FinternetService.submitProof(order.finternet_intent_id, {
                    proofHash: `0x${Buffer.from(imageUrl || 'default_evidence').toString('hex').slice(0, 32)}`,
                    proofURI: imageUrl || 'https://city.gov/evidence/pending',
                    submittedBy: order.contractor_id || 'contractor_anonymous'
                });
                console.log(`✅ [Finternet] Proof submission successful for intent: ${order.finternet_intent_id}`);
            } catch (finError) {
                console.error(`⚠️ [Finternet] Automated proof submission failed (non-critical):`, finError.message);
            }
        }

        res.json({ success: true, message: 'Verification requested with evidence' });
    } catch (error) {
        console.error('Error requesting verification:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getDashboardData,
    updateOrderStatus,
    requestMilestoneVerification
};
