import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// JWT Secrets
const JWT_SECRET = "dev_secret_change_me";
const JWT_REFRESH_SECRET = "dev_refresh_secret_change_me";

// ==========================================
// IN-MEMORY DATABASE SCHEMA & SEED DATA
// ==========================================

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "RESEARCHER" | "ADMIN" | "REVIEWER";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Protocol {
  id: string;
  title: string;
  studyCode: string;
  phase: "PHASE_I" | "PHASE_II" | "PHASE_III" | "PHASE_IV";
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECTED";
  therapeuticArea: string;
  sponsor: string;
  condition: string;
  objective: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  studyDesign: string;
  population: string;
  durationWeeks: number;
  currentVersion: number;
  createdById: string;
  createdAt: string;
}

interface ProtocolVersion {
  id: string;
  protocolId: string;
  versionNumber: number;
  snapshot: any;
  changeSummary: string;
  createdById: string;
  createdAt: string;
}

interface Risk {
  id: string;
  protocolId: string;
  title: string;
  description: string;
  category: string;
  probability: number;
  impact: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  mitigationPlan: string;
  createdAt: string;
}

interface AdverseEvent {
  id: string;
  protocolId: string;
  subjectCode: string;
  description: string;
  severity: "MILD" | "MODERATE" | "SEVERE" | "LIFE_THREATENING" | "FATAL";
  causality: "NOT_RELATED" | "UNLIKELY" | "POSSIBLE" | "PROBABLE" | "DEFINITE";
  status: "REPORTED" | "ONGOING" | "RESOLVED";
  onsetDate: string | null;
  resolvedDate: string | null;
  reportedBy: string;
  createdAt: string;
}

interface Milestone {
  id: string;
  protocolId: string;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";
  dueDate: string | null;
  completedAt: string | null;
  order: number;
  createdAt: string;
}

interface ChecklistItem {
  id: string;
  protocolId: string;
  label: string;
  category: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
}

interface Review {
  id: string;
  protocolId: string;
  reviewerId: string;
  decision: "PENDING" | "APPROVE" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT";
  comments: string;
  score: number;
  createdAt: string;
}

interface Report {
  id: string;
  protocolId: string;
  type: "PROTOCOL_SUMMARY" | "RISK_ASSESSMENT" | "ADVERSE_EVENT_SUMMARY" | "REVIEW_SUMMARY" | "FULL_PROTOCOL";
  format: "JSON" | "PDF_READY";
  content: any;
  generatedById: string;
  createdAt: string;
}

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
  createdAt: string;
}

