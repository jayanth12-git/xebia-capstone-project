const asyncHandler = require('../middleware/asyncHandler');
const riskService = require('../services/riskService');
const apiResponse = require('../utils/apiResponse');

// @desc    Create a risk entry for a protocol (auto-calculates score & level)
// @route   POST /api/protocols/:protocolId/risks
// @access  Private
const createRisk = asyncHandler(async (req, res) => {
  const risk = await riskService.createRisk(req.params.protocolId, req.body);
  return apiResponse.success(res, 201, 'Risk created successfully', { risk });
});

// @desc    List all risks for a protocol (risk matrix)
// @route   GET /api/protocols/:protocolId/risks
// @access  Private
const listRisks = asyncHandler(async (req, res) => {
  const risks = await riskService.listRisksForProtocol(req.params.protocolId);
  return apiResponse.success(res, 200, 'Risks fetched successfully', { risks });
});

// @desc    Get a single risk
// @route   GET /api/risks/:id
// @access  Private
const getRisk = asyncHandler(async (req, res) => {
  const risk = await riskService.getRiskById(req.params.id);
  return apiResponse.success(res, 200, 'Risk fetched successfully', { risk });
});

// @desc    Update a risk (re-calculates score & level if probability/impact change)
// @route   PUT /api/risks/:id
// @access  Private
const updateRisk = asyncHandler(async (req, res) => {
  const risk = await riskService.updateRisk(req.params.id, req.body);
  return apiResponse.success(res, 200, 'Risk updated successfully', { risk });
});

// @desc    Delete a risk
// @route   DELETE /api/risks/:id
// @access  Private
const deleteRisk = asyncHandler(async (req, res) => {
  await riskService.deleteRisk(req.params.id);
  return apiResponse.success(res, 200, 'Risk deleted successfully');
});

module.exports = { createRisk, listRisks, getRisk, updateRisk, deleteRisk };
