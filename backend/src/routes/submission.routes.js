const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/check-similarity', authenticate, authorize(['organizer', 'judge']), submissionController.checkSimilarity);
router.get('/similarity-flags', authenticate, authorize(['organizer', 'judge']), submissionController.getSimilarityFlags);
router.get('/', authenticate, submissionController.getAllSubmissions);
router.post('/', authenticate, submissionController.createOrUpdateSubmission);
router.post('/:id/evaluate', authenticate, submissionController.evaluateSubmission);
router.get('/:id/evaluation', authenticate, submissionController.getEvaluation);
router.patch('/:id/manual-score', authenticate, authorize(['judge', 'organizer']), submissionController.updateManualScore);

module.exports = router;
