const { generateTimeSeriesData } = require('../../utils/resourceSimulator');

/**
 * Optimization Controller
 * Handles anomaly detection and recommendation generation
 */

// Simple MA-7 Deviation Detection
const detectAnomalies = (data) => {
    const alerts = [];

    for (let i = 7; i < data.length; i++) {
        // Energy Check
        const prevEnergyAvg = data.slice(i - 7, i).reduce((sum, d) => sum + d.energy, 0) / 7;
        const energyDeviation = (data[i].energy - prevEnergyAvg) / prevEnergyAvg;

        if (energyDeviation > 0.8) {
            alerts.push({
                type: 'ENERGY_SURGE',
                severity: energyDeviation > 1.5 ? 'CRITICAL' : 'MEDIUM',
                value: data[i].energy,
                timestamp: data[i].timestamp,
                reason: `Energy consumption spiked by ${(energyDeviation * 100).toFixed(0)}% compared to recent baseline.`
            });
        }

        // Water Check
        const prevWaterAvg = data.slice(i - 7, i).reduce((sum, d) => sum + d.water, 0) / 7;
        const waterDeviation = (data[i].water - prevWaterAvg) / prevWaterAvg;

        // Leak Detection (Steady high flow at night)
        const hour = new Date(data[i].timestamp).getHours();
        if (hour >= 1 && hour <= 4 && data[i].water > 35) {
            alerts.push({
                type: 'WATER_LEAK',
                severity: 'CRITICAL',
                value: data[i].water,
                timestamp: data[i].timestamp,
                reason: 'Sustained high water flow detected during off-peak night hours. Highly indicative of a pipe burst.'
            });
        }
    }

    // Sort by timestamp descending and take the most recent context
    return alerts.reverse().slice(0, 5);
};

const getRecommendations = (alerts) => {
    const recommendations = [];

    alerts.forEach(alert => {
        if (alert.type === 'ENERGY_SURGE') {
            recommendations.push({
                target: 'Sector 4 Grid',
                action: 'Load Balancing Required',
                suggestion: 'Shift non-critical industrial HVAC loads to off-peak hours (11 PM - 5 AM).',
                impact: 'Est. peak reduction: 12%'
            });
        }
        if (alert.type === 'WATER_LEAK') {
            recommendations.push({
                target: 'Zone 2 North Pipeline',
                action: 'Automated Isolation Sugggested',
                suggestion: 'Trigger remote shut-off valve #V12 and dispatch repair crew to Sector 8 junction.',
                impact: 'Est. water saved: 450L/hr'
            });
        }
    });

    // Add general "optimization" if no alerts
    if (recommendations.length === 0) {
        recommendations.push({
            target: 'Smart Street-lights',
            action: 'Adaptive Dimming',
            suggestion: 'Usage is low. Dim sector 1-4 lights to 60% for next 4 hours.',
            impact: 'Est. Energy Savings: 5%'
        });
    }

    return recommendations;
};

const getResourceStats = async (req, res) => {
    try {
        const timeSeriesData = generateTimeSeriesData();
        const activeAlerts = detectAnomalies(timeSeriesData);
        const recommendations = getRecommendations(activeAlerts);

        // 🤖 ML INTEGRATION: Call forecasting service
        let forecast = null;
        try {
            const axios = require('axios');
            const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
            const mlResponse = await axios.post(`${ML_SERVICE_URL}/forecast-demand`, timeSeriesData.slice(-20));
            forecast = mlResponse.data;
            console.log('✅ ML Forecasting complete');
        } catch (mlError) {
            console.error('❌ ML Forecasting failed:', mlError.message);
        }

        // Get current "Real-time" snapshot (latest data point)
        const currentSnapshot = timeSeriesData[timeSeriesData.length - 1];

        res.json({
            success: true,
            data: {
                timeline: timeSeriesData,
                alerts: activeAlerts,
                recommendations: recommendations,
                forecast: forecast,
                summary: {
                    currentEnergy: currentSnapshot.energy,
                    currentWater: currentSnapshot.water,
                    alertCount: activeAlerts.length
                }
            }
        });
    } catch (error) {
        console.error('Error in Resource Stats:', error);
        res.status(500).json({ success: false, message: 'Optimization Engine failed to generate report.' });
    }
};

module.exports = { getResourceStats };
