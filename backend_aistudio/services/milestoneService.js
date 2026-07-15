const { prisma } = require('../config/db');
const ApiError = require('../utils/ApiError');

async function ensureProtocolExists(protocolId) {
  const protocol = await prisma.protocol.findUnique({ where: { id: protocolId } });
  if (!protocol) throw ApiError.notFound('Protocol not found');
  return protocol;
}

async function createMilestone(protocolId, data) {
  await ensureProtocolExists(protocolId);
  return prisma.milestone.create({
    data: {
      protocolId,
      title: data.title,
      description: data.description,
      status: data.status || 'PENDING',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      order: data.order ?? 0,
    },
  });
}

async function listMilestonesForProtocol(protocolId) {
  await ensureProtocolExists(protocolId);
  return prisma.milestone.findMany({
    where: { protocolId },
    orderBy: [{ order: 'asc' }, { dueDate: 'asc' }],
  });
}

async function getMilestoneById(id) {
  const milestone = await prisma.milestone.findUnique({ where: { id } });
  if (!milestone) throw ApiError.notFound('Milestone not found');
  return milestone;
}

async function updateMilestone(id, data) {
  const existing = await prisma.milestone.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Milestone not found');

  const updateData = { ...data };
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
  if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
    updateData.completedAt = new Date();
  }

  return prisma.milestone.update({ where: { id }, data: updateData });
}

async function deleteMilestone(id) {
  const existing = await prisma.milestone.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Milestone not found');
  await prisma.milestone.delete({ where: { id } });
  return { id };
}

module.exports = {
  createMilestone,
  listMilestonesForProtocol,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
};
