const ApiError = require('../utils/ApiError');

/**
 * 404 handler for unmatched routes. Must be registered AFTER all routes.
 */
function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Centralized error-handling middleware. Must be registered LAST,
 * after all routes and other middleware.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Prisma known request errors (e.g. unique constraint violations)
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    message = `Duplicate value for unique field(s): ${target}`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record does not exist';
  } else if (err.code && err.code.startsWith('P')) {
    // Other Prisma errors
    statusCode = 400;
    message = 'Database request error';
  }

  // JSON body parse errors
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  if (process.env.NODE_ENV === 'development' && !(err instanceof ApiError)) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };
