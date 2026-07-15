const { prisma } = require('../config/db');
const ApiError = require('../utils/ApiError');

async function createProtocol(data, userId) {
  const existingCode = await prisma.protocol.findUnique({ where: { studyCode: data.studyCode } });
  if (existingCode) {
    throw ApiError.conflict(`Study code "${data.studyCode}" is already in use`);
  }

  const protocol = await prisma.protocol.create({
    data: {
      title: data.title,
      studyCode: data.studyCode,
      phase: data.phase || 'PHASE_I',
      status: data.status || 'DRAFT',
      therapeuticArea: data.therapeuticArea,
      sponsor: data.sponsor,
      condition: data.condition,
      objective: data.objective,
      inclusionCriteria: data.inclusionCriteria,
      exclusionCriteria: data.exclusionCriteria,
      studyDesign: data.studyDesign,
      population: data.population,
      durationWeeks: data.durationWeeks,
      createdById: userId,
    },
  });

  // Create initial version snapshot
  await prisma.protocolVersion.create({
    data: {
      protocolId: protocol.id,
      versionNumber: 1,
      snapshot: protocol,
      changeSummary: 'Initial protocol creation',
      createdById: userId,
    },
  });

  return protocol;
}

async function getProtocolById(id) {
  const protocol = await prisma.protocol.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      _count: {
        select: {
          risks: true,
          adverseEvents: true,
          milestones: true,
          checklistItems: true,
          reviews: true,
          versions: true,
        },
      },
    },
  });

  if (!protocol) throw ApiError.notFound('Protocol not found');
  return protocol;
}

async function listProtocols({ page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, phase }) {
  const where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { studyCode: { contains: search, mode: 'insensitive' } },
      { condition: { contains: search, mode: 'insensitive' } },
      { sponsor: { contains: search, mode: 'insensitive' } },
      { therapeuticArea: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) where.status = status;
  if (phase) where.phase = phase;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.protocol.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: Number(limit),
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { risks: true, adverseEvents: true, reviews: true } },
      },
    }),
    prisma.protocol.count({ where }),
  ]);

  return {
    items,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function updateProtocol(id, data, userId) {
  const existing = await prisma.protocol.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Protocol not found');

  if (data.studyCode && data.studyCode !== existing.studyCode) {
    const codeInUse = await prisma.protocol.findUnique({ where: { studyCode: data.studyCode } });
    if (codeInUse) throw ApiError.conflict(`Study code "${data.studyCode}" is already in use`);
  }

  const updated = await prisma.protocol.update({
    where: { id },
    data: {
      ...data,
      currentVersion: existing.currentVersion + 1,
    },
  });

  await prisma.protocolVersion.create({
    data: {
      protocolId: id,
      versionNumber: updated.currentVersion,
      snapshot: updated,
      changeSummary: data.changeSummary || 'Protocol updated',
      createdById: userId,
    },
  });

  return updated;
}

async function deleteProtocol(id) {
  const existing = await prisma.protocol.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Protocol not found');
  await prisma.protocol.delete({ where: { id } });
  return { id };
}

async function duplicateProtocol(id, userId) {
  const original = await prisma.protocol.findUnique({ where: { id } });
  if (!original) throw ApiError.notFound('Protocol not found');

  let newCode = `${original.studyCode}-COPY`;
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.protocol.findUnique({ where: { studyCode: newCode } })) {
    suffix += 1;
    newCode = `${original.studyCode}-COPY-${suffix}`;
  }

  const duplicate = await prisma.protocol.create({
    data: {
      title: `${original.title} (Copy)`,
      studyCode: newCode,
      phase: original.phase,
      status: 'DRAFT',
      therapeuticArea: original.therapeuticArea,
      sponsor: original.sponsor,
      condition: original.condition,
      objective: original.objective,
      inclusionCriteria: original.inclusionCriteria,
      exclusionCriteria: original.exclusionCriteria,
      studyDesign: original.studyDesign,
      population: original.population,
      durationWeeks: original.durationWeeks,
      createdById: userId,
    },
  });

  await prisma.protocolVersion.create({
    data: {
      protocolId: duplicate.id,
      versionNumber: 1,
      snapshot: duplicate,
      changeSummary: `Duplicated from protocol ${original.studyCode}`,
      createdById: userId,
    },
  });

  return duplicate;
}

async function getVersionHistory(protocolId) {
  const protocol = await prisma.protocol.findUnique({ where: { id: protocolId } });
  if (!protocol) throw ApiError.notFound('Protocol not found');

  const versions = await prisma.protocolVersion.findMany({
    where: { protocolId },
    orderBy: { versionNumber: 'desc' },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  });

  return versions;
}

module.exports = {
  createProtocol,
  getProtocolById,
  listProtocols,
  updateProtocol,
  deleteProtocol,
  duplicateProtocol,
  getVersionHistory,
};
