const express = require('express');
const router = express.Router();

const { getSettings, getSetting, updateSetting } = require('../controllers/settingsController');
const { updateSettingValidator } = require('../validators/settingsValidators');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/', getSettings);
router.route('/:key')
  .get(getSetting)
  .put(updateSettingValidator, validate, updateSetting);

module.exports = router;
