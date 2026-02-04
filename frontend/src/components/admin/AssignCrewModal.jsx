import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AssignCrewModal = ({ isOpen, onClose, reportId, onAssignmentComplete }) => {
    const [contractors, setContractors] = useState([]);
    const [selectedContractor, setSelectedContractor] = useState('');
    const [estimatedCost, setEstimatedCost] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [deadline, setDeadline] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [milestones, setMilestones] = useState([
        { title: 'Site Inspection', description: 'Initial evaluation of damage and safety checks.' },
        { title: 'Mobilization', description: 'Transporting equipment and materials to site.' },
        { title: 'Core Repairs', description: 'Execution of main infrastructure fix.' },
        { title: 'Final Testing', description: 'Validation and quality assurance tests.' }
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchContractors();
        }
    }, [isOpen]);

    const fetchContractors = async () => {
        try {
            const response = await api.get('/admin/contractors');
            setContractors(response.data);
            if (response.data.length > 0) setSelectedContractor(response.data[0].id);
        } catch (error) {
            console.error('Error fetching contractors:', error);
            toast.error('Failed to load contractor list');
        }
    };

    const handleMilestoneChange = (index, field, value) => {
        const newMilestones = [...milestones];
        newMilestones[index][field] = value;
        setMilestones(newMilestones);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedContractor || !estimatedCost || !deadline) {
            return toast.error('Please fill in contractor, cost, and deadline');
        }

        setLoading(true);
        try {
            await api.post('/admin/assign-work', {
                reportId,
                contractorId: selectedContractor,
                milestones,
                estimatedCost,
                priority,
                deadline,
                adminNotes
            });

            toast.success('Work order assigned successfully!');
            onAssignmentComplete();
            onClose();
        } catch (error) {
            console.error('Assignment error:', error);
            toast.error('Failed to create work order');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                            <span className="text-xl">📋</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Create Work Order</h2>
                            <p className="text-xs text-gray-500 font-medium">Dispatching to official contractor network</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors group">
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                    {/* Primary Info: Contractor & Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Selected Contractor</label>
                            <select
                                value={selectedContractor}
                                onChange={(e) => setSelectedContractor(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all shadow-sm"
                            >
                                {contractors.length > 0 ? (
                                    contractors.map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                                    ))
                                ) : (
                                    <option disabled>No contractors found</option>
                                )}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Assignment Priority</label>
                            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                                {['Low', 'Medium', 'High'].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${priority === p
                                                ? (p === 'High' ? 'bg-red-600 text-white shadow-md' : p === 'Medium' ? 'bg-orange-500 text-white shadow-md' : 'bg-green-600 text-white shadow-md')
                                                : 'text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Secondary Info: Cost & Deadline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Budget Allocation ($)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input
                                    type="number"
                                    value={estimatedCost}
                                    onChange={(e) => setEstimatedCost(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Target Completion Deadline</label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all shadow-sm bg-white"
                            />
                        </div>
                    </div>

                    {/* Milestones Visualization */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center justify-between">
                            Project Roadmap
                            <span className="text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-black">SYSTEM GENERATED</span>
                        </label>
                        <div className="space-y-3 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                            {milestones.map((m, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-7 h-7 rounded-full bg-white border-2 border-blue-500 text-blue-600 text-xs flex items-center justify-center font-black shadow-sm">
                                            {idx + 1}
                                        </div>
                                        {idx < milestones.length - 1 && <div className="flex-1 w-0.5 bg-blue-100 my-1"></div>}
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <input
                                            type="text"
                                            value={m.title}
                                            onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                                            className="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-900 outline-none focus:ring-0 mb-1"
                                        />
                                        <textarea
                                            value={m.description}
                                            onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                                            rows="1"
                                            className="w-full bg-transparent border-none p-0 text-[11px] text-gray-500 outline-none focus:ring-0 resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Administrative Instructions</label>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Add mission-critical details or specialized equipment requirements..."
                            rows="3"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50/80">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] px-6 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-sm uppercase tracking-wider"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                Deploy Assigned Crew
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignCrewModal;
