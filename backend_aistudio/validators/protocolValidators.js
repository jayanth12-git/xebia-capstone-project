const { body, param, query } = require('express-validator');

const PHASES = ['PRECLINICAL', 'PHASE_I', 'PHASE_II', 'PHASE_III', 'PHASE_IV'];
const STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECTED', 'ARCHIVED'];

const createProtocolValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('studyCode').trim().notEmpty().withMessage('Study code is required'),
  body('condition').trim().notEmpty().withMessage('Condition is required'),
  body('objective').trim().notEmpty().withMessage('Objective is required'),
  body('phase').optional().isIn(PHASES).withMessage(`Phase must be one of: ${PHASES.join(', ')}`),
  body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('population').optional().isInt({ min: 1 }).withMessage('Population must be a positive integer'),
  body('durationWeeks').optional().isInt({ min: 1 }).withMessage('Duration (weeks) must be a positive integer'),
  body('sponsor').optional().isString(),
  body('therapeuticArea').optional().isString(),
  body('inclusionCriteria').optional().isString(),
  body('exclusionCriteria').optional().isString(),
  body('studyDesign').optional().isString(),
];

const updateProtocolValidator = [
  param('id').isUUID().withMessage('Invalid protocol id'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('phase').optional().isIn(PHASES).withMessage(`Phase must be one of: ${PHASES.join(', ')}`),
  body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('population').optional().isInt({ min: 1 }).withMessage('Population must be a positive integer'),
  body('durationWeeks').optional().isInt({ min: 1 }).withMessage('Duration (weeks) must be a positive integer'),
];

const idParamValidator = [param('id').isUUID().withMessage('Invalid id format')];

const listQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('sortBy').optional().isString(),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
  query('search').optional().isString(),
  query('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
  query('phase').optional().isIn(PHASES).withMessage(`phase must be one of: ${PHASES.join(', ')}`),
];

module.exports = {
  createProtocolValidator,
  updateProtocolValidator,
  idParamValidator,
  listQueryValidator,
  PHASES,
  STATUSES,
};
