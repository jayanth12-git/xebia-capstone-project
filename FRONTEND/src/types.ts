export interface User {
  id: string;
  name: string;
  email: string;
  role: "RESEARCHER" | "ADMIN" | "REVIEWER";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Protocol {
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
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  _count?: {
    risks: number;
    adverseEvents: number;
    milestones?: number;
    checklistItems?: number;
    reviews: number;
    versions?: number;
  };
}

export interface ProtocolVersion {
  id: string;
  protocolId: string;
  versionNumber: number;
  snapshot: any;
  changeSummary: string;
  createdById: string;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface Risk {
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

export interface AdverseEvent {
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

export interface Milestone {
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

export interface ChecklistItem {
  id: string;
  protocolId: string;
  label: string;
  category: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
}

export interface Review {
  id: string;
  protocolId: string;
  reviewerId: string;
  decision: "PENDING" | "APPROVE" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECT";
  comments: string;
  score: number;
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export interface Report {
  id: string;
  protocolId: string;
  type: "PROTOCOL_SUMMARY" | "RISK_ASSESSMENT" | "ADVERSE_EVENT_SUMMARY" | "REVIEW_SUMMARY" | "FULL_PROTOCOL";
  format: "JSON" | "PDF_READY";
  content: any;
  generatedById: string;
  createdAt: string;
  generatedBy?: {
    name: string;
    email: string;
  } | null;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
  createdAt: string;
}

export interface DashboardStats {
  totals: {
    protocols: number;
    risks: number;
    adverseEvents: number;
    milestones: number;
    reviews: number;
    pendingReviews: number;
    users: number;
  };
  protocolsByStatus: Record<string, number>;
  protocolsByPhase: Record<string, number>;
  risksByLevel: Record<string, number>;
  adverseEventsBySeverity: Record<string, number>;
  milestonesByStatus: Record<string, number>;
  recentProtocols: Array<{
    id: string;
    title: string;
    studyCode: string;
    status: string;
    phase: string;
    createdAt: string;
  }>;
}
