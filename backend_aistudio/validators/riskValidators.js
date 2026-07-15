const { body, param } = require('express-validator');

const CATEGORIES = ['SAFETY', 'OPERATIONAL', 'REGULATORY', 'DATA_INTEGRITY', 'FINANCIAL', 'RECRUITMENT', 'OTHER'];

const createRiskValidator = [
  param('protocolId').isUUID().withMessage('Invalid protocol id'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('category').optional().isIn(CATEGORIES).withMessage(`category must be one of: ${CATEGORIES.join(', ')}`),
  body('probability').isInt({ min: 1, max: 5 }).withMessage('probability must be an integer 1-5'),
  body('impact').isInt({ min: 1, max: 5 }).withMessage('impact must be an integer 1-5'),
  body('mitigationPlan').optional().isString(),
];

const updateRiskValidator = [
  param('id').isUUID().withMessage('Invalid risk id'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('category').optional().isIn(CATEGORIES).withMessage(`category must be one of: ${CATEGORIES.join(', ')}`),
  body('probability').optional().isInt({ min: 1, max: 5 }).withMessage('probability must be an integer 1-5'),
  body('impact').optional().isInt({ min: 1, max: 5 }).withMessage('impact must be an integer 1-5'),
  body('mitigationPlan').optional().isString(),
];

module.exports = { createRiskValidator, updateRiskValidator, CATEGORIES };
