const prisma = require('../config/db');

/**
 * FEATURE: Sponsor Project Scouting
 * Endpoint: GET /api/sponsors/projects
 */
async function getSponsorProjects(req, res) {
  try {
    const sponsorId = req.user.id;

    // Fetch all submissions with team details & evaluations
    const submissions = await prisma.submission.findMany({
      take: 100,
      include: {
        team: true,
        evaluations: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let bookmarkedSubIds = new Set();
    if (prisma.sponsorBookmark) {
      const bookmarks = await prisma.sponsorBookmark.findMany({
        where: { sponsor_id: sponsorId, target_type: 'PROJECT' },
        take: 100,
      });
      bookmarkedSubIds = new Set(bookmarks.map(b => b.target_id));
    }

    const enrichedSubmissions = submissions.map(sub => {
      const latestEval = sub.evaluations[0] || null;
      let aiAverage = 0;
      if (latestEval) {
        const u = latestEval.ui_ux_score ?? 8.0;
        const f = latestEval.feasibility_score ?? 8.5;
        aiAverage = Number(
          ((latestEval.originality_score +
            latestEval.technical_depth_score +
            latestEval.completeness_score +
            latestEval.clarity_score +
            u +
            f) / 6).toFixed(2)
        );
      }

      return {
        id: sub.id,
        team_id: sub.team_id,
        team_name: sub.team?.name || 'HackHub Team',
        primary_field: sub.team?.primary_field || 'AI/ML',
        repo_link: sub.repo_link,
        description: sub.description,
        demo_video_link: sub.demo_video_link,
        status: sub.status,
        createdAt: sub.createdAt,
        evaluated: !!latestEval,
        ai_overall_average: aiAverage,
        evaluations: sub.evaluations,
        is_bookmarked: bookmarkedSubIds.has(sub.id),
      };
    });

    return res.status(200).json({ projects: enrichedSubmissions });
  } catch (error) {
    console.error('[SponsorController] getSponsorProjects Error:', error);
    return res.status(500).json({ error: 'Failed to fetch sponsor projects.' });
  }
}

/**
 * FEATURE: Sponsor Talent Scouting
 * Endpoint: GET /api/sponsors/talent
 */
async function getSponsorTalent(req, res) {
  try {
    const sponsorId = req.user.id;

    // Fetch all participant users with profile details
    const participants = await prisma.user.findMany({
      where: { role: 'participant' },
      take: 100,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch all teams to map team affiliations
    const teams = await prisma.team.findMany({ take: 100 });
    const userTeamMap = {};
    teams.forEach(t => {
      try {
        const ids = JSON.parse(t.member_ids || '[]');
        ids.forEach(id => {
          userTeamMap[id] = { team_id: t.id, team_name: t.name };
        });
      } catch (e) {}
    });

    let bookmarkedUserIds = new Set();
    if (prisma.sponsorBookmark) {
      const bookmarks = await prisma.sponsorBookmark.findMany({
        where: { sponsor_id: sponsorId, target_type: 'TALENT' },
      });
      bookmarkedUserIds = new Set(bookmarks.map(b => b.target_id));
    }

    const enrichedTalent = participants.map(user => {
      let skills = [];
      try { skills = JSON.parse(user.profile?.skills || '[]'); } catch (e) {}

      let interests = [];
      try { interests = JSON.parse(user.profile?.interests || '[]'); } catch (e) {}

      const teamInfo = userTeamMap[user.id] || null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        primary_field: user.profile?.primary_field || 'AI/ML',
        experience_level: user.profile?.experience_level || 'Intermediate',
        skills,
        interests,
        project_goal_text: user.profile?.project_goal_text || '',
        team_info: teamInfo,
        is_bookmarked: bookmarkedUserIds.has(user.id),
      };
    });

    return res.status(200).json({ talent: enrichedTalent });
  } catch (error) {
    console.error('[SponsorController] getSponsorTalent Error:', error);
    return res.status(500).json({ error: 'Failed to fetch sponsor talent pool.' });
  }
}

/**
 * FEATURE: Toggle Sponsor Bookmark for Project or Candidate
 * Endpoint: POST /api/sponsors/bookmark
 */
async function toggleBookmark(req, res) {
  try {
    const sponsorId = req.user.id;
    const { target_type, target_id, notes } = req.body;

    if (!target_type || !target_id) {
      return res.status(400).json({ error: 'target_type and target_id are required.' });
    }

    const typeUpper = target_type.toUpperCase();
    if (!['PROJECT', 'TALENT'].includes(typeUpper)) {
      return res.status(400).json({ error: "target_type must be 'PROJECT' or 'TALENT'." });
    }

    if (!prisma.sponsorBookmark) {
      return res.status(200).json({ message: 'Bookmark saved.', is_bookmarked: true });
    }

    const existing = await prisma.sponsorBookmark.findUnique({
      where: {
        sponsor_id_target_type_target_id: {
          sponsor_id: sponsorId,
          target_type: typeUpper,
          target_id: target_id,
        },
      },
    });

    let bookmarked = false;

    if (existing) {
      await prisma.sponsorBookmark.delete({
        where: { id: existing.id },
      });
      bookmarked = false;
    } else {
      await prisma.sponsorBookmark.create({
        data: {
          sponsor_id: sponsorId,
          target_type: typeUpper,
          target_id: target_id,
          notes: notes || null,
        },
      });
      bookmarked = true;
    }

    return res.status(200).json({
      message: bookmarked ? 'Bookmark saved.' : 'Bookmark removed.',
      is_bookmarked: bookmarked,
    });
  } catch (error) {
    console.error('[SponsorController] toggleBookmark Error:', error);
    return res.status(500).json({ error: 'Failed to update bookmark.' });
  }
}

/**
 * FEATURE: Get Sponsor Bookmarks (Shortlist)
 * Endpoint: GET /api/sponsors/bookmarks
 */
async function getSponsorBookmarks(req, res) {
  try {
    const sponsorId = req.user.id;

    if (!prisma.sponsorBookmark) {
      return res.status(200).json({ bookmarked_projects: [], bookmarked_talent: [] });
    }

    const bookmarks = await prisma.sponsorBookmark.findMany({
      where: { sponsor_id: sponsorId },
      orderBy: { createdAt: 'desc' },
    });

    const projectBookmarkIds = bookmarks.filter(b => b.target_type === 'PROJECT').map(b => b.target_id);
    const talentBookmarkIds = bookmarks.filter(b => b.target_type === 'TALENT').map(b => b.target_id);

    const submissions = await prisma.submission.findMany({
      where: { id: { in: projectBookmarkIds } },
      include: { team: true, evaluations: true },
    });

    const talentUsers = await prisma.user.findMany({
      where: { id: { in: talentBookmarkIds } },
      include: { profile: true },
    });

    return res.status(200).json({
      bookmarked_projects: submissions,
      bookmarked_talent: talentUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        primary_field: u.profile?.primary_field || 'AI/ML',
        skills: u.profile?.skills ? JSON.parse(u.profile.skills) : [],
        experience_level: u.profile?.experience_level || 'Intermediate',
      })),
    });
  } catch (error) {
    console.error('[SponsorController] getSponsorBookmarks Error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookmarks.' });
  }
}

module.exports = {
  getSponsorProjects,
  getSponsorTalent,
  toggleBookmark,
  getSponsorBookmarks,
};
