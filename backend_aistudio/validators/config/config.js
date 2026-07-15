require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  },

  defaultAdmin: {
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
    name: process.env.DEFAULT_ADMIN_NAME || 'System Administrator',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 200,
  },
};
