const axios = require('axios');
const FormData = require('form-data');

const ML_SERVICE_URL = (process.env.ML_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');

/**
 * Calculate risk score from image using ML service
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} filename - Original filename
 * @returns {Promise<number>} Risk score (0-100)
 */
const calculateRiskScore = async (imageBuffer, filename) => {
    try {
        // Create form data for ML service
        const formData = new FormData();
        formData.append('file', imageBuffer, {
            filename: filename,
            contentType: 'image/jpeg'
        });

        // Call ML service
        const response = await axios.post(
            `${ML_SERVICE_URL}/predict-damage`,
            formData,
            {
                headers: formData.getHeaders(),
                timeout: 10000 // 10 second timeout
            }
        );

        // Extract health score from response
        const { health_score, damage_type, severity } = response.data;

        // Calculate risk score (inverse of health score)
        const riskScore = 100 - health_score;

        console.log(`ML Analysis: ${damage_type}, Severity: ${severity}, Risk Score: ${riskScore}`);

        return Math.round(riskScore);
    } catch (error) {
        console.error('ML Service Error:', error.message);

        // Fallback: return medium priority if ML service is unavailable
        console.log('Using fallback risk score: 50 (medium priority)');
        return 50;
    }
};

/**
 * Download image from URL and get buffer
 * @param {string} imageUrl - Public image URL
 * @returns {Promise<Buffer>} Image buffer
 */
const downloadImage = async (imageUrl) => {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 10000
        });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Failed to download image:', error.message);
        throw error;
    }
};

/**
 * Check if ML service is available
 * @returns {Promise<boolean>}
 */
const checkMLServiceHealth = async () => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/`, { timeout: 3000 });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

module.exports = {
    calculateRiskScore,
    downloadImage,
    checkMLServiceHealth
};
