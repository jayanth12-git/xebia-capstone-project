const { prisma } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { calculateCompletionPercentage } = require('../utils/checklistCalculator');

async function getProtocolOrThrow(protocolId) {
  const protocol = await prisma.protocol.findUnique({ where: { id: protocolId } });
  if (!protocol) throw ApiError.notFound('Protocol not found');
  return protocol;
}

async function buildProtocolSummary(protocolId) {
  const protocol = await prisma.protocol.findUnique({
    where: { id: protocolId },
    include: { createdBy: { select: { name: true, email: true } } },
  });
  return {
    reportType: 'PROTOCOL_SUMMARY',
    protocol,
  };
}

async function buildRiskAssessment(protocolId) {
  const risks = await prisma.risk.findMany({ where: { protocolId }, orderBy: { riskScore: 'desc' } });
  const summary = {
    total: risks.length,
    critical: risks.filter((r) => r.riskLevel === 'CRITICAL').length,
    high: risks.filter((r) => r.riskLevel === 'HIGH').length,
    medium: risks.filter((r) => r.riskLevel === 'MEDIUM').length,
    low: risks.filter((r) => r.riskLevel === 'LOW').length,
  };
  return { reportType: 'RISK_ASSESSMENT', summary, risks };
}

async function buildAdverseEventSummary(protocolId) {
  const events = await prisma.adverseEvent.findMany({ where: { protocolId }, orderBy: { createdAt: 'desc' } });
  const summary = {
    total: events.length,
    fatal: events.filter((e) => e.severity === 'FATAL').length,
    lifeThreatening: events.filter((e) => e.severity === 'LIFE_THREATENING').length,
    severe: events.filter((e) => e.severity === 'SEVERE').length,
    moderate: events.filter((e) => e.severity === 'MODERATE').length,
    mild: events.filter((e) => e.severity === 'MILD').length,
    ongoing: events.filter((e) => e.status === 'ONGOING').length,
  };
  return { reportType: 'ADVERSE_EVENT_SUMMARY', summary, events };
}

async function buildReviewSummary(protocolId) {
  const reviews = await prisma.review.findMany({
    where: { protocolId },
    orderBy: { createdAt: 'desc' },
    include: { reviewer: { select: { name: true, email: true } } },
  });
  const summary = {
    total: reviews.length,
    approved: reviews.filter((r) => r.decision === 'APPROVE').length,
    minorRevision: reviews.filter((r) => r.decision === 'MINOR_REVISION').length,
    majorRevision: reviews.filter((r) => r.decision === 'MAJOR_REVISION').length,
    rejected: reviews.filter((r) => r.decision === 'REJECT').length,
  };
  return { reportType: 'REVIEW_SUMMARY', summary, reviews };
}

async function buildFullProtocolReport(protocolId) {
  const [protocol, risks, adverseEvents, milestones, checklistItems, reviews, versions] = await Promise.all([
    prisma.protocol.findUnique({ where: { id: protocolId }, include: { createdBy: { select: { name: true, email: true } } } }),
    prisma.risk.findMany({ where: { protocolId } }),
    prisma.adverseEvent.findMany({ where: { protocolId } }),
    prisma.milestone.findMany({ where: { protocolId }, orderBy: { order: 'asc' } }),
    prisma.checklistItem.findMany({ where: { protocolId } }),
    prisma.review.findMany({ where: { protocolId }, include: { reviewer: { select: { name: true, email: true } } } }),
    prisma.protocolVersion.count({ where: { protocolId } }),
  ]);

  return {
    reportType: 'FULL_PROTOCOL',
    protocol,
    risks,
    adverseEvents,
    milestones,
    checklist: {
      items: checklistItems,
      completionPercentage: calculateCompletionPercentage(checklistItems),
    },
    reviews,
    totalVersions: versions,
  };
}

const BUILDERS = {
  PROTOCOL_SUMMARY: buildProtocolSummary,
  RISK_ASSESSMENT: buildRiskAssessment,
  ADVERSE_EVENT_SUMMARY: buildAdverseEventSummary,
  REVIEW_SUMMARY: buildReviewSummary,
  FULL_PROTOCOL: buildFullProtocolReport,
};

/**
 * Converts a JSON report payload into a flattened "PDF-ready" shape:
 * a simple ordered list of { heading, rows } blocks that a PDF
 * rendering layer (e.g. pdfkit/puppeteer on the frontend or a
 * separate service) can iterate over directly.
 */
function toPdfReadyFormat(reportType, content) {
  const blocks = [];

  blocks.push({ heading: 'Report Type', rows: [reportType] });

  Object.entries(content).forEach(([key, value]) => {
    if (key === 'reportType') return;
    if (Array.isArray(value)) {
      blocks.push({
        heading: key,
        rows: value.map((item) => JSON.stringify(item)),
      });
    } else if (value && typeof value === 'object') {
      blocks.push({
        heading: key,
        rows: Object.entries(value).map(([k, v]) => `${k}: ${v}`),
      });
    } else {
      blocks.push({ heading: key, rows: [String(value)] });
    }
  });

  return { format: 'PDF_READY', blocks };
}

async function generateReport(protocolId, type, format, userId) {
  await getProtocolOrThrow(protocolId);

  const builder = BUILDERS[type];
  if (!builder) throw ApiError.badRequest(`Unsupported report type: ${type}`);

  const content = await builder(protocolId);

  const finalContent = format === 'PDF_READY' ? toPdfReadyFormat(type, content) : content;

  const report = await prisma.report.create({
    data: {
      protocolId,
      type,
      format: format || 'JSON',
      content: finalContent,
      generatedById: userId,
    },
  });

  return report;
}

async function listReportsForProtocol(protocolId) {
  await getProtocolOrThrow(protocolId);
  return prisma.report.findMany({
    where: { protocolId },
    orderBy: { createdAt: 'desc' },
    include: { generatedBy: { select: { name: true, email: true } } },
  });
}

async function getReportById(id) {
  const report = await prisma.report.findUnique({
    where: { id },
    include: { generatedBy: { select: { name: true, email: true } } },
  });
  if (!report) throw ApiError.notFound('Report not found');
  return report;
}

module.exports = { generateReport, listReportsForProtocol, getReportById };
