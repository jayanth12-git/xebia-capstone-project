-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'REVIEWER', 'RESEARCHER');

-- CreateEnum
CREATE TYPE "ProtocolStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProtocolPhase" AS ENUM ('PRECLINICAL', 'PHASE_I', 'PHASE_II', 'PHASE_III', 'PHASE_IV');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('SAFETY', 'OPERATIONAL', 'REGULATORY', 'DATA_INTEGRITY', 'FINANCIAL', 'RECRUITMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AdverseEventSeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING', 'FATAL');

-- CreateEnum
CREATE TYPE "AdverseEventCausality" AS ENUM ('UNRELATED', 'UNLIKELY', 'POSSIBLE', 'PROBABLE', 'DEFINITE');

-- CreateEnum
CREATE TYPE "AdverseEventStatus" AS ENUM ('REPORTED', 'UNDER_INVESTIGATION', 'RESOLVED', 'RESOLVED_WITH_SEQUELAE', 'ONGOING');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVE', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT', 'PENDING');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('PROTOCOL_SUMMARY', 'RISK_ASSESSMENT', 'ADVERSE_EVENT_SUMMARY', 'REVIEW_SUMMARY', 'FULL_PROTOCOL');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('JSON', 'PDF_READY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'RESEARCHER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocols" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "studyCode" TEXT NOT NULL,
    "phase" "ProtocolPhase" NOT NULL DEFAULT 'PHASE_I',
    "status" "ProtocolStatus" NOT NULL DEFAULT 'DRAFT',
    "therapeuticArea" TEXT,
    "sponsor" TEXT,
    "condition" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "inclusionCriteria" TEXT,
    "exclusionCriteria" TEXT,
    "studyDesign" TEXT,
    "population" INTEGER,
    "durationWeeks" INTEGER,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocol_versions" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changeSummary" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "protocol_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risks" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "RiskCategory" NOT NULL DEFAULT 'OTHER',
    "probability" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "mitigationPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adverse_events" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "AdverseEventSeverity" NOT NULL DEFAULT 'MILD',
    "causality" "AdverseEventCausality" NOT NULL DEFAULT 'POSSIBLE',
    "status" "AdverseEventStatus" NOT NULL DEFAULT 'REPORTED',
    "onsetDate" TIMESTAMP(3),
    "resolvedDate" TIMESTAMP(3),
    "reportedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adverse_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "protocolId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "format" "ReportFormat" NOT NULL DEFAULT 'JSON',
    "content" JSONB NOT NULL,
    "generatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "protocols_studyCode_key" ON "protocols"("studyCode");

-- CreateIndex
CREATE INDEX "protocols_status_idx" ON "protocols"("status");

-- CreateIndex
CREATE INDEX "protocols_phase_idx" ON "protocols"("phase");

-- CreateIndex
CREATE UNIQUE INDEX "protocol_versions_protocolId_versionNumber_key" ON "protocol_versions"("protocolId", "versionNumber");

-- CreateIndex
CREATE INDEX "reviews_protocolId_idx" ON "reviews"("protocolId");

-- CreateIndex
CREATE INDEX "risks_protocolId_idx" ON "risks"("protocolId");

-- CreateIndex
CREATE INDEX "risks_riskLevel_idx" ON "risks"("riskLevel");

-- CreateIndex
CREATE INDEX "adverse_events_protocolId_idx" ON "adverse_events"("protocolId");

-- CreateIndex
CREATE INDEX "adverse_events_severity_idx" ON "adverse_events"("severity");

-- CreateIndex
CREATE INDEX "milestones_protocolId_idx" ON "milestones"("protocolId");

-- CreateIndex
CREATE INDEX "checklist_items_protocolId_idx" ON "checklist_items"("protocolId");

-- CreateIndex
CREATE INDEX "reports_protocolId_idx" ON "reports"("protocolId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- AddForeignKey
ALTER TABLE "protocols" ADD CONSTRAINT "protocols_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_versions" ADD CONSTRAINT "protocol_versions_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocol_versions" ADD CONSTRAINT "protocol_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adverse_events" ADD CONSTRAINT "adverse_events_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "protocols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
