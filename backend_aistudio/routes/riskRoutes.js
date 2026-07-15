const express = require('express');
const router = express.Router({ mergeParams: true });

const { createRisk, listRisks } = require('../controllers/riskController');
const { createRiskValidator } = require('../validators/riskValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(listRisks)
  .post(createRiskValidator, validate, createRisk);

module.exports = router;
