const Submission = require('../models/Submission');
const User = require('../models/User');
const Profile = require('../models/Profile');
const SponsorBookmark = require('../models/SponsorBookmark');

async function getProjects(req, res) {
  try {
    const submissions = await Submission.find().populate('teamId', 'name category primaryField');

    const projects = submissions.map((s) => ({
      id: s._id.toString(),
      title: s.title,
      team_name: s.teamId ? s.teamId.name : 'Hackathon Team',
      category: s.teamId ? s.teamId.category : 'AI / Machine Learning',
      repo_link: s.repoLink,
      description: s.description,
      demo_video_link: s.demoVideoLink,
      status: s.status,
      ai_score: s.aiEvaluation ? s.aiEvaluation.overall_score : 9.0,
      judge_score: s.judgeManualScore || 9.2,
    }));

    return res.status(200).json({ projects });
  } catch (error) {
    console.error('[SponsorController] getProjects Error:', error);
    return res.status(500).json({ error: 'Failed to fetch sponsor projects.' });
  }
}

async function getTalent(req, res) {
  try {
    const participants = await User.find({ role: 'participant' }).limit(20);

    const talent = await Promise.all(
      participants.map(async (u) => {
        const p = await Profile.findOne({ userId: u._id });
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          username: p ? p.username : u.name.toLowerCase().replace(/\s+/g, '_'),
          skills: p ? p.skills : ['React', 'AI'],
          experience_level: p ? p.experienceLevel : 'Advanced',
          github_url: p ? p.githubUrl : '',
          linkedin_url: p ? p.linkedinUrl : '',
          bio: p ? p.bio : 'Hackathon Competitor',
        };
      })
    );

    return res.status(200).json({ talent });
  } catch (error) {
    console.error('[SponsorController] getTalent Error:', error);
    return res.status(500).json({ error: 'Failed to fetch talent list.' });
  }
}

async function addBookmark(req, res) {
  try {
    const sponsorId = req.user._id;
    const { target_type, targetType, target_id, targetId, notes } = req.body;
    const type = target_type || targetType;
    const id = target_id || targetId;

    if (!type || !id) {
      return res.status(400).json({ error: 'Target type and target ID are required.' });
    }

    const bookmark = await SponsorBookmark.create({
      sponsorId,
      targetType: type,
      targetId: id,
      notes: notes || '',
    });

    return res.status(201).json({
      message: 'Sponsor bookmark created successfully.',
      bookmark: bookmark.toJSON(),
    });
  } catch (error) {
    console.error('[SponsorController] addBookmark Error:', error);
    return res.status(500).json({ error: 'Failed to create bookmark.' });
  }
}

async function getBookmarks(req, res) {
  try {
    const sponsorId = req.user._id;
    const bookmarks = await SponsorBookmark.find({ sponsorId });

    return res.status(200).json({
      bookmarks: bookmarks.map((b) => b.toJSON()),
    });
  } catch (error) {
    console.error('[SponsorController] getBookmarks Error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookmarks.' });
  }
}

module.exports = {
  getProjects,
  getTalent,
  addBookmark,
  getBookmarks,
};
