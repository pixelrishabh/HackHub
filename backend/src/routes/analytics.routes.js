const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Analytics Dashboard Endpoint (Staff/Sponsors/Participants)
router.get('/dashboard', authenticate, analyticsController.getAnalyticsDashboard);

// Certificate Endpoints
router.post('/certificates/generate', authenticate, authorize(['organizer']), analyticsController.generateCertificates);
router.get('/certificates/user/:userId?', authenticate, analyticsController.getUserCertificates);

// Public Certificate Verification Endpoint (No auth required for public verification)
router.get('/certificates/verify/:hash', analyticsController.verifyCertificate);

module.exports = router;