// Global In-Memory Stores
let users: User[] = [
  {
    id: "usr_1",
    name: "System Administrator",
    email: "admin@example.com",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "ADMIN",
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_2",
    name: "Dr. Rachel Green",
    email: "reviewer@example.com",
    passwordHash: bcrypt.hashSync("reviewer123", 10),
    role: "REVIEWER",
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_3",
    name: "Dr. John Doe",
    email: "researcher@example.com",
    passwordHash: bcrypt.hashSync("researcher123", 10),
    role: "RESEARCHER",
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
];

let protocols: Protocol[] = [
  {
    id: "prt_1",
    title: "Efficacy of AlzGuard-9 in Mild-to-Moderate Alzheimer's Disease",
    studyCode: "AG9-2026-01",
    phase: "PHASE_II",
    status: "IN_REVIEW",
    therapeuticArea: "Neurology",
    sponsor: "AlzVax Therapeutics Inc.",
    condition: "Mild-to-Moderate Alzheimer's Disease",
    objective: "To evaluate the efficacy and cognitive safety of AlzGuard-9 over 24 weeks.",
    inclusionCriteria: "Ages 50-80, diagnosed with mild-to-moderate AD, MMSE score between 18 and 26.",
    exclusionCriteria: "History of severe stroke, uncontrolled cardiovascular disease, or regular use of other investigational drugs.",
    studyDesign: "Double-blind, randomized, placebo-controlled, multi-center trial.",
    population: "Target enrollment of 250 subjects randomized 1:1.",
    durationWeeks: 24,
    currentVersion: 1,
    createdById: "usr_3",
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "prt_2",
    title: "Cardiovascular Safety Study of CardioPRIME in Hypertensive Patients",
    studyCode: "CP-2026-03",
    phase: "PHASE_III",
    status: "APPROVED",
    therapeuticArea: "Cardiology",
    sponsor: "PrimeCardia Pharma",
    condition: "Essential Hypertension",
    objective: "To establish long-term safety profile and blood pressure reduction efficacy of CardioPRIME.",
    inclusionCriteria: "Ages 18-75, systolic blood pressure between 140-160 mmHg despite single therapy.",
    exclusionCriteria: "Secondary hypertension, type 1 diabetes, active myocardial infarction within last 6 months.",
    studyDesign: "Active-controlled, open-label, parallel-group, superiority study.",
    population: "850 subjects across 45 clinical centers.",
    durationWeeks: 48,
    currentVersion: 2,
    createdById: "usr_3",
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "prt_3",
    title: "Immunogenicity of CoV-Block Multivalent Booster in Elderly Populations",
    studyCode: "CVB-Elderly-04",
    phase: "PHASE_I",
    status: "DRAFT",
    therapeuticArea: "Immunology",
    sponsor: "VaxSphere Labs",
    condition: "COVID-19 Prevention",
    objective: "To measure early antibody titers and reactogenicity of three dosage levels.",
    inclusionCriteria: "Healthy adults aged 65 and above, previously vaccinated with standard vaccine regimes.",
    exclusionCriteria: "Immunodeficient disorders, active immunosuppressive therapy, severe vaccination allergies.",
    studyDesign: "Dose-escalation, single-blind safety trial.",
    population: "30 subjects split into three cohorts of 10.",
    durationWeeks: 8,
    currentVersion: 1,
    createdById: "usr_3",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  }
];

let protocolVersions: ProtocolVersion[] = [
  {
    id: "ver_1",
    protocolId: "prt_1",
    versionNumber: 1,
    snapshot: { ...protocols[0] },
    changeSummary: "Initial protocol creation",
    createdById: "usr_3",
    createdAt: protocols[0].createdAt,
  },
  {
    id: "ver_2",
    protocolId: "prt_2",
    versionNumber: 1,
    snapshot: { ...protocols[1], currentVersion: 1 },
    changeSummary: "Initial baseline protocol draft",
    createdById: "usr_3",
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "ver_3",
    protocolId: "prt_2",
    versionNumber: 2,
    snapshot: { ...protocols[1] },
    changeSummary: "Revised inclusion MMSE criteria and increased center count.",
    createdById: "usr_3",
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "ver_4",
    protocolId: "prt_3",
    versionNumber: 1,
    snapshot: { ...protocols[2] },
    changeSummary: "Initial protocol creation",
    createdById: "usr_3",
    createdAt: protocols[2].createdAt,
  }
];

let risks: Risk[] = [
  {
    id: "rsk_1",
    protocolId: "prt_1",
    title: "Patient Cognitive Decline",
    description: "Rapid cognitive worsening due to natural disease progression or trial intervention.",
    category: "CLINICAL",
    probability: 3,
    impact: 4,
    riskScore: 12,
    riskLevel: "HIGH",
    mitigationPlan: "Frequent safety evaluations including MMSE at weeks 4, 8, 12, and 24. Implement stop criteria.",
    createdAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rsk_2",
    protocolId: "prt_1",
    title: "Delayed Site Enrollment",
    description: "Multi-center sites take longer than expected to screen and enroll appropriate AD subjects.",
    category: "OPERATIONAL",
    probability: 4,
    impact: 3,
    riskScore: 12,
    riskLevel: "HIGH",
    mitigationPlan: "Engage dedicated patient recruitment agencies. Host regional investigator meetings.",
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rsk_3",
    protocolId: "prt_2",
    title: "Severe Hypotension Event",
    description: "Investigational product drops blood pressure below normal safe levels leading to syncopal episodes.",
    category: "SAFETY",
    probability: 2,
    impact: 5,
    riskScore: 10,
    riskLevel: "HIGH",
    mitigationPlan: "Initial dose titration under active monitoring. Provision of automated blood pressure cuffs to all subjects.",
    createdAt: new Date(Date.now() - 24 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rsk_4",
    protocolId: "prt_2",
    title: "Electronic Data Capture (EDC) Downtime",
    description: "System outage preventing clinical coordinators from recording study data in real-time.",
    category: "DATA_MANAGEMENT",
    probability: 1,
    impact: 3,
    riskScore: 3,
    riskLevel: "LOW",
    mitigationPlan: "Offline paper source document backups. Multi-region database hosting redundancy.",
    createdAt: new Date(Date.now() - 23 * 24 * 3600 * 1000).toISOString(),
  }
];

let adverseEvents: AdverseEvent[] = [
  {
    id: "ae_1",
    protocolId: "prt_1",
    subjectCode: "SUB-0103",
    description: "Transient acute headache resolving with over-the-counter paracetamol.",
    severity: "MILD",
    causality: "POSSIBLE",
    status: "RESOLVED",
    onsetDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    resolvedDate: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
    reportedBy: "Dr. Alice Vance (Site 14)",
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "ae_2",
    protocolId: "prt_2",
    subjectCode: "SUB-3024",
    description: "Hospitalization due to hypertensive crisis combined with severe dizziness.",
    severity: "SEVERE",
    causality: "PROBABLE",
    status: "ONGOING",
    onsetDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    resolvedDate: null,
    reportedBy: "Dr. Robert Smith (Site 02)",
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  }
];

let milestones: Milestone[] = [
  {
    id: "ms_1",
    protocolId: "prt_1",
    title: "IRB Submission & Approval",
    description: "Obtain Institutional Review Board approvals for all initial active sites.",
    status: "COMPLETED",
    dueDate: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
    completedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    order: 1,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "ms_2",
    protocolId: "prt_1",
    title: "First Patient In (FPI)",
    description: "Enrollment and dosing of the very first patient in the study.",
    status: "IN_PROGRESS",
    dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    completedAt: null,
    order: 2,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "ms_3",
    protocolId: "prt_1",
    title: "Interim Analysis",
    description: "Unblinded analysis of safety parameters by the DSMB after 50% enrollment.",
    status: "PENDING",
    dueDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
    completedAt: null,
    order: 3,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "ms_4",
    protocolId: "prt_2",
    title: "Clinical Study Report Draft",
    description: "Final study document compilation and clinical study report generation.",
    status: "PENDING",
    dueDate: new Date(Date.now() + 120 * 24 * 3600 * 1000).toISOString().split('T')[0],
    completedAt: null,
    order: 4,
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
  }
];

let checklistItems: ChecklistItem[] = [
  {
    id: "chk_1",
    protocolId: "prt_1",
    label: "Verify clear inclusion criteria with specific clinical scores (MMSE/ADAS-Cog)",
    category: "ELIGIBILITY",
    isCompleted: true,
    order: 1,
    createdAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "chk_2",
    protocolId: "prt_1",
    label: "Define stop study safety rules for severe adverse event boundaries",
    category: "SAFETY",
    isCompleted: false,
    order: 2,
    createdAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "chk_3",
    protocolId: "prt_1",
    label: "Specify randomization mechanism, blinding methods, and emergency unblinding codes",
    category: "DESIGN",
    isCompleted: true,
    order: 3,
    createdAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "chk_4",
    protocolId: "prt_2",
    label: "Review and obtain secondary sponsor signatory commitments",
    category: "REGULATORY",
    isCompleted: true,
    order: 1,
    createdAt: new Date(Date.now() - 24 * 24 * 3600 * 1000).toISOString(),
  }
];

let reviews: Review[] = [
  {
    id: "rev_1",
    protocolId: "prt_1",
    reviewerId: "usr_2",
    decision: "PENDING",
    comments: "Protocol covers Alzheimer patients nicely, but we need to pay higher attention to safety indicators. Recommend adding weekly caregiver check-ins.",
    score: 78,
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rev_2",
    protocolId: "prt_2",
    reviewerId: "usr_2",
    decision: "APPROVE",
    comments: "Comprehensive cardio study with solid statistical backing. Recommended for fast-track IRB approval.",
    score: 95,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  }
];

let reports: Report[] = [
  {
    id: "rep_1",
    protocolId: "prt_2",
    type: "RISK_ASSESSMENT",
    format: "JSON",
    content: {
      reportType: "RISK_ASSESSMENT",
      summary: { total: 2, critical: 0, high: 1, medium: 0, low: 1 },
      risks: [
        { title: "Severe Hypotension Event", riskLevel: "HIGH", riskScore: 10 },
        { title: "EDC Downtime", riskLevel: "LOW", riskScore: 3 }
      ]
    },
    generatedById: "usr_3",
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  }
];

let settings: Setting[] = [
  {
    id: "set_1",
    key: "AI_MODEL_PREFERENCE",
    value: "gemini-2.5-flash",
    description: "The preferred Google Gemini AI model used for protocol drafts generation.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "set_2",
    key: "ENABLE_PEER_REVIEW_SCORE_GATES",
    value: "true",
    description: "Block protocol final sign-off if peer review score average is below 80.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "set_3",
    key: "DEFAULT_DROP_OUT_RATE_PERCENT",
    value: "15",
    description: "Standard dropout percentage used for study statistical powers calculations.",
    createdAt: new Date().toISOString(),
  }
];

// Helper functions
const getNextId = (prefix: string, list: { id: string }[]) => {
  const ids = list.map(item => parseInt(item.id.split('_')[1] || "0", 10)).filter(num => !isNaN(num));
  const max = ids.length > 0 ? Math.max(...ids) : 0;
  return `${prefix}_${max + 1}`;
};

const calculateRiskRating = (prob: number, imp: number) => {
  const score = prob * imp;
  let level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
  if (score >= 15) level = "CRITICAL";
  else if (score >= 10) level = "HIGH";
  else if (score >= 5) level = "MEDIUM";
  return { score, level };
};

// ==========================================
// MIDDLEWARE (AUTH & VALIDATION)
// ==========================================

const protect = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Not authorized, user no longer exists or is inactive" });
    }
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized, token is invalid or expired" });
  }
};

