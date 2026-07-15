const bcrypt = require('bcrypt');
const { prisma } = require('../config/db');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const { signAccessToken, signRefreshToken } = require('../utils/jwt');

async function register({ name, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('A user with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'RESEARCHER',
    },
  });

  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  const { password, ...safeUser } = user;
  return safeUser;
}

module.exports = { register, login, getProfile };
