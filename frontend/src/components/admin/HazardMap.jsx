import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HazardMap = ({ hazards }) => {
    // Default center (Mumbai/India approx or dynamic based on hazards)
    const defaultCenter = [19.0760, 72.8777];

    const getSeverityColor = (severity) => {
        if (severity >= 70) return '#ef4444'; // Red-500
        if (severity >= 50) return '#f97316'; // Orange-500
        return '#eab308'; // Yellow-500
    };

    const getSeverityLabel = (severity) => {
        if (severity >= 70) return 'Critical';
        if (severity >= 50) return 'High';
        return 'Medium';
    };

    // A simple string hashing function to handle UUIDs or numeric IDs
    const getHash = (input) => {
        let str = String(input || '');
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash | 0; // Convert to 32bit integer
        }
        return hash;
    };

    // Deterministic jitter function to separate overlapping points
    const getJitteredPosition = (lat, lng, id) => {
        // Safe check for invalid lat/lng immediately prevents crashes
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return [0, 0];

        // Use hash of the ID (supports UUID strings) for seed
        const seed = getHash(id);
        const jitterLat = (Math.sin(seed) * 0.0003); // approx 30m jitter
        const jitterLng = (Math.cos(seed) * 0.0003);

        return [lat + jitterLat, lng + jitterLng];
    };

    return (
        <div className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-gray-700 relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                {/* Dark themed map tiles (step 4: professional look) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {hazards.map((hazard) => (
                    <CircleMarker
                        key={hazard.id}
                        center={getJitteredPosition(hazard.lat, hazard.lng, hazard.id)}
                        pathOptions={{
                            color: getSeverityColor(hazard.severity),
                            fillColor: getSeverityColor(hazard.severity),
                            fillOpacity: 0.7,
                            weight: 2
                        }}
                        radius={8}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1">
                                <h3 className="font-bold text-gray-900">{hazard.type || 'Hazard'}</h3>
                                <div className="text-sm text-gray-600">
                                    <p>Severity: <span className="font-semibold" style={{ color: getSeverityColor(hazard.severity) }}>
                                        {hazard.severity}% ({getSeverityLabel(hazard.severity)})
                                    </span></p>
                                    <p>Status: {hazard.status}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(hazard.reportedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 right-4 bg-gray-900/90 text-white p-3 rounded-lg border border-gray-700 text-xs z-[1000] backdrop-blur-sm shadow-xl">
                <h4 className="font-bold mb-2 uppercase tracking-wider text-gray-400">Severity Levels</h4>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                    <span>Critical (70-100%)</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
                    <span>High (50-69%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span>
                    <span>Moderate (&lt;50%)</span>
                </div>
            </div>
        </div>
    );
};

export default HazardMap;
