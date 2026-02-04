const express = require('express');
const router = express.Router();
const { getAllReports, updateReportStatus, getDashboardStats, getReportById } = require('../../controllers/admin/dashboard.controller');
const { getResourceStats } = require('../../controllers/admin/optimization.controller');
const { getContractors, assignWork, approveMilestone } = require('../../controllers/admin/contractor.controller');

// GET all reports (with user info)
router.get('/reports', getAllReports);

// GET all contractors
router.get('/contractors', getContractors);

// POST assign work to contractor
router.post('/assign-work', assignWork);

// POST approve a milestone
router.post('/approve-milestone', approveMilestone);

// GET report by ID
router.get('/reports/:id', getReportById);

// GET dashboard statistics
router.get('/stats', getDashboardStats);

// GET resource optimization data
router.get('/optimization', getResourceStats);

// PATCH update report status
router.patch('/reports/:id', updateReportStatus);

module.exports = router;
