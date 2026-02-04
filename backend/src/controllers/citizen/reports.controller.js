const supabase = require('../../services/supabase');
const multer = require('multer');

// Multer Setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const createReport = async (req, res) => {
    try {
        const { category, description, latitude, longitude, user_id } = req.body;
        const file = req.file;

        let image_url = null;
        let risk_score = 50; // Default medium priority

        // Predefined risk scores by category
        const categoryRiskScores = {
            'Road Damage': null,      // Will use ML prediction
            'Streetlight': 65,         // Medium-high priority
            'Water Leak': 85,          // High priority (safety concern)
            'Garbage': 40,             // Medium-low priority
            'Hazard': 90               // Very high priority (immediate danger)
        };

        // Check if category has predefined risk score
        if (categoryRiskScores.hasOwnProperty(category) && categoryRiskScores[category] !== null) {
            risk_score = categoryRiskScores[category];
            console.log(`📋 Using predefined risk score for ${category}: ${risk_score}`);
        }

        if (file) {
            // Sanitize filename
            const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;

            // Upload to 'TSEC26' bucket
            const { data, error } = await supabase
                .storage
                .from('TSEC26')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                });

            if (error) throw error;

            // Get Public URL
            const { data: publicUrlData } = supabase
                .storage
                .from('TSEC26')
                .getPublicUrl(fileName);

            image_url = publicUrlData.publicUrl;

            // 🤖 ML INTEGRATION: Only for Road Damage category
            if (category === 'Road Damage' && categoryRiskScores[category] === null) {
                try {
                    const mlService = require('../../services/mlService');
                    risk_score = await mlService.calculateRiskScore(file.buffer, fileName);
                    console.log(`🤖 ML-calculated risk score for Road Damage: ${risk_score}`);
                } catch (mlError) {
                    console.error('❌ ML service unavailable, using default:', mlError.message);
                    risk_score = 70; // Default for road damage if ML fails
                }
            }
        } else if (req.body.image_url) {
            image_url = req.body.image_url;
        }

        // Insert into Database
        const { data, error: dbError } = await supabase
            .from('reports')
            .insert([
                {
                    user_id,
                    category,
                    description,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    image_url,
                    status: 'PENDING',
                    risk_score
                }
            ])
            .select();

        if (dbError) throw dbError;

        res.status(201).json({ success: true, report: data[0] });

    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserReports = async (req, res) => {
    try {
        const { user_id } = req.params;

        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    upload,
    createReport,
    getReports,
    getUserReports
};
