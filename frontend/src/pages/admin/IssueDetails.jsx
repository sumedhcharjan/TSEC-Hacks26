import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const IssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const response = await api.get(`/admin/reports/${id}`);
                setIssue(response.data);
            } catch (error) {
                console.error('Error fetching issue details:', error);
                toast.error('Failed to load issue details');
            }
        };

        if (id) fetchIssue();
    }, [id]);

    const getSeverityColor = (score) => {
        if (score >= 80) return 'bg-red-100 text-red-800 border-red-200';
        if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-green-100 text-green-800 border-green-200';
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    const handleUpdateStatus = async () => {
        if (!selectedStatus) return;

        try {
            const response = await api.patch(`/admin/reports/${id}`, {
                status: selectedStatus
            });

            if (response.data.success) {
                // Update only the status field to preserve joined data like profiles
                setIssue(prev => ({ ...prev, status: selectedStatus }));
                toast.success(`Status updated to ${selectedStatus}`);
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    if (!issue) return <div className="p-8 text-center text-gray-500">Loading details...</div>;

    return (
        <div className="space-y-6 relative">
            {/* Header / Nav */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/admin/issues')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Issue #{issue.id} Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Key Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{issue.category}</h2>
                                <p className="text-sm text-gray-500">Reported on {issue.created_at}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(issue.risk_score)}`}>
                                Risk Score: {issue.risk_score}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
                                <span className={`block text-lg font-medium mt-1 ${issue.status === 'Open' ? 'text-blue-600' :
                                    issue.status === 'In Progress' ? 'text-purple-600' :
                                        issue.status === 'Resolved' ? 'text-green-600' : 'text-gray-600'
                                    }`}>{issue.status}</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Reported By</span>
                                <span className="block text-lg font-medium text-gray-900 mt-1">{issue.reportedBy}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {issue.description}
                            </p>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[400px]">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Location Map</h3>
                        <div className="flex-1 rounded-lg overflow-hidden border border-gray-200 relative z-0">
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
                                        {issue.category} <br /> {issue.status}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Image Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="aspect-video w-full bg-gray-100 relative">
                            {issue.image_url ? (
                                <img
                                    src={issue.image_url}
                                    alt="Issue Evidence"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    No Image Available
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500 text-center">Attached Evidence Photo</p>
                        </div>
                    </div>

                    {/* Actions Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setSelectedStatus(issue.status);
                                    setIsModalOpen(true);
                                }}
                                className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                            >
                                Update Status
                            </button>
                            <button className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                Assign Crew
                            </button>
                            <button className="w-full py-2 px-4 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors font-medium">
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Status Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Update Issue Status</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select New Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary py-2 px-3 border"
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>

                            <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                                >
                                    Confirm Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueDetails;
