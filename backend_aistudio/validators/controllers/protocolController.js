const asyncHandler = require('../middleware/asyncHandler');
const protocolService = require('../services/protocolService');
const apiResponse = require('../utils/apiResponse');

// @desc    Create a new protocol
// @route   POST /api/protocols
// @access  Private
const createProtocol = asyncHandler(async (req, res) => {
  const protocol = await protocolService.createProtocol(req.body, req.user.id);
  return apiResponse.success(res, 201, 'Protocol created successfully', { protocol });
});

// @desc    Get a single protocol by id
// @route   GET /api/protocols/:id
// @access  Private
const getProtocol = asyncHandler(async (req, res) => {
  const protocol = await protocolService.getProtocolById(req.params.id);
  return apiResponse.success(res, 200, 'Protocol fetched successfully', { protocol });
});

// @desc    List / search / filter / paginate protocols (Protocol Library)
// @route   GET /api/protocols
// @access  Private
const listProtocols = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, phase } = req.query;
  const { items, meta } = await protocolService.listProtocols({
    page: Number(page),
    limit: Number(limit),
    sortBy,
    sortOrder,
    search,
    status,
    phase,
  });
  return apiResponse.success(res, 200, 'Protocols fetched successfully', { protocols: items }, meta);
});

// @desc    Update a protocol
// @route   PUT /api/protocols/:id
// @access  Private
const updateProtocol = asyncHandler(async (req, res) => {
  const protocol = await protocolService.updateProtocol(req.params.id, req.body, req.user.id);
  return apiResponse.success(res, 200, 'Protocol updated successfully', { protocol });
});

// @desc    Delete a protocol
// @route   DELETE /api/protocols/:id
// @access  Private
const deleteProtocol = asyncHandler(async (req, res) => {
  await protocolService.deleteProtocol(req.params.id);
  return apiResponse.success(res, 200, 'Protocol deleted successfully');
});

// @desc    Duplicate a protocol
// @route   POST /api/protocols/:id/duplicate
// @access  Private
const duplicateProtocol = asyncHandler(async (req, res) => {
  const protocol = await protocolService.duplicateProtocol(req.params.id, req.user.id);
  return apiResponse.success(res, 201, 'Protocol duplicated successfully', { protocol });
});

// @desc    Get protocol version history
// @route   GET /api/protocols/:id/versions
// @access  Private
const getVersionHistory = asyncHandler(async (req, res) => {
  const versions = await protocolService.getVersionHistory(req.params.id);
  return apiResponse.success(res, 200, 'Version history fetched successfully', { versions });
});

module.exports = {
  createProtocol,
  getProtocol,
  listProtocols,
  updateProtocol,
  deleteProtocol,
  duplicateProtocol,
  getVersionHistory,
};
