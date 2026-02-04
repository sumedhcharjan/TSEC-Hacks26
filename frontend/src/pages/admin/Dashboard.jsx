import React, { useEffect, useState } from 'react';
import HazardMap from '../../components/admin/HazardMap';
import DashboardStats from '../../components/admin/DashboardStats';
import { Toaster, toast } from 'react-hot-toast';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        active: 0,
        critical: 0,
        pending: 0,
        resolvedToday: 0
    });

    const [hazards, setHazards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', category: 'General' });

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [reportsRes, statsRes] = await Promise.all([
                api.get('/admin/reports'),
                api.get('/admin/stats')
            ]);

            const reportsData = reportsRes.data || [];
            const statsData = statsRes.data || {};

            const mappedHazards = reportsData
                .filter(report => report.latitude && report.longitude)
                .map(report => ({
                    id: report.id,
                    lat: parseFloat(report.latitude),
                    lng: parseFloat(report.longitude),
                    severity: parseInt(report.risk_score || 0),
                    type: report.category || 'Hazard',
                    status: report.status || 'UNKNOWN',
                    reportedAt: report.created_at || new Date().toISOString()
                }));

            setHazards(mappedHazards);

            const criticalCount = reportsData.filter(r => (r.risk_score || 0) >= 70 && r.status !== 'RESOLVED').length;
            const today = new Date().toISOString().split('T')[0];
            const resolvedTodayCount = reportsData.filter(r => r.status === 'RESOLVED' && r.created_at.startsWith(today)).length;

            setStats({
                active: (Number(statsData.inProgress) || 0) + (Number(statsData.pending) || 0),
                critical: criticalCount,
                pending: Number(statsData.pending) || 0,
                resolvedToday: resolvedTodayCount
            });

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            if (!loading) toast.error('Operational sync failed. Retrying...');
        }
    };

    return (
        <div className="min-h-screen pb-20">
            <Toaster position="top-right" />

            {/* Professional Management Header */}
            <div className="bg-white border-b border-border-subtle mb-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-action font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                            <span className="w-2 h-2 rounded-full bg-action animate-pulse"></span>
                            Operational Oversight
                        </div>
                        <h1 className="text-4xl font-black text-primary tracking-tight">
                            Administration <span className="text-action">Dashboard</span>
                        </h1>
                        <p className="text-text-muted font-medium mt-1 uppercase text-[10px] tracking-widest">Real-time city infrastructure control panel</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowAnnouncementModal(true)}
                            className="bg-primary text-white px-6 py-4 rounded-2xl font-bold tracking-tight shadow-xl shadow-primary/20 hover:bg-primary/90 hover:-translate-y-1 transition-all flex items-center gap-2"
                        >
                            <span>📢</span> Post Public Notice
                        </button>
                        <button
                            onClick={() => { setLoading(true); fetchData(); }}
                            className="p-4 bg-white border border-border-subtle rounded-2xl hover:bg-gray-50 transition-all text-text-muted"
                            title="Sync Data"
                        >
                            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/20 backdrop-blur-md p-6">
                    <div className="civic-card p-10 w-full max-w-lg shadow-2xl relative">
                        <button
                            onClick={() => setShowAnnouncementModal(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors text-text-muted"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-accent-soft rounded-2xl flex items-center justify-center text-2xl">📢</div>
                            <div>
                                <h2 className="text-2xl font-black text-primary tracking-tight">Public Notice</h2>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Broadcast to all citizen portals</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Notice Tier</label>
                                <select
                                    value={announcementForm.category}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                                    className="w-full bg-gray-50 border border-border-subtle rounded-xl px-4 py-3 font-bold text-primary focus:ring-4 focus:ring-action/10 outline-none transition-all"
                                >
                                    <option value="General">General Information</option>
                                    <option value="Critical">Critical Alert (High Priority)</option>
                                    <option value="Utility">Utility Update</option>
                                    <option value="Event">Municipal Event</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Subject Header</label>
                                <input
                                    type="text"
                                    value={announcementForm.title}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                    placeholder="Brief descriptive title..."
                                    className="w-full bg-gray-50 border border-border-subtle rounded-xl px-4 py-3 font-bold text-primary focus:ring-4 focus:ring-action/10 outline-none transition-all placeholder:font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Broadcast Message</label>
                                <textarea
                                    value={announcementForm.message}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                                    placeholder="Detailed information for the public..."
                                    rows="4"
                                    className="w-full bg-gray-50 border border-border-subtle rounded-xl px-4 py-3 font-bold text-primary focus:ring-4 focus:ring-action/10 outline-none transition-all placeholder:font-medium resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-10">
                            <button
                                onClick={async () => {
                                    if (!announcementForm.title || !announcementForm.message) return toast.error('Verification failure: missing fields');
                                    try {
                                        await api.post('/announcements', announcementForm);
                                        toast.success('Broadcast transmitted successfully.');
                                        setShowAnnouncementModal(false);
                                        setAnnouncementForm({ title: '', message: '', category: 'General' });
                                    } catch (e) {
                                        toast.error('Transmission failure.');
                                    }
                                }}
                                className="w-full py-4 bg-action text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-action/20 hover:bg-action/90 transition-all active:scale-[0.98]"
                            >
                                Dispatch Notice
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="px-6 lg:px-8 max-w-7xl mx-auto space-y-12 pb-20">
                <DashboardStats stats={stats} />

                {/* Professional Action Banner - Softened dominance */}
                <div className="bg-primary/95 backdrop-blur-sm p-12 rounded-[40px] shadow-2xl shadow-primary/10 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-6">
                                <span className="text-[9px] font-black text-white/80 uppercase tracking-[0.2em]">Strategic Infrastructure</span>
                            </div>
                            <h3 className="text-3xl font-black mb-4 text-white tracking-tight leading-tight">
                                AI-Powered Emergency <br /> Route Optimization
                            </h3>
                            <p className="text-white/60 font-medium leading-relaxed max-w-2xl">
                                Deploying advanced geospatial algorithms to synchronize emergency responder paths, navigating around infrastructure failure points in real-time.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/admin/emergency-routes')}
                            className="whitespace-nowrap bg-white text-primary px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-2xl flex items-center gap-3 group-hover:translate-x-1"
                        >
                            Launch Route Engine <ArrowRight size={16} />
                        </button>
                    </div>
                    {/* Architectural Accent - Softened */}
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-action/10 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-150"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-[700px]">
                    {/* Left: Tactical Map */}
                    <div className="lg:col-span-8 civic-card p-4 h-full relative group overflow-hidden">
                        <div className="absolute top-8 left-8 z-10 bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-[14px] text-[9px] font-black text-primary border border-border-subtle shadow-2xl flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-action animate-pulse shadow-[0_0_8px_rgba(30,111,217,0.5)]"></span>
                            <span className="uppercase tracking-[0.3em]">Operational Tactical Map</span>
                        </div>
                        <HazardMap hazards={hazards} />
                    </div>

                    {/* Right: Operational Feed */}
                    <div className="lg:col-span-4 civic-card flex flex-col h-full max-h-[700px]">
                        <div className="p-8 border-b border-border-subtle flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="font-black text-primary tracking-tight">Incident Ledger</h2>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">Live Response Priority</p>
                            </div>
                            <span className="text-[10px] font-black text-action bg-accent-soft/50 px-3 py-1 rounded-full border border-action/5">{hazards.length} ACTIVE</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{ maxHeight: 'calc(700px - 90px)' }}>
                            {loading && hazards.length === 0 ? (
                                <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="w-10 h-10 border-4 border-accent-soft border-t-action rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Synchronizing Feed...</p>
                                </div>
                            ) : (
                                hazards.sort((a, b) => b.severity - a.severity).map((hazard) => (
                                    <div key={hazard.id} className="p-5 bg-gray-50 border border-border-subtle rounded-2xl hover:bg-white hover:border-action/20 hover:shadow-xl hover:shadow-action/5 transition-all group cursor-pointer">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-black text-sm text-primary group-hover:text-action transition-colors">{hazard.type}</h3>
                                            <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-widest ${hazard.severity >= 70 ? 'bg-red-50 text-red-500 border border-red-100' :
                                                hazard.severity >= 50 ? 'bg-orange-50 text-orange-500 border border-orange-100' :
                                                    'bg-blue-50 text-action border border-blue-100'
                                                }`}>
                                                {hazard.severity}% RISK
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-[10px] font-bold text-text-muted space-y-1">
                                                <p className="flex items-center gap-1">🕒 {new Date(hazard.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className="flex items-center gap-1">📍 {hazard.lat?.toFixed(4)}, {hazard.lng?.toFixed(4)}</p>
                                            </div>
                                            <span className="text-[9px] font-black px-3 py-1.5 bg-white border border-border-subtle rounded-xl text-primary group-hover:border-action/20 transition-colors uppercase tracking-widest">
                                                {hazard.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;