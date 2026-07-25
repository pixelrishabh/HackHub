const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// FEATURE 5: Similarity Detection & Flags (Organizer/Judge)
router.post('/check-similarity', authenticate, authorize(['organizer', 'judge']), submissionController.checkSimilarity);
router.get('/similarity-flags', authenticate, authorize(['organizer', 'judge']), submissionController.getSimilarityFlags);

// FEATURE 3: Project Evaluation endpoints
router.post('/:id/evaluate', authenticate, authorize(['judge', 'organizer']), submissionController.evaluateSubmission);
router.get('/:id/evaluation', authenticate, submissionController.getSubmissionEvaluation);
router.patch('/:id/manual-score', authenticate, authorize(['judge', 'organizer']), submissionController.updateJudgeManualScore);

// Submissions management endpoints
router.post('/', authenticate, submissionController.createOrUpdateSubmission);
router.get('/', authenticate, submissionController.getAllSubmissions);

module.exports = router;
