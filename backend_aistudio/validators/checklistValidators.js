const { body, param } = require('express-validator');

const createChecklistItemValidator = [
  param('protocolId').isUUID().withMessage('Invalid protocol id'),
  body('label').trim().notEmpty().withMessage('label is required'),
  body('category').optional().isString(),
  body('order').optional().isInt({ min: 0 }).withMessage('order must be a non-negative integer'),
];

const updateChecklistItemValidator = [
  param('id').isUUID().withMessage('Invalid checklist item id'),
  body('label').optional().trim().notEmpty().withMessage('label cannot be empty'),
  body('isCompleted').optional().isBoolean().withMessage('isCompleted must be a boolean'),
  body('order').optional().isInt({ min: 0 }).withMessage('order must be a non-negative integer'),
];

module.exports = { createChecklistItemValidator, updateChecklistItemValidator };
