const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in .env');
}
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Authentication Middleware - verifies JWT token from Authorization header.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User associated with token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    return res.status(500).json({ error: 'Authentication processing failed.' });
  }
};

/**
 * Optional Authentication Middleware - attaches user if valid token present, otherwise proceeds as guest.
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { profile: true },
      });
      if (user) req.user = user;
    }
  } catch (err) {
    // Ignore error for optional auth
  }
  next();
};

/**
 * Role-Based Access Control (RBAC) Middleware.
 * Pass allowed roles, e.g., authorize(['organizer', 'judge'])
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRole = req.user.role.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

    if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized for this resource. Allowed roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  JWT_SECRET,
};
