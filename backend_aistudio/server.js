require('dotenv').config();

const app = require('./app');
const config = require('./config/config');
const { connectDB, disconnectDB } = require('./config/db');

let server;

async function start() {
  await connectDB();

  server = app.listen(config.port, () => {
    console.log(`🚀 AI Clinical Trial Protocol Designer API running in ${config.env} mode on port ${config.port}`);
  });
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      console.log('✅ Server closed and database disconnected.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

start();