const restrictTo = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
    }
    next();
  };
};

// ==========================================
// API ROUTES IMPLEMENTATION
// ==========================================

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "AI Clinical Trial Protocol Designer API is healthy" });
});

// 1. Auth Endpoints
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" });
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(409).json({ success: false, message: "A user with this email already exists" });
  }

  const newUser: User = {
    id: getNextId("usr", users),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: role || "RESEARCHER",
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  const { passwordHash, ...safeUser } = newUser;
  return res.status(201).json({ success: true, message: "User registered successfully", data: { user: safeUser } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  const user = users.find(u => u.email === email);
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  user.lastLoginAt = new Date().toISOString();

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });

  const { passwordHash, ...safeUser } = user;
  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user: safeUser, accessToken, refreshToken }
  });
});

app.post("/api/auth/logout", protect, (req, res) => {
  return res.status(200).json({ success: true, message: "Logout successful. Please discard your access token." });
});

app.get("/api/auth/me", protect, (req: any, res) => {
  return res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: { user: req.user }
  });
});

// 2. Dashboard Statistics
app.get("/api/dashboard", protect, (req, res) => {
  const totalProtocols = protocols.length;
  const totalRisks = risks.length;
  const totalAdverseEvents = adverseEvents.length;
  const totalMilestones = milestones.length;
  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter(r => r.decision === "PENDING").length;
  const totalUsers = users.length;

  // Grouping helpers
  const protocolsByStatus: Record<string, number> = {};
  protocols.forEach(p => {
    protocolsByStatus[p.status] = (protocolsByStatus[p.status] || 0) + 1;
  });

  const protocolsByPhase: Record<string, number> = {};
  protocols.forEach(p => {
    protocolsByPhase[p.phase] = (protocolsByPhase[p.phase] || 0) + 1;
  });

  const risksByLevel: Record<string, number> = {};
  risks.forEach(r => {
    risksByLevel[r.riskLevel] = (risksByLevel[r.riskLevel] || 0) + 1;
  });

  const adverseEventsBySeverity: Record<string, number> = {};
  adverseEvents.forEach(ae => {
    adverseEventsBySeverity[ae.severity] = (adverseEventsBySeverity[ae.severity] || 0) + 1;
  });

  const milestonesByStatus: Record<string, number> = {};
  milestones.forEach(m => {
    milestonesByStatus[m.status] = (milestonesByStatus[m.status] || 0) + 1;
  });

  const recentProtocols = [...protocols]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      title: p.title,
      studyCode: p.studyCode,
      status: p.status,
      phase: p.phase,
      createdAt: p.createdAt,
    }));

  return res.status(200).json({
    success: true,
    message: "Dashboard statistics fetched successfully",
    data: {
      stats: {
        totals: {
          protocols: totalProtocols,
          risks: totalRisks,
          adverseEvents: totalAdverseEvents,
          milestones: totalMilestones,
          reviews: totalReviews,
          pendingReviews,
          users: totalUsers,
        },
        protocolsByStatus,
        protocolsByPhase,
        risksByLevel,
        adverseEventsBySeverity,
        milestonesByStatus,
        recentProtocols,
      }
    }
  });
});

// 3. Protocols Library
app.get("/api/protocols", protect, (req, res) => {
  const { page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", search, status, phase } = req.query as any;

  let filtered = [...protocols];

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(s) ||
      p.studyCode.toLowerCase().includes(s) ||
      p.condition.toLowerCase().includes(s) ||
      p.sponsor.toLowerCase().includes(s) ||
      p.therapeuticArea.toLowerCase().includes(s)
    );
  }

  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }

  if (phase) {
    filtered = filtered.filter(p => p.phase === phase);
  }

  // Sort
  filtered.sort((a: any, b: any) => {
    const fieldA = a[sortBy];
    const fieldB = b[sortBy];
    if (typeof fieldA === "string") {
      return sortOrder === "desc"
        ? fieldB.localeCompare(fieldA)
        : fieldA.localeCompare(fieldB);
    } else {
      return sortOrder === "desc" ? fieldB - fieldA : fieldA - fieldB;
    }
  });

  const total = filtered.length;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const items = filtered.slice(skip, skip + limitNum);

  // Attach creator and counts
  const itemsDetailed = items.map(p => {
    const creator = users.find(u => u.id === p.createdById);
    return {
      ...p,
      createdBy: creator ? { id: creator.id, name: creator.name, email: creator.email } : null,
      _count: {
        risks: risks.filter(r => r.protocolId === p.id).length,
        adverseEvents: adverseEvents.filter(ae => ae.protocolId === p.id).length,
        reviews: reviews.filter(rev => rev.protocolId === p.id).length,
      }
    };
  });

  return res.status(200).json({
    success: true,
    message: "Protocols fetched successfully",
    data: itemsDetailed,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    }
  });
});

app.post("/api/protocols", protect, (req: any, res) => {
  const data = req.body;
  if (!data.title || !data.studyCode) {
    return res.status(400).json({ success: false, message: "Please provide a study title and code" });
  }

  const codeInUse = protocols.some(p => p.studyCode === data.studyCode);
  if (codeInUse) {
    return res.status(409).json({ success: false, message: `Study code "${data.studyCode}" is already in use` });
  }

  const newProtocol: Protocol = {
    id: getNextId("prt", protocols),
    title: data.title,
    studyCode: data.studyCode,
    phase: data.phase || "PHASE_I",
    status: data.status || "DRAFT",
    therapeuticArea: data.therapeuticArea || "General Medicine",
    sponsor: data.sponsor || "Internal Investigator",
    condition: data.condition || "N/A",
    objective: data.objective || "",
    inclusionCriteria: data.inclusionCriteria || "",
    exclusionCriteria: data.exclusionCriteria || "",
    studyDesign: data.studyDesign || "",
    population: data.population || "",
    durationWeeks: parseInt(data.durationWeeks, 10) || 12,
    currentVersion: 1,
    createdById: req.user.id,
    createdAt: new Date().toISOString(),
  };

  protocols.push(newProtocol);

  // Initial version history
  protocolVersions.push({
    id: getNextId("ver", protocolVersions),
    protocolId: newProtocol.id,
    versionNumber: 1,
    snapshot: { ...newProtocol },
    changeSummary: "Initial protocol creation",
    createdById: req.user.id,
    createdAt: newProtocol.createdAt,
  });

  return res.status(201).json({
    success: true,
    message: "Protocol created successfully",
    data: { protocol: newProtocol }
  });
});

