const asyncHandler = require('../middleware/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const { calculateSampleSize } = require('../utils/sampleSizeCalculator');

// @desc    Calculate required sample size for a study design
// @route   POST /api/sample-size
// @access  Private
const calculate = asyncHandler(async (req, res) => {
  const { effectSize, power, alpha, dropoutRate, population } = req.body;

  let result;
  try {
    result = calculateSampleSize({
      effectSize: Number(effectSize),
      power: Number(power),
      alpha: Number(alpha),
      dropoutRate: dropoutRate !== undefined ? Number(dropoutRate) : 0,
      population: population !== undefined ? Number(population) : null,
    });
  } catch (err) {
    throw ApiError.badRequest(err.message);
  }

  return apiResponse.success(res, 200, 'Sample size calculated successfully', result);
});

module.exports = { calculate };
