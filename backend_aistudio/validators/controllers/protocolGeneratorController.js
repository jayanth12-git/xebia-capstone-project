const asyncHandler = require('../middleware/asyncHandler');
const protocolGeneratorService = require('../services/protocolGeneratorService');
const apiResponse = require('../utils/apiResponse');

// @desc    Generate a protocol document from a form using predefined templates
// @route   POST /api/protocol-generator
// @access  Private
const generateProtocol = asyncHandler(async (req, res) => {
  const result = await protocolGeneratorService.generateAndStore(req.body, req.user.id);
  return apiResponse.success(res, 201, 'Protocol generated successfully', result);
});

module.exports = { generateProtocol };
