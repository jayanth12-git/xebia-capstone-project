const express = require('express');
const router = express.Router({ mergeParams: true });

const { generateReport, listReports } = require('../controllers/reportController');
const { generateReportValidator } = require('../validators/reportValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(listReports)
  .post(generateReportValidator, validate, generateReport);

module.exports = router;
