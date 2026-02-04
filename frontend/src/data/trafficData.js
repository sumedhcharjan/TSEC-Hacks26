// Mock traffic congestion data
// Each zone represents an area with traffic congestion
export const trafficZones = [
    {
        id: 1,
        name: "Downtown Congestion",
        center: [19.0760, 72.8777],
        radius: 500, // meters
        severity: "high", // high, medium, low
        color: "#ef4444",
        opacity: 0.3
    },
    {
        id: 2,
        name: "Highway Junction",
        center: [19.0896, 72.8656],
        radius: 300,
        severity: "medium",
        color: "#f59e0b",
        opacity: 0.25
    },
    {
        id: 3,
        name: "Market Area",
        center: [19.0650, 72.8900],
        radius: 400,
        severity: "high",
        color: "#ef4444",
        opacity: 0.3
    },
    {
        id: 4,
        name: "Residential Zone",
        center: [19.0820, 72.8820],
        radius: 250,
        severity: "low",
        color: "#22c55e",
        opacity: 0.2
    }
];

export const getSeverityColor = (severity) => {
    switch (severity) {
        case 'high': return '#ef4444';
        case 'medium': return '#f59e0b';
        case 'low': return '#22c55e';
        default: return '#6b7280';
    }
};
