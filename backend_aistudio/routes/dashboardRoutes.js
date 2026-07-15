const express = require('express');
const router = express.Router();

const { getStatistics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getStatistics);

module.exports = router;
