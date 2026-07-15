const asyncHandler = require('../middleware/asyncHandler');
const milestoneService = require('../services/milestoneService');
const apiResponse = require('../utils/apiResponse');

// @desc    Create a milestone for a protocol timeline
// @route   POST /api/protocols/:protocolId/milestones
// @access  Private
const createMilestone = asyncHandler(async (req, res) => {
  const milestone = await milestoneService.createMilestone(req.params.protocolId, req.body);
  return apiResponse.success(res, 201, 'Milestone created successfully', { milestone });
});

// @desc    List milestones for a protocol (timeline)
// @route   GET /api/protocols/:protocolId/milestones
// @access  Private
const listMilestones = asyncHandler(async (req, res) => {
  const milestones = await milestoneService.listMilestonesForProtocol(req.params.protocolId);
  return apiResponse.success(res, 200, 'Milestones fetched successfully', { milestones });
});

// @desc    Get a single milestone
// @route   GET /api/milestones/:id
// @access  Private
const getMilestone = asyncHandler(async (req, res) => {
  const milestone = await milestoneService.getMilestoneById(req.params.id);
  return apiResponse.success(res, 200, 'Milestone fetched successfully', { milestone });
});

// @desc    Update a milestone
// @route   PUT /api/milestones/:id
// @access  Private
const updateMilestone = asyncHandler(async (req, res) => {
  const milestone = await milestoneService.updateMilestone(req.params.id, req.body);
  return apiResponse.success(res, 200, 'Milestone updated successfully', { milestone });
});

// @desc    Delete a milestone
// @route   DELETE /api/milestones/:id
// @access  Private
const deleteMilestone = asyncHandler(async (req, res) => {
  await milestoneService.deleteMilestone(req.params.id);
  return apiResponse.success(res, 200, 'Milestone deleted successfully');
});

module.exports = { createMilestone, listMilestones, getMilestone, updateMilestone, deleteMilestone };
