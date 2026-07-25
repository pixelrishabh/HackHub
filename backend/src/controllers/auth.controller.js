const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth.middleware');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register new User and create Profile (Public self-registration defaults to role='participant')
 */
async function register(req, res) {
  try {
    const { name, email, password, skills, experience_level, interests, timezone, project_goal_text } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    // Mandatory security rule: Public self-registration ALWAYS defaults to participant role
    const assignedRole = 'participant';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role: assignedRole,
        profile: {
          create: {
            skills: Array.isArray(skills) ? JSON.stringify(skills) : (skills || '[]'),
            experience_level: experience_level || 'Intermediate',
            interests: Array.isArray(interests) ? JSON.stringify(interests) : (interests || '[]'),
            timezone: timezone || 'UTC',
            project_goal_text: project_goal_text || '',
          },
        },
      },
      include: { profile: true },
    });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Hide password_hash from output
    const { password_hash: _, ...safeUser } = user;

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('[AuthController] Register Error:', error);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

/**
 * Create Staff User (Organizer-only endpoint to create mentor/judge/sponsor/organizer accounts)
 */
async function createStaff(req, res) {
  try {
    const { name, email, password, role, skills, experience_level, interests, timezone, project_goal_text } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required for staff creation.' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const allowedStaffRoles = ['mentor', 'judge', 'organizer', 'sponsor'];
    const targetRole = role.toLowerCase();
    if (!allowedStaffRoles.includes(targetRole)) {
      return res.status(400).json({ error: `Invalid staff role. Allowed roles: ${allowedStaffRoles.join(', ')}` });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role: targetRole,
        profile: {
          create: {
            skills: Array.isArray(skills) ? JSON.stringify(skills) : (skills || '[]'),
            experience_level: experience_level || 'Advanced',
            interests: Array.isArray(interests) ? JSON.stringify(interests) : (interests || '[]'),
            timezone: timezone || 'UTC',
            project_goal_text: project_goal_text || '',
          },
        },
      },
      include: { profile: true },
    });

    const { password_hash: _, ...safeUser } = user;

    return res.status(201).json({
      message: `Staff account (${targetRole}) created successfully.`,
      user: safeUser,
    });
  } catch (error) {
    console.error('[AuthController] CreateStaff Error:', error);
    return res.status(500).json({ error: 'Failed to create staff user. Please try again.' });
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

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const { password_hash: _, ...safeUser } = user;

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('[AuthController] Login Error:', error);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

/**
 * Get current authenticated user details
 */
async function getMe(req, res) {
  try {
    const { password_hash: _, ...safeUser } = req.user;
    return res.status(200).json({ user: safeUser });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user details.' });
  }
}

module.exports = {
  register,
  createStaff,
  login,
  getMe,
};

