import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthProvider';
import { Toaster, toast } from 'react-hot-toast';

const ContractorDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/contractor/dashboard', {
                    headers: { 'user-id': user.id }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboard();
    }, [user]);

    const handleRequestVerification = async (orderId, milestoneIndex) => {
        try {
            await api.post('/contractor/verify-milestone', { orderId, milestoneIndex });
            toast.success('Verification request sent to admin');

            // Refresh data
            const response = await api.get('/contractor/dashboard', {
                headers: { 'user-id': user.id }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Verification request error:', error);
            toast.error('Failed to send verification request');
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading dashboard...</div>;
    if (!stats) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">No data available</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-6">
            <Toaster position="top-right" />

            <header className="mb-10 border-b border-gray-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Contractor <span className="text-blue-500">Mission Control</span></h1>
                    <p className="text-gray-400 mt-1 font-medium italic">Active Field Operations for {user?.email}</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-blue-600 px-4 py-2 rounded-xl shadow-lg shadow-blue-900/20 flex flex-col items-center justify-center">
                        <span className="text-[10px] uppercase font-black text-blue-100">Status</span>
                        <span className="text-xs font-bold">ON DUTY</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-2xl transition-transform hover:scale-[1.02]">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Total Earnings</p>
                        <p className="text-4xl font-black text-green-400 mt-2">${stats.total_earnings?.toLocaleString()}</p>
                        <div className="w-full h-1 bg-green-900/30 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-green-400 w-2/3"></div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-2xl transition-transform hover:scale-[1.02]">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Active Jobs</p>
                        <p className="text-4xl font-black text-yellow-400 mt-2">{stats.pending_works}</p>
                        <div className="w-full h-1 bg-yellow-900/30 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-yellow-400 w-1/3"></div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-2xl transition-transform hover:scale-[1.02]">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Completed</p>
                        <p className="text-4xl font-black text-blue-400 mt-2">{stats.completed_works}</p>
                        <div className="w-full h-1 bg-blue-900/30 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-blue-400 w-full"></div>
                        </div>
                    </div>
                </div>

                {/* Assignment Feed */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black tracking-tight">Current Deployments</h2>
                        <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-blue-500/20 tracking-widest">
                            {stats.assigned_orders.length} Records Found
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {stats.assigned_orders.length === 0 ? (
                            <div className="py-20 text-center bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-700">
                                <span className="text-5xl block mb-4">📭</span>
                                <p className="text-gray-500 font-bold">No active missions assigned to your ID.</p>
                            </div>
                        ) : (
                            stats.assigned_orders.map((order) => (
                                <div key={order.id} className="bg-gray-800/40 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
                                    <div className="p-8">
                                        <div className="flex flex-col lg:flex-row justify-between gap-10">
                                            {/* Header Info */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center flex-wrap gap-3">
                                                    <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg shadow-sm ${order.priority === 'High' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                                                        }`}>
                                                        {order.priority} PRIORITY
                                                    </span>
                                                    <span className="text-lg font-black text-white">{order.reports?.category}</span>
                                                    <span className="text-gray-600">#WO-{order.id.slice(0, 8)}</span>
                                                </div>
                                                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">{order.reports?.description}</p>

                                                <div className="flex flex-wrap gap-6 pt-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600">📅</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] uppercase font-black text-gray-600">Deadline</span>
                                                            <span className="text-sm font-bold text-gray-300">{new Date(order.deadline).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-600/80 text-xl font-bold">$</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] uppercase font-black text-gray-600">Allocation</span>
                                                            <span className="text-sm font-bold text-gray-300">${order.estimated_cost}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex flex-col items-center lg:items-end gap-2">
                                                <div className={`px-6 py-2 rounded-2xl font-black text-sm uppercase tracking-tighter shadow-inner border ${order.status === 'completed' ? 'bg-green-600/10 text-green-400 border-green-500/20' : 'bg-yellow-600/10 text-yellow-500 border-yellow-500/20'
                                                    }`}>
                                                    {order.status.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Journey / Milestones */}
                                        <div className="mt-12">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-px bg-gray-700 flex-1"></div>
                                                <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">Mission Roadmap</span>
                                                <div className="h-px bg-gray-700 flex-1"></div>
                                            </div>

                                            <div className="relative">
                                                {/* Connecting Line */}
                                                <div className="absolute left-[13px] top-6 bottom-6 w-0.5 bg-gray-700 hidden sm:block"></div>

                                                <div className="space-y-8">
                                                    {order.milestones?.map((step, idx) => (
                                                        <div key={idx} className="flex flex-col sm:flex-row gap-4 sm:gap-8 relative group">
                                                            {/* Milestone Marker */}
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs z-10 transition-all ${step.status === 'completed' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                                                                step.status === 'review' ? 'bg-yellow-500 text-white animate-pulse' : 'bg-gray-700 text-gray-400'
                                                                }`}>
                                                                {step.status === 'completed' ? '✓' : idx + 1}
                                                            </div>

                                                            {/* Milestone Content */}
                                                            <div className={`flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/40 p-5 rounded-2xl border transition-all duration-300 ${(step.status === 'pending' && idx > 0 && order.milestones[idx - 1].status !== 'completed')
                                                                    ? 'opacity-50 grayscale border-transparent'
                                                                    : 'hover:border-gray-600 border-transparent'
                                                                }`}>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className={`text-sm font-bold tracking-tight ${step.status === 'completed' ? 'text-gray-500 line-through decoration-2' : 'text-gray-200'}`}>
                                                                            {step.title}
                                                                        </h4>
                                                                        {step.status === 'pending' && idx > 0 && order.milestones[idx - 1].status !== 'completed' && (
                                                                            <span className="text-[8px] font-black bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">Locked</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-gray-500 mt-1 max-w-xl">{step.description}</p>
                                                                </div>

                                                                {/* Action for Milestone */}
                                                                <div className="flex items-center gap-3 w-full md:w-auto">
                                                                    {step.status === 'pending' ? (
                                                                        <button
                                                                            onClick={() => handleRequestVerification(order.id, idx)}
                                                                            disabled={idx > 0 && order.milestones[idx - 1].status !== 'completed'}
                                                                            className={`w-full md:w-auto px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all shadow-lg active:scale-95 ${(idx > 0 && order.milestones[idx - 1].status !== 'completed')
                                                                                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                                                                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                                                                                }`}
                                                                        >
                                                                            {idx > 0 && order.milestones[idx - 1].status !== 'completed' ? 'Wait for Previous' : 'Request Review'}
                                                                        </button>
                                                                    ) : step.status === 'review' ? (
                                                                        <span className="text-[10px] font-black uppercase text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20 w-full md:w-auto text-center">
                                                                            Review In Progress
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 w-full md:w-auto text-center flex items-center justify-center gap-2">
                                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Completed
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Admin Feedback */}
                                        {order.admin_notes && (
                                            <div className="mt-10 p-5 bg-blue-600/5 rounded-2xl border border-blue-600/10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-blue-500">📥</span>
                                                    <span className="text-[10px] font-black tracking-widest text-blue-300 uppercase">Headquarters Directives</span>
                                                </div>
                                                <p className="text-sm text-gray-400 leading-relaxed font-medium italic">"{order.admin_notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContractorDashboard;