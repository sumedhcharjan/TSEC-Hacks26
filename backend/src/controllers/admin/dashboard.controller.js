const supabase = require('../../services/supabase');

// Get all reports for admin dashboard
const getAllReports = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select(`
                *,
                profiles:user_id (
                    email,
                    full_name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update report status (admin only)
const updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, risk_score } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (risk_score !== undefined) updateData.risk_score = risk_score;

        const { data, error } = await supabase
            .from('reports')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ success: true, report: data[0] });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        const { data: reports, error } = await supabase
            .from('reports')
            .select('status, risk_score');

        if (error) throw error;

        const stats = {
            total: reports.length,
            pending: reports.filter(r => r.status === 'PENDING').length,
            resolved: reports.filter(r => r.status === 'RESOLVED').length,
            inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
            avgRiskScore: reports.length > 0
                ? Math.round(reports.reduce((sum, r) => sum + (r.risk_score || 0), 0) / reports.length)
                : 0
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllReports,
    updateReportStatus,
    getDashboardStats
};
