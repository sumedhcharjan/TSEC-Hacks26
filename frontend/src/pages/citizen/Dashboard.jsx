import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "react-router-dom";
import AnnouncementsFeed from "../../components/citizen/AnnouncementsFeed";

const CitizenDashboard = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/citizen/user/${user.id}`);
                setReports(response.data);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchReports();
        }
    }, [user]);

    const getStatusStyles = (status) => {
        const s = status?.toUpperCase();
        if (s === 'RESOLVED') return 'bg-status-success/10 text-status-success border-status-success/20';
        if (s === 'IN_PROGRESS' || s === 'REVIEW') return 'bg-status-warning/10 text-status-warning border-status-warning/20';
        return 'bg-accent-soft text-action border-action/20';
    };

    const getCategoryIcon = (category) => {
        if (category?.includes('Road')) return '🛣️';
        if (category?.includes('Water')) return '💧';
        if (category?.includes('Garbage')) return '🗑️';
        if (category?.includes('Streetlight')) return '💡';
        return '📑';
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Professional Sub-Header */}
            <div className="bg-white border-b border-border-subtle mb-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                            <div className="flex items-center gap-2 text-action font-black text-[9px] uppercase tracking-[0.25em] mb-3">
                                <span className="w-2 h-2 rounded-full bg-action animate-pulse"></span>
                                Tactical Citizen Feed
                            </div>
                            <h1 className="text-4xl font-black text-primary tracking-tight">
                                Welcome, <span className="text-action">{user?.email?.split('@')[0]}</span>
                            </h1>
                            <p className="text-text-muted font-bold mt-2 uppercase text-[9px] tracking-[0.2em] opacity-80">Official dashboard for urban infrastructure oversight</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/report/new"
                                className="bg-action text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-action/20 hover:bg-action/90 transition-all flex items-center gap-3"
                            >
                                <span className="text-xl">+</span>
                                File New Report
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
                {/* Stats Summary Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="civic-card p-8 flex items-center justify-between group shadow-xl shadow-primary/5">
                        <div>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.25em] mb-2">Total Contributions</p>
                            <p className="text-4xl font-black text-primary group-hover:text-action transition-colors tracking-tight">{reports.length}</p>
                        </div>
                        <div className="w-14 h-14 bg-accent-soft/50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📝</div>
                    </div>
                    <div className="civic-card p-8 flex items-center justify-between group shadow-xl shadow-primary/5">
                        <div>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.25em] mb-2">Active Resolving</p>
                            <p className="text-4xl font-black text-primary group-hover:text-action transition-colors tracking-tight">
                                {reports.filter(r => r.status === 'In Progress').length}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-accent-soft/50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">⚡</div>
                    </div>
                    <div className="civic-card p-8 bg-primary/95 text-white flex items-center justify-between shadow-2xl shadow-primary/10 backdrop-blur-sm">
                        <div>
                            <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.25em] mb-2">Registry Tier</p>
                            <p className="text-2xl font-black tracking-tight leading-none">Active Steward</p>
                        </div>
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">🏛️</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left: Feed */}
                    <div className="lg:col-span-4 space-y-6">
                        <AnnouncementsFeed />
                    </div>

                    {/* Right: Detailed Activity */}
                    <div className="lg:col-span-8">
                        <div className="civic-card overflow-hidden">
                            <div className="p-8 border-b border-border-subtle bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h2 className="text-lg font-black text-primary tracking-tight">Historical Activity Ledger</h2>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-tighter">
                                        <span className="w-2 h-2 rounded-full bg-status-success"></span> Resolved
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-tighter">
                                        <span className="w-2 h-2 rounded-full bg-status-warning"></span> In Review
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="p-20 flex flex-col items-center justify-center gap-4 animate-pulse">
                                    <div className="w-12 h-12 border-4 border-accent-soft border-t-action rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Hydrating Ledger...</p>
                                </div>
                            ) : reports.length > 0 ? (
                                <div className="divide-y divide-border-subtle">
                                    {reports.map((report) => (
                                        <div key={report.id} className="p-8 hover:bg-gray-50/50 transition-all group">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                                <div className="flex gap-6 flex-1">
                                                    <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm flex-shrink-0">
                                                        {getCategoryIcon(report.category)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="font-black text-primary tracking-tight group-hover:text-action transition-colors">{report.category}</h3>
                                                            <span className="text-[9px] font-bold text-text-muted bg-gray-100 px-2 py-0.5 rounded tracking-tighter uppercase">ID-{report.id.slice(0, 6)}</span>
                                                        </div>
                                                        <p className="text-sm text-text-muted font-medium italic mb-4 leading-relaxed line-clamp-2">"{report.description}"</p>
                                                        <div className="flex items-center gap-6 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                                            <span className="flex items-center gap-2"><span className="opacity-50">📍</span> {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}</span>
                                                            <span className="flex items-center gap-2"><span className="opacity-50">📅</span> {new Date(report.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(report.status)} whitespace-nowrap shadow-sm`}>
                                                    {report.status?.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-20 h-20 bg-accent-soft rounded-[30px] flex items-center justify-center mx-auto mb-6 text-4xl">📎</div>
                                    <h3 className="text-xl font-black text-primary mb-2 tracking-tight">Zero Activity Recorded</h3>
                                    <p className="text-text-muted font-medium mb-8 max-w-xs mx-auto">Your contributions to the city’s digital growth will appear here.</p>
                                    <Link to="/report/new" className="inline-flex items-center gap-2 text-action font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-all">
                                        Open First Report <span className="text-lg">→</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;
