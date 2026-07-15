const { verifyAccessToken } = require('../utils/jwt');
const { prisma } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('./asyncHandler');

/**
 * Protects a route: requires a valid Bearer JWT in the Authorization header.
 * Attaches the authenticated user (minus password) to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Not authorized, token is invalid or expired');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Not authorized, user no longer exists or is inactive');
  }

  const { password, ...safeUser } = user;
  req.user = safeUser;
  next();
});

/**
 * Restricts a route to specific roles.
 * Usage: restrictTo('ADMIN', 'REVIEWER')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
};

module.exports = { protect, restrictTo };
