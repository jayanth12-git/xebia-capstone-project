const express = require('express');
const router = express.Router({ mergeParams: true });

const { createMilestone, listMilestones } = require('../controllers/milestoneController');
const { createMilestoneValidator } = require('../validators/milestoneValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(listMilestones)
  .post(createMilestoneValidator, validate, createMilestone);

module.exports = router;
