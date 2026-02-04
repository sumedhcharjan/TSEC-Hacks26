import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
        fetchStats();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/reports');
            setReports(response.data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            await api.patch(`/admin/reports/${reportId}`, { status: newStatus });
            toast.success('Status updated successfully!');
            fetchReports(); // Refresh list
            fetchStats(); // Refresh stats
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    const getRiskColor = (risk) => {
        if (risk >= 80) return 'bg-danger/20 text-danger';
        if (risk >= 50) return 'bg-accent/20 text-accent';
        return 'bg-success/20 text-success';
    };

    return (
        <>
            <Toaster position="top-center" />
            <div className="space-y-6">
                {/* Header */}
                <header className="bg-surface shadow-lg rounded-xl p-6">
                    <h1 className="text-3xl font-bold text-text-main">City Command Center</h1>
                    <p className="mt-2 text-sm text-text-muted">Overview of reported infrastructure issues</p>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
                        <p className="text-sm text-text-muted font-medium">Total Reports</p>
                        <p className="text-3xl font-bold text-primary mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
                        <p className="text-sm text-text-muted font-medium">Pending</p>
                        <p className="text-3xl font-bold text-accent mt-1">{stats.pending}</p>
                    </div>
                    <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
                        <p className="text-sm text-text-muted font-medium">In Progress</p>
                        <p className="text-3xl font-bold text-primary mt-1">{stats.inProgress}</p>
                    </div>
                    <div className="bg-surface p-6 rounded-xl shadow-sm border border-secondary/10">
                        <p className="text-sm text-text-muted font-medium">Resolved</p>
                        <p className="text-3xl font-bold text-success mt-1">{stats.resolved}</p>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-surface shadow-lg rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-secondary/10">
                        <h3 className="text-lg font-semibold text-text-main">
                            All Reports
                        </h3>
                    </div>
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-secondary/10">
                                <thead className="bg-background">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                            Reporter
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                            Risk Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-secondary/10">
                                    {reports.map((report) => (
                                        <tr key={report.id} className="hover:bg-background transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-text-main">{report.category}</div>
                                                <div className="text-sm text-text-muted">
                                                    {new Date(report.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-text-muted">
                                                    {report.profiles?.email || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-text-muted">
                                                    {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRiskColor(report.risk_score)}`}>
                                                    {report.risk_score}/100
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={report.status}
                                                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                                    className="text-sm border border-secondary/20 rounded-lg px-3 py-1 bg-surface focus:ring-2 focus:ring-primary outline-none"
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="RESOLVED">Resolved</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
