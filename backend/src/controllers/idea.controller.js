const { validateIdeaWithAI } = require('../services/ai.service');

async function validateIdea(req, res) {
  try {
    const { idea_description, ideaText, description, hours_remaining, hoursRemaining } = req.body;
    const idea = idea_description || ideaText || description || 'Autonomous AI Hackathon OS';
    const hours = hours_remaining || hoursRemaining || 16;

    const validation = await validateIdeaWithAI(idea, hours);
    return res.status(200).json({ validation });
  } catch (error) {
    console.error('[IdeaController] validateIdea Error:', error);
    return res.status(500).json({ error: 'Idea validation failed.' });
  }
}

module.exports = {
  validateIdea,
};
