const asyncHandler = require('../middleware/asyncHandler');
const checklistService = require('../services/checklistService');
const apiResponse = require('../utils/apiResponse');

// @desc    Add a checklist item to a protocol
// @route   POST /api/protocols/:protocolId/checklist
// @access  Private
const createChecklistItem = asyncHandler(async (req, res) => {
  const item = await checklistService.createChecklistItem(req.params.protocolId, req.body);
  return apiResponse.success(res, 201, 'Checklist item created successfully', { item });
});

// @desc    Get checklist for a protocol including completion percentage
// @route   GET /api/protocols/:protocolId/checklist
// @access  Private
const getChecklist = asyncHandler(async (req, res) => {
  const checklist = await checklistService.getChecklistForProtocol(req.params.protocolId);
  return apiResponse.success(res, 200, 'Checklist fetched successfully', checklist);
});

// @desc    Update a checklist item (e.g. toggle isCompleted)
// @route   PUT /api/checklist/:id
// @access  Private
const updateChecklistItem = asyncHandler(async (req, res) => {
  const item = await checklistService.updateChecklistItem(req.params.id, req.body);
  return apiResponse.success(res, 200, 'Checklist item updated successfully', { item });
});

// @desc    Delete a checklist item
// @route   DELETE /api/checklist/:id
// @access  Private
const deleteChecklistItem = asyncHandler(async (req, res) => {
  await checklistService.deleteChecklistItem(req.params.id);
  return apiResponse.success(res, 200, 'Checklist item deleted successfully');
});

module.exports = { createChecklistItem, getChecklist, updateChecklistItem, deleteChecklistItem };
