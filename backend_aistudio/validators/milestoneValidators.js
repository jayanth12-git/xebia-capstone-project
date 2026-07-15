const { body, param } = require('express-validator');

const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'];

const createMilestoneValidator = [
  param('protocolId').isUUID().withMessage('Invalid protocol id'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid date'),
  body('order').optional().isInt({ min: 0 }).withMessage('order must be a non-negative integer'),
];

const updateMilestoneValidator = [
  param('id').isUUID().withMessage('Invalid milestone id'),
  body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid date'),
  body('order').optional().isInt({ min: 0 }).withMessage('order must be a non-negative integer'),
];

module.exports = { createMilestoneValidator, updateMilestoneValidator, STATUSES };
