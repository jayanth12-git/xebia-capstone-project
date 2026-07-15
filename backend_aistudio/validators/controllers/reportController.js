const asyncHandler = require('../middleware/asyncHandler');
const reportService = require('../services/reportService');
const apiResponse = require('../utils/apiResponse');

// @desc    Generate a report for a protocol (JSON or PDF-ready)
// @route   POST /api/protocols/:protocolId/reports
// @access  Private
const generateReport = asyncHandler(async (req, res) => {
  const { type, format } = req.body;
  const report = await reportService.generateReport(req.params.protocolId, type, format || 'JSON', req.user.id);
  return apiResponse.success(res, 201, 'Report generated successfully', { report });
});

// @desc    List reports for a protocol
// @route   GET /api/protocols/:protocolId/reports
// @access  Private
const listReports = asyncHandler(async (req, res) => {
  const reports = await reportService.listReportsForProtocol(req.params.protocolId);
  return apiResponse.success(res, 200, 'Reports fetched successfully', { reports });
});

// @desc    Get a single generated report
// @route   GET /api/reports/:id
// @access  Private
const getReport = asyncHandler(async (req, res) => {
  const report = await reportService.getReportById(req.params.id);
  return apiResponse.success(res, 200, 'Report fetched successfully', { report });
});

module.exports = { generateReport, listReports, getReport };
