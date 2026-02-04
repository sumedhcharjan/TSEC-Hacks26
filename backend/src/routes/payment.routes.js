const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');

// Payment Intent routes
router.post('/work-orders/:orderId/intent', PaymentController.createIntentForWorkOrder);

// Milestone routes
router.post('/work-orders/:orderId/milestones/sync', PaymentController.syncMilestones);
router.post('/work-orders/:orderId/milestones/:index/proof', PaymentController.submitMilestoneProof);

// Ledger routes
router.get('/ledger', PaymentController.getLedger);

module.exports = router;
