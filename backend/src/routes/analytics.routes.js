const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/certificates/verify/:hash', analyticsController.verifyCertificate); // Public route
router.get('/dashboard', authenticate, analyticsController.getDashboard);
router.post('/certificates/generate', authenticate, analyticsController.generateCertificates);
router.get('/certificates/user/:userId', authenticate, analyticsController.getUserCertificates);
router.get('/certificates/user', authenticate, analyticsController.getUserCertificates);

module.exports = router;
