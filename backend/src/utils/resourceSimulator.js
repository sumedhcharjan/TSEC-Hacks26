/**
 * Resource Simulator Utility
 * Generates realistic 24-hour time-series data for Energy (kW) and Water (LPM)
 * with injected anomalies (surges and leaks) for demo purposes.
 */

const generateTimeSeriesData = () => {
    const data = [];
    const now = new Date();
    const intervals = 96; // 24 hours * 4 (15-min intervals)

    // Start from midnight of the current day
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    for (let i = 0; i < intervals; i++) {
        const timestamp = new Date(startTime.getTime() + i * 15 * 60000);
        const hour = timestamp.getHours();

        // --- ENERGY SIMULATION (kW) ---
        // Diurnal curve: Base usage + Peak hours (8-10 AM, 6-10 PM)
        let energyBase = 2.5 + Math.sin((hour - 6) * Math.PI / 12) * 1.5;
        let energyVal = energyBase + (Math.random() * 0.5);

        // Inject a "Surge" at 2 PM (Index 56)
        if (i >= 56 && i <= 58) {
            energyVal *= 2.8; // Dramatic spike
        }

        // --- WATER SIMULATION (LPM) ---
        // Normal usage + "Night Leak" scenario
        let waterVal = 10 + (Math.random() * 5);
        if (hour >= 6 && hour <= 9) waterVal += 15; // Morning shower surge
        if (hour >= 18 && hour <= 21) waterVal += 10; // Evening surge

        // Inject a "Leak" starting at 1 AM (Index 4) for 3 hours
        if (i >= 4 && i <= 16) {
            waterVal = 42 + (Math.random() * 3); // Continuous high flow
        }

        data.push({
            timestamp: timestamp.toISOString(),
            energy: parseFloat(energyVal.toFixed(2)),
            water: parseFloat(waterVal.toFixed(2)),
            index: i
        });
    }

    return data;
};

module.exports = { generateTimeSeriesData };
