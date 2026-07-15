const { prisma } = require('../config/db');

async function getDashboardStatistics() {
  const [
    totalProtocols,
    protocolsByStatus,
    protocolsByPhase,
    totalRisks,
    risksByLevel,
    totalAdverseEvents,
    adverseEventsBySeverity,
    totalMilestones,
    milestonesByStatus,
    totalReviews,
    pendingReviews,
    totalUsers,
    recentProtocols,
  ] = await Promise.all([
    prisma.protocol.count(),
    prisma.protocol.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.protocol.groupBy({ by: ['phase'], _count: { _all: true } }),
    prisma.risk.count(),
    prisma.risk.groupBy({ by: ['riskLevel'], _count: { _all: true } }),
    prisma.adverseEvent.count(),
    prisma.adverseEvent.groupBy({ by: ['severity'], _count: { _all: true } }),
    prisma.milestone.count(),
    prisma.milestone.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.review.count(),
    prisma.review.count({ where: { decision: 'PENDING' } }),
    prisma.user.count(),
    prisma.protocol.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, studyCode: true, status: true, phase: true, createdAt: true },
    }),
  ]);

  const groupToObject = (groups) =>
    groups.reduce((acc, g) => {
      const keyName = Object.keys(g).find((k) => k !== '_count');
      acc[g[keyName]] = g._count._all;
      return acc;
    }, {});

  return {
    totals: {
      protocols: totalProtocols,
      risks: totalRisks,
      adverseEvents: totalAdverseEvents,
      milestones: totalMilestones,
      reviews: totalReviews,
      pendingReviews,
      users: totalUsers,
    },
    protocolsByStatus: groupToObject(protocolsByStatus),
    protocolsByPhase: groupToObject(protocolsByPhase),
    risksByLevel: groupToObject(risksByLevel),
    adverseEventsBySeverity: groupToObject(adverseEventsBySeverity),
    milestonesByStatus: groupToObject(milestonesByStatus),
    recentProtocols,
  };
}

module.exports = { getDashboardStatistics };
