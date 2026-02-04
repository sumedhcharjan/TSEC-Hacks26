import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthProvider';


import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

import AssignCrewModal from '../../components/admin/AssignCrewModal';

const IssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { role } = useAuth();
    const [issue, setIssue] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [approving, setApproving] = useState(false);

    const fetchIssue = async () => {
        try {
            const response = await api.get(`/admin/reports/${id}`);
            setIssue(response.data);
        } catch (error) {
            console.error('Error fetching issue details:', error);
            toast.error('Failed to load intelligence data');
        }
    };

    useEffect(() => {
        if (id) fetchIssue();
    }, [id]);

    const getSeverityStyles = (score) => {
        if (score >= 80) return 'bg-red-50 text-red-600 border-red-100';
        if (score >= 50) return 'bg-orange-50 text-orange-600 border-orange-100';
        return 'bg-blue-50 text-action border-blue-100';
    };

    const handleUpdateStatus = async () => {
        if (!selectedStatus) return;

        try {
            const response = await api.patch(`/admin/reports/${id}`, {
                status: selectedStatus
            });

            if (response.data.success) {
                setIssue(prev => ({ ...prev, status: selectedStatus }));
                toast.success(`Operational status updated: ${selectedStatus}`);
                setIsStatusModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Status override failed');
        }
    };

    const handleApproveMilestone = async (orderId, milestoneIndex) => {
        setApproving(true);
        try {
            await api.post('/admin/approve-milestone', { orderId, milestoneIndex });
            toast.success('Field milestone verified and logged.');
            await fetchIssue();
        } catch (error) {
            console.error('Approval error:', error);
            toast.error('Verification failure');
        } finally {
            setApproving(false);
        }
    };

    if (!issue) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-accent-soft border-t-action rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Acquiring Incident Intelligence...</p>
        </div>
    );

    const activeOrder = issue.work_orders?.[0];

    return (
        <div className="min-h-screen pb-20">
            <Toaster position="top-center" />

            {/* Professional Sub-Header */}
            <div className="bg-white border-b border-border-subtle mb-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate(role === 'admin' ? '/admin/issues' : '/dashboard')}
                                className="w-12 h-12 flex items-center justify-center bg-white border border-border-subtle rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                            >
                                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <div className="flex items-center gap-2 text-action font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                                    Incident Investigation
                                </div>
                                <h1 className="text-4xl font-black text-primary tracking-tight">Report #{issue.id.slice(0, 8)}</h1>
                                <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest mt-2 opacity-60 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-text-muted rounded-full"></span>
                                    Classification: {issue.category}
                                </p>
                            </div>
                        </div>
                        {role === 'admin' && (
                            <div className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getSeverityStyles(issue.risk_score)}`}>
                                Threat Index: {issue.risk_score}%
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Primary Content Column */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Primary Intelligence Card */}
                        <div className="civic-card p-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                                <div className="p-8 bg-gray-50 rounded-[28px] border border-border-subtle">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Lifecycle State</p>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full animate-pulse ${issue.status === 'Open' ? 'bg-action' :
                                            issue.status === 'In Progress' ? 'bg-status-warning' :
                                                issue.status === 'Resolved' ? 'bg-status-success' : 'bg-gray-400'
                                            }`}></div>
                                        <span className={`text-2xl font-black tracking-tight ${issue.status === 'Open' ? 'text-primary' :
                                            issue.status === 'In Progress' ? 'text-action' :
                                                issue.status === 'Resolved' ? 'text-status-success' : 'text-gray-900'
                                            }`}>{issue.status?.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <div className="p-8 bg-gray-50 rounded-[28px] border border-border-subtle">
                                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Data Origin</p>
                                    <span className="block text-2xl font-black text-primary tracking-tight truncate">
                                        {issue.profiles?.full_name || 'System Registry'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-text-muted rounded-full"></span>
                                    Technical Briefing
                                </h3>
                                <div className="p-8 bg-accent-soft/30 rounded-[28px] border border-accent-soft/50 text-primary font-bold text-lg leading-relaxed italic">
                                    "{issue.description}"
                                </div>
                            </div>
                        </div>

                        {/* Mission Execution Timeline */}
                        {activeOrder && (
                            <div className="civic-card p-10">
                                <div className="flex items-center justify-between mb-10 pb-6 border-b border-border-subtle">
                                    <div>
                                        <h3 className="text-xl font-black text-primary tracking-tight">Mission Execution Timeline</h3>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Verified Field Operations</p>
                                    </div>
                                    <span className="text-[10px] font-black bg-action text-white px-4 py-2 rounded-full uppercase tracking-widest border border-white/20">Active Order</span>
                                </div>

                                <div className="relative space-y-12">
                                    {/* Chronological Track */}
                                    <div className="absolute left-[24px] top-6 bottom-6 w-1 bg-gray-100"></div>

                                    {activeOrder.milestones?.map((step, idx) => (
                                        <div key={idx} className="flex gap-8 relative group">
                                            <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-sm z-10 transition-all border-4 border-white shadow-xl ${step.status === 'completed' ? 'bg-status-success text-white' :
                                                step.status === 'review' ? 'bg-action text-white ring-4 ring-action/10' :
                                                    'bg-gray-100 text-text-muted'
                                                }`}>
                                                {step.status === 'completed' ? '✓' : idx + 1}
                                            </div>

                                            <div className="flex-1 bg-gray-50/50 rounded-[28px] p-8 border border-border-subtle hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                                                <div className="max-w-xl">
                                                    <h4 className={`text-lg font-black tracking-tight ${step.status === 'completed' ? 'text-text-muted line-through opacity-60' : 'text-primary'}`}>
                                                        {step.title}
                                                    </h4>
                                                    <p className="text-[11px] text-text-muted mt-2 font-bold leading-relaxed">{step.description}</p>

                                                    {step.evidence_url && (
                                                        <div className="mt-6">
                                                            <a
                                                                href={step.evidence_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-3 text-[10px] font-black text-action bg-white px-5 py-3 rounded-xl border border-border-subtle hover:border-action transition-all shadow-sm"
                                                            >
                                                                <span>📸</span> GROUND EVIDENCE LOG
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Administrative Protocol */}
                                                {role === 'admin' && step.status === 'review' && (
                                                    <button
                                                        onClick={() => handleApproveMilestone(activeOrder.id, idx)}
                                                        disabled={approving}
                                                        className="w-full xl:w-auto px-8 py-4 bg-status-success text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-status-success/20 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        {approving ? 'VERIFYING...' : 'VERIFY & ARCHIVE'}
                                                    </button>
                                                )}

                                                {step.status === 'completed' && (
                                                    <span className="text-[10px] font-black text-status-success bg-status-success/10 px-4 py-2 rounded-full uppercase tracking-widest flex items-center gap-2 border border-status-success/20">
                                                        <span className="w-2 h-2 bg-status-success rounded-full"></span> PROTOCOL VERIFIED
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Geospatial Map */}
                        <div className="civic-card p-4 h-[500px] flex flex-col relative overflow-hidden">
                            <div className="absolute top-8 left-8 z-10 bg-white/90 backdrop-blur px-5 py-2.5 rounded-2xl text-[10px] font-black text-primary border border-border-subtle shadow-lg flex items-center gap-2 uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-action animate-pulse"></span>
                                Precision Coordinates
                            </div>
                            <div className="flex-1 rounded-[28px] overflow-hidden border border-border-subtle relative z-0">
                                <MapContainer
                                    center={[issue.latitude, issue.longitude]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                    className="z-0"
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap'
                                    />
                                    <Marker position={[issue.latitude, issue.longitude]}>
                                        <Popup className="civic-popup">
                                            <div className="p-3">
                                                <p className="font-black text-primary mb-1">{issue.category}</p>
                                                <p className="text-[9px] font-black text-action uppercase tracking-widest">{issue.status}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    </div>

                    {/* Tactical Sidebar */}
                    <div className="lg:col-span-4 space-y-10">

                        {/* Visual Intelligence Photo */}
                        <div className="civic-card overflow-hidden group">
                            <div className="aspect-square w-full bg-gray-50 relative overflow-hidden">
                                {issue.image_url ? (
                                    <img
                                        src={issue.image_url}
                                        alt="Visual Intelligence"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full gap-4">
                                        <div className="w-20 h-20 bg-accent-soft rounded-full flex items-center justify-center text-3xl">📷</div>
                                        <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">No Visual Data Available</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 bg-gray-50/50 border-t border-border-subtle text-center">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Primary Ground Observation</p>
                            </div>
                        </div>

                        {/* Operational Protocols - Admin Only */}
                        {role === 'admin' && (
                            <div className="civic-card p-10 space-y-8">
                                <div>
                                    <h3 className="text-xl font-black text-primary tracking-tight">Strategy Control</h3>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">Mission Override</p>
                                </div>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => {
                                            setSelectedStatus(issue.status);
                                            setIsStatusModalOpen(true);
                                        }}
                                        className="w-full py-5 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
                                    >
                                        Adjust Operational Status
                                    </button>
                                    {!activeOrder && (
                                        <button
                                            onClick={() => setIsAssignModalOpen(true)}
                                            className="w-full py-5 bg-action text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-action/20 hover:-translate-y-1 transition-all active:scale-95 border border-white/10"
                                        >
                                            Deploy Tactical Unit
                                        </button>
                                    )}
                                    <button className="w-full py-5 bg-white border border-red-100 text-red-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all">
                                        Terminate & Archive
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Taskforce Designation Card */}
                        {activeOrder && (
                            <div className="bg-primary rounded-[40px] shadow-2xl p-10 text-white relative overflow-hidden group">
                                <div className="relative z-10">
                                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-8 pb-1 border-b border-white/10">Designated Taskforce</span>
                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner border border-white/20">
                                            {activeOrder.contractor?.full_name?.charAt(0) || 'T'}
                                        </div>
                                        <div>
                                            <p className="font-black text-2xl tracking-tight leading-none mb-2">{activeOrder.contractor?.full_name || 'Unit 7-Alpha'}</p>
                                            <p className="text-[10px] font-black text-action uppercase tracking-widest">Lead Operator</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">ALLOCATION</p>
                                            <p className="font-black text-lg">${activeOrder.estimated_cost}</p>
                                        </div>
                                        <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">ETA TARGET</p>
                                            <p className="font-black text-lg">{new Date(activeOrder.deadline).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Visual Architecture */}
                                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-action/20 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-150"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Override Intercept */}
                {isStatusModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-primary/20 backdrop-blur-xl">
                        <div className="civic-card p-10 w-full max-w-lg shadow-2xl relative">
                            <button
                                onClick={() => setIsStatusModalOpen(false)}
                                className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-xl transition-colors text-text-muted"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-accent-soft rounded-2xl flex items-center justify-center text-2xl">⚙️</div>
                                <div>
                                    <h3 className="text-2xl font-black text-primary tracking-tight leading-none mb-1">Status Override</h3>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Operational modification protocol</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 px-1">Tactical Status Level</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full bg-gray-50 border border-border-subtle rounded-2xl px-6 py-4 font-black text-primary focus:ring-8 focus:ring-action/5 outline-none transition-all"
                                    >
                                        <option value="Open">Protocol: Open (Triage)</option>
                                        <option value="In Progress">Protocol: In Progress (Active)</option>
                                        <option value="Resolved">Protocol: Resolved (Success)</option>
                                        <option value="Pending">Protocol: Standby (On Hold)</option>
                                    </select>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsStatusModalOpen(false)}
                                        className="flex-1 py-5 bg-white border border-border-subtle text-text-muted rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all font-black"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={handleUpdateStatus}
                                        className="flex-1 py-5 bg-action text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-action/20 hover:-translate-y-1 transition-all active:scale-95"
                                    >
                                        Commit Change
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <AssignCrewModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    reportId={id}
                    onAssignmentComplete={fetchIssue}
                />
            </div>
        </div>
    );
};

export default IssueDetails;
