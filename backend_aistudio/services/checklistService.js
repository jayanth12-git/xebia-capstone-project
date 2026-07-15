const { prisma } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { calculateCompletionPercentage } = require('../utils/checklistCalculator');

async function ensureProtocolExists(protocolId) {
  const protocol = await prisma.protocol.findUnique({ where: { id: protocolId } });
  if (!protocol) throw ApiError.notFound('Protocol not found');
  return protocol;
}

async function createChecklistItem(protocolId, data) {
  await ensureProtocolExists(protocolId);
  return prisma.checklistItem.create({
    data: {
      protocolId,
      label: data.label,
      category: data.category,
      order: data.order ?? 0,
    },
  });
}

async function getChecklistForProtocol(protocolId) {
  await ensureProtocolExists(protocolId);
  const items = await prisma.checklistItem.findMany({
    where: { protocolId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  const completionPercentage = calculateCompletionPercentage(items);
  return { items, completionPercentage, totalItems: items.length };
}

async function updateChecklistItem(id, data) {
  const existing = await prisma.checklistItem.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Checklist item not found');
  return prisma.checklistItem.update({ where: { id }, data });
}

async function deleteChecklistItem(id) {
  const existing = await prisma.checklistItem.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Checklist item not found');
  await prisma.checklistItem.delete({ where: { id } });
  return { id };
}

module.exports = {
  createChecklistItem,
  getChecklistForProtocol,
  updateChecklistItem,
  deleteChecklistItem,
};
