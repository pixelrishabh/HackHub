const { validateIdeaWithAI } = require('../services/ai.service');

/**
 * FEATURE 4 — AI Idea Validation
 * Endpoint: POST /api/ideas/validate
 */
async function validateIdea(req, res) {
  try {
    const { idea_description, description, hours_remaining } = req.body;
    const ideaText = idea_description || description;

    if (!ideaText) {
      return res.status(400).json({ error: 'idea_description is required.' });
    }

    const hours = hours_remaining !== undefined ? Number(hours_remaining) : 24;

    const result = await validateIdeaWithAI({
      idea_description: ideaText,
      hours_remaining: hours,
    });

    return res.status(200).json({
      message: 'Idea validation completed successfully',
      validation: result,
    });
  } catch (error) {
    console.error('[IdeaController] validateIdea Error:', error);
    return res.status(500).json({ error: 'Idea validation failed. Please try again.' });
  }
}

module.exports = {
  validateIdea,
};
