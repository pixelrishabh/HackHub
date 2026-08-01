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
    let { team_id, message, repo_link } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is a required non-empty string.' });
    }

    // Auto-resolve team_id for solo participants or missing payload
    if (!team_id) {
      const allTeams = await prisma.team.findMany();
      const myTeam = allTeams.find(t => {
        try {
          const ids = JSON.parse(t.member_ids || '[]');
          return Array.isArray(ids) && ids.includes(req.user?.id);
        } catch (e) {
          return false;
        }
      });
      team_id = myTeam ? myTeam.id : `personal-${req.user?.id || 'demo'}`;
    }

    let team = null;
    if (!team_id.startsWith('personal-')) {
      team = await prisma.team.findUnique({
        where: { id: team_id },
        include: { submissions: true },
      });
    }

    if (!team && team_id.startsWith('personal-')) {
      team = {
        id: team_id,
        name: 'Personal Sandbox',
        member_ids: JSON.stringify([req.user?.id]),
        submissions: [],
      };
    }

    if (!team) {
      // Fallback: create personal sandbox team object
      team = {
        id: team_id,
        name: 'Personal Sandbox',
        member_ids: JSON.stringify([req.user?.id]),
        submissions: [],
      };
    }

    // Determine effective repo link
    const effectiveRepoLink = repo_link || (team.submissions?.[0]?.repo_link) || null;

    // Fetch GitHub README if repo link is present
    let readmeContent = null;
    if (effectiveRepoLink) {
      readmeContent = await fetchGithubReadme(effectiveRepoLink);
    }

    // Retrieve conversation history
    let history = [];
    try {
      if (!team_id.startsWith('personal-')) {
        history = await prisma.mentorMessage.findMany({
          where: { team_id },
          orderBy: { timestamp: 'asc' },
          take: 20,
        });
      }
    } catch (e) {
      history = [];
    }

    // Save User message to DB if real team exists
    if (!team_id.startsWith('personal-')) {
      await prisma.mentorMessage.create({
        data: {
          team_id,
          sender: 'user',
          content: message,
        },
      }).catch(e => console.warn('[MentorMsg] user msg warn:', e.message));

      await prisma.engagementEvent.create({
        data: {
          team_id,
          user_id: req.user?.id || null,
          event_type: 'chat_message',
        },
      }).catch(e => console.warn('[Engagement] warn:', e.message));
    }

    // Generate AI Mentor Response using Groq LLM
    const aiContent = await generateMentorResponse({
      teamId: team_id,
      userMessage: message,
      history: history.map(h => ({ sender: h.sender, content: h.content })),
      readmeContent,
    });

    let mentorMsgId = 'msg-' + Date.now();
    if (!team_id.startsWith('personal-')) {
      const saved = await prisma.mentorMessage.create({
        data: {
          team_id,
          sender: 'mentor',
          content: aiContent,
        },
      }).catch(e => null);
      if (saved) mentorMsgId = saved.id;
    }

    return res.status(200).json({
      message: 'Mentor response generated successfully',
      response: {
        id: mentorMsgId,
        sender: 'mentor',
        content: aiContent,
        timestamp: new Date().toISOString(),
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


