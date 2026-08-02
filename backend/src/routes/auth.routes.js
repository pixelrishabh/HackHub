const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: (req) => {
    const email = String(req.body?.email || '').toLowerCase();
    return email.includes('demo') || email.includes('@hackhub.ai') || email.includes('@hackops.test');
  },
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authController.login);
router.post('/create-staff', authenticate, authorize(['organizer']), authController.createStaff);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
