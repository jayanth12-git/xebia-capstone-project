const { body } = require('express-validator');

const sampleSizeValidator = [
  body('effectSize').isFloat({ gt: 0 }).withMessage('effectSize must be a positive number'),
  body('power').isFloat({ gt: 0, lt: 1 }).withMessage('power must be a number between 0 and 1 (exclusive)'),
  body('alpha').isFloat({ gt: 0, lt: 1 }).withMessage('alpha must be a number between 0 and 1 (exclusive)'),
  body('dropoutRate')
    .optional()
    .isFloat({ min: 0, max: 0.99 })
    .withMessage('dropoutRate must be between 0 and 0.99'),
  body('population').optional().isInt({ min: 1 }).withMessage('population must be a positive integer'),
];

module.exports = { sampleSizeValidator };
