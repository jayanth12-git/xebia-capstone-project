const express = require('express');
const router = express.Router();

const { generateProtocol } = require('../controllers/protocolGeneratorController');
const { generateProtocolValidator } = require('../validators/protocolGeneratorValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', generateProtocolValidator, validate, generateProtocol);

module.exports = router;
