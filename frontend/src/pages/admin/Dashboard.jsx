import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
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
            toast.success('Status updated successfully');
            fetchReports();
            fetchStats();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    const getRiskColor = (risk) => {
        if (risk >= 80) return 'bg-danger text-white';
        if (risk >= 50) return 'bg-warning text-white';
        return 'bg-success text-white';
    };

    const getCategoryIcon = (category) => {
        if (category?.includes('Road')) return '🛣️';
        if (category?.includes('Water')) return '💧';
        if (category?.includes('Garbage')) return '🗑️';
        if (category?.includes('Streetlight')) return '💡';
        if (category?.includes('Hazard')) return '⚠️';
        return '📍';
    };

    // Group reports by category and sort by risk_score (desc) then created_at (desc)
    const groupedReports = reports.reduce((acc, report) => {
        const category = report.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(report);
        return acc;
    }, {});

    // Sort reports within each category
    Object.keys(groupedReports).forEach(category => {
        groupedReports[category].sort((a, b) => {
            // Primary sort: risk_score (descending)
            if (b.risk_score !== a.risk_score) {
                return b.risk_score - a.risk_score;
            }
            // Secondary sort: created_at (descending - newest first)
            return new Date(b.created_at) - new Date(a.created_at);
        });
    });

    return (
        <>
            <Toaster position="top-center" />
            <div className="min-h-screen bg-surface">
                {/* Header */}
                <div className="bg-primary text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🏛️</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">City Command Center</h1>
                                <p className="text-white/80 mt-1">Monitor and manage infrastructure issues across the city</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-text-muted">Total Reports</span>
                                <span className="text-4xl font-bold text-primary mt-2">{stats.total}</span>
                                <span className="text-xs text-text-light mt-2">All time</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-text-muted">Pending Review</span>
                                <span className="text-4xl font-bold text-warning mt-2">{stats.pending}</span>
                                <span className="text-xs text-text-light mt-2">Requires attention</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-text-muted">In Progress</span>
                                <span className="text-4xl font-bold text-secondary mt-2">{stats.inProgress}</span>
                                <span className="text-xs text-text-light mt-2">Being resolved</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-text-muted">Resolved</span>
                                <span className="text-4xl font-bold text-success mt-2">{stats.resolved}</span>
                                <span className="text-xs text-text-light mt-2">Completed</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions / Emergency Finder */}
                    <div className="bg-gradient-to-r from-primary to-primary-hover p-8 rounded-2xl shadow-xl border border-white/10 text-white relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                    🚑 Emergency Route Finder
                                </h3>
                                <p className="text-white/80 max-w-xl">
                                    AI-powered route optimization for emergency services. Plan optimal paths by automatically avoiding current infrastructure incidents and congestion zones.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/emergency-routes')}
                                className="whitespace-nowrap bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-neutral-100 transition-all shadow-2xl flex items-center gap-2 group-hover:scale-105"
                            >
                                Launch Route Engine <ArrowRight size={18} />
                            </button>
                        </div>
                        {/* Background flare */}
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
                    </div>

                    {/* Category-Based Reports */}
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
                            <div className="w-12 h-12 border-4 border-accent border-t-secondary rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-text-muted">Loading reports...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.keys(groupedReports).map(category => (
                                <div key={category} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                                    {/* Category Header */}
                                    <div className="px-6 py-4 bg-surface border-b border-border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getCategoryIcon(category)}</span>
                                                <div>
                                                    <h2 className="text-lg font-semibold text-text-main">{category}</h2>
                                                    <p className="text-sm text-text-muted">
                                                        {groupedReports[category].length} report{groupedReports[category].length !== 1 ? 's' : ''}
                                                        • Sorted by priority
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-accent text-secondary text-xs font-medium rounded-full">
                                                    {groupedReports[category].filter(r => r.status === 'PENDING').length} Pending
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reports Grid/List */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                                        {groupedReports[category].map((report) => (
                                            <div key={report.id} className="group flex flex-col bg-white border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                                                {/* Report Image/Placeholder */}
                                                <div className="relative h-48 bg-accent overflow-hidden">
                                                    {report.image_url ? (
                                                        <img
                                                            src={report.image_url}
                                                            alt={report.category}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-secondary/30">
                                                            <span className="text-5xl mb-2">{getCategoryIcon(report.category)}</span>
                                                            <span className="text-xs font-medium uppercase tracking-wider">No Image Attached</span>
                                                        </div>
                                                    )}

                                                    {/* Risk Score Floating Badge */}
                                                    <div className="absolute top-3 right-3 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-white/95 backdrop-blur shadow-xl border-2 border-white">
                                                        <span className={`text-lg font-bold leading-none ${report.risk_score >= 80 ? 'text-danger' : report.risk_score >= 50 ? 'text-warning' : 'text-success'}`}>
                                                            {report.risk_score}
                                                        </span>
                                                        <span className="text-[9px] uppercase font-bold text-text-muted mt-0.5">Risk</span>
                                                    </div>

                                                    {/* Status Label Overlay */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/40 backdrop-blur-md`}>
                                                            {report.status?.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-5 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-secondary border border-secondary/10">
                                                                {report.profiles?.email?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-text-main leading-tight">
                                                                    {report.profiles?.email?.split('@')[0] || 'Unknown'}
                                                                </span>
                                                                <span className="text-[10px] text-text-muted">Reporter</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] font-bold text-text-muted bg-surface px-2 py-1 rounded uppercase tracking-tighter">
                                                            {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-text-main font-medium line-clamp-2 mb-6 h-10 leading-relaxed group-hover:text-secondary transition-colors">
                                                        {report.description || 'No description provided.'}
                                                    </p>

                                                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-text-muted group-hover:text-secondary transition-colors">
                                                            <div className="w-6 h-6 rounded bg-surface flex items-center justify-center text-xs">📍</div>
                                                            <span className="text-[11px] font-mono tracking-tighter">
                                                                {report.latitude?.toFixed(3)}, {report.longitude?.toFixed(3)}
                                                            </span>
                                                        </div>

                                                        <div className="relative group/select">
                                                            <select
                                                                value={report.status}
                                                                onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                                                className="text-[10px] font-black uppercase tracking-widest border border-border rounded-md pl-3 pr-8 py-2 bg-surface hover:bg-white hover:border-secondary transition-all cursor-pointer appearance-none outline-none focus:ring-4 focus:ring-secondary/10"
                                                            >
                                                                <option value="PENDING">Pending</option>
                                                                <option value="IN_PROGRESS">Working</option>
                                                                <option value="RESOLVED">Closed</option>
                                                            </select>
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-text-muted group-hover/select:text-secondary transition-colors">
                                                                ▼
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Bar Hover Gradient */}
                                                <div className="h-1.5 bg-gradient-to-r from-secondary to-primary w-0 group-hover:w-full transition-all duration-500 ease-in-out"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
