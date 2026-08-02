const Submission = require('../models/Submission');
const Team = require('../models/Team');
const { evaluateSubmissionWithAI, calculateTFIDFSimilarity } = require('../services/ai.service');

async function createOrUpdateSubmission(req, res) {
  try {
    const { team_id, teamId, title, description, repo_link, repoLink, demo_video_link, demoVideoLink } = req.body;
    const resolvedTeamId = team_id || teamId;

    if (!resolvedTeamId) {
      return res.status(400).json({ error: 'Team ID is required.' });
    }

    let submission = await Submission.findOne({ teamId: resolvedTeamId });

    if (submission) {
      submission.title = title || submission.title;
      submission.description = description || submission.description;
      submission.repoLink = repo_link || repoLink || submission.repoLink;
      submission.demoVideoLink = demo_video_link || demoVideoLink || submission.demoVideoLink;
      submission.status = 'SUBMITTED';
      await submission.save();
    } else {
      submission = await Submission.create({
        teamId: resolvedTeamId,
        title: title || 'Hackathon Project',
        description: description || '',
        repoLink: repo_link || repoLink || '',
        demoVideoLink: demo_video_link || demoVideoLink || '',
        status: 'SUBMITTED',
      });
    }

    return res.status(201).json({
      message: 'Submission saved successfully',
      submission: submission.toJSON(),
    });
  } catch (error) {
    console.error('[SubmissionController] createOrUpdateSubmission Error:', error);
    return res.status(500).json({ error: 'Failed to save submission.' });
  }
}

async function getAllSubmissions(req, res) {
  try {
    const submissions = await Submission.find().populate('teamId', 'name category primaryField').sort({ createdAt: -1 });
    const formatted = submissions.map((s) => s.toJSON());
    return res.status(200).json({ submissions: formatted });
  } catch (error) {
    console.error('[SubmissionController] getAllSubmissions Error:', error);
    return res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
}

async function evaluateSubmission(req, res) {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ error: `Submission with ID '${id}' not found.` });
    }

    const aiEval = await evaluateSubmissionWithAI(submission);
    submission.aiEvaluation = {
      ...aiEval,
      evaluated_at: new Date(),
    };
    submission.status = 'EVALUATED';
    await submission.save();

    return res.status(200).json({
      message: 'Project evaluated successfully by AI Scorecard Engine.',
      evaluation: submission.aiEvaluation,
      submission: submission.toJSON(),
    });
  } catch (error) {
    console.error('[SubmissionController] evaluateSubmission Error:', error);
    return res.status(500).json({ error: 'Failed to run AI evaluation.' });
  }
}

async function getEvaluation(req, res) {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);
    if (!submission || !submission.aiEvaluation) {
      return res.status(404).json({ error: 'Evaluation not found for this submission.' });
    }

    return res.status(200).json({ evaluation: submission.aiEvaluation });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch evaluation.' });
  }
}

async function updateManualScore(req, res) {
  try {
    const { id } = req.params;
    const { judge_manual_score, score } = req.body;
    const val = judge_manual_score !== undefined ? judge_manual_score : score;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ error: `Submission with ID '${id}' not found.` });
    }

    submission.judgeManualScore = parseFloat(val);
    await submission.save();

    return res.status(200).json({
      message: 'Manual judge score updated successfully.',
      submission: submission.toJSON(),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update manual score.' });
  }
}

async function checkSimilarity(req, res) {
  try {
    const threshold = req.body?.threshold ? parseFloat(req.body.threshold) : 0.7;
    const submissions = await Submission.find().populate('teamId', 'name');

    const flaggedPairs = [];
    for (let i = 0; i < submissions.length; i++) {
      for (let j = i + 1; j < submissions.length; j++) {
        const subA = submissions[i];
        const subB = submissions[j];

        const textA = `${subA.title} ${subA.description} ${subA.repoLink}`;
        const textB = `${subB.title} ${subB.description} ${subB.repoLink}`;

        const score = calculateTFIDFSimilarity(textA, textB);
        if (score >= threshold) {
          flaggedPairs.push({
            submission_a_id: subA._id.toString(),
            team_a_name: subA.teamId ? subA.teamId.name : 'Team A',
            submission_b_id: subB._id.toString(),
            team_b_name: subB.teamId ? subB.teamId.name : 'Team B',
            similarity_score: score,
            flagged_reason: 'High textual and code structure overlap detected.',
          });
        }
      }
    }

    return res.status(200).json({
      threshold,
      flagged_count: flaggedPairs.length,
      flagged_pairs: flaggedPairs,
    });
  } catch (error) {
    console.error('[SubmissionController] checkSimilarity Error:', error);
    return res.status(500).json({ error: 'Similarity check failed.' });
  }
}

async function getSimilarityFlags(req, res) {
  try {
    const submissions = await Submission.find({ 'similarityFlags.0': { $exists: true } });
    const flags = [];

    submissions.forEach((s) => {
      s.similarityFlags.forEach((f) => {
        flags.push({
          submission_id: s._id.toString(),
          target_submission_id: f.target_submission_id,
          target_team_name: f.target_team_name,
          similarity_score: f.similarity_score,
          flagged_reason: f.flagged_reason,
        });
      });
    });

    return res.status(200).json({ flags });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch similarity flags.' });
  }
}

module.exports = {
  createOrUpdateSubmission,
  getAllSubmissions,
  evaluateSubmission,
  getEvaluation,
  updateManualScore,
  checkSimilarity,
  getSimilarityFlags,
};
