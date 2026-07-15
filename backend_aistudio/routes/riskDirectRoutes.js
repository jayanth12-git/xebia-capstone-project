const express = require('express');
const router = express.Router();

const { getRisk, updateRisk, deleteRisk } = require('../controllers/riskController');
const { updateRiskValidator } = require('../validators/riskValidators');
const { idParamValidator } = require('../validators/protocolValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/:id')
  .get(idParamValidator, validate, getRisk)
  .put(updateRiskValidator, validate, updateRisk)
  .delete(idParamValidator, validate, deleteRisk);

module.exports = router;
