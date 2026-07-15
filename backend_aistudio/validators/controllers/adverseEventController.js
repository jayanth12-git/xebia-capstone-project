const asyncHandler = require('../middleware/asyncHandler');
const adverseEventService = require('../services/adverseEventService');
const apiResponse = require('../utils/apiResponse');

// @desc    Report an adverse event for a protocol
// @route   POST /api/protocols/:protocolId/adverse-events
// @access  Private
const createAdverseEvent = asyncHandler(async (req, res) => {
  const event = await adverseEventService.createAdverseEvent(req.params.protocolId, req.body);
  return apiResponse.success(res, 201, 'Adverse event reported successfully', { adverseEvent: event });
});

// @desc    List adverse events for a protocol
// @route   GET /api/protocols/:protocolId/adverse-events
// @access  Private
const listAdverseEvents = asyncHandler(async (req, res) => {
  const events = await adverseEventService.listAdverseEventsForProtocol(req.params.protocolId);
  return apiResponse.success(res, 200, 'Adverse events fetched successfully', { adverseEvents: events });
});

// @desc    Get a single adverse event
// @route   GET /api/adverse-events/:id
// @access  Private
const getAdverseEvent = asyncHandler(async (req, res) => {
  const event = await adverseEventService.getAdverseEventById(req.params.id);
  return apiResponse.success(res, 200, 'Adverse event fetched successfully', { adverseEvent: event });
});

// @desc    Update an adverse event
// @route   PUT /api/adverse-events/:id
// @access  Private
const updateAdverseEvent = asyncHandler(async (req, res) => {
  const event = await adverseEventService.updateAdverseEvent(req.params.id, req.body);
  return apiResponse.success(res, 200, 'Adverse event updated successfully', { adverseEvent: event });
});

// @desc    Delete an adverse event
// @route   DELETE /api/adverse-events/:id
// @access  Private
const deleteAdverseEvent = asyncHandler(async (req, res) => {
  await adverseEventService.deleteAdverseEvent(req.params.id);
  return apiResponse.success(res, 200, 'Adverse event deleted successfully');
});

module.exports = {
  createAdverseEvent,
  listAdverseEvents,
  getAdverseEvent,
  updateAdverseEvent,
  deleteAdverseEvent,
};