app.get("/api/protocols/:id", protect, (req, res) => {
  const protocol = protocols.find(p => p.id === req.params.id);
  if (!protocol) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const creator = users.find(u => u.id === protocol.createdById);
  const detail = {
    ...protocol,
    createdBy: creator ? { id: creator.id, name: creator.name, email: creator.email, role: creator.role } : null,
    _count: {
      risks: risks.filter(r => r.protocolId === protocol.id).length,
      adverseEvents: adverseEvents.filter(ae => ae.protocolId === protocol.id).length,
      milestones: milestones.filter(m => m.protocolId === protocol.id).length,
      checklistItems: checklistItems.filter(ci => ci.protocolId === protocol.id).length,
      reviews: reviews.filter(rev => rev.protocolId === protocol.id).length,
      versions: protocolVersions.filter(v => v.protocolId === protocol.id).length,
    }
  };

  return res.status(200).json({
    success: true,
    message: "Protocol fetched successfully",
    data: { protocol: detail }
  });
});

app.put("/api/protocols/:id", protect, (req: any, res) => {
  const id = req.params.id;
  const existingIndex = protocols.findIndex(p => p.id === id);
  if (existingIndex === -1) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const existing = protocols[existingIndex];
  const data = req.body;

  if (data.studyCode && data.studyCode !== existing.studyCode) {
    const codeInUse = protocols.some(p => p.studyCode === data.studyCode);
    if (codeInUse) {
      return res.status(409).json({ success: false, message: `Study code "${data.studyCode}" is already in use` });
    }
  }

  const updated: Protocol = {
    ...existing,
    ...data,
    durationWeeks: data.durationWeeks !== undefined ? parseInt(data.durationWeeks, 10) : existing.durationWeeks,
    currentVersion: existing.currentVersion + 1,
  };

  protocols[existingIndex] = updated;

  // Add new version history
  protocolVersions.push({
    id: getNextId("ver", protocolVersions),
    protocolId: id,
    versionNumber: updated.currentVersion,
    snapshot: { ...updated },
    changeSummary: data.changeSummary || "Protocol updated",
    createdById: req.user.id,
    createdAt: new Date().toISOString(),
  });

  return res.status(200).json({
    success: true,
    message: "Protocol updated successfully",
    data: { protocol: updated }
  });
});

app.delete("/api/protocols/:id", protect, (req, res) => {
  const index = protocols.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  protocols.splice(index, 1);
  return res.status(200).json({ success: true, message: "Protocol deleted successfully" });
});

app.post("/api/protocols/:id/duplicate", protect, (req: any, res) => {
  const original = protocols.find(p => p.id === req.params.id);
  if (!original) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  let newCode = `${original.studyCode}-COPY`;
  let suffix = 1;
  while (protocols.some(p => p.studyCode === newCode)) {
    suffix += 1;
    newCode = `${original.studyCode}-COPY-${suffix}`;
  }

  const duplicate: Protocol = {
    ...original,
    id: getNextId("prt", protocols),
    title: `${original.title} (Copy)`,
    studyCode: newCode,
    status: "DRAFT",
    currentVersion: 1,
    createdById: req.user.id,
    createdAt: new Date().toISOString(),
  };

  protocols.push(duplicate);

  protocolVersions.push({
    id: getNextId("ver", protocolVersions),
    protocolId: duplicate.id,
    versionNumber: 1,
    snapshot: { ...duplicate },
    changeSummary: `Duplicated from protocol ${original.studyCode}`,
    createdById: req.user.id,
    createdAt: duplicate.createdAt,
  });

  return res.status(201).json({
    success: true,
    message: "Protocol duplicated successfully",
    data: { protocol: duplicate }
  });
});

app.get("/api/protocols/:id/versions", protect, (req, res) => {
  const p = protocols.find(p => p.id === req.params.id);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const history = protocolVersions
    .filter(v => v.protocolId === req.params.id)
    .sort((a, b) => b.versionNumber - a.versionNumber)
    .map(v => {
      const creator = users.find(u => u.id === v.createdById);
      return {
        ...v,
        createdBy: creator ? { id: creator.id, name: creator.name, email: creator.email } : null,
      };
    });

  return res.status(200).json({
    success: true,
    message: "Version history fetched successfully",
    data: { versions: history }
  });
});

// 4. Protocol Generator Endpoint
app.post("/api/protocol-generator", protect, (req: any, res) => {
  const data = req.body;
  if (!data.title || !data.therapeuticArea) {
    return res.status(400).json({ success: false, message: "Please provide a title and therapeutic area" });
  }

  // Generate sections based on input
  const generatedDocument = {
    title: data.title,
    therapeuticArea: data.therapeuticArea,
    phase: data.phase || "PHASE_I",
    sections: [
      {
        title: "1.0 INTRODUCTION & BACKGROUND",
        content: `This clinical trial focuses on investigational therapeutic approaches for ${data.condition || "the stated clinical condition"} within the field of ${data.therapeuticArea}. Over the last decade, targeted treatments have shown strong potential, yet patient safety gates and dosage validations remain essential. This study design seeks to address critical therapeutic gaps in randomized cohorts under rigorous monitoring.`
      },
      {
        title: "2.0 TRIAL OBJECTIVES & PARAMETERS",
        content: `Primary Objective: ${data.objective || "To evaluate the efficacy and clinical safety profiles of the therapeutic agent."}\n\nSecondary Objectives: To monitor patient biomarkers, investigate dose-limiting toxicities, and establish long-term patient survival outcomes over a duration of ${data.durationWeeks || 12} weeks.`
      },
      {
        title: "3.0 STUDY POPULATION & ELIGIBILITY",
        content: `Inclusion Criteria: Patients who meet the following clinical gates:\n- ${data.inclusionCriteria || "Informed consent given, clinical diagnosis of primary condition, standard age intervals."}\n\nExclusion Criteria: Patients meeting any of the following boundaries:\n- ${data.exclusionCriteria || "History of uncontrolled systemic disorders or pregnancy."}`
      },
      {
        title: "4.0 STATISTICAL ANALYSIS & COHORTS",
        content: `Study Design: ${data.studyDesign || "Randomized, open-label, parallel cohort trial."}\n\nProposed Target Enrollment Size: ${data.population || "Calculated statistical sample size based on clinical power boundaries."}\n\nPrimary endpoint analysis will be completed at week ${data.durationWeeks || 12} using ANOVA test methodologies and Cox proportional hazard gates.`
      },
    ]
  };

  let savedReportId: string | null = null;

  if (data.protocolId) {
    const protocol = protocols.find(p => p.id === data.protocolId);
    if (!protocol) {
      return res.status(404).json({ success: false, message: "Protocol not found for the supplied protocolId" });
    }

    const report: Report = {
      id: getNextId("rep", reports),
      protocolId: data.protocolId,
      type: "FULL_PROTOCOL",
      format: "JSON",
      content: generatedDocument,
      generatedById: req.user.id,
      createdAt: new Date().toISOString(),
    };

    reports.push(report);
    savedReportId = report.id;
  }

  return res.status(201).json({
    success: true,
    message: "Protocol generated successfully",
    data: { generatedDocument, savedReportId }
  });
});

// 5. Sample Size Calculator Endpoint
app.post("/api/sample-size", protect, (req, res) => {
  const { effectSize, power, alpha, dropoutRate, population } = req.body;

  if (effectSize === undefined || power === undefined || alpha === undefined) {
    return res.status(400).json({ success: false, message: "Effect size, power, and alpha are required parameters" });
  }

  const es = Number(effectSize);
  const pw = Number(power);
  const al = Number(alpha);
  const dr = dropoutRate !== undefined ? Number(dropoutRate) : 0;
  const pop = population !== undefined ? Number(population) : null;

  if (es <= 0 || pw <= 0 || pw >= 1 || al <= 0 || al >= 1) {
    return res.status(400).json({ success: false, message: "Invalid parameter ranges supplied" });
  }

  // Alpha and Beta critical values approximations
  let zAlpha = 1.96; // 0.05 default
  if (al <= 0.01) zAlpha = 2.576;
  else if (al <= 0.05) zAlpha = 1.96;
  else if (al <= 0.10) zAlpha = 1.645;

  let zBeta = 0.842; // 0.80 power default
  if (pw >= 0.99) zBeta = 2.326;
  else if (pw >= 0.95) zBeta = 1.645;
  else if (pw >= 0.90) zBeta = 1.282;
  else if (pw >= 0.80) zBeta = 0.842;

  // Cohort sample size formula approximation (2 groups parallel)
  let nBase = Math.ceil((2 * Math.pow(zAlpha + zBeta, 2)) / Math.pow(es, 2));

  // If pop finite population correction
  let finalBase = nBase;
  if (pop && pop > 0) {
    finalBase = Math.ceil((nBase * pop) / (nBase + pop - 1));
  }

  // Dropout inflation
  const withDropout = Math.ceil(finalBase / (1 - dr));

  const result = {
    sampleSize: finalBase,
    totalSampleSizeWithDropout: withDropout,
    calculationMethod: "Parallel Cohort Comparison (Z-Test Approximation)",
    parameters: {
      effectSize: es,
      power: pw,
      alpha: al,
      dropoutRate: dr,
      population: pop,
    }
  };

  return res.status(200).json({
    success: true,
    message: "Sample size calculated successfully",
    data: result
  });
});

// 6. Risks Endpoints (Nested & Flat)
app.get("/api/protocols/:protocolId/risks", protect, (req, res) => {
  const pId = req.params.protocolId;
  const p = protocols.find(p => p.id === pId);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const pRisks = risks.filter(r => r.protocolId === pId)
    .sort((a, b) => b.riskScore - a.riskScore);

  return res.status(200).json({
    success: true,
    message: "Risks fetched successfully",
    data: { risks: pRisks }
  });
});

app.post("/api/protocols/:protocolId/risks", protect, (req, res) => {
  const pId = req.params.protocolId;
  const p = protocols.find(p => p.id === pId);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const { title, description, category, probability, impact, mitigationPlan } = req.body;
  if (!title || probability === undefined || impact === undefined) {
    return res.status(400).json({ success: false, message: "Title, probability and impact parameters are required" });
  }

  const { score, level } = calculateRiskRating(Number(probability), Number(impact));

  const newRisk: Risk = {
    id: getNextId("rsk", risks),
    protocolId: pId,
    title,
    description: description || "",
    category: category || "OTHER",
    probability: Number(probability),
    impact: Number(impact),
    riskScore: score,
    riskLevel: level,
    mitigationPlan: mitigationPlan || "",
    createdAt: new Date().toISOString(),
  };

  risks.push(newRisk);

  return res.status(201).json({
    success: true,
    message: "Risk created successfully",
    data: { risk: newRisk }
  });
});

app.get("/api/risks/:id", protect, (req, res) => {
  const risk = risks.find(r => r.id === req.params.id);
  if (!risk) {
    return res.status(404).json({ success: false, message: "Risk not found" });
  }
  return res.status(200).json({ success: true, message: "Risk fetched successfully", data: { risk } });
});

app.put("/api/risks/:id", protect, (req, res) => {
  const rIndex = risks.findIndex(r => r.id === req.params.id);
  if (rIndex === -1) {
    return res.status(404).json({ success: false, message: "Risk not found" });
  }

  const existing = risks[rIndex];
  const { title, description, category, probability, impact, mitigationPlan } = req.body;

  const updatedProb = probability !== undefined ? Number(probability) : existing.probability;
  const updatedImp = impact !== undefined ? Number(impact) : existing.impact;

  const { score, level } = calculateRiskRating(updatedProb, updatedImp);

  const updatedRisk: Risk = {
    ...existing,
    title: title || existing.title,
    description: description !== undefined ? description : existing.description,
    category: category || existing.category,
    probability: updatedProb,
    impact: updatedImp,
    riskScore: score,
    riskLevel: level,
    mitigationPlan: mitigationPlan !== undefined ? mitigationPlan : existing.mitigationPlan,
  };

  risks[rIndex] = updatedRisk;

  return res.status(200).json({
    success: true,
    message: "Risk updated successfully",
    data: { risk: updatedRisk }
  });
});

app.delete("/api/risks/:id", protect, (req, res) => {
  const idx = risks.findIndex(r => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Risk not found" });
  }

  risks.splice(idx, 1);
  return res.status(200).json({ success: true, message: "Risk deleted successfully" });
});

// 7. Adverse Events (Nested & Flat)
app.get("/api/protocols/:protocolId/adverse-events", protect, (req, res) => {
  const pId = req.params.protocolId;
  const p = protocols.find(p => p.id === pId);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const pAEs = adverseEvents.filter(ae => ae.protocolId === pId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.status(200).json({
    success: true,
    message: "Adverse events fetched successfully",
    data: { adverseEvents: pAEs }
  });
});

app.post("/api/protocols/:protocolId/adverse-events", protect, (req, res) => {
  const pId = req.params.protocolId;
  const p = protocols.find(p => p.id === pId);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const { subjectCode, description, severity, causality, status, onsetDate, resolvedDate, reportedBy } = req.body;
  if (!subjectCode || !description) {
    return res.status(400).json({ success: false, message: "Subject code and description are required" });
  }

  const newAE: AdverseEvent = {
    id: getNextId("ae", adverseEvents),
    protocolId: pId,
    subjectCode,
    description,
    severity: severity || "MILD",
    causality: causality || "POSSIBLE",
    status: status || "REPORTED",
    onsetDate: onsetDate ? onsetDate : null,
    resolvedDate: resolvedDate ? resolvedDate : null,
    reportedBy: reportedBy || "System Operator",
    createdAt: new Date().toISOString(),
  };

  adverseEvents.push(newAE);

  return res.status(201).json({
    success: true,
    message: "Adverse event reported successfully",
    data: { adverseEvent: newAE }
  });
});

app.get("/api/adverse-events/:id", protect, (req, res) => {
  const ae = adverseEvents.find(a => a.id === req.params.id);
  if (!ae) {
    return res.status(404).json({ success: false, message: "Adverse event not found" });
  }
  return res.status(200).json({ success: true, message: "Adverse event fetched successfully", data: { adverseEvent: ae } });
});

app.put("/api/adverse-events/:id", protect, (req, res) => {
  const idx = adverseEvents.findIndex(a => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Adverse event not found" });
  }

  const existing = adverseEvents[idx];
  const data = req.body;

  const updated: AdverseEvent = {
    ...existing,
    ...data,
    onsetDate: data.onsetDate !== undefined ? data.onsetDate : existing.onsetDate,
    resolvedDate: data.resolvedDate !== undefined ? data.resolvedDate : existing.resolvedDate,
  };

  adverseEvents[idx] = updated;

  return res.status(200).json({
    success: true,
    message: "Adverse event updated successfully",
    data: { adverseEvent: updated }
  });
});

app.delete("/api/adverse-events/:id", protect, (req, res) => {
  const idx = adverseEvents.findIndex(a => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Adverse event not found" });
  }

  adverseEvents.splice(idx, 1);
  return res.status(200).json({ success: true, message: "Adverse event deleted successfully" });
});

// 8. Milestones / Timeline (Nested & Flat)
app.get("/api/protocols/:protocolId/milestones", protect, (req, res) => {
  const pId = req.params.protocolId;
  const p = protocols.find(p => p.id === pId);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const pMilestones = milestones.filter(m => m.protocolId === pId)
    .sort((a, b) => a.order - b.order || new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());

  return res.status(200).json({
    success: true,
    message: "Milestones fetched successfully",
    data: { milestones: pMilestones }
  });
});

app.post("/api/protocols/:protocolId/milestones", protect, (req, res) => {
  const pId = req.params.protocolId;
  const p = protocols.find(p => p.id === pId);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const { title, description, status, dueDate, order } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: "Milestone title is required" });
  }

  const newMilestone: Milestone = {
    id: getNextId("ms", milestones),
    protocolId: pId,
    title,
    description: description || "",
    status: status || "PENDING",
    dueDate: dueDate ? dueDate : null,
    completedAt: status === "COMPLETED" ? new Date().toISOString() : null,
    order: order !== undefined ? Number(order) : 0,
    createdAt: new Date().toISOString(),
  };

  milestones.push(newMilestone);

  return res.status(201).json({
    success: true,
    message: "Milestone created successfully",
    data: { milestone: newMilestone }
  });
});

app.get("/api/milestones/:id", protect, (req, res) => {
  const m = milestones.find(m => m.id === req.params.id);
  if (!m) {
    return res.status(404).json({ success: false, message: "Milestone not found" });
  }
  return res.status(200).json({ success: true, message: "Milestone fetched successfully", data: { milestone: m } });
});

app.put("/api/milestones/:id", protect, (req, res) => {
  const idx = milestones.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Milestone not found" });
  }

  const existing = milestones[idx];
  const data = req.body;

  const updated: Milestone = {
    ...existing,
    ...data,
    order: data.order !== undefined ? Number(data.order) : existing.order,
    dueDate: data.dueDate !== undefined ? data.dueDate : existing.dueDate,
    completedAt: data.status === "COMPLETED" && existing.status !== "COMPLETED" ? new Date().toISOString() : (data.status !== "COMPLETED" ? null : existing.completedAt),
  };

  milestones[idx] = updated;

  return res.status(200).json({
    success: true,
    message: "Milestone updated successfully",
    data: { milestone: updated }
  });
});

app.delete("/api/milestones/:id", protect, (req, res) => {
  const idx = milestones.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Milestone not found" });
  }

  milestones.splice(idx, 1);
  return res.status(200).json({ success: true, message: "Milestone deleted successfully" });
});

