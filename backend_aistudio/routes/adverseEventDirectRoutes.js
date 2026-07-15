const express = require('express');
const router = express.Router();

const { getAdverseEvent, updateAdverseEvent, deleteAdverseEvent } = require('../controllers/adverseEventController');
const { updateAdverseEventValidator } = require('../validators/adverseEventValidators');
const { idParamValidator } = require('../validators/protocolValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/:id')
  .get(idParamValidator, validate, getAdverseEvent)
  .put(updateAdverseEventValidator, validate, updateAdverseEvent)
  .delete(idParamValidator, validate, deleteAdverseEvent);

module.exports = router;
