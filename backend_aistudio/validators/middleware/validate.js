const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs after express-validator validation chains. If any validation
 * errors are present, responds with 400 and a structured error list.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg,
    }));
    return next(ApiError.badRequest('Validation failed', formatted));
  }
  next();
}

module.exports = validate;
