const { prisma } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { evaluateRisk } = require('../utils/riskCalculator');

async function ensureProtocolExists(protocolId) {
  const protocol = await prisma.protocol.findUnique({ where: { id: protocolId } });
  if (!protocol) throw ApiError.notFound('Protocol not found');
  return protocol;
}

async function createRisk(protocolId, data) {
  await ensureProtocolExists(protocolId);

  const { riskScore, riskLevel } = evaluateRisk(data.probability, data.impact);

  return prisma.risk.create({
    data: {
      protocolId,
      title: data.title,
      description: data.description,
      category: data.category || 'OTHER',
      probability: data.probability,
      impact: data.impact,
      riskScore,
      riskLevel,
      mitigationPlan: data.mitigationPlan,
    },
  });
}

async function listRisksForProtocol(protocolId) {
  await ensureProtocolExists(protocolId);
  return prisma.risk.findMany({
    where: { protocolId },
    orderBy: { riskScore: 'desc' },
  });
}

async function getRiskById(id) {
  const risk = await prisma.risk.findUnique({ where: { id } });
  if (!risk) throw ApiError.notFound('Risk not found');
  return risk;
}

async function updateRisk(id, data) {
  const existing = await prisma.risk.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Risk not found');

  const probability = data.probability ?? existing.probability;
  const impact = data.impact ?? existing.impact;
  const { riskScore, riskLevel } = evaluateRisk(probability, impact);

  return prisma.risk.update({
    where: { id },
    data: {
      ...data,
      probability,
      impact,
      riskScore,
      riskLevel,
    },
  });
}

async function deleteRisk(id) {
  const existing = await prisma.risk.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Risk not found');
  await prisma.risk.delete({ where: { id } });
  return { id };
}

module.exports = { createRisk, listRisksForProtocol, getRiskById, updateRisk, deleteRisk };
