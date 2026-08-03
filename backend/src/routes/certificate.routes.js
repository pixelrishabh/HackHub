const express = require('express');
const router = express.Router();
const certController = require('../controllers/certificate.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', authenticate, certController.getMyCertificates);
router.post('/issue', authenticate, authorize('organizer'), certController.issueCertificate);
router.get('/verify/:hash', certController.verifyCertificate);

module.exports = router;
