const express = require('express');
const router = express.Router();

const { getReport } = require('../controllers/reportController');
const { idParamValidator } = require('../validators/protocolValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:id', idParamValidator, validate, getReport);

module.exports = router;
