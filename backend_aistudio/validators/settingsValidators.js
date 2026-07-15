const { body, param } = require('express-validator');

const updateSettingValidator = [
  param('key').trim().notEmpty().withMessage('Setting key is required'),
  body('value').exists().withMessage('value is required'),
  body('description').optional().isString(),
];

module.exports = { updateSettingValidator };
