const express = require('express');
const router = express.Router();
const { createReport, getReports, getUserReports, upload } = require('../../controllers/citizen/reports.controller');

// GET all reports
router.get('/', getReports);

// GET reports for specific user
router.get('/user/:user_id', getUserReports);

// POST create report (with image upload)
router.post('/', upload.single('image'), createReport);

module.exports = router;
