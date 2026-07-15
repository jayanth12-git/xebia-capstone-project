const express = require('express');
const router = express.Router();

const { updateChecklistItem, deleteChecklistItem } = require('../controllers/checklistController');
const { updateChecklistItemValidator } = require('../validators/checklistValidators');
const { idParamValidator } = require('../validators/protocolValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/:id')
  .put(updateChecklistItemValidator, validate, updateChecklistItem)
  .delete(idParamValidator, validate, deleteChecklistItem);

module.exports = router;
