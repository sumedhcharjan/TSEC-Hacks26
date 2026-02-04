import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthProvider';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import toast, { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ReportIssue = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);

    const [formData, setFormData] = useState({
        category: '',
        description: '',
        latitude: 19.0760,
        longitude: 72.8777,
        locationStatus: 'Default'
    });

    const categories = [
        { label: "Select Issue Category", value: "" },
        { label: "Road Damage (Pothole/Crack)", value: "Road Damage" },
        { label: "Broken Streetlight", value: "Streetlight" },
        { label: "Water Leakage / Pipe Burst", value: "Water Leak" },
        { label: "Garbage Accumulation", value: "Garbage" },
        { label: "Fallen Tree / Hazard", value: "Hazard" },
    ];

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setFormData(prev => ({
                    ...prev,
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng,
                    locationStatus: 'Pin'
                }));
            },
        });
        return formData.latitude ? (
            <Marker position={[formData.latitude, formData.longitude]} />
        ) : null;
    };

    const handleLocationDetect = () => {
        setFormData(prev => ({ ...prev, locationStatus: 'Detecting' }));
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }
        const loadingToast = toast.loading('Detecting your location...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    locationStatus: 'Detected'
                }));
                toast.success('Location detected successfully!', { id: loadingToast });
            },
            () => {
                toast.error('Unable to retrieve your location', { id: loadingToast });
            }
        );
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('category', formData.category);
            data.append('description', formData.description);
            data.append('latitude', formData.latitude);
            data.append('longitude', formData.longitude);
            data.append('user_id', user.id);
            if (file) {
                data.append('image', file);
            }

            const response = await api.post('/citizen/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 200 || response.status === 201) {
                toast.success('Report submitted successfully! 🎉', {
                    duration: 3000,
                    style: { background: '#10B981', color: 'white' }
                });
                setTimeout(() => navigate('/dashboard'), 1500);
            }
        } catch (error) {
            console.error("Submission failed", error);
            toast.error(error.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="min-h-screen bg-surface">
                {/* Header */}
                <div className="bg-primary text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <h1 className="text-3xl font-bold">Report Infrastructure Issue</h1>
                        <p className="text-white/80 mt-2">Help us maintain better infrastructure by reporting issues in your area</p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Location Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">📍</span>
                                <h2 className="text-xl font-semibold text-text-main">Location Details</h2>
                            </div>
                            <p className="text-sm text-text-muted mb-6">Pin the exact location on the map or use your current location</p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="h-80 rounded-xl overflow-hidden border border-border">
                                    <MapContainer
                                        center={[formData.latitude, formData.longitude]}
                                        zoom={13}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; OpenStreetMap contributors'
                                        />
                                        <LocationMarker />
                                    </MapContainer>
                                </div>
                                <div className="space-y-4">
                                    <button
                                        type="button"
                                        onClick={handleLocationDetect}
                                        className="w-full bg-accent text-secondary px-4 py-3 rounded-lg font-medium hover:bg-accent-light transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>📡</span>
                                        Use Current Location
                                    </button>
                                    <div className="bg-surface rounded-lg p-4">
                                        <p className="text-xs font-medium text-text-muted mb-2">Coordinates</p>
                                        <p className="text-sm font-mono text-text-main">
                                            {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                        </p>
                                    </div>
                                    <div className="bg-accent-light rounded-lg p-4 border border-secondary/20">
                                        <p className="text-xs text-secondary font-medium">💡 Tip</p>
                                        <p className="text-xs text-text-muted mt-1">
                                            Click anywhere on the map to set the exact location of the issue
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Issue Details Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">📝</span>
                                <h2 className="text-xl font-semibold text-text-main">Issue Details</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-2">Category *</label>
                                    <select
                                        required
                                        className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-colors"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-2">Description *</label>
                                    <textarea
                                        required
                                        rows="4"
                                        placeholder="Please describe the issue in detail..."
                                        className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-colors resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-2">Photo Evidence</label>
                                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-secondary hover:bg-accent transition-all relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {preview ? (
                                            <div className="space-y-2">
                                                <img src={preview} alt="Preview" className="h-40 mx-auto rounded-lg object-cover" />
                                                <p className="text-sm text-text-muted">Click to change photo</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <span className="text-3xl">📸</span>
                                                </div>
                                                <p className="text-sm font-medium text-text-main">Upload a photo</p>
                                                <p className="text-xs text-text-muted mt-1">PNG, JPG up to 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 bg-white text-text-main px-8 py-4 rounded-lg font-semibold border border-border hover:bg-surface transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-secondary hover:bg-secondary-hover text-white px-8 py-4 rounded-lg font-semibold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting Report...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ReportIssue;
