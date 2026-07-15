const { body, param } = require('express-validator');

const DECISIONS = ['APPROVE', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT', 'PENDING'];

const createReviewValidator = [
  param('protocolId').isUUID().withMessage('Invalid protocol id'),
  body('decision').optional().isIn(DECISIONS).withMessage(`decision must be one of: ${DECISIONS.join(', ')}`),
  body('comments').optional().isString(),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('score must be an integer between 0 and 100'),
];

const decisionValidator = [
  param('id').isUUID().withMessage('Invalid review id'),
  body('comments').optional().isString(),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('score must be an integer between 0 and 100'),
];

module.exports = { createReviewValidator, decisionValidator, DECISIONS };
