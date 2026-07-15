require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || 'System Administrator';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;

async function main() {
  console.log('🌱 Seeding database...');

  // ------------------------------------------------------------------
  // Admin user
  // ------------------------------------------------------------------
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {},
    create: {
      name: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user ready: ${admin.email}`);

  // A couple of extra users so reviews look realistic
  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@example.com' },
    update: {},
    create: {
      name: 'Dr. Priya Sharma',
      email: 'reviewer@example.com',
      password: await bcrypt.hash('reviewer123', SALT_ROUNDS),
      role: 'REVIEWER',
    },
  });

  const researcher = await prisma.user.upsert({
    where: { email: 'researcher@example.com' },
    update: {},
    create: {
      name: 'Dr. Arjun Mehta',
      email: 'researcher@example.com',
      password: await bcrypt.hash('researcher123', SALT_ROUNDS),
      role: 'RESEARCHER',
    },
  });

  // ------------------------------------------------------------------
  // Protocols (5)
  // ------------------------------------------------------------------
  const protocolSeeds = [
    {
      title: 'Efficacy of Compound-A in Type 2 Diabetes',
      studyCode: 'CTP-2026-001',
      phase: 'PHASE_II',
      status: 'IN_REVIEW',
      therapeuticArea: 'Endocrinology',
      sponsor: 'Takshashila Research Institute',
      condition: 'Type 2 Diabetes Mellitus',
      objective: 'Evaluate the glycemic control efficacy of Compound-A versus placebo over 24 weeks.',
      inclusionCriteria: 'Adults 18-65 with confirmed Type 2 Diabetes, HbA1c 7-10%.',
      exclusionCriteria: 'Type 1 Diabetes, severe renal impairment, pregnancy.',
      studyDesign: 'Randomized, double-blind, placebo-controlled, parallel-group.',
      population: 240,
      durationWeeks: 24,
    },
    {
      title: 'Safety and Tolerability of Compound-B in Hypertension',
      studyCode: 'CTP-2026-002',
      phase: 'PHASE_I',
      status: 'DRAFT',
      therapeuticArea: 'Cardiology',
      sponsor: 'Takshashila Research Institute',
      condition: 'Essential Hypertension',
      objective: 'Assess the safety, tolerability, and pharmacokinetics of ascending doses of Compound-B.',
      inclusionCriteria: 'Adults 18-55, mild to moderate essential hypertension.',
      exclusionCriteria: 'Secondary hypertension, cardiovascular events within 6 months.',
      studyDesign: 'Open-label, dose-escalation.',
      population: 48,
      durationWeeks: 8,
    },
    {
      title: 'Confirmatory Trial of Compound-C for Rheumatoid Arthritis',
      studyCode: 'CTP-2026-003',
      phase: 'PHASE_III',
      status: 'APPROVED',
      therapeuticArea: 'Rheumatology',
      sponsor: 'National Biomedical Consortium',
      condition: 'Rheumatoid Arthritis',
      objective: 'Confirm efficacy of Compound-C in reducing disease activity score (DAS28) at 52 weeks.',
      inclusionCriteria: 'Adults with moderate-to-severe active RA despite methotrexate therapy.',
      exclusionCriteria: 'Active infection, prior biologic failure > 2 agents.',
      studyDesign: 'Multi-center, randomized, double-blind, active-comparator.',
      population: 520,
      durationWeeks: 52,
    },
    {
      title: 'Post-Marketing Surveillance of Compound-D',
      studyCode: 'CTP-2026-004',
      phase: 'PHASE_IV',
      status: 'MINOR_REVISION',
      therapeuticArea: 'Pulmonology',
      sponsor: 'Regional Health Authority',
      condition: 'Chronic Obstructive Pulmonary Disease',
      objective: 'Monitor long-term real-world safety of Compound-D in a post-approval population.',
      inclusionCriteria: 'Patients prescribed Compound-D under routine clinical care.',
      exclusionCriteria: 'Enrollment in a concurrent interventional trial.',
      studyDesign: 'Observational registry study.',
      population: 1000,
      durationWeeks: 104,
    },
    {
      title: 'Preclinical Research Planning for Compound-E Oncology Candidate',
      studyCode: 'CTP-2026-005',
      phase: 'PRECLINICAL',
      status: 'DRAFT',
      therapeuticArea: 'Oncology',
      sponsor: 'Takshashila Research Institute',
      condition: 'Solid Tumor (exploratory)',
      objective: 'Characterize in-vitro and in-vivo activity of Compound-E prior to IND filing.',
      inclusionCriteria: 'N/A (preclinical).',
      exclusionCriteria: 'N/A (preclinical).',
      studyDesign: 'Preclinical in-vitro / in-vivo model study.',
      population: null,
      durationWeeks: 26,
    },
  ];

  const protocols = [];
  for (const seedData of protocolSeeds) {
    // eslint-disable-next-line no-await-in-loop
    const protocol = await prisma.protocol.upsert({
      where: { studyCode: seedData.studyCode },
      update: {},
      create: { ...seedData, createdById: admin.id },
    });
    protocols.push(protocol);

    // eslint-disable-next-line no-await-in-loop
    const versionCount = await prisma.protocolVersion.count({ where: { protocolId: protocol.id } });
    if (versionCount === 0) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.protocolVersion.create({
        data: {
          protocolId: protocol.id,
          versionNumber: 1,
          snapshot: protocol,
          changeSummary: 'Initial seed version',
          createdById: admin.id,
        },
      });
    }
  }
  console.log(`✅ ${protocols.length} protocols ready`);

  const [p1, p2, p3, p4, p5] = protocols;

  // ------------------------------------------------------------------
  // Risks (5) — score/level computed the same way the risk service does
  // ------------------------------------------------------------------
  function score(prob, impact) {
    const riskScore = prob * impact;
    let riskLevel = 'LOW';
    if (riskScore >= 16) riskLevel = 'CRITICAL';
    else if (riskScore >= 10) riskLevel = 'HIGH';
    else if (riskScore >= 5) riskLevel = 'MEDIUM';
    return { riskScore, riskLevel };
  }

  const riskSeeds = [
    { protocolId: p1.id, title: 'Hypoglycemia risk with dose escalation', category: 'SAFETY', probability: 4, impact: 4, mitigationPlan: 'Implement stepped dose titration and continuous glucose monitoring.' },
    { protocolId: p1.id, title: 'Site recruitment shortfall', category: 'RECRUITMENT', probability: 3, impact: 3, mitigationPlan: 'Expand to additional recruitment sites.' },
    { protocolId: p2.id, title: 'Unexpected cardiovascular event during escalation', category: 'SAFETY', probability: 2, impact: 5, mitigationPlan: 'Continuous ECG monitoring during dosing.' },
    { protocolId: p3.id, title: 'Data entry inconsistency across sites', category: 'DATA_INTEGRITY', probability: 3, impact: 2, mitigationPlan: 'Central data monitoring and automated validation checks.' },
    { protocolId: p4.id, title: 'Underreporting of adverse events in registry', category: 'REGULATORY', probability: 3, impact: 4, mitigationPlan: 'Quarterly site audits and reporting reminders.' },
  ];

  for (const r of riskSeeds) {
    const { riskScore, riskLevel } = score(r.probability, r.impact);
    // eslint-disable-next-line no-await-in-loop
    const exists = await prisma.risk.findFirst({ where: { protocolId: r.protocolId, title: r.title } });
    if (!exists) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.risk.create({ data: { ...r, riskScore, riskLevel } });
    }
  }
  console.log(`✅ ${riskSeeds.length} risks ready`);

  // ------------------------------------------------------------------
  // Adverse Events (5)
  // ------------------------------------------------------------------
  const aeSeeds = [
    { protocolId: p1.id, subjectCode: 'SUBJ-001', description: 'Mild nausea reported after morning dose.', severity: 'MILD', causality: 'POSSIBLE', status: 'RESOLVED', onsetDate: new Date('2026-02-01'), resolvedDate: new Date('2026-02-03') },
    { protocolId: p1.id, subjectCode: 'SUBJ-014', description: 'Episode of dizziness, resolved without intervention.', severity: 'MODERATE', causality: 'PROBABLE', status: 'RESOLVED', onsetDate: new Date('2026-02-10'), resolvedDate: new Date('2026-02-11') },
    { protocolId: p2.id, subjectCode: 'SUBJ-005', description: 'Transient elevation in blood pressure post-dose.', severity: 'MODERATE', causality: 'POSSIBLE', status: 'UNDER_INVESTIGATION', onsetDate: new Date('2026-03-01') },
    { protocolId: p3.id, subjectCode: 'SUBJ-102', description: 'Injection site reaction.', severity: 'MILD', causality: 'DEFINITE', status: 'RESOLVED', onsetDate: new Date('2026-01-15'), resolvedDate: new Date('2026-01-20') },
    { protocolId: p4.id, subjectCode: 'SUBJ-221', description: 'Hospitalization due to respiratory exacerbation.', severity: 'SEVERE', causality: 'UNLIKELY', status: 'ONGOING', onsetDate: new Date('2026-04-05') },
  ];

  for (const ae of aeSeeds) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await prisma.adverseEvent.findFirst({ where: { protocolId: ae.protocolId, subjectCode: ae.subjectCode, description: ae.description } });
    if (!exists) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.adverseEvent.create({ data: ae });
    }
  }
  console.log(`✅ ${aeSeeds.length} adverse events ready`);

  // ------------------------------------------------------------------
  // Milestones (5)
  // ------------------------------------------------------------------
  const milestoneSeeds = [
    { protocolId: p1.id, title: 'Protocol Finalization', status: 'COMPLETED', dueDate: new Date('2026-01-15'), order: 1 },
    { protocolId: p1.id, title: 'First Patient Enrolled', status: 'COMPLETED', dueDate: new Date('2026-02-01'), order: 2 },
    { protocolId: p1.id, title: 'Interim Safety Review', status: 'IN_PROGRESS', dueDate: new Date('2026-06-01'), order: 3 },
    { protocolId: p2.id, title: 'IRB Approval', status: 'PENDING', dueDate: new Date('2026-08-01'), order: 1 },
    { protocolId: p3.id, title: 'Database Lock', status: 'DELAYED', dueDate: new Date('2026-05-01'), order: 4 },
  ];

  for (const m of milestoneSeeds) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await prisma.milestone.findFirst({ where: { protocolId: m.protocolId, title: m.title } });
    if (!exists) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.milestone.create({ data: m });
    }
  }
  console.log(`✅ ${milestoneSeeds.length} milestones ready`);

  // ------------------------------------------------------------------
  // Checklist items (a handful per key protocol)
  // ------------------------------------------------------------------
  const checklistSeeds = [
    { protocolId: p1.id, label: 'Informed consent form finalized', category: 'Regulatory', order: 1, isCompleted: true },
    { protocolId: p1.id, label: 'IRB/Ethics committee approval obtained', category: 'Regulatory', order: 2, isCompleted: true },
    { protocolId: p1.id, label: 'Site initiation visits completed', category: 'Operational', order: 3, isCompleted: false },
    { protocolId: p1.id, label: 'Randomization scheme validated', category: 'Statistical', order: 4, isCompleted: false },
    { protocolId: p3.id, label: 'Statistical analysis plan signed off', category: 'Statistical', order: 1, isCompleted: true },
    { protocolId: p3.id, label: 'Data Safety Monitoring Board constituted', category: 'Regulatory', order: 2, isCompleted: true },
  ];

  for (const c of checklistSeeds) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await prisma.checklistItem.findFirst({ where: { protocolId: c.protocolId, label: c.label } });
    if (!exists) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.checklistItem.create({ data: c });
    }
  }
  console.log(`✅ ${checklistSeeds.length} checklist items ready`);

  // ------------------------------------------------------------------
  // Reviews (3)
  // ------------------------------------------------------------------
  const reviewSeeds = [
    { protocolId: p1.id, reviewerId: reviewer.id, decision: 'MINOR_REVISION', comments: 'Please clarify the dropout handling in the statistical section.', score: 78 },
    { protocolId: p3.id, reviewerId: reviewer.id, decision: 'APPROVE', comments: 'Well-structured protocol, ready for execution.', score: 95 },
    { protocolId: p4.id, reviewerId: reviewer.id, decision: 'MINOR_REVISION', comments: 'Add more detail to the adverse event reporting timelines.', score: 82 },
  ];

  for (const rv of reviewSeeds) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await prisma.review.findFirst({ where: { protocolId: rv.protocolId, reviewerId: rv.reviewerId, comments: rv.comments } });
    if (!exists) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.review.create({ data: rv });
    }
  }
  console.log(`✅ ${reviewSeeds.length} reviews ready`);

  // ------------------------------------------------------------------
  // Reports (a couple of generated examples)
  // ------------------------------------------------------------------
  const reportSeeds = [
    {
      protocolId: p1.id,
      type: 'PROTOCOL_SUMMARY',
      format: 'JSON',
      content: { reportType: 'PROTOCOL_SUMMARY', note: 'Seeded example summary report for CTP-2026-001.' },
      generatedById: admin.id,
    },
    {
      protocolId: p3.id,
      type: 'RISK_ASSESSMENT',
      format: 'JSON',
      content: { reportType: 'RISK_ASSESSMENT', note: 'Seeded example risk assessment report for CTP-2026-003.' },
      generatedById: admin.id,
    },
  ];

  for (const rep of reportSeeds) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await prisma.report.findFirst({ where: { protocolId: rep.protocolId, type: rep.type } });
    if (!exists) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.report.create({ data: rep });
    }
  }
  console.log(`✅ ${reportSeeds.length} reports ready`);

  // ------------------------------------------------------------------
  // Default settings
  // ------------------------------------------------------------------
  await prisma.setting.upsert({
    where: { key: 'app.name' },
    update: {},
    create: { key: 'app.name', value: 'AI Clinical Trial Protocol Designer', description: 'Application display name' },
  });
  await prisma.setting.upsert({
    where: { key: 'app.defaultAlpha' },
    update: {},
    create: { key: 'app.defaultAlpha', value: 0.05, description: 'Default significance level used by the sample size calculator UI' },
  });
  await prisma.setting.upsert({
    where: { key: 'app.defaultPower' },
    update: {},
    create: { key: 'app.defaultPower', value: 0.8, description: 'Default statistical power used by the sample size calculator UI' },
  });
  console.log('✅ Default settings ready');

  console.log('🌱 Seeding complete!');
  console.log('----------------------------------------------------');
  console.log(`Default admin login -> email: ${DEFAULT_ADMIN_EMAIL} | password: ${DEFAULT_ADMIN_PASSWORD}`);
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