// 9. Checklist (Nested & Flat)
app.get("/api/protocols/:protocolId/checklist", protect, (req, res) => {
  const pId = req.params.protocolId;
  const p = protocols.find(p => p.id === pId);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const items = checklistItems.filter(ci => ci.protocolId === pId)
    .sort((a, b) => a.order - b.order || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const totalItems = items.length;
  const completedCount = items.filter(i => i.isCompleted).length;
  const completionPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return res.status(200).json({
    success: true,
    message: "Checklist fetched successfully",
    data: {
      items,
      completionPercentage,
      totalItems,
    }
  });
});

app.post("/api/protocols/:protocolId/checklist", protect, (req, res) => {
  const pId = req.params.protocolId;
  const p = protocols.find(p => p.id === pId);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const { label, category, order } = req.body;
  if (!label || !category) {
    return res.status(400).json({ success: false, message: "Label and category are required" });
  }

  const newItem: ChecklistItem = {
    id: getNextId("chk", checklistItems),
    protocolId: pId,
    label,
    category,
    isCompleted: false,
    order: order !== undefined ? Number(order) : 0,
    createdAt: new Date().toISOString(),
  };

  checklistItems.push(newItem);

  return res.status(201).json({
    success: true,
    message: "Checklist item created successfully",
    data: { item: newItem }
  });
});

app.put("/api/checklist/:id", protect, (req, res) => {
  const idx = checklistItems.findIndex(ci => ci.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Checklist item not found" });
  }

  const existing = checklistItems[idx];
  const data = req.body;

  const updated: ChecklistItem = {
    ...existing,
    ...data,
    isCompleted: data.isCompleted !== undefined ? Boolean(data.isCompleted) : existing.isCompleted,
    order: data.order !== undefined ? Number(data.order) : existing.order,
  };

  checklistItems[idx] = updated;

  return res.status(200).json({
    success: true,
    message: "Checklist item updated successfully",
    data: { item: updated }
  });
});

app.delete("/api/checklist/:id", protect, (req, res) => {
  const idx = checklistItems.findIndex(ci => ci.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Checklist item not found" });
  }

  checklistItems.splice(idx, 1);
  return res.status(200).json({ success: true, message: "Checklist item deleted successfully" });
});

// 10. Peer Reviews Endpoints (Nested & Flat)
app.get("/api/protocols/:protocolId/reviews", protect, (req, res) => {
  const pId = req.params.protocolId;
  const p = protocols.find(p => p.id === pId);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const pReviews = reviews.filter(r => r.protocolId === pId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(r => {
      const reviewer = users.find(u => u.id === r.reviewerId);
      return {
        ...r,
        reviewer: reviewer ? { id: reviewer.id, name: reviewer.name, email: reviewer.email, role: reviewer.role } : null
      };
    });

  return res.status(200).json({
    success: true,
    message: "Reviews fetched successfully",
    data: { reviews: pReviews }
  });
});

app.post("/api/protocols/:protocolId/reviews", protect, (req: any, res) => {
  const pId = req.params.protocolId;
  const pIndex = protocols.findIndex(p => p.id === pId);
  if (pIndex === -1) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const { decision, comments, score } = req.body;

  const newReview: Review = {
    id: getNextId("rev", reviews),
    protocolId: pId,
    reviewerId: req.user.id,
    decision: decision || "PENDING",
    comments: comments || "",
    score: score !== undefined ? Number(score) : 80,
    createdAt: new Date().toISOString(),
  };

  reviews.push(newReview);

  // Update protocol status based on review decision
  const DECISION_TO_PROTOCOL_STATUS: Record<string, string> = {
    APPROVE: "APPROVED",
    MINOR_REVISION: "MINOR_REVISION",
    MAJOR_REVISION: "MAJOR_REVISION",
    REJECT: "REJECTED",
  };

  if (decision && DECISION_TO_PROTOCOL_STATUS[decision]) {
    protocols[pIndex].status = DECISION_TO_PROTOCOL_STATUS[decision] as any;
  } else {
    protocols[pIndex].status = "IN_REVIEW";
  }

  return res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: { review: newReview }
  });
});

app.get("/api/reviews/:id", protect, (req, res) => {
  const r = reviews.find(rev => rev.id === req.params.id);
  if (!r) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  const reviewer = users.find(u => u.id === r.reviewerId);
  const detail = {
    ...r,
    reviewer: reviewer ? { id: reviewer.id, name: reviewer.name, email: reviewer.email, role: reviewer.role } : null
  };

  return res.status(200).json({ success: true, message: "Review fetched successfully", data: { review: detail } });
});

