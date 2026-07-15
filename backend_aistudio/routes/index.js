const authRoutes = require('./authRoutes');
const protocolRoutes = require('./protocolRoutes');
const protocolGeneratorRoutes = require('./protocolGeneratorRoutes');
const sampleSizeRoutes = require('./sampleSizeRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const settingsRoutes = require('./settingsRoutes');

const riskRoutes = require('./riskRoutes');
const riskDirectRoutes = require('./riskDirectRoutes');

const adverseEventRoutes = require('./adverseEventRoutes');
const adverseEventDirectRoutes = require('./adverseEventDirectRoutes');

const milestoneRoutes = require('./milestoneRoutes');
const milestoneDirectRoutes = require('./milestoneDirectRoutes');

const checklistRoutes = require('./checklistRoutes');
const checklistDirectRoutes = require('./checklistDirectRoutes');

const reviewRoutes = require('./reviewRoutes');
const reviewDirectRoutes = require('./reviewDirectRoutes');

const reportRoutes = require('./reportRoutes');
const reportDirectRoutes = require('./reportDirectRoutes');

/**
 * Mounts every API route module onto the Express app.
 * Nested routes (e.g. /api/protocols/:protocolId/risks) are mounted
 * alongside flat, id-based routes (e.g. /api/risks/:id) for each
 * resource that belongs to a Protocol.
 */
function mountRoutes(app) {
  app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'AI Clinical Trial Protocol Designer API is healthy' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/protocols', protocolRoutes);
  app.use('/api/protocol-generator', protocolGeneratorRoutes);
  app.use('/api/sample-size', sampleSizeRoutes);
  app.use('/api/settings', settingsRoutes);

  // Nested (belongs-to-protocol) routes
  app.use('/api/protocols/:protocolId/risks', riskRoutes);
  app.use('/api/protocols/:protocolId/adverse-events', adverseEventRoutes);
  app.use('/api/protocols/:protocolId/milestones', milestoneRoutes);
  app.use('/api/protocols/:protocolId/checklist', checklistRoutes);
  app.use('/api/protocols/:protocolId/reviews', reviewRoutes);
  app.use('/api/protocols/:protocolId/reports', reportRoutes);

  // Flat, id-based routes
  app.use('/api/risks', riskDirectRoutes);
  app.use('/api/adverse-events', adverseEventDirectRoutes);
  app.use('/api/milestones', milestoneDirectRoutes);
  app.use('/api/checklist', checklistDirectRoutes);
  app.use('/api/reviews', reviewDirectRoutes);
  app.use('/api/reports', reportDirectRoutes);
}

module.exports = mountRoutes;
