const express = require('express');
const router = express.Router({ mergeParams: true });

const { createChecklistItem, getChecklist } = require('../controllers/checklistController');
const { createChecklistItemValidator } = require('../validators/checklistValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getChecklist)
  .post(createChecklistItemValidator, validate, createChecklistItem);

module.exports = router;
