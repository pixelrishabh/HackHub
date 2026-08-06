const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Authenticate JWT Bearer Token and re-fetch user from DB on every request.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Missing or malformed Bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId || decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User session invalid. Account not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware.
 * @param {Array<string>} allowedRoles 
 */
function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const isAllowed = allowedRoles.some((role) => role.toLowerCase() === userRole);

    if (!isAllowed) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized for this resource. Required roles: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
  JWT_SECRET,
};
