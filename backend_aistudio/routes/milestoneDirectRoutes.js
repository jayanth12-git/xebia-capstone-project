const express = require('express');
const router = express.Router();

const { getMilestone, updateMilestone, deleteMilestone } = require('../controllers/milestoneController');
const { updateMilestoneValidator } = require('../validators/milestoneValidators');
const { idParamValidator } = require('../validators/protocolValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/:id')
  .get(idParamValidator, validate, getMilestone)
  .put(updateMilestoneValidator, validate, updateMilestone)
  .delete(idParamValidator, validate, deleteMilestone);

module.exports = router;
