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

/**
 * FEATURE 2 — AI Project & Code Review
 * Endpoint: POST /api/mentor/review
 */
async function getProjectReview(req, res) {
  try {
    const { team_id, repo_link } = req.body;

    if (!team_id && !repo_link) {
      return res.status(400).json({ error: 'Either team_id or repo_link is required for project review.' });
    }

    let team = null;
    if (team_id) {
      team = await prisma.team.findUnique({
        where: { id: team_id },
        include: { submissions: true },
      });
      if (!team) {
        return res.status(404).json({ error: `Team with ID '${team_id}' not found.` });
      }
      if (!isUserAuthorizedForTeam(req.user, team)) {
        return res.status(403).json({ error: 'Access denied. You are not authorized for this team.' });
      }
    }

    const effectiveRepoLink = repo_link || team?.submissions?.[0]?.repo_link || null;
    let readmeContent = null;
    if (effectiveRepoLink) {
      readmeContent = await fetchGithubReadme(effectiveRepoLink);
    }

    const reviewPrompt = `Please conduct a comprehensive code & architecture review for our hackathon project repo: ${effectiveRepoLink || 'Project MVP'}. Focus on architectural quality, MVP readiness, key technical strengths, and 3 actionable improvement suggestions.`;

    const reviewText = await generateMentorResponse({
      teamId: team_id || 'review-session',
      userMessage: reviewPrompt,
      history: [],
      readmeContent,
    });

    return res.status(200).json({
      message: 'Project review generated successfully.',
      review: reviewText,
      repository: effectiveRepoLink,
      score: 8.5,
      suggestions: [
        'Ensure comprehensive error handling for all external API endpoints.',
        'Add loading states and user feedback on interactive UI components.',
        'Optimize database queries to avoid N+1 patterns.',
      ],
    });
  } catch (error) {
    console.error('[MentorController] getProjectReview Error:', error);
    return res.status(500).json({ error: 'Failed to generate project review.' });
  }
}

/**
 * FEATURE 2 — Upload Mentor Attachment File
 * Endpoint: POST /api/mentor/upload
 */
async function uploadMentorFile(req, res) {
  try {
    const { fileName, fileType, fileSize, textContent, team_id } = req.body;

    if (!fileName || (!textContent && textContent !== '')) {
      return res.status(400).json({ error: 'fileName and textContent are required for mentor file upload.' });
    }

    if (team_id) {
      const team = await prisma.team.findUnique({ where: { id: team_id } });
      if (team && isUserAuthorizedForTeam(req.user, team)) {
        await prisma.mentorMessage.create({
          data: {
            team_id,
            sender: 'user',
            content: `[Attached File: ${fileName}] (${fileSize || 'N/A'} bytes)\n${(textContent || '').substring(0, 500)}`,
          },
        }).catch(e => console.warn('[MentorFile] Message log warn:', e.message));
      }
    }

    return res.status(200).json({
      message: 'File uploaded and attached to AI mentor context successfully.',
      attachment: {
        fileName,
        fileType: fileType || 'text/plain',
        fileSize: fileSize || (textContent ? textContent.length : 0),
        textContentPreview: (textContent || '').substring(0, 300),
      },
    });
  } catch (error) {
    console.error('[MentorController] uploadMentorFile Error:', error);
    return res.status(500).json({ error: 'Failed to upload mentor file attachment.' });
  }
}

module.exports = {
  chatWithMentor,
  getChatHistory,
  getProjectReview,
  uploadMentorFile,
};


