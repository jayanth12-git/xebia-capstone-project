const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');
const apiResponse = require('../utils/apiResponse');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (in a real system this might be restricted to Admins)
const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  return apiResponse.success(res, 201, 'User registered successfully', { user });
});

// @desc    Login user & return JWT tokens
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  return apiResponse.success(res, 200, 'Login successful', { user, accessToken, refreshToken });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
// Note: Since JWTs are stateless, "logout" here is a client-side operation
// (discard the token). This endpoint exists for API completeness and to
// give the frontend a clear contract; in a production system this would
// typically also add the token to a server-side denylist/blacklist store.
const logout = asyncHandler(async (req, res) => {
  return apiResponse.success(res, 200, 'Logout successful. Please discard your access token.');
});

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  return apiResponse.success(res, 200, 'Profile fetched successfully', { user });
});

module.exports = { register, login, logout, getMe };
