import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import toast from 'react-hot-toast';
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
            toast.error('Failed to load issue details');
        }
    };

    useEffect(() => {
        if (id) fetchIssue();
    }, [id]);

    const getSeverityColor = (score) => {
        if (score >= 80) return 'bg-red-100 text-red-800 border-red-200';
        if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };

    const handleUpdateStatus = async () => {
        if (!selectedStatus) return;

        try {
            const response = await api.patch(`/admin/reports/${id}`, {
                status: selectedStatus
            });

            if (response.data.success) {
                setIssue(prev => ({ ...prev, status: selectedStatus }));
                toast.success(`Status updated to ${selectedStatus}`);
                setIsStatusModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleApproveMilestone = async (orderId, milestoneIndex) => {
        setApproving(true);
        try {
            await api.post('/admin/approve-milestone', { orderId, milestoneIndex });
            toast.success('Milestone approved and verified!');
            await fetchIssue();
        } catch (error) {
            console.error('Approval error:', error);
            toast.error('Failed to approve milestone');
        } finally {
            setApproving(false);
        }
    };

    if (!issue) return <div className="p-8 text-center text-gray-500">Loading details...</div>;

    const activeOrder = issue.work_orders?.[0];

    return (
        <div className="space-y-8 relative pb-20">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(role === 'admin' ? '/admin/issues' : '/dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 bg-white shadow-sm border border-gray-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Issue #{issue.id.slice(0, 8)}</h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{issue.category} Investigation</p>
                    </div>
                </div>
                {role === 'admin' && (
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm border ${getSeverityColor(issue.risk_score)}`}>
                        Risk Level: {issue.risk_score}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Key Info Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Lifecycle Status</span>
                                <span className={`block text-xl font-black ${issue.status === 'Open' ? 'text-blue-600' :
                                    issue.status === 'In Progress' ? 'text-orange-600' :
                                        issue.status === 'Resolved' ? 'text-green-600' : 'text-gray-900'
                                    }`}>{issue.status}</span>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reported Source</span>
                                <span className="block text-xl font-black text-gray-900 truncate">
                                    {issue.profiles?.full_name || 'System Auto-Detect'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Detailed Description</h3>
                            <div className="p-6 bg-blue-50/30 rounded-2xl border border-blue-50 text-gray-700 leading-relaxed font-medium">
                                {issue.description}
                            </div>
                        </div>
                    </div>

                    {/* Progress Journey Section - NEW! */}
                    {activeOrder && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Mission Progress Journey</h3>
                                <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase">Live Updates</span>
                            </div>

                            <div className="relative space-y-8">
                                {/* Journey Line */}
                                <div className="absolute left-[17px] top-4 bottom-4 w-px bg-gray-100"></div>

                                {activeOrder.milestones?.map((step, idx) => (
                                    <div key={idx} className="flex gap-6 relative">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs z-10 transition-all border-4 border-white ${step.status === 'completed' ? 'bg-green-500 text-white shadow-lg shadow-green-100' :
                                            step.status === 'review' ? 'bg-orange-500 text-white animate-pulse' :
                                                'bg-gray-100 text-gray-400'
                                            }`}>
                                            {step.status === 'completed' ? '✓' : idx + 1}
                                        </div>

                                        <div className="flex-1 bg-gray-50/50 rounded-2xl p-5 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div>
                                                <h4 className={`text-sm font-black ${step.status === 'completed' ? 'text-gray-400' : 'text-gray-900'}`}>
                                                    {step.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 font-medium italic">{step.description}</p>

                                                {step.evidence_url && (
                                                    <div className="mt-4 group/img relative">
                                                        <a
                                                            href={step.evidence_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all w-fit"
                                                        >
                                                            <span>📸</span> VIEW FIELD EVIDENCE
                                                        </a>
                                                        <div className="hidden group-hover/img:block absolute top-10 left-0 z-[100] w-64 h-48 rounded-xl overflow-hidden border-4 border-white shadow-2xl animate-in fade-in zoom-in duration-200">
                                                            <img
                                                                src={step.evidence_url}
                                                                alt="Field Evidence"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Admin Control */}
                                            {role === 'admin' && step.status === 'review' && (
                                                <button
                                                    onClick={() => handleApproveMilestone(activeOrder.id, idx)}
                                                    disabled={approving}
                                                    className="w-full md:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {approving ? 'Syncing...' : 'Approve Milestone'}
                                                </button>
                                            )}

                                            {step.status === 'completed' && (
                                                <span className="text-[9px] font-black text-green-600 bg-green-100 px-3 py-1 rounded-full uppercase flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping"></span> Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Map Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col h-[450px]">
                        <h3 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Geospatial Context</h3>
                        <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100 relative z-0 shadow-inner">
                            <MapContainer
                                center={[issue.latitude, issue.longitude]}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[issue.latitude, issue.longitude]}>
                                    <Popup>
                                        <div className="p-2">
                                            <p className="font-black text-blue-600">{issue.category}</p>
                                            <p className="text-xs font-bold text-gray-500 uppercase">{issue.status}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Image Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="aspect-square w-full bg-gray-50 relative overflow-hidden">
                            {issue.image_url ? (
                                <img
                                    src={issue.image_url}
                                    alt="Issue Evidence"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                    <span className="text-5xl mb-2">📸</span>
                                    <span className="text-[10px] font-black uppercase">No Media Captured</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                            <p className="text-[10px] font-black text-gray-400 text-center uppercase tracking-widest">Ground Intelligence Photo</p>
                        </div>
                    </div>

                    {/* Actions Card - Only for Admin */}
                    {role === 'admin' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Administrative Ops</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setSelectedStatus(issue.status);
                                        setIsStatusModalOpen(true);
                                    }}
                                    className="w-full py-3.5 px-4 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-200"
                                >
                                    Force Status Update
                                </button>
                                {!activeOrder && (
                                    <button
                                        onClick={() => setIsAssignModalOpen(true)}
                                        className="w-full py-3.5 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100"
                                    >
                                        Deploy Field Crew
                                    </button>
                                )}
                                <button className="w-full py-3.5 px-4 bg-white border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest">
                                    Archive Report
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Assigned Contractor Info */}
                    {activeOrder && (
                        <div className="bg-blue-600 rounded-3xl shadow-xl shadow-blue-100 p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-200 mb-4">Assigned Taskforce</h3>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-xl shadow-lg border border-white/10 italic">
                                        {activeOrder.contractor?.full_name?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg">{activeOrder.contractor?.full_name || 'Assigned Crew'}</p>
                                        <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Official Contractor</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-[11px] font-bold text-blue-50 bg-blue-700/50 p-4 rounded-2xl border border-blue-500/30">
                                    <p className="flex justify-between"><span>BUDGET:</span> <span>${activeOrder.estimated_cost}</span></p>
                                    <p className="flex justify-between"><span>DEADLINE:</span> <span>{new Date(activeOrder.deadline).toLocaleDateString()}</span></p>
                                </div>
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Modal - Keeps existing logic */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200 border border-gray-100">
                        <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Manual Status Override</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Select Operations Level</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full border-gray-100 bg-gray-50 rounded-2xl shadow-inner focus:ring-4 focus:ring-blue-50 focus:border-blue-500 py-4 px-4 border text-sm font-bold transition-all outline-none"
                                >
                                    <option value="Open">Open (Pending Triage)</option>
                                    <option value="In Progress">In Progress (Active Ops)</option>
                                    <option value="Resolved">Resolved (Success)</option>
                                    <option value="Pending">On Hold (Resource Delay)</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="flex-1 py-4 px-4 bg-white border border-gray-100 text-gray-500 rounded-2xl hover:bg-gray-50 transition-all font-black text-xs uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    className="flex-1 py-4 px-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100"
                                >
                                    Apply Override
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Crew Modal */}
            <AssignCrewModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                reportId={id}
                onAssignmentComplete={fetchIssue}
            />
        </div>
    );
};

export default IssueDetails;
