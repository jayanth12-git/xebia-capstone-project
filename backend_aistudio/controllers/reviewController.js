const asyncHandler = require('../middleware/asyncHandler');
const reviewService = require('../services/reviewService');
const apiResponse = require('../utils/apiResponse');

// @desc    Create a peer review entry for a protocol
// @route   POST /api/protocols/:protocolId/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.params.protocolId, req.user.id, req.body);
  return apiResponse.success(res, 201, 'Review created successfully', { review });
});

// @desc    List peer reviews for a protocol
// @route   GET /api/protocols/:protocolId/reviews
// @access  Private
const listReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listReviewsForProtocol(req.params.protocolId);
  return apiResponse.success(res, 200, 'Reviews fetched successfully', { reviews });
});

// @desc    Get a single review
// @route   GET /api/reviews/:id
// @access  Private
const getReview = asyncHandler(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.id);
  return apiResponse.success(res, 200, 'Review fetched successfully', { review });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id);
  return apiResponse.success(res, 200, 'Review deleted successfully');
});

// @desc    Approve a protocol via review decision
// @route   PATCH /api/reviews/:id/approve
// @access  Private (Reviewer/Admin)
const approve = asyncHandler(async (req, res) => {
  const review = await reviewService.applyDecision(req.params.id, 'APPROVE', {
    comments: req.body.comments,
    score: req.body.score,
  });
  return apiResponse.success(res, 200, 'Protocol approved', { review });
});

// @desc    Request minor revision via review decision
// @route   PATCH /api/reviews/:id/minor-revision
// @access  Private (Reviewer/Admin)
const requestMinorRevision = asyncHandler(async (req, res) => {
  const review = await reviewService.applyDecision(req.params.id, 'MINOR_REVISION', {
    comments: req.body.comments,
    score: req.body.score,
  });
  return apiResponse.success(res, 200, 'Minor revision requested', { review });
});

// @desc    Request major revision via review decision
// @route   PATCH /api/reviews/:id/major-revision
// @access  Private (Reviewer/Admin)
const requestMajorRevision = asyncHandler(async (req, res) => {
  const review = await reviewService.applyDecision(req.params.id, 'MAJOR_REVISION', {
    comments: req.body.comments,
    score: req.body.score,
  });
  return apiResponse.success(res, 200, 'Major revision requested', { review });
});

// @desc    Reject a protocol via review decision
// @route   PATCH /api/reviews/:id/reject
// @access  Private (Reviewer/Admin)
const reject = asyncHandler(async (req, res) => {
  const review = await reviewService.applyDecision(req.params.id, 'REJECT', {
    comments: req.body.comments,
    score: req.body.score,
  });
  return apiResponse.success(res, 200, 'Protocol rejected', { review });
});

module.exports = {
  createReview,
  listReviews,
  getReview,
  deleteReview,
  approve,
  requestMinorRevision,
  requestMajorRevision,
  reject,
};
