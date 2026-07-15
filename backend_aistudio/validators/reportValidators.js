const { body, param } = require('express-validator');

const REPORT_TYPES = ['PROTOCOL_SUMMARY', 'RISK_ASSESSMENT', 'ADVERSE_EVENT_SUMMARY', 'REVIEW_SUMMARY', 'FULL_PROTOCOL'];
const REPORT_FORMATS = ['JSON', 'PDF_READY'];

const generateReportValidator = [
  param('protocolId').isUUID().withMessage('Invalid protocol id'),
  body('type').isIn(REPORT_TYPES).withMessage(`type must be one of: ${REPORT_TYPES.join(', ')}`),
  body('format').optional().isIn(REPORT_FORMATS).withMessage(`format must be one of: ${REPORT_FORMATS.join(', ')}`),
];

module.exports = { generateReportValidator, REPORT_TYPES, REPORT_FORMATS };
