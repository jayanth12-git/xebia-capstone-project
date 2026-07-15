const express = require('express');
const router = express.Router({ mergeParams: true });

const { createReview, listReviews } = require('../controllers/reviewController');
const { createReviewValidator } = require('../validators/reviewValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(listReviews)
  .post(createReviewValidator, validate, createReview);

module.exports = router;
