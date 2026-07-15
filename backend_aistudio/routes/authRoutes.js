const express = require('express');
const router = express.Router();

const { register, login, logout, getMe } = require('../controllers/authController');
const { loginValidator, registerValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
