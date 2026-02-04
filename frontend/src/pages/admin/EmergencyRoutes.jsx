import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { trafficZones } from '../../data/trafficData';
import polyline from '@mapbox/polyline';

// Fix default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons for different purposes
const createCustomIcon = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

const originIcon = createCustomIcon('#10b981');
const destinationIcon = createCustomIcon('#ef4444');

const EmergencyRoutes = () => {
    const [incidents, setIncidents] = useState([]);
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mapCenter] = useState([19.0760, 72.8777]); // Default: Mumbai
    const [selectionMode, setSelectionMode] = useState(null); // 'origin' or 'destination'

    // Fetch incidents on mount
    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await api.get('/admin/reports');
            setIncidents(response.data);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            toast.error('Failed to load incidents');
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        const loadingToast = toast.loading('Getting your location...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setOrigin({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                toast.success('Location set as origin', { id: loadingToast });
            },
            () => {
                toast.error('Unable to retrieve your location', { id: loadingToast });
            }
        );
    };

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (selectionMode === 'origin') {
                    setOrigin({ lat: e.latlng.lat, lng: e.latlng.lng });
                    toast.success('Origin set');
                    setSelectionMode(null);
                } else if (selectionMode === 'destination') {
                    setDestination({ lat: e.latlng.lat, lng: e.latlng.lng });
                    toast.success('Destination set');
                    setSelectionMode(null);
                }
            }
        });
        return null;
    };


    // Helper function to create a polygon around a point (for avoiding incidents)
    const createAvoidPolygon = (lat, lng, radiusMeters = 200) => {
        const earthRadius = 6371000; // meters
        const latOffset = (radiusMeters / earthRadius) * (180 / Math.PI);
        const lngOffset = (radiusMeters / (earthRadius * Math.cos(lat * Math.PI / 180))) * (180 / Math.PI);

        // Create a square polygon around the point
        return {
            type: "Polygon",
            coordinates: [[
                [lng - lngOffset, lat - latOffset],
                [lng + lngOffset, lat - latOffset],
                [lng + lngOffset, lat + latOffset],
                [lng - lngOffset, lat + latOffset],
                [lng - lngOffset, lat - latOffset]
            ]]
        };
    };

    const calculateRoute = async () => {
        if (!origin || !destination) {
            toast.error('Please set both origin and destination');
            return;
        }

        setLoading(true);
        try {
            const orsApiKey = import.meta.env.VITE_ORS_KEY;
            if (!orsApiKey) throw new Error('ORS API key missing');

            // Filter high-risk incidents (risk_score >= 70) to avoid
            const highRiskIncidents = incidents.filter(inc =>
                inc.risk_score >= 70 && inc.latitude && inc.longitude
            );

            // Create avoid polygons for high-risk incidents
            const avoidPolygons = highRiskIncidents.map(inc =>
                createAvoidPolygon(inc.latitude, inc.longitude, 150)
            );

            const requestBody = {
                coordinates: [
                    [origin.lng, origin.lat],
                    [destination.lng, destination.lat]
                ]
            };

            // Add avoid_polygons if there are high-risk incidents
            if (avoidPolygons.length > 0) {
                requestBody.options = {
                    avoid_polygons: {
                        type: "MultiPolygon",
                        coordinates: avoidPolygons.map(p => p.coordinates)
                    }
                };
            }

            const response = await fetch(
                'https://api.openrouteservice.org/v2/directions/driving-car',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: orsApiKey
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            if (!response.ok) {
                const err = await response.text();
                throw new Error(err);
            }

            const data = await response.json();

            if (!data.routes?.[0]?.geometry) {
                throw new Error('Route geometry missing');
            }

            // Decode encoded polyline → Leaflet coords
            const decodedCoords = polyline
                .decode(data.routes[0].geometry)
                .map(([lat, lng]) => [lat, lng]);

            setRoute({
                coordinates: decodedCoords,
                distance: (data.routes[0].summary.distance / 1000).toFixed(2),
                duration: (data.routes[0].summary.duration / 60).toFixed(0)
            });

            const avoidMessage = avoidPolygons.length > 0
                ? ` (avoiding ${avoidPolygons.length} high-risk areas)`
                : '';
            toast.success(`Route calculated${avoidMessage}`);
        } catch (error) {
            console.error('Error calculating route:', error);
            toast.error('Failed to calculate route');
        } finally {
            setLoading(false);
        }
    };

    const getIncidentColor = (riskScore) => {
        if (riskScore >= 80) return '#ef4444';
        if (riskScore >= 50) return '#f59e0b';
        return '#22c55e';
    };

    const clearRoute = () => {
        setOrigin(null);
        setDestination(null);
        setRoute(null);
        setSelectionMode(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900">Emergency Route Finder</h1>
                <p className="text-sm text-gray-500 mt-1">Plan optimal routes avoiding infrastructure incidents</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Control Panel */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Origin Selection */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-3">Origin</h3>
                        <button
                            onClick={handleUseCurrentLocation}
                            className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium mb-2"
                        >
                            📍 Use Current Location
                        </button>
                        <button
                            onClick={() => setSelectionMode('origin')}
                            className={`w-full py-2 px-4 rounded-lg transition-colors font-medium ${selectionMode === 'origin'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {selectionMode === 'origin' ? 'Click Map to Set' : 'Set on Map'}
                        </button>
                        {origin && (
                            <p className="text-xs text-gray-500 mt-2">
                                {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
                            </p>
                        )}
                    </div>

                    {/* Destination Selection */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-3">Destination</h3>
                        <button
                            onClick={() => setSelectionMode('destination')}
                            className={`w-full py-2 px-4 rounded-lg transition-colors font-medium ${selectionMode === 'destination'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {selectionMode === 'destination' ? 'Click Map to Set' : 'Set on Map'}
                        </button>
                        {destination && (
                            <p className="text-xs text-gray-500 mt-2">
                                {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
                        <button
                            onClick={calculateRoute}
                            disabled={!origin || !destination || loading}
                            className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Calculating...' : '🚑 Calculate Route'}
                        </button>
                        <button
                            onClick={clearRoute}
                            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Route Info */}
                    {route && (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-2">Route Info</h3>
                            <div className="space-y-1 text-sm">
                                <p className="text-gray-600">Distance: <span className="font-medium text-gray-900">{route.distance} km</span></p>
                                <p className="text-gray-600">Duration: <span className="font-medium text-gray-900">~{route.duration} min</span></p>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-2">Legend</h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span>Origin</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span>Destination</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
                                <span>High Risk Incident</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500 border border-white"></div>
                                <span>Medium Risk</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
                                <span>Low Risk</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '700px' }}>
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />

                            <MapClickHandler />

                            {/* Traffic Zones */}
                            {trafficZones.map(zone => (
                                <Circle
                                    key={zone.id}
                                    center={zone.center}
                                    radius={zone.radius}
                                    pathOptions={{
                                        color: zone.color,
                                        fillColor: zone.color,
                                        fillOpacity: zone.opacity,
                                        weight: 1
                                    }}
                                >
                                    <Popup>
                                        <strong>{zone.name}</strong><br />
                                        Severity: {zone.severity}
                                    </Popup>
                                </Circle>
                            ))}

                            {/* Incident Markers */}
                            {incidents.map(incident => (
                                incident.latitude && incident.longitude && (
                                    <Circle
                                        key={incident.id}
                                        center={[incident.latitude, incident.longitude]}
                                        radius={100}
                                        pathOptions={{
                                            color: getIncidentColor(incident.risk_score),
                                            fillColor: getIncidentColor(incident.risk_score),
                                            fillOpacity: 0.5,
                                            weight: 2
                                        }}
                                    >
                                        <Popup>
                                            <strong>{incident.category}</strong><br />
                                            Risk Score: {incident.risk_score}<br />
                                            Status: {incident.status}
                                        </Popup>
                                    </Circle>
                                )
                            ))}

                            {/* Origin Marker */}
                            {origin && (
                                <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
                                    <Popup>Origin</Popup>
                                </Marker>
                            )}

                            {/* Destination Marker */}
                            {destination && (
                                <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
                                    <Popup>Destination</Popup>
                                </Marker>
                            )}

                            {/* Route Polyline */}
                            {route && (
                                <Polyline
                                    positions={route.coordinates}
                                    pathOptions={{
                                        color: '#3b82f6',
                                        weight: 4,
                                        opacity: 0.7
                                    }}
                                />
                            )}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyRoutes;
