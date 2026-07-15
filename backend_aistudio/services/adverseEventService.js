const { prisma } = require('../config/db');
const ApiError = require('../utils/ApiError');

async function ensureProtocolExists(protocolId) {
  const protocol = await prisma.protocol.findUnique({ where: { id: protocolId } });
  if (!protocol) throw ApiError.notFound('Protocol not found');
  return protocol;
}

async function createAdverseEvent(protocolId, data) {
  await ensureProtocolExists(protocolId);
  return prisma.adverseEvent.create({
    data: {
      protocolId,
      subjectCode: data.subjectCode,
      description: data.description,
      severity: data.severity || 'MILD',
      causality: data.causality || 'POSSIBLE',
      status: data.status || 'REPORTED',
      onsetDate: data.onsetDate ? new Date(data.onsetDate) : null,
      resolvedDate: data.resolvedDate ? new Date(data.resolvedDate) : null,
      reportedBy: data.reportedBy,
    },
  });
}

async function listAdverseEventsForProtocol(protocolId) {
  await ensureProtocolExists(protocolId);
  return prisma.adverseEvent.findMany({
    where: { protocolId },
    orderBy: { createdAt: 'desc' },
  });
}

async function getAdverseEventById(id) {
  const event = await prisma.adverseEvent.findUnique({ where: { id } });
  if (!event) throw ApiError.notFound('Adverse event not found');
  return event;
}

async function updateAdverseEvent(id, data) {
  const existing = await prisma.adverseEvent.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Adverse event not found');

  return prisma.adverseEvent.update({
    where: { id },
    data: {
      ...data,
      onsetDate: data.onsetDate ? new Date(data.onsetDate) : undefined,
      resolvedDate: data.resolvedDate ? new Date(data.resolvedDate) : undefined,
    },
  });
}

async function deleteAdverseEvent(id) {
  const existing = await prisma.adverseEvent.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Adverse event not found');
  await prisma.adverseEvent.delete({ where: { id } });
  return { id };
}

module.exports = {
  createAdverseEvent,
  listAdverseEventsForProtocol,
  getAdverseEventById,
  updateAdverseEvent,
  deleteAdverseEvent,
};
