require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config/config');
const mountRoutes = require('./routes/index');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// ------------------------------------------------------------------
// Security & core middleware
// ------------------------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.env === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', apiLimiter);

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------
mountRoutes(app);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Clinical Trial Protocol Designer API — educational project, not for real clinical use.',
    docs: '/README.md',
  });
});

// ------------------------------------------------------------------
// 404 + centralized error handling (must be registered last)
// ------------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
