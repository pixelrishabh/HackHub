const prisma = require('../config/db');
const { evaluateSubmissionWithAI } = require('../services/ai.service');
const { checkAllSubmissionsSimilarity } = require('../services/similarity.service');

// Global cache or memory store for similarity check flags
let similarityFlagsCache = [];

function isUserAuthorizedForTeam(user, team) {
  if (!user) return false;
  const userRole = (user.role || '').toLowerCase();
  if (['organizer', 'judge', 'mentor', 'sponsor'].includes(userRole)) {
    return true;
  }
  let memberIds = [];
  try {
    memberIds = JSON.parse(team?.member_ids || '[]');
  } catch (e) {}
  return Array.isArray(memberIds) && memberIds.includes(user.id);
}

/**
 * Create or Update Submission for a Team
 */
async function createOrUpdateSubmission(req, res) {
  try {
    const { team_id, repo_link, description, demo_video_link, status } = req.body;

    if (!team_id || !repo_link || !description) {
      return res.status(400).json({ error: 'team_id, repo_link, and description are required.' });
    }

    const team = await prisma.team.findUnique({ where: { id: team_id } });
    if (!team) {
      return res.status(404).json({ error: `Team with ID '${team_id}' not found.` });
    }

    // IDOR Protection: Staff or team member only
    if (!isUserAuthorizedForTeam(req.user, team)) {
      return res.status(403).json({ error: 'Access denied. You are not authorized to create/update submissions for this team.' });
    }

    const existingSubmission = await prisma.submission.findFirst({
      where: { team_id },
    });

    let submission;
    let eventType;

    if (existingSubmission) {
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          repo_link,
          description,
          demo_video_link: demo_video_link || existingSubmission.demo_video_link,
          status: status || existingSubmission.status,
        },
      });
      eventType = 'submission_update';
    } else {
      submission = await prisma.submission.create({
        data: {
          team_id,
          repo_link,
          description,
          demo_video_link: demo_video_link || null,
          status: status || 'SUBMITTED',
        },
      });
      eventType = 'submission_create';
    }

    // Automatically log engagement event
    await prisma.engagementEvent.create({
      data: {
        team_id,
        user_id: req.user?.id || null,
        event_type: eventType,
      },
    });

    return res.status(existingSubmission ? 200 : 201).json({
      message: `Submission ${existingSubmission ? 'updated' : 'created'} successfully.`,
      submission,
    });
  } catch (error) {
    console.error('[SubmissionController] createOrUpdateSubmission Error:', error);
    return res.status(500).json({ error: 'Failed to create/update submission.' });
  }
}

/**
 * FEATURE 3 — AI Project Evaluation
 * Endpoint: POST /api/submissions/:id/evaluate
 */
async function evaluateSubmission(req, res) {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { team: true },
    });

    if (!submission) {
      return res.status(404).json({ error: `Submission with ID '${id}' not found.` });
    }

    // Perform AI evaluation using LLM prompt service
    const evaluationResult = await evaluateSubmissionWithAI({
      repo_link: req.body.repo_link || submission.repo_link,
      description: req.body.description || submission.description,
      demo_video_link: req.body.demo_video_link || submission.demo_video_link,
    });

    // Save or update Evaluation record in DB
    const existingEval = await prisma.evaluation.findFirst({
      where: { submission_id: id },
    });

    let evaluation;
    if (existingEval) {
      evaluation = await prisma.evaluation.update({
        where: { id: existingEval.id },
        data: {
          originality_score: evaluationResult.originality_score,
          technical_depth_score: evaluationResult.technical_depth_score,
          completeness_score: evaluationResult.completeness_score,
          clarity_score: evaluationResult.clarity_score,
          ai_justification_text: evaluationResult.justification,
        },
      });
    } else {
      evaluation = await prisma.evaluation.create({
        data: {
          submission_id: id,
          originality_score: evaluationResult.originality_score,
          technical_depth_score: evaluationResult.technical_depth_score,
          completeness_score: evaluationResult.completeness_score,
          clarity_score: evaluationResult.clarity_score,
          ai_justification_text: evaluationResult.justification,
          judge_manual_score: null,
        },
      });
    }

    return res.status(200).json({
      message: 'AI evaluation completed successfully',
      evaluation,
    });
  } catch (error) {
    console.error('[SubmissionController] evaluateSubmission Error:', error);
    return res.status(500).json({ error: 'AI Evaluation failed. Please try again.' });
  }
}

/**
 * FEATURE 3 — Get Submission Scorecard (AI Scorecard + Judge's Manual Score side by side)
 * Endpoint: GET /api/submissions/:id/evaluation
 */
