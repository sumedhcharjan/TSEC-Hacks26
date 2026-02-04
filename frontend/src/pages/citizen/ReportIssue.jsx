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
        { label: "Select Infrastructure Category", value: "" },
        { label: "Road & Pavement Damage", value: "Road Damage" },
        { label: "Public Lighting Failure", value: "Streetlight" },
        { label: "Water & Sanitation Systems", value: "Water Leak" },
        { label: "Waste Management Issues", value: "Garbage" },
        { label: "Public Safety Hazards", value: "Hazard" },
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
            toast.error("Geolocation services not supported by your browser.");
            return;
        }
        const loadingToast = toast.loading('Synchronizing with GPS satellites...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    locationStatus: 'Detected'
                }));
                toast.success('Geospatial fix established.', { id: loadingToast });
            },
            () => {
                toast.error('Unable to establish GPS fix.', { id: loadingToast });
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
                toast.success('Official report submitted successfully.', {
                    duration: 3000,
                    style: { background: '#0A2540', color: 'white' }
                });
                setTimeout(() => navigate('/dashboard'), 1500);
            }
        } catch (error) {
            console.error("Submission failed", error);
            toast.error(error.response?.data?.message || 'Submission failure. Please verify connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="min-h-screen pb-20">
                {/* Formal Header */}
                <div className="bg-white border-b border-border-subtle mb-10">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-3 hover:bg-gray-100 rounded-xl transition-colors text-text-muted"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <div className="flex items-center gap-2 text-action font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                                    Official Filing
                                </div>
                                <h1 className="text-3xl font-black text-primary tracking-tight">Report Infrastructure Issue</h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Section 1: Geospatial Fix */}
                        <div className="civic-card p-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center text-xl">📍</div>
                                <div>
                                    <h2 className="text-xl font-black text-primary tracking-tight">Geospatial Fix</h2>
                                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Define incident location</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-5 gap-10">
                                <div className="md:col-span-3 h-64 rounded-2xl overflow-hidden border border-border-subtle shadow-inner relative z-0">
                                    <MapContainer
                                        center={[formData.latitude, formData.longitude]}
                                        zoom={13}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; OpenStreetMap'
                                        />
                                        <LocationMarker />
                                    </MapContainer>
                                </div>
                                <div className="md:col-span-2 space-y-6">
                                    <button
                                        type="button"
                                        onClick={handleLocationDetect}
                                        className="w-full bg-white text-action hover:bg-accent-soft px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border border-action/20 transition-all flex items-center justify-center gap-3"
                                    >
                                        <span className="text-lg">📡</span>
                                        Auto-Detect GPS
                                    </button>
                                    <div className="bg-gray-50 rounded-xl p-5 border border-border-subtle">
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Logged Coordinates</p>
                                        <p className="text-sm font-mono font-bold text-primary">
                                            {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                        </p>
                                    </div>
                                    <p className="text-[11px] text-text-muted leading-relaxed italic">
                                        Tip: You can manually adjust the pin by clicking anywhere on the tactical map view.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Technical Description */}
                        <div className="civic-card p-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 bg-accent-soft rounded-lg flex items-center justify-center text-xl">📝</div>
                                <div>
                                    <h2 className="text-xl font-black text-primary tracking-tight">Technical Description</h2>
                                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-0.5">Specify incident parameters</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest mb-3">Service Category</label>
                                    <select
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border border-border-subtle rounded-xl focus:ring-4 focus:ring-action/10 focus:border-action outline-none transition-all font-bold text-primary"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest mb-3">Observation Details</label>
                                    <textarea
                                        required
                                        rows="4"
                                        placeholder="Please provide a concise, factual description of the infrastructure failure..."
                                        className="w-full px-6 py-4 bg-gray-50 border border-border-subtle rounded-xl focus:ring-4 focus:ring-action/10 focus:border-action outline-none transition-all font-bold text-primary resize-none placeholder:font-medium"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-text-muted uppercase tracking-widest mb-3">Visual Evidence</label>
                                    <div className="border-2 border-dashed border-border-subtle rounded-[20px] p-10 text-center cursor-pointer hover:border-action hover:bg-accent-soft transition-all relative group overflow-hidden">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {preview ? (
                                            <div className="space-y-4">
                                                <img src={preview} alt="Evidence Preview" className="h-48 mx-auto rounded-xl object-cover shadow-lg border-2 border-white" />
                                                <p className="text-[10px] font-black text-action uppercase tracking-widest">Click to change tactical photo</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                                    <span className="text-3xl">📸</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-primary uppercase tracking-tight">Capture Evidence</p>
                                                    <p className="text-[11px] text-text-muted font-medium mt-1">Accepts high-resolution JPG/PNG formats</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Final Action */}
                        <div className="flex flex-col sm:flex-row gap-6 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="sm:w-1/3 bg-white text-text-muted px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-border-subtle hover:bg-gray-50 transition-all"
                            >
                                Abandon Draft
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-action text-white px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-action/20 hover:bg-action/90 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Submitting to City Hub...
                                    </>
                                ) : 'Transmit Official Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ReportIssue;
