

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const exampleRoutes = require('./routes/example.routes');
const adminRoutes = require('./routes/admin/index.routes');
const citizenRoutes = require('./routes/citizen/index.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', exampleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/announcements', require('./routes/announcement.routes'));

// Health Check

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// Backend restart trigger
