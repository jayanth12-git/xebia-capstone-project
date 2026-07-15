const { prisma } = require('../config/db');
const ApiError = require('../utils/ApiError');

async function ensureProtocolExists(protocolId) {
  const protocol = await prisma.protocol.findUnique({ where: { id: protocolId } });
  if (!protocol) throw ApiError.notFound('Protocol not found');
  return protocol;
}

const DECISION_TO_PROTOCOL_STATUS = {
  APPROVE: 'APPROVED',
  MINOR_REVISION: 'MINOR_REVISION',
  MAJOR_REVISION: 'MAJOR_REVISION',
  REJECT: 'REJECTED',
};

async function createReview(protocolId, reviewerId, data) {
  await ensureProtocolExists(protocolId);

  const review = await prisma.review.create({
    data: {
      protocolId,
      reviewerId,
      decision: data.decision || 'PENDING',
      comments: data.comments,
      score: data.score,
    },
  });

  if (data.decision && DECISION_TO_PROTOCOL_STATUS[data.decision]) {
    await prisma.protocol.update({
      where: { id: protocolId },
      data: { status: DECISION_TO_PROTOCOL_STATUS[data.decision] },
    });
  } else {
    await prisma.protocol.update({ where: { id: protocolId }, data: { status: 'IN_REVIEW' } });
  }

  return review;
}

async function listReviewsForProtocol(protocolId) {
  await ensureProtocolExists(protocolId);
  return prisma.review.findMany({
    where: { protocolId },
    orderBy: { createdAt: 'desc' },
    include: { reviewer: { select: { id: true, name: true, email: true, role: true } } },
  });
}

async function getReviewById(id) {
  const review = await prisma.review.findUnique({
    where: { id },
    include: { reviewer: { select: { id: true, name: true, email: true, role: true } } },
  });
  if (!review) throw ApiError.notFound('Review not found');
  return review;
}

async function applyDecision(id, decision, extra = {}) {
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Review not found');

  const review = await prisma.review.update({
    where: { id },
    data: { decision, ...extra },
  });

  if (DECISION_TO_PROTOCOL_STATUS[decision]) {
    await prisma.protocol.update({
      where: { id: existing.protocolId },
      data: { status: DECISION_TO_PROTOCOL_STATUS[decision] },
    });
  }

  return review;
}

async function deleteReview(id) {
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Review not found');
  await prisma.review.delete({ where: { id } });
  return { id };
}

module.exports = {
  createReview,
  listReviewsForProtocol,
  getReviewById,
  applyDecision,
  deleteReview,
};
