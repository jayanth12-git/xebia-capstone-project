const asyncHandler = require('../middleware/asyncHandler');
const dashboardService = require('../services/dashboardService');
const apiResponse = require('../utils/apiResponse');

// @desc    Get aggregated dashboard statistics
// @route   GET /api/dashboard
// @access  Private
const getStatistics = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStatistics();
  return apiResponse.success(res, 200, 'Dashboard statistics fetched successfully', { stats });
});

module.exports = { getStatistics };