async function getSubmissionEvaluation(req, res) {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        team: true,
        evaluations: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: `Submission with ID '${id}' not found.` });
    }

    // IDOR Protection: Staff or submitting team member only
    if (!isUserAuthorizedForTeam(req.user, submission.team)) {
      return res.status(403).json({ error: 'Access denied. You are not authorized to view evaluation details for this submission.' });
    }

    const latestEval = submission.evaluations[0] || null;

    if (!latestEval) {
      return res.status(200).json({
        submission_id: id,
        team_name: submission.team.name,
        evaluated: false,
        message: 'Submission has not been evaluated by AI yet.',
      });
    }

    const aiAverageScore = Number(
      ((latestEval.originality_score +
        latestEval.technical_depth_score +
        latestEval.completeness_score +
        latestEval.clarity_score) / 4).toFixed(2)
    );

    return res.status(200).json({
      submission_id: id,
      team_id: submission.team_id,
      team_name: submission.team.name,
      repo_link: submission.repo_link,
      description: submission.description,
      demo_video_link: submission.demo_video_link,
      evaluated: true,
      scorecard: {
        ai_scorecard: {
          originality_score: latestEval.originality_score,
          technical_depth_score: latestEval.technical_depth_score,
          completeness_score: latestEval.completeness_score,
          clarity_score: latestEval.clarity_score,
          ai_overall_average: aiAverageScore,
          ai_justification_text: latestEval.ai_justification_text,
        },
        judge_manual_scorecard: {
          judge_manual_score: latestEval.judge_manual_score,
          has_manual_score: latestEval.judge_manual_score !== null,
        },
      },
    });
  } catch (error) {
    console.error('[SubmissionController] getSubmissionEvaluation Error:', error);
    return res.status(500).json({ error: 'Failed to fetch submission evaluation.' });
  }
}

/**
 * Judge Manual Score Update
 * Endpoint: PATCH /api/submissions/:id/manual-score
 */
async function updateJudgeManualScore(req, res) {
  try {
    const { id } = req.params;
    const { judge_manual_score } = req.body;

    if (judge_manual_score === undefined || typeof judge_manual_score !== 'number') {
      return res.status(400).json({ error: 'Numeric judge_manual_score is required.' });
    }

    let evalObj = await prisma.evaluation.findFirst({ where: { submission_id: id } });

    if (!evalObj) {
      evalObj = await prisma.evaluation.create({
        data: {
          submission_id: id,
          originality_score: 0,
          technical_depth_score: 0,
          completeness_score: 0,
          clarity_score: 0,
          ai_justification_text: 'Manual score assigned by judge.',
          judge_manual_score: judge_manual_score,
        },
      });
    } else {
      evalObj = await prisma.evaluation.update({
        where: { id: evalObj.id },
        data: { judge_manual_score: judge_manual_score },
      });
    }

    return res.status(200).json({
      message: 'Judge manual score updated successfully.',
      evaluation: evalObj,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update judge manual score.' });
  }
}

/**
 * FEATURE 5 — AI Plagiarism/Similarity Detection
 * Endpoint: POST /api/submissions/check-similarity
 */
async function checkSimilarity(req, res) {
  try {
    const threshold = req.body.threshold ? parseFloat(req.body.threshold) : 0.85;

    const submissions = await prisma.submission.findMany({
      include: { team: true },
    });

    if (submissions.length < 2) {
      return res.status(200).json({
        message: 'At least 2 submissions are required to run similarity analysis.',
        total_submissions: submissions.length,
        flagged_pairs: [],
      });
    }

    const mappedSubmissions = submissions.map(s => ({
      id: s.id,
      team_id: s.team_id,
      team_name: s.team.name,
      repo_link: s.repo_link,
      description: s.description,
    }));

    const flaggedPairs = await checkAllSubmissionsSimilarity(mappedSubmissions, threshold);
    similarityFlagsCache = flaggedPairs;

    return res.status(200).json({
      message: `Similarity check completed over ${submissions.length} submission(s).`,
      threshold_used: threshold,
      flagged_count: flaggedPairs.length,
      flagged_pairs: flaggedPairs,
    });
  } catch (error) {
    console.error('[SubmissionController] checkSimilarity Error:', error);
    return res.status(500).json({ error: 'Similarity detection failed.' });
  }
}

/**
 * FEATURE 5 — GET Flagged Similarity Pairs
 * Endpoint: GET /api/submissions/similarity-flags
 */
async function getSimilarityFlags(req, res) {
  try {
    if (similarityFlagsCache.length === 0) {
      // Run quick check if cache is empty
      const submissions = await prisma.submission.findMany({ include: { team: true } });
      if (submissions.length >= 2) {
        similarityFlagsCache = await checkAllSubmissionsSimilarity(
          submissions.map(s => ({
            id: s.id,
            team_id: s.team_id,
            team_name: s.team.name,
            repo_link: s.repo_link,
            description: s.description,
          })),
          0.85
        );
      }
    }

    return res.status(200).json({
      flagged_pairs: similarityFlagsCache,
      total_flagged: similarityFlagsCache.length,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch similarity flags.' });
  }
}

/**
 * List submissions (Scoped for participants)
 */
async function getAllSubmissions(req, res) {
  try {
    let submissions = await prisma.submission.findMany({
      include: { team: true, evaluations: true },
      orderBy: { createdAt: 'desc' },
    });

    // Data Scoping: Participants see only their team's submissions, staff sees all
    const userRole = (req.user?.role || '').toLowerCase();
    const isStaff = ['organizer', 'judge', 'mentor', 'sponsor'].includes(userRole);
    if (!isStaff && req.user) {
      submissions = submissions.filter(s => isUserAuthorizedForTeam(req.user, s.team));
    }

    return res.status(200).json({ submissions });
  } catch (error) {
    console.error('[SubmissionController] getAllSubmissions Error:', error);
    return res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
}

module.exports = {
  createOrUpdateSubmission,
  evaluateSubmission,
  getSubmissionEvaluation,
  updateJudgeManualScore,
  checkSimilarity,
  getSimilarityFlags,
  getAllSubmissions,
};

