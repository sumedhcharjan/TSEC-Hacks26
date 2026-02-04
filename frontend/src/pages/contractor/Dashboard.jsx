import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthProvider';
import { Toaster, toast } from 'react-hot-toast';

const ContractorDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null); // { orderId, index }
    const fileInputRef = useRef(null);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/contractor/dashboard', {
                headers: { 'user-id': user.id }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
            toast.error('Failed to synchronise field data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchDashboard();
    }, [user]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedMilestone) return;

        setIsUploading(true);
        const loadingToast = toast.loading('Synchronising evidence with city registry...');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `evidence_${selectedMilestone.orderId}_${selectedMilestone.index}_${Date.now()}.${fileExt}`;
            const filePath = `milestone-evidence/${fileName}`;

            const { data, error: uploadError } = await supabase.storage
                .from('TSEC26')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('TSEC26')
                .getPublicUrl(filePath);

            await api.post('/contractor/verify-milestone', {
                orderId: selectedMilestone.orderId,
                milestoneIndex: selectedMilestone.index,
                imageUrl: publicUrl
            });

            toast.success('Field evidence logged. Verification pending.', { id: loadingToast });
            fetchDashboard();
        } catch (error) {
            console.error('Verification request error:', error);
            toast.error('Evidence logging failure: ' + error.message, { id: loadingToast });
        } finally {
            setIsUploading(false);
            setSelectedMilestone(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerUpload = (orderId, index) => {
        setSelectedMilestone({ orderId, index });
        fileInputRef.current.click();
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
            <div className="w-10 h-10 border-4 border-accent-soft border-t-action rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] animate-pulse">Acquiring Tactical Briefing...</p>
        </div>
    );

    if (!stats) return (
        <div className="min-h-screen flex items-center justify-center bg-white text-text-muted font-black uppercase text-[10px] tracking-widest">
            Authorization Error: No Data Access
        </div>
    );

    return (
        <div className="min-h-screen pb-20">
            <Toaster position="top-right" />

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
            />

            {/* Professional Operational Header */}
            <div className="bg-white border-b border-border-subtle mb-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-2 text-action font-black text-[9px] uppercase tracking-[0.25em] mb-3">
                            <span className="w-2 h-2 rounded-full bg-action animate-pulse"></span>
                            Tactical Field Terminal
                        </div>
                        <h1 className="text-4xl font-black text-primary tracking-tight">
                            Contractor <span className="text-action">Dashboard</span>
                        </h1>
                        <p className="text-text-muted font-bold mt-2 uppercase text-[9px] tracking-[0.2em] opacity-80">
                            Registry Portal: {user?.email}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-accent-soft/50 px-8 py-4 rounded-[20px] border border-action/5 flex flex-col items-center justify-center shadow-sm">
                            <span className="text-[8px] uppercase font-black text-action/70 tracking-[0.3em] mb-1">Pulse Status</span>
                            <span className="text-xs font-black text-primary uppercase tracking-wider">ACTIVE / ONLINE</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12 pb-24">
                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="civic-card p-10 group hover:-translate-y-1 transition-all shadow-xl shadow-primary/5">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.25em] mb-2">Total Allocation</p>
                                <h3 className="text-4xl font-black text-primary group-hover:text-status-success transition-colors tracking-tight">${stats.total_earnings?.toLocaleString()}</h3>
                            </div>
                            <div className="w-14 h-14 bg-status-success/5 rounded-2xl flex items-center justify-center text-status-success text-2xl shadow-inner">💰</div>
                        </div>
                        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-status-success w-2/3 shadow-[0_0_15px_rgba(34,197,94,0.3)]"></div>
                        </div>
                    </div>

                    <div className="civic-card p-10 group hover:-translate-y-1 transition-all shadow-xl shadow-primary/5">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.25em] mb-2">Live Missions</p>
                                <h3 className="text-4xl font-black text-primary group-hover:text-status-warning transition-colors tracking-tight">{stats.pending_works}</h3>
                            </div>
                            <div className="w-14 h-14 bg-status-warning/5 rounded-2xl flex items-center justify-center text-status-warning text-2xl shadow-inner">⚡</div>
                        </div>
                        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-status-warning w-1/3 shadow-[0_0_15px_rgba(245,158,11,0.3)]"></div>
                        </div>
                    </div>

                    <div className="civic-card p-10 group hover:-translate-y-1 transition-all shadow-xl shadow-primary/5">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.25em] mb-2">Verified Units</p>
                                <h3 className="text-4xl font-black text-primary group-hover:text-action transition-colors tracking-tight">{stats.completed_works}</h3>
                            </div>
                            <div className="w-14 h-14 bg-accent-soft/50 rounded-2xl flex items-center justify-center text-action text-2xl shadow-inner">✅</div>
                        </div>
                        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-action w-full shadow-[0_0_15px_rgba(30,111,217,0.3)]"></div>
                        </div>
                    </div>
                </div>

                {/* Deployment Roster */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between border-b border-border-subtle pb-8">
                        <div>
                            <h2 className="text-3xl font-black text-primary tracking-tight">Deployment Ledger</h2>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mt-2 opacity-70">Ground Truth Operations Feed</p>
                        </div>
                        <span className="bg-primary/95 text-white px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 backdrop-blur-sm">
                            {stats.assigned_orders.length} ACTIVE DEPLOYMENTS
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-12">
                        {stats.assigned_orders.length === 0 ? (
                            <div className="py-24 text-center civic-card border-dashed">
                                <div className="text-5xl mb-6">📓</div>
                                <p className="text-primary font-black uppercase text-[11px] tracking-[0.3em]">No Active Deployments Found</p>
                                <p className="text-text-muted font-bold text-[10px] mt-2">Standing by for next mission assignment.</p>
                            </div>
                        ) : (
                            stats.assigned_orders.map((order) => (
                                <div key={order.id} className="civic-card overflow-hidden group">
                                    <div className="p-10">
                                        <div className="flex flex-col xl:flex-row justify-between gap-12">
                                            {/* Deployment Intelligence */}
                                            <div className="flex-1 space-y-6">
                                                <div className="flex items-center flex-wrap gap-4">
                                                    <span className={`px-4 py-1.5 text-[9px] font-black tracking-[0.2em] uppercase rounded-xl border ${order.priority === 'High' ? 'bg-red-50 text-status-danger border-status-danger/20' : 'bg-blue-50 text-action border-action/20'
                                                        }`}>
                                                        {order.priority} PRIORITY
                                                    </span>
                                                    <span className="text-xl font-black text-primary tracking-tight">{order.reports?.category}</span>
                                                    <span className="text-[10px] font-black text-text-muted bg-gray-50 px-3 py-1 rounded-lg border border-border-subtle uppercase tracking-widest">IDX: {order.id.slice(0, 8)}</span>
                                                </div>
                                                <div className="p-6 bg-accent-soft/30 rounded-3xl border border-accent-soft/50">
                                                    <p className="text-primary font-bold text-sm leading-relaxed italic">"{order.reports?.description}"</p>
                                                </div>

                                                <div className="flex flex-wrap gap-10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-text-muted">📅</div>
                                                        <div>
                                                            <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">SLA Deadline</p>
                                                            <p className="text-sm font-black text-primary">{new Date(order.deadline).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-status-success/5 rounded-xl flex items-center justify-center text-status-success font-black text-xl">$</div>
                                                        <div>
                                                            <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Approved Budget</p>
                                                            <p className="text-sm font-black text-primary">${order.estimated_cost}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Matrix */}
                                            <div className="flex flex-col items-center xl:items-end gap-4 min-w-[200px]">
                                                <div className={`px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] border shadow-sm ${order.status === 'completed' ? 'bg-status-success/5 text-status-success border-status-success/20' : 'bg-status-warning/5 text-status-warning border-status-warning/20'
                                                    }`}>
                                                    {order.status.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deployment Roadmap */}
                                        <div className="mt-16">
                                            <div className="flex items-center gap-4 mb-10">
                                                <h3 className="text-[10px] font-black tracking-[0.3em] text-text-muted uppercase">Operational Roadmap</h3>
                                                <div className="h-px bg-border-subtle flex-1"></div>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute left-[24px] top-8 bottom-8 w-1 bg-gray-100 hidden sm:block"></div>
                                                <div className="space-y-12">
                                                    {order.milestones?.map((step, idx) => (
                                                        <div key={idx} className="flex flex-col sm:flex-row gap-8 relative group/step">
                                                            {/* Milestone Index */}
                                                            <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-sm z-10 transition-all border-4 border-white shadow-xl ${step.status === 'completed' ? 'bg-status-success text-white' :
                                                                step.status === 'review' ? 'bg-status-warning text-white' : 'bg-gray-100 text-text-muted'
                                                                }`}>
                                                                {step.status === 'completed' ? '✓' : idx + 1}
                                                            </div>

                                                            {/* Milestone Intelligence */}
                                                            <div className={`flex-1 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 p-8 rounded-[28px] border transition-all duration-300 ${(step.status === 'pending' && idx > 0 && order.milestones[idx - 1].status !== 'completed')
                                                                ? 'opacity-40 bg-gray-50/50 border-transparent italic'
                                                                : 'bg-white border-border-subtle hover:border-action hover:shadow-2xl hover:shadow-primary/5'
                                                                }`}>
                                                                <div className="flex-1 pr-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <h4 className={`text-lg font-black tracking-tight ${step.status === 'completed' ? 'text-text-muted line-through opacity-50' : 'text-primary'}`}>
                                                                            {step.title}
                                                                        </h4>
                                                                        {step.status === 'pending' && idx > 0 && order.milestones[idx - 1].status !== 'completed' && (
                                                                            <span className="text-[8px] font-black bg-gray-200 text-text-muted px-2 py-1 rounded-lg uppercase tracking-widest border border-border-subtle">STANDBY</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-text-muted mt-2 font-bold leading-relaxed">{step.description}</p>

                                                                    {step.evidence_url && (
                                                                        <a
                                                                            href={step.evidence_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="inline-flex items-center gap-2 mt-5 text-[9px] font-black text-action bg-accent-soft px-4 py-2 rounded-xl border border-action/10 hover:border-action transition-all uppercase tracking-widest uppercase"
                                                                        >
                                                                            <span>🖼️</span> VERIFY SUBMITTED EVIDENCE
                                                                        </a>
                                                                    )}
                                                                </div>

                                                                {/* Tactical Action Zone */}
                                                                <div className="flex items-center gap-4 w-full xl:w-auto">
                                                                    {step.status === 'pending' ? (
                                                                        <button
                                                                            onClick={() => triggerUpload(order.id, idx)}
                                                                            disabled={isUploading || (idx > 0 && order.milestones[idx - 1].status !== 'completed')}
                                                                            className={`w-full xl:w-auto px-8 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${(idx > 0 && order.milestones[idx - 1].status !== 'completed')
                                                                                ? 'bg-gray-100 text-text-muted cursor-not-allowed border border-border-subtle'
                                                                                : 'bg-action hover:bg-action/90 text-white shadow-action/20'
                                                                                }`}
                                                                        >
                                                                            {isUploading && selectedMilestone?.index === idx ? (
                                                                                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                                            ) : (
                                                                                <span className="text-base">📸</span>
                                                                            )}
                                                                            {idx > 0 && order.milestones[idx - 1].status !== 'completed' ? 'Awaiting Pre-requisite' : 'LOG FIELD EVIDENCE'}
                                                                        </button>
                                                                    ) : step.status === 'review' ? (
                                                                        <div className="text-[10px] font-black uppercase text-status-warning bg-status-warning/5 px-6 py-4 rounded-2xl border border-status-warning/20 w-full xl:w-auto text-center tracking-widest flex items-center justify-center gap-2">
                                                                            <span className="w-2 h-2 bg-status-warning rounded-full animate-pulse"></span>
                                                                            In-House Review
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-[10px] font-black uppercase text-status-success bg-status-success/5 px-6 py-4 rounded-2xl border border-status-success/20 w-full xl:w-auto text-center tracking-widest flex items-center justify-center gap-2">
                                                                            <span className="w-2 h-2 bg-status-success rounded-full"></span>
                                                                            Tactical Completion
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Command Directives */}
                                        {order.admin_notes && (
                                            <div className="mt-12 p-8 bg-primary text-white rounded-[32px] relative overflow-hidden shadow-2xl shadow-primary/20">
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="text-action text-xl">📩</span>
                                                        <span className="text-[10px] font-black tracking-[0.3em] text-white/50 uppercase">Official Headquarters Directive</span>
                                                    </div>
                                                    <p className="text-lg font-bold leading-relaxed italic pr-10">"{order.admin_notes}"</p>
                                                </div>
                                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
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