/**
 * Wraps an async route/middleware function so any thrown error or
 * rejected promise is forwarded to Express's error-handling
 * middleware via next(err), instead of requiring try/catch in every
 * controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
