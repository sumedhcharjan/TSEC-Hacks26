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
                    risk_score: Math.floor(Math.random() * 100)
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
