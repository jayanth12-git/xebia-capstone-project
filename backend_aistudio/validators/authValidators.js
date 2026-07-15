const { body } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['ADMIN', 'REVIEWER', 'RESEARCHER']).withMessage('Invalid role'),
];

module.exports = { loginValidator, registerValidator };
