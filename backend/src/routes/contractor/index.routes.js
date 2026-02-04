const express = require('express');
const router = express.Router();
const { getDashboardData, updateOrderStatus, requestMilestoneVerification } = require('../../controllers/contractor/dashboard.controller');

// GET contractor dashboard stats and orders
router.get('/dashboard', getDashboardData);

// PATCH update work order status
router.patch('/orders/:id/status', updateOrderStatus);

// POST request milestone verification
router.post('/verify-milestone', requestMilestoneVerification);

module.exports = router;
