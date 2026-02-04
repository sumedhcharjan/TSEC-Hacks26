import React, { useEffect, useState } from 'react';
import HazardMap from '../../components/admin/HazardMap';
import DashboardStats from '../../components/admin/DashboardStats';
import { Toaster, toast } from 'react-hot-toast';
import api from '../../services/api';

const AdminDashboard = () => {
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
        // Poll every 5 seconds for real-time updates (faster than 30s)
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            // Parallel fetch for valid Dashboard performance
            // Also fetch latest announcements if needed, but for Admin Dash main view, we focus on stats/map
            const [reportsRes, statsRes] = await Promise.all([
                api.get('/admin/reports'),
                api.get('/admin/stats')
            ]);

            const reportsData = reportsRes.data || [];
            const statsData = statsRes.data || {};

            // Map Backend Reports to Hazard Map Format
            // CRITICAL FIX: Filter out reports with missing location data to prevent Map crash
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

            // Map Backend Stats to DashboardStats Format
            // Backend sends: { total, pending, resolved, inProgress }
            // DashboardStats expects: { active, critical, pending, resolvedToday }
            // We'll calculate derived stats where needed

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
            if (!loading) toast.error('Connection lost. Retrying...');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

            {/* Top Navigation Bar */}
            <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center justify-between px-4 sm:px-6 shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🏙️</span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
                        City<span className="text-blue-500">Watch</span> <span className="hidden sm:inline">Command Center</span>
                    </h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => setShowAnnouncementModal(true)}
                        className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-500 text-sm font-bold rounded shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                    >
                        <span>📢</span> <span className="hidden sm:inline">Post Announcement</span>
                    </button>
                    <button
                        onClick={() => { setLoading(true); fetchData(); }}
                        className="px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded transition-colors flex items-center gap-1"
                    >
                        <span>⟳</span> <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full text-xs">
                        <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></span>
                        <span className="text-gray-300">{loading ? 'Syncing...' : 'Live System'}</span>
                    </div>
                </div>
            </header>

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span>📢</span> Create Announcement
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                <select
                                    value={announcementForm.category}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="General">General</option>
                                    <option value="Critical">Critical (Red)</option>
                                    <option value="Utility">Utility (Yellow)</option>
                                    <option value="Event">Event</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={announcementForm.title}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                                    placeholder="e.g. Water Cut Notice"
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                                <textarea
                                    value={announcementForm.message}
                                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                                    placeholder="Enter the full announcement details..."
                                    rows="4"
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowAnnouncementModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!announcementForm.title || !announcementForm.message) return toast.error('Please fill all fields');
                                    try {
                                        await api.post('/announcements', announcementForm);
                                        toast.success('Announcement Posted!');
                                        setShowAnnouncementModal(false);
                                        setAnnouncementForm({ title: '', message: '', category: 'General' });
                                    } catch (e) {
                                        toast.error('Failed to post');
                                    }
                                }}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded shadow-lg transition-transform hover:scale-105"
                            >
                                Post Live
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="p-6 max-w-[1600px] mx-auto">
                <DashboardStats stats={stats} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
                    {/* Left Column: Map */}
                    <div className="lg:col-span-2 flex flex-col bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl relative group">
                        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-mono text-blue-400 border border-blue-500/30">
                            LIVE HAZARD FEED
                        </div>
                        <div className="flex-1 w-full h-full">
                            <HazardMap hazards={hazards} />
                        </div>
                    </div>

                    {/* Right Column: Recent Alerts / Feed */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col shadow-xl">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                            <h2 className="font-bold text-gray-200">Recent Alerts</h2>
                            <span className="text-xs text-gray-400">{hazards.length} Total</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {loading && hazards.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">Loading feed...</div>
                            ) : (
                                hazards.sort((a, b) => b.severity - a.severity).map((hazard) => (
                                    <div key={hazard.id} className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors border-l-4 border-transparent hover:border-blue-500 group cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-sm text-gray-200 group-hover:text-white">{hazard.type}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${hazard.severity >= 70 ? 'bg-red-500/20 text-red-400' :
                                                hazard.severity >= 50 ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {hazard.severity}% Risk
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="text-xs text-gray-500">
                                                <p>{new Date(hazard.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className="mt-0.5">{hazard.lat?.toFixed(4)}, {hazard.lng?.toFixed(4)}</p>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-gray-900 rounded text-gray-400 border border-gray-600">
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
