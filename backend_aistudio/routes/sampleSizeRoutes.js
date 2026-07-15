const express = require('express');
const router = express.Router();

const { calculate } = require('../controllers/sampleSizeController');
const { sampleSizeValidator } = require('../validators/sampleSizeValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', sampleSizeValidator, validate, calculate);

module.exports = router;
