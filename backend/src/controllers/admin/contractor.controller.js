const supabase = require('../../services/supabase');

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
        // Each milestone: { title, description, status: 'pending' }
        const formattedMilestones = milestones.map(m => ({
            title: m.title,
            description: m.description,
            status: 'pending'
        }));

        // 3. Insert into work_orders table
        const { data: workOrder, error: orderError } = await supabase
            .from('work_orders')
            .insert({
                report_id: reportId,
                contractor_id: contractorId,
                status: 'assigned',
                priority: priority || 'Medium',
                estimated_cost: parseFloat(estimatedCost),
                deadline: deadline || null,
                admin_notes: adminNotes || '',
                milestones: formattedMilestones
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 4. Update parent report status to 'IN_PROGRESS'
        const { error: updateError } = await supabase
            .from('reports')
            .update({ status: 'IN_PROGRESS' })
            .eq('id', reportId);

        if (updateError) console.warn('Note: Could not update report status:', updateError.message);

        res.json({
            success: true,
            message: 'Work order created successfully',
            workOrderId: workOrder.id
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
            .select('milestones, status, report_id')
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
