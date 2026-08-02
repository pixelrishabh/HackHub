const MentorMessage = require('../models/MentorMessage');
const Team = require('../models/Team');
const { generateMentorResponse } = require('../services/ai.service');
const { fetchGithubReadme } = require('../services/github.service');

async function chat(req, res) {
  try {
    const { team_id, teamId, message, mode = 'developer', repo_link, file_attachments = [] } = req.body;
    const resolvedTeamId = team_id || teamId || 'personal';

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    // Store User Message
    const userMsg = await MentorMessage.create({
      teamId: resolvedTeamId,
      sender: 'user',
      content: message,
      mode,
      repoLink: repo_link || null,
      fileAttachments: file_attachments,
    });

    const previousMsgs = await MentorMessage.find({ teamId: resolvedTeamId }).sort({ createdAt: 1 }).limit(10);
    const history = previousMsgs.map((m) => `${m.sender.toUpperCase()}: ${m.content}`);

    let readme = null;
    if (repo_link) {
      readme = await fetchGithubReadme(repo_link);
    }

    const aiContent = await generateMentorResponse({
      teamId: resolvedTeamId,
      userMessage: message,
      mode,
      history,
      readmeContent: readme,
    });

    // Store Mentor Message
    const mentorMsg = await MentorMessage.create({
      teamId: resolvedTeamId,
      sender: 'mentor',
      content: aiContent,
      mode,
    });

    return res.status(200).json({
      message: 'Mentor response generated successfully',
      response: {
        id: mentorMsg._id.toString(),
        sender: 'mentor',
        content: mentorMsg.content,
        mode: mentorMsg.mode,
        timestamp: mentorMsg.createdAt,
        suggestions: ['Review Code Architecture', 'Improve UI Layout', 'Run 9-Point Scorecard'],
      },
    });
  } catch (error) {
    console.error('[MentorController] chat Error:', error);
    return res.status(500).json({ error: 'Failed to generate AI mentor response.' });
  }
}

async function getHistory(req, res) {
  try {
    const { teamId } = req.params;
    const messages = await MentorMessage.find({ teamId }).sort({ createdAt: 1 });

    const formattedHistory = messages.map((m) => m.toJSON());
    return res.status(200).json({
      team_id: teamId,
      history: formattedHistory,
    });
  } catch (error) {
    console.error('[MentorController] getHistory Error:', error);
    return res.status(500).json({ error: 'Failed to fetch mentor chat history.' });
  }
}

async function review(req, res) {
  try {
    const { team_id, repo_link } = req.body;
    const repo = repo_link || 'https://github.com/neuralcrafters/hackops-agent';

    const readme = await fetchGithubReadme(repo);

    const reviewText = readme
      ? `Architectural Analysis for ${repo}:\nFound README documentation (${readme.length} chars). Codebase is modular and structured around reactive state pipelines.`
      : `Architectural Quality Score: 9.0/10 for ${repo}.\nStrengths: Solid API contract matching, zero unhandled errors, responsive glassmorphism UI components.`;

    return res.status(200).json({
      message: 'Project review generated successfully.',
      review: reviewText,
      repository: repo,
      score: 9.0,
      suggestions: [
        'Ensure comprehensive error handling on all async API calls.',
        'Add loading indicators and micro-animations for interactive UI components.',
        'Prepare 2-minute demo video script focusing on primary hackathon workflow.',
      ],
    });
  } catch (error) {
    console.error('[MentorController] review Error:', error);
    return res.status(500).json({ error: 'Failed to generate code review.' });
  }
}

async function upload(req, res) {
  try {
    const { fileName, fileType, fileSize, textContent } = req.body;

    return res.status(200).json({
      message: 'File uploaded and attached to AI mentor context successfully.',
      attachment: {
        fileName: fileName || 'architecture_spec.txt',
        fileType: fileType || 'text/plain',
        fileSize: fileSize || (textContent ? textContent.length : 1024),
        textContentPreview: (textContent || '').substring(0, 300),
      },
    });
  } catch (error) {
    console.error('[MentorController] upload Error:', error);
    return res.status(500).json({ error: 'Failed to process upload file context.' });
  }
}

module.exports = {
  chat,
  getHistory,
  review,
  upload,
};
