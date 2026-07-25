const prisma = require('../config/db');
const { generateMentorResponse } = require('../services/ai.service');
const { fetchGithubReadme } = require('../services/github.service');

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
 * FEATURE 2 — AI Mentor Assistant Chat
 * Endpoint: POST /api/mentor/chat
 */
async function chatWithMentor(req, res) {
  try {
    const { team_id, message, repo_link } = req.body;

    if (!team_id || !message) {
      return res.status(400).json({ error: 'team_id and message are required fields.' });
    }

    const team = await prisma.team.findUnique({
      where: { id: team_id },
      include: { submissions: true },
    });

    if (!team) {
      return res.status(404).json({ error: `Team with ID '${team_id}' not found.` });
    }

    // IDOR Protection: Staff or team member only
    if (!isUserAuthorizedForTeam(req.user, team)) {
      return res.status(403).json({ error: 'Access denied. You are not authorized to access mentor chat for this team.' });
    }

    // Determine effective repo link (from request body or team's active submission)
    const effectiveRepoLink = repo_link || (team.submissions?.[0]?.repo_link) || null;

    // Fetch GitHub README if repo link is present
    let readmeContent = null;
    if (effectiveRepoLink) {
      readmeContent = await fetchGithubReadme(effectiveRepoLink);
    }

    // Retrieve conversation history for this team from DB
    const history = await prisma.mentorMessage.findMany({
      where: { team_id },
      orderBy: { timestamp: 'asc' },
      take: 20, // keep latest 20 context messages
    });

    // Save User message to DB
    const userMsg = await prisma.mentorMessage.create({
      data: {
        team_id,
        sender: 'user',
        content: message,
      },
    });

    // Automatically log engagement event for chat activity
    await prisma.engagementEvent.create({
      data: {
        team_id,
        user_id: req.user?.id || null,
        event_type: 'chat_message',
      },
    });

    // Generate AI Mentor Response using LLM
    const aiContent = await generateMentorResponse({
      teamId: team_id,
      userMessage: message,
      history: history.map(h => ({ sender: h.sender, content: h.content })),
      readmeContent,
    });

    // Save Mentor response to DB
    const mentorMsg = await prisma.mentorMessage.create({
      data: {
        team_id,
        sender: 'mentor',
        content: aiContent,
      },
    });

    return res.status(200).json({
      message: 'Mentor response generated successfully',
      response: {
        id: mentorMsg.id,
        sender: 'mentor',
        content: mentorMsg.content,
        timestamp: mentorMsg.timestamp,
        readme_fetched: !!readmeContent,
      },
    });
  } catch (error) {
    console.error('[MentorController] chatWithMentor Error:', error);
    return res.status(500).json({ error: 'AI Mentor assistant failed to process request.' });
  }
}

/**
 * Get Team Mentor Chat History
 * Endpoint: GET /api/mentor/history/:teamId
 */
async function getChatHistory(req, res) {
  try {
    const { teamId } = req.params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).json({ error: `Team with ID '${teamId}' not found.` });
    }

    // IDOR Protection: Staff or team member only
    if (!isUserAuthorizedForTeam(req.user, team)) {
      return res.status(403).json({ error: 'Access denied. You are not authorized to view mentor history for this team.' });
    }

    const history = await prisma.mentorMessage.findMany({
      where: { team_id: teamId },
      orderBy: { timestamp: 'asc' },
    });

    return res.status(200).json({ team_id: teamId, history });
  } catch (error) {
    console.error('[MentorController] getChatHistory Error:', error);
    return res.status(500).json({ error: 'Failed to fetch mentor chat history.' });
  }
}

module.exports = {
  chatWithMentor,
  getChatHistory,
};

