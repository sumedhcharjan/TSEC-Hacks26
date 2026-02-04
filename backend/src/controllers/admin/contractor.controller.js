const supabase = require('../../services/supabase');
const FinternetService = require('../../services/finternet.service');

// Fetch all profiles with the 'contractor' role
const getContractors = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .eq('role', 'contractor');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching contractors:', error);
        res.status(500).json({ error: error.message });
    }
};

// Assign work to a contractor via work_orders table
const assignWork = async (req, res) => {
    try {
        const {
            reportId,
            contractorId,
            milestones,
            estimatedCost,
            priority,
            deadline,
            adminNotes
        } = req.body;

        // 1. Verify report existence
        const { data: report, error: reportError } = await supabase
            .from('reports')
            .select('*')
            .eq('id', reportId)
            .single();

        if (reportError || !report) throw new Error('Report not found');

        // 2. Format milestones for the JSONB column
        const formattedMilestones = milestones.map(m => ({
            title: m.title,
            description: m.description,
            status: 'pending'
        }));

        console.log(`🏦 [Finternet] Generating Payment Intent for Infrastructure: ${report.category} #${reportId}`);

        // 🚀 CRITICAL STEP: Create Finternet Intent BEFORE DB Insert
        let intentId = null;
        let escrowId = null;
        try {
            const intentResponse = await FinternetService.createPaymentIntent({
                amount: estimatedCost.toString(),
                description: `Infrastructure Escrow: ${report.category} #${reportId}`,
                metadata: { reportId }
            });

            // Robust extraction: Check both 'data' wrapper and root
            intentId = intentResponse.data?.id || intentResponse.id;
            escrowId = intentResponse.data?.escrowId || intentResponse.escrowId || null;

            console.log(`✨ [Finternet] Success! Raw Response received.`);
            console.log(`   🔸 Extracted Intent ID: [${intentId}]`);
            console.log(`   🔸 Extracted Escrow ID: [${escrowId}]`);
        } catch (finError) {
            console.error('⚠️ [Finternet] Integration system unreachable:', finError.message);
        }

        // 3. Atomic Insert into work_orders table
        console.log(`🔄 [DB] Preparing Atomic Insert for Work Order...`);
        const insertObject = {
            report_id: reportId,
            contractor_id: contractorId,
            status: 'assigned',
            priority: priority || 'Medium',
            estimated_cost: parseFloat(estimatedCost),
            deadline: deadline || null,
            admin_notes: adminNotes || '',
            milestones: formattedMilestones,
            finternet_intent_id: intentId,
            finternet_escrow_id: escrowId
        };

        console.log(`📝 [DB] Insert Paylod:`, JSON.stringify({ ...insertObject, milestones: '...' }, null, 2));

        const { data: workOrder, error: orderError } = await supabase
            .from('work_orders')
            .insert(insertObject)
            .select()
            .single();

        if (orderError) {
            console.error('❌ [DB] Work Order Insertion FAILED:', orderError);
            throw orderError;
        }

        console.log(`✅ [DB] Work Order ${workOrder.id} successfully persisted.`);
        console.log(`   🔸 Saved IDs - Intent: ${workOrder.finternet_intent_id}, Escrow: ${workOrder.finternet_escrow_id}`);

        if (!workOrder.finternet_intent_id && intentId) {
            console.warn(`🚨 [DB] DESYNC DETECTED: Intent ID was provided but not saved in returned record!`);
        }

        // 4. Update parent report status to 'IN_PROGRESS'
        await supabase
            .from('reports')
            .update({ status: 'IN_PROGRESS' })
            .eq('id', reportId);

        // 🚀 SYNC MILESTONES: Programming the Escrow Container
        if (intentId) {
            try {
                console.log(`📋 [Finternet] Programming ${formattedMilestones.length} milestones into escrow...`);
                for (let i = 0; i < formattedMilestones.length; i++) {
                    await FinternetService.createMilestone(intentId, {
                        milestoneIndex: i,
                        description: formattedMilestones[i].title,
                        amount: (estimatedCost / formattedMilestones.length).toFixed(2)
                    });
                    console.log(`   🔸 Phase [${i}] Locked: ${formattedMilestones[i].title}`);
                }
                console.log(`✅ [Finternet] Escrow Container Fully Programmed.`);
            } catch (msError) {
                console.error('❌ [Finternet] Milestone sync failed (manual sync required):', msError.message);
            }
        }

        res.json({
            success: true,
            message: intentId ? 'Work order created and escrow programmed' : 'Work order created (Escrow Offline)',
            workOrderId: workOrder.id,
            finternet_intent_id: intentId
        });
    } catch (error) {
        console.error('Error assigning work order:', error);
        res.status(500).json({ error: error.message });
    }
};

const approveMilestone = async (req, res) => {
    try {
        const { orderId, milestoneIndex } = req.body;

        // 1. Fetch current order
        const { data: order, error: fetchError } = await supabase
            .from('work_orders')
            .select('milestones, status, report_id, finternet_intent_id')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) throw new Error('Work order not found');

        const milestones = [...order.milestones];
        if (!milestones[milestoneIndex]) throw new Error('Milestone index out of bounds');

        // 2. Update status
        milestones[milestoneIndex].status = 'completed';

        // 3. Check if all completed
        const allCompleted = milestones.every(m => m.status === 'completed');
        const finalStatus = allCompleted ? 'completed' : order.status;

        const { error: updateError } = await supabase
            .from('work_orders')
            .update({
                milestones,
                status: finalStatus,
                completed_at: allCompleted ? new Date().toISOString() : null
            })
            .eq('id', orderId);

        if (updateError) throw updateError;
        console.log(`✅ [DB] Milestone index ${milestoneIndex} for Work Order ${orderId} marked COMPLETED.`);

        // 💰 FINRENET INTEGRATION: Trigger actual fund release
        if (order.finternet_intent_id) {
            try {
                console.log(`📡 [Finternet] Finalising payment for milestone ${milestoneIndex}...`);
                await FinternetService.settleMilestone(order.finternet_intent_id, milestoneIndex);
                console.log(`✅ [Finternet] Funds released for milestone ${milestoneIndex}.`);
            } catch (finError) {
                console.error(`⚠️ [Finternet] Milestone settlement failed:`, finError.message);
                // We don't throw here to ensure DB consistency remains, but admin might need manual sync
            }
        }

        res.json({ success: true, allCompleted });
    } catch (error) {
        console.error('Error approving milestone:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getContractors,
    assignWork,
    approveMilestone
};
