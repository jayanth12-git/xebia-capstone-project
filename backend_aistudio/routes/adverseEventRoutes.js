const express = require('express');
const router = express.Router({ mergeParams: true });

const { createAdverseEvent, listAdverseEvents } = require('../controllers/adverseEventController');
const { createAdverseEventValidator } = require('../validators/adverseEventValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(listAdverseEvents)
  .post(createAdverseEventValidator, validate, createAdverseEvent);

module.exports = router;
