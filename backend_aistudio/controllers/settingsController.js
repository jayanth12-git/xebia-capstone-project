const asyncHandler = require('../middleware/asyncHandler');
const settingsService = require('../services/settingsService');
const apiResponse = require('../utils/apiResponse');

// @desc    Get all application settings
// @route   GET /api/settings
// @access  Private (Admin)
const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getAllSettings();
  return apiResponse.success(res, 200, 'Settings fetched successfully', { settings });
});

// @desc    Get a single setting by key
// @route   GET /api/settings/:key
// @access  Private (Admin)
const getSetting = asyncHandler(async (req, res) => {
  const setting = await settingsService.getSettingByKey(req.params.key);
  return apiResponse.success(res, 200, 'Setting fetched successfully', { setting });
});

// @desc    Create or update a setting
// @route   PUT /api/settings/:key
// @access  Private (Admin)
const updateSetting = asyncHandler(async (req, res) => {
  const { value, description } = req.body;
  const setting = await settingsService.upsertSetting(req.params.key, value, description);
  return apiResponse.success(res, 200, 'Setting updated successfully', { setting });
});

module.exports = { getSettings, getSetting, updateSetting };
