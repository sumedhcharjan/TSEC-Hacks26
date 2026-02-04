import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HazardMap = ({ hazards }) => {
    const defaultCenter = [19.0760, 72.8777];

    const getSeverityColor = (severity) => {
        if (severity >= 70) return '#EF4444'; // Red-500
        if (severity >= 50) return '#F97316'; // Orange-500
        return '#1E6FD9'; // Action Blue (Standard Operational)
    };

    const getHash = (input) => {
        let str = String(input || '');
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash | 0;
        }
        return hash;
    };

    const getJitteredPosition = (lat, lng, id) => {
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return [0, 0];
        const seed = getHash(id);
        const jitterLat = (Math.sin(seed) * 0.0003);
        const jitterLng = (Math.cos(seed) * 0.0003);
        return [lat + jitterLat, lng + jitterLng];
    };

    return (
        <div className="h-full w-full rounded-[32px] overflow-hidden border border-border-subtle relative shadow-inner">
            <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
                zoomControl={false}
            >
                {/* Muted Professional Tile Layer */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {hazards.map((hazard) => (
                    <CircleMarker
                        key={hazard.id}
                        center={getJitteredPosition(hazard.lat, hazard.lng, hazard.id)}
                        pathOptions={{
                            color: getSeverityColor(hazard.severity),
                            fillColor: getSeverityColor(hazard.severity),
                            fillOpacity: 0.15,
                            weight: 2,
                            opacity: 0.8
                        }}
                        radius={15}
                    >
                        <CircleMarker
                            center={getJitteredPosition(hazard.lat, hazard.lng, hazard.id)}
                            radius={4}
                            pathOptions={{
                                color: 'white',
                                fillColor: getSeverityColor(hazard.severity),
                                fillOpacity: 1,
                                weight: 2
                            }}
                        />
                        <Popup className="civic-popup">
                            <div className="p-4 min-w-[200px]">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: getSeverityColor(hazard.severity) }}></div>
                                        <h3 className="font-black text-primary tracking-tight text-xs uppercase">{hazard.type || 'Hazard'}</h3>
                                    </div>
                                    <span className="text-[9px] font-black px-2 py-0.5 bg-gray-50 border border-border-subtle rounded uppercase text-text-muted">
                                        ID-{String(hazard.id).slice(0, 5)}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Risk Level</span>
                                        <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded" style={{ backgroundColor: `${getSeverityColor(hazard.severity)}10`, color: getSeverityColor(hazard.severity) }}>
                                            {hazard.severity}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Current Status</span>
                                        <span className="text-[9px] font-black text-action uppercase tracking-tight">{hazard.status?.replace('_', ' ')}</span>
                                    </div>
                                    <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-[8px] font-bold text-text-muted">
                                        <span>REPORTED LOG:</span>
                                        <span>{new Date(hazard.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            {/* Tactical Legend Overlay */}
            <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-[24px] border border-border-subtle z-[1000] shadow-2xl space-y-4">
                <div className="flex flex-col gap-1 mb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Tactical Legend</h4>
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Severity Index Level</p>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
                        <span className="text-[10px] font-black text-text-primary uppercase tracking-tight">Critical (70+)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shadow-[0_0_8px_rgba(249,115,22,0.4)]"></span>
                        <span className="text-[10px] font-black text-text-primary uppercase tracking-tight">Escalated (50+)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1E6FD9] shadow-[0_0_8px_rgba(30,111,217,0.4)]"></span>
                        <span className="text-[10px] font-black text-text-primary uppercase tracking-tight">Standard Tracking</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HazardMap;
