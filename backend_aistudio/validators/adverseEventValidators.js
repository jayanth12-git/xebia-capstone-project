const { body, param } = require('express-validator');

const SEVERITIES = ['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING', 'FATAL'];
const CAUSALITIES = ['UNRELATED', 'UNLIKELY', 'POSSIBLE', 'PROBABLE', 'DEFINITE'];
const STATUSES = ['REPORTED', 'UNDER_INVESTIGATION', 'RESOLVED', 'RESOLVED_WITH_SEQUELAE', 'ONGOING'];

const createAdverseEventValidator = [
  param('protocolId').isUUID().withMessage('Invalid protocol id'),
  body('subjectCode').trim().notEmpty().withMessage('subjectCode is required'),
  body('description').trim().notEmpty().withMessage('description is required'),
  body('severity').optional().isIn(SEVERITIES).withMessage(`severity must be one of: ${SEVERITIES.join(', ')}`),
  body('causality').optional().isIn(CAUSALITIES).withMessage(`causality must be one of: ${CAUSALITIES.join(', ')}`),
  body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
  body('onsetDate').optional().isISO8601().withMessage('onsetDate must be a valid date'),
  body('resolvedDate').optional().isISO8601().withMessage('resolvedDate must be a valid date'),
  body('reportedBy').optional().isString(),
];

const updateAdverseEventValidator = [
  param('id').isUUID().withMessage('Invalid adverse event id'),
  body('severity').optional().isIn(SEVERITIES).withMessage(`severity must be one of: ${SEVERITIES.join(', ')}`),
  body('causality').optional().isIn(CAUSALITIES).withMessage(`causality must be one of: ${CAUSALITIES.join(', ')}`),
  body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
  body('onsetDate').optional().isISO8601().withMessage('onsetDate must be a valid date'),
  body('resolvedDate').optional().isISO8601().withMessage('resolvedDate must be a valid date'),
];

module.exports = {
  createAdverseEventValidator,
  updateAdverseEventValidator,
  SEVERITIES,
  CAUSALITIES,
  STATUSES,
};
