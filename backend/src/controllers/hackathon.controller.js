const Hackathon = require('../models/Hackathon');

// Get all hackathons with optional filters: status, track, search
exports.getHackathons = async (req, res) => {
  try {
    const { status, track, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (track && track !== 'All') {
      query.tracks = { $in: [track] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const hackathons = await Hackathon.find(query).sort({ startDate: -1 });
    return res.json({ success: true, count: hackathons.length, hackathons });
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    return res.status(500).json({ error: 'Server error fetching hackathons' });
  }
};

// Get single hackathon detail by ID or Slug
exports.getHackathonById = async (req, res) => {
  try {
    const { id } = req.params;
    let hackathon = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      hackathon = await Hackathon.findById(id);
    }

    if (!hackathon) {
      hackathon = await Hackathon.findOne({ slug: id });
    }

    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    return res.json({ success: true, hackathon });
  } catch (error) {
    console.error('Error fetching hackathon detail:', error);
    return res.status(500).json({ error: 'Server error fetching hackathon detail' });
  }
};

// Register/Unregister current user for a hackathon
exports.registerUserForHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    const isRegistered = hackathon.registeredUserIds.some(
      (uid) => uid.toString() === userId.toString()
    );

    if (isRegistered) {
      // Unregister
      hackathon.registeredUserIds = hackathon.registeredUserIds.filter(
        (uid) => uid.toString() !== userId.toString()
      );
    } else {
      // Register
      hackathon.registeredUserIds.push(userId);
    }

    await hackathon.save();

    return res.json({
      success: true,
      registered: !isRegistered,
      participantCount: hackathon.registeredUserIds.length,
      message: !isRegistered ? 'Registered successfully!' : 'Unregistered from hackathon.',
    });
  } catch (error) {
    console.error('Error registering for hackathon:', error);
    return res.status(500).json({ error: 'Server error registering for hackathon' });
  }
};

// Create a new hackathon (Organizer only)
exports.createHackathon = async (req, res) => {
  try {
    const { title, tagline, description, bannerUrl, status, startDate, endDate, prizePool, location, tracks, prizes, schedule } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ error: 'Title, start date, and end date are required.' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const hackathon = await Hackathon.create({
      title,
      slug,
      tagline: tagline || '',
      description: description || '',
      bannerUrl: bannerUrl || undefined,
      status: status || 'Upcoming',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      prizePool: prizePool || '$10,000 in Prizes',
      location: location || 'Virtual / Online',
      tracks: tracks || ['AI/ML', 'Web3'],
      prizes: prizes || [],
      schedule: schedule || [],
    });

    return res.status(201).json({ success: true, hackathon });
  } catch (error) {
    console.error('Error creating hackathon:', error);
    return res.status(500).json({ error: 'Server error creating hackathon' });
  }
};
