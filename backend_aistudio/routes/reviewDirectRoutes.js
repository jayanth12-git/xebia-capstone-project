const express = require('express');
const router = express.Router();

const {
  getReview,
  deleteReview,
  approve,
  requestMinorRevision,
  requestMajorRevision,
  reject,
} = require('../controllers/reviewController');

const { decisionValidator } = require('../validators/reviewValidators');
const { idParamValidator } = require('../validators/protocolValidators');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.route('/:id')
  .get(idParamValidator, validate, getReview)
  .delete(idParamValidator, validate, deleteReview);

router.patch('/:id/approve', restrictTo('ADMIN', 'REVIEWER'), decisionValidator, validate, approve);
router.patch('/:id/minor-revision', restrictTo('ADMIN', 'REVIEWER'), decisionValidator, validate, requestMinorRevision);
router.patch('/:id/major-revision', restrictTo('ADMIN', 'REVIEWER'), decisionValidator, validate, requestMajorRevision);
router.patch('/:id/reject', restrictTo('ADMIN', 'REVIEWER'), decisionValidator, validate, reject);

module.exports = router;
