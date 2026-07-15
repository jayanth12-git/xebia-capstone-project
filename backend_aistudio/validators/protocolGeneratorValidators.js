const { body } = require('express-validator');
const { PHASES } = require('./protocolValidators');

const generateProtocolValidator = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('condition').trim().notEmpty().withMessage('condition is required'),
  body('objective').trim().notEmpty().withMessage('objective is required'),
  body('phase').optional().isIn(PHASES).withMessage(`phase must be one of: ${PHASES.join(', ')}`),
  body('inclusionCriteria').optional().isString(),
  body('exclusionCriteria').optional().isString(),
  body('studyDesign').optional().isString(),
  body('protocolId').optional().isUUID().withMessage('protocolId must be a valid UUID'),
];

module.exports = { generateProtocolValidator };