app.delete("/api/reviews/:id", protect, (req, res) => {
  const idx = reviews.findIndex(rev => rev.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  reviews.splice(idx, 1);
  return res.status(200).json({ success: true, message: "Review deleted successfully" });
});

// Patch review decisions (restricted to ADMIN, REVIEWER)
const applyReviewDecision = (id: string, decision: "APPROVE" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT", comments: string, score: number, res: any) => {
  const idx = reviews.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  const existing = reviews[idx];
  const updatedReview = {
    ...existing,
    decision,
    comments: comments !== undefined ? comments : existing.comments,
    score: score !== undefined ? Number(score) : existing.score,
  };

  reviews[idx] = updatedReview;

  // Sync back to protocol status
  const pIndex = protocols.findIndex(p => p.id === existing.protocolId);
  if (pIndex !== -1) {
    const DECISION_TO_PROTOCOL_STATUS = {
      APPROVE: "APPROVED",
      MINOR_REVISION: "MINOR_REVISION",
      MAJOR_REVISION: "MAJOR_REVISION",
      REJECT: "REJECTED",
    };
    protocols[pIndex].status = DECISION_TO_PROTOCOL_STATUS[decision] as any;
  }

  return res.status(200).json({
    success: true,
    message: `Protocol reviewed decision of ${decision} applied`,
    data: { review: updatedReview }
  });
};

app.patch("/api/reviews/:id/approve", protect, restrictTo("ADMIN", "REVIEWER"), (req, res) => {
  const { comments, score } = req.body;
  return applyReviewDecision(req.params.id, "APPROVE", comments, score, res);
});

app.patch("/api/reviews/:id/minor-revision", protect, restrictTo("ADMIN", "REVIEWER"), (req, res) => {
  const { comments, score } = req.body;
  return applyReviewDecision(req.params.id, "MINOR_REVISION", comments, score, res);
});

app.patch("/api/reviews/:id/major-revision", protect, restrictTo("ADMIN", "REVIEWER"), (req, res) => {
  const { comments, score } = req.body;
  return applyReviewDecision(req.params.id, "MAJOR_REVISION", comments, score, res);
});

app.patch("/api/reviews/:id/reject", protect, restrictTo("ADMIN", "REVIEWER"), (req, res) => {
  const { comments, score } = req.body;
  return applyReviewDecision(req.params.id, "REJECT", comments, score, res);
});

// 11. Reports Endpoints (Nested & Flat)
app.get("/api/protocols/:protocolId/reports", protect, (req, res) => {
  const pId = req.params.protocolId;
  const p = protocols.find(p => p.id === pId);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const pReports = reports.filter(r => r.protocolId === pId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(r => {
      const creator = users.find(u => u.id === r.generatedById);
      return {
        ...r,
        generatedBy: creator ? { name: creator.name, email: creator.email } : null
      };
    });

  return res.status(200).json({
    success: true,
    message: "Reports fetched successfully",
    data: { reports: pReports }
  });
});

app.post("/api/protocols/:protocolId/reports", protect, (req: any, res) => {
  const pId = req.params.protocolId;
  const p = protocols.find(p => p.id === pId);
  if (!p) {
    return res.status(404).json({ success: false, message: "Protocol not found" });
  }

  const { type, format } = req.body;
  if (!type) {
    return res.status(400).json({ success: false, message: "Report type is required" });
  }

  const fmt = format || "JSON";

  // Build specific content reports dynamically
  let builtContent: any = {};
  if (type === "PROTOCOL_SUMMARY") {
    builtContent = {
      reportType: "PROTOCOL_SUMMARY",
      protocol: p,
    };
  } else if (type === "RISK_ASSESSMENT") {
    const pRisks = risks.filter(r => r.protocolId === pId);
    builtContent = {
      reportType: "RISK_ASSESSMENT",
      summary: {
        total: pRisks.length,
        critical: pRisks.filter(r => r.riskLevel === "CRITICAL").length,
        high: pRisks.filter(r => r.riskLevel === "HIGH").length,
        medium: pRisks.filter(r => r.riskLevel === "MEDIUM").length,
        low: pRisks.filter(r => r.riskLevel === "LOW").length,
      },
      risks: pRisks,
    };
  } else if (type === "ADVERSE_EVENT_SUMMARY") {
    const pAEs = adverseEvents.filter(ae => ae.protocolId === pId);
    builtContent = {
      reportType: "ADVERSE_EVENT_SUMMARY",
      summary: {
        total: pAEs.length,
        fatal: pAEs.filter(e => e.severity === "FATAL").length,
        lifeThreatening: pAEs.filter(e => e.severity === "LIFE_THREATENING").length,
        severe: pAEs.filter(e => e.severity === "SEVERE").length,
        moderate: pAEs.filter(e => e.severity === "MODERATE").length,
        mild: pAEs.filter(e => e.severity === "MILD").length,
        ongoing: pAEs.filter(e => e.status === "ONGOING").length,
      },
      events: pAEs,
    };
  } else if (type === "REVIEW_SUMMARY") {
    const pReviews = reviews.filter(r => r.protocolId === pId);
    builtContent = {
      reportType: "REVIEW_SUMMARY",
      summary: {
        total: pReviews.length,
        approved: pReviews.filter(r => r.decision === "APPROVE").length,
        minorRevision: pReviews.filter(r => r.decision === "MINOR_REVISION").length,
        majorRevision: pReviews.filter(r => r.decision === "MAJOR_REVISION").length,
        rejected: pReviews.filter(r => r.decision === "REJECT").length,
      },
      reviews: pReviews.map(r => {
        const reviewer = users.find(u => u.id === r.reviewerId);
        return {
          ...r,
          reviewer: reviewer ? { name: reviewer.name, email: reviewer.email } : null
        };
      }),
    };
  } else {
    // FULL_PROTOCOL
    const pRisks = risks.filter(r => r.protocolId === pId);
    const pAEs = adverseEvents.filter(ae => ae.protocolId === pId);
    const pMilestones = milestones.filter(m => m.protocolId === pId);
    const pCI = checklistItems.filter(ci => ci.protocolId === pId);
    const pReviews = reviews.filter(r => r.protocolId === pId);

    const totalCI = pCI.length;
    const completedCI = pCI.filter(ci => ci.isCompleted).length;
    const percentage = totalCI > 0 ? Math.round((completedCI / totalCI) * 100) : 0;

    builtContent = {
      reportType: "FULL_PROTOCOL",
      protocol: p,
      risks: pRisks,
      adverseEvents: pAEs,
      milestones: pMilestones,
      checklist: {
        items: pCI,
        completionPercentage: percentage,
      },
      reviews: pReviews,
      totalVersions: protocolVersions.filter(v => v.protocolId === pId).length,
    };
  }

  // Handle PDF_READY layout conversion
  let finalContent = builtContent;
  if (fmt === "PDF_READY") {
    const blocks: any[] = [{ heading: "Report Type", rows: [type] }];

    Object.entries(builtContent).forEach(([key, value]) => {
      if (key === "reportType") return;
      if (Array.isArray(value)) {
        blocks.push({
          heading: key.toUpperCase(),
          rows: value.map(item => typeof item === "object" ? JSON.stringify(item, null, 2) : String(item)),
        });
      } else if (value && typeof value === "object") {
        blocks.push({
          heading: key.toUpperCase(),
          rows: Object.entries(value).map(([k, v]) => `${k}: ${JSON.stringify(v)}`),
        });
      } else {
        blocks.push({ heading: key.toUpperCase(), rows: [String(value)] });
      }
    });

    finalContent = { format: "PDF_READY", blocks };
  }

  const newReport: Report = {
    id: getNextId("rep", reports),
    protocolId: pId,
    type,
    format: fmt,
    content: finalContent,
    generatedById: req.user.id,
    createdAt: new Date().toISOString(),
  };

  reports.push(newReport);

  return res.status(201).json({
    success: true,
    message: "Report generated successfully",
    data: { report: newReport }
  });
});

app.get("/api/reports/:id", protect, (req, res) => {
  const rep = reports.find(r => r.id === req.params.id);
  if (!rep) {
    return res.status(404).json({ success: false, message: "Report not found" });
  }

  const creator = users.find(u => u.id === rep.generatedById);
  const detail = {
    ...rep,
    generatedBy: creator ? { name: creator.name, email: creator.email } : null
  };

  return res.status(200).json({ success: true, message: "Report fetched successfully", data: { report: detail } });
});

// 12. Settings Endpoints (Private - Admin only)
app.get("/api/settings", protect, restrictTo("ADMIN"), (req, res) => {
  const sorted = [...settings].sort((a, b) => a.key.localeCompare(b.key));
  return res.status(200).json({
    success: true,
    message: "Settings fetched successfully",
    data: { settings: sorted }
  });
});

app.get("/api/settings/:key", protect, restrictTo("ADMIN"), (req, res) => {
  const s = settings.find(set => set.key === req.params.key);
  if (!s) {
    return res.status(404).json({ success: false, message: `Setting "${req.params.key}" not found` });
  }
  return res.status(200).json({
    success: true,
    message: "Setting fetched successfully",
    data: { setting: s }
  });
});

app.put("/api/settings/:key", protect, restrictTo("ADMIN"), (req, res) => {
  const key = req.params.key;
  const { value, description } = req.body;

  let idx = settings.findIndex(s => s.key === key);
  if (idx !== -1) {
    settings[idx].value = value;
    if (description !== undefined) {
      settings[idx].description = description;
    }
    return res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      data: { setting: settings[idx] }
    });
  } else {
    const newSetting: Setting = {
      id: getNextId("set", settings),
      key,
      value,
      description: description || "",
      createdAt: new Date().toISOString(),
    };
    settings.push(newSetting);
    return res.status(200).json({
      success: true,
      message: "Setting updated successfully",
      data: { setting: newSetting }
    });
  }
});


// ==========================================
// VITE DEV SERVER AND PRODUCTION SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 AI Clinical Trial Protocol Designer running on http://localhost:${PORT}`);
  });
}

startServer();
