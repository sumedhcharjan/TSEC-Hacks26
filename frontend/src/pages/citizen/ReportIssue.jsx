import React, { useState, useEffect } from 'react';
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

    // Form State
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        latitude: 19.0760, // Default Mumbai
        longitude: 72.8777,
        locationStatus: 'Default' // 'Default', 'Detecting', 'Detected', 'Error', 'Pin'
    });

    // Categories
    const categories = [
        { label: "Select a Category", value: "" },
        { label: "Road Damage (Pothole/Crack)", value: "Road Damage" },
        { label: "Broken Streetlight", value: "Streetlight" },
        { label: "Water Leakage / Pipe Burst", value: "Water Leak" },
        { label: "Garbage Accumulation", value: "Garbage" },
        { label: "Fallen Tree / Hazard", value: "Hazard" },
    ];

    // Map Click Handler
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
            // Create FormData for file upload
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
                    style: { background: '#10b981', color: 'white' }
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
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="bg-surface shadow-lg rounded-2xl p-8 border border-secondary/10 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column: Map & Location */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-text-main">1. Pinpoint Location</h2>
                        <div className="h-64 rounded-xl overflow-hidden shadow-inner border border-secondary/20 relative z-0">
                            <MapContainer
                                center={[formData.latitude, formData.longitude]}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker />
                            </MapContainer>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <button onClick={handleLocationDetect} type="button" className="text-primary font-medium hover:underline">
                                📍 Use My Current Location
                            </button>
                            <span className="text-text-muted">
                                {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Form Details */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-xl font-bold text-text-main">2. Issue Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">Category</label>
                            <select
                                required
                                className="w-full p-3 bg-background border border-secondary/20 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map((cat, idx) => (
                                    <option key={idx} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">Description</label>
                            <textarea
                                required
                                rows="3"
                                className="w-full p-3 bg-background border border-secondary/20 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">Photo Evidence</label>
                            <div className="border-2 border-dashed border-secondary/20 rounded-xl p-4 text-center cursor-pointer hover:bg-background transition-colors relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {preview ? (
                                    <img src={preview} alt="Preview" className="h-32 mx-auto rounded-lg object-cover" />
                                ) : (
                                    <div className="text-text-muted py-4">
                                        <span className="text-2xl block mb-2">📸</span>
                                        <span className="text-sm">Click to upload photo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 disabled:opacity-70"
                        >
                            {loading ? 'Submitting Report...' : 'Submit Report'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ReportIssue;
