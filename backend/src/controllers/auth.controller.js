const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { JWT_SECRET } = require('../middleware/auth.middleware');

/**
 * Register User (Role Selection with Invite Code Verification for Staff Roles)
 */
async function register(req, res) {
  try {
    const { name, email, password, role, inviteCode, skills, experience_level } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required fields.' });
    }

    const normEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normEmail });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const allowedRoles = ['participant', 'mentor', 'judge', 'organizer', 'sponsor'];
    const requestedRole = (role && allowedRoles.includes(String(role).toLowerCase()))
      ? String(role).toLowerCase()
      : 'participant';

    // Privileged Staff Roles Gate
    if (requestedRole !== 'participant') {
      const validInviteCodes = (process.env.STAFF_INVITE_CODES || '')
        .split(',')
        .map((code) => code.trim().toUpperCase())
        .filter(Boolean);
      const normInviteCode = String(inviteCode || '').trim().toUpperCase();

      if (!validInviteCodes.includes(normInviteCode)) {
        return res.status(403).json({
          error: 'Invalid or missing Staff Invite Code. Registration for Organizer, Judge, Mentor, or Sponsor roles requires an authorized Invite Code.',
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      email: normEmail,
      password: hashedPassword,
      role: requestedRole,
    });

    const parsedSkills = Array.isArray(skills) ? skills : [];
    const profile = await Profile.create({
      userId: user._id,
      username: normEmail.split('@')[0],
      skills: parsedSkills,
      experienceLevel: experience_level || 'Intermediate',
    });

    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const userObj = user.toJSON();
    userObj.profile = profile.toJSON();

    return res.status(201).json({
      message: `Account created successfully with role '${user.role}'`,
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('[AuthController] register Error:', error);
    return res.status(500).json({ error: 'Registration failed.' });
  }
}

/**
 * Create Staff User (Organizer-only)
 */
async function createStaff(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required fields.' });
    }

    const allowedStaffRoles = ['mentor', 'judge', 'organizer', 'sponsor'];
    const normRole = String(role).toLowerCase();
    if (!allowedStaffRoles.includes(normRole)) {
      return res.status(400).json({ error: `Invalid staff role. Must be one of: [${allowedStaffRoles.join(', ')}]` });
    }

    const normEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normEmail });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normEmail,
      password: hashedPassword,
      role: normRole,
    });

    const profile = await Profile.create({
      userId: user._id,
      username: normEmail.split('@')[0],
    });

    const userObj = user.toJSON();
    userObj.profile = profile.toJSON();

    return res.status(201).json({
      message: `Staff account (${normRole}) created successfully`,
      user: userObj,
    });
  } catch (error) {
    console.error('[AuthController] createStaff Error:', error);
    return res.status(500).json({ error: 'Failed to create staff account.' });
  }
}

/**
 * Login User
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normEmail });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    let profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      profile = await Profile.create({ userId: user._id, username: normEmail.split('@')[0] });
    }

    const userObj = user.toJSON();
    userObj.profile = profile.toJSON();

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('[AuthController] login Error:', error);
    return res.status(500).json({ error: 'Login failed.' });
  }
}

/**
 * Get Current User
 */
async function getMe(req, res) {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    const userObj = req.user.toJSON();
    userObj.profile = profile ? profile.toJSON() : {};
    return res.status(200).json({ user: userObj });
  } catch (error) {
    console.error('[AuthController] getMe Error:', error);
    return res.status(500).json({ error: 'Failed to fetch user session.' });
  }
}

module.exports = {
  register,
  createStaff,
  login,
  getMe,
};
