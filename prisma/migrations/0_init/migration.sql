-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('citizen', 'rescue_team', 'ngo', 'government', 'admin', 'volunteer', 'commander', 'responder', 'super_admin');

-- CreateEnum
CREATE TYPE "VerificationTokenType" AS ENUM ('email_verification', 'password_reset', 'login_verify', 'email_change', 'activation');

-- CreateEnum
CREATE TYPE "NGOApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "DisasterType" AS ENUM ('flood', 'earthquake', 'wildfire', 'hurricane', 'industrial', 'medical', 'environmental');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('critical', 'high', 'moderate', 'low');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('active', 'contained', 'resolved');

-- CreateEnum
CREATE TYPE "DataSourceType" AS ENUM ('historical', 'live', 'forecast', 'demo');

-- CreateEnum
CREATE TYPE "SOSPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "SOSStatus" AS ENUM ('pending', 'triaged', 'dispatched', 'assigned', 'in_progress', 'rescued', 'resolved', 'cancelled');

-- CreateEnum
CREATE TYPE "ShelterStatus" AS ENUM ('open', 'nearing_capacity', 'full', 'closed');

-- CreateEnum
CREATE TYPE "SupplyCategory" AS ENUM ('medical', 'rations', 'water', 'shelter_gear', 'vehicles', 'power', 'tents', 'generators', 'infant_kits');

-- CreateEnum
CREATE TYPE "SupplyStatus" AS ENUM ('adequate', 'low', 'critical');

-- CreateEnum
CREATE TYPE "ResponderType" AS ENUM ('medical_unit', 'swift_water', 'search_rescue', 'logistics', 'drone_recon');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('available', 'dispatched', 'en_route', 'on_scene', 'off_duty');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'citizen',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT,
    "organization" TEXT,
    "badgeNumber" TEXT,
    "assignedTeamId" TEXT,
    "phone" TEXT,
    "assignedZone" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" JSONB,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockoutUntil" TEXT,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "token" TEXT NOT NULL,
    "otp" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "token" TEXT,
    "otp" TEXT NOT NULL,
    "type" "VerificationTokenType" NOT NULL DEFAULT 'email_verification',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NGOApplication" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "focalPersonName" TEXT NOT NULL,
    "focalPersonEmail" TEXT NOT NULL,
    "focalPersonPhone" TEXT NOT NULL,
    "website" TEXT,
    "hqAddress" TEXT NOT NULL,
    "operationalDistricts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reliefCapabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documentName" TEXT,
    "documentData" TEXT,
    "status" "NGOApplicationStatus" NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NGOApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisasterIncident" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "banglaTitle" TEXT NOT NULL,
    "type" "DisasterType" NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'active',
    "dataSource" "DataSourceType" NOT NULL DEFAULT 'live',
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "citation" JSONB,
    "location" JSONB NOT NULL,
    "affectedPopulation" INTEGER NOT NULL DEFAULT 0,
    "casualtiesReported" INTEGER NOT NULL DEFAULT 0,
    "respondersDeployed" INTEGER NOT NULL DEFAULT 0,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurredAt" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "recommendedEvacuationRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "activeHazards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisasterIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SOSRequest" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT,
    "reporterName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "contactPhone" TEXT,
    "disasterId" TEXT,
    "location" JSONB NOT NULL,
    "urgencyScore" INTEGER NOT NULL DEFAULT 50,
    "priority" "SOSPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "SOSStatus" NOT NULL DEFAULT 'pending',
    "details" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "voiceNoteUrl" TEXT,
    "trappedCount" INTEGER NOT NULL DEFAULT 1,
    "injuriesCount" INTEGER NOT NULL DEFAULT 0,
    "specialNeeds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "needsBoat" BOOLEAN NOT NULL DEFAULT false,
    "needsMedical" BOOLEAN NOT NULL DEFAULT false,
    "needsFoodWater" BOOLEAN NOT NULL DEFAULT false,
    "assignedTeamId" TEXT,
    "assignedTeamName" TEXT,
    "aiTriageSummary" TEXT,
    "dispatchEtaMinutes" INTEGER,
    "aiDamageAssessment" JSONB,
    "aiSeverity" JSONB,
    "assignedTo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SOSRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shelter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "hasMedical" BOOLEAN NOT NULL DEFAULT false,
    "hasFood" BOOLEAN NOT NULL DEFAULT true,
    "hasWater" BOOLEAN NOT NULL DEFAULT true,
    "hasPower" BOOLEAN NOT NULL DEFAULT false,
    "isPetFriendly" BOOLEAN NOT NULL DEFAULT false,
    "hasSupplies" BOOLEAN NOT NULL DEFAULT true,
    "contactPhone" TEXT,
    "contactNumber" TEXT,
    "managedByNGO" TEXT,
    "status" "ShelterStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shelter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SupplyCategory" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "warehouseLocation" TEXT NOT NULL,
    "status" "SupplyStatus" NOT NULL DEFAULT 'adequate',
    "threshold" INTEGER NOT NULL DEFAULT 50,
    "allocated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponderTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leadName" TEXT NOT NULL,
    "type" "ResponderType" NOT NULL,
    "membersCount" INTEGER NOT NULL DEFAULT 4,
    "status" "TeamStatus" NOT NULL DEFAULT 'available',
    "currentIncidentId" TEXT,
    "assignedSOSId" TEXT,
    "currentLocation" JSONB NOT NULL,
    "radioFreq" TEXT NOT NULL,
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastCheckIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResponderTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AidDonation" (
    "id" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "allocatedCause" TEXT NOT NULL,
    "impactMetric" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "channel" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AidDonation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RescueTeamAuditLog" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "operatorEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "previousTeamId" TEXT,
    "newTeamId" TEXT,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RescueTeamAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_assignedTeamId_idx" ON "User"("assignedTeamId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_familyId_idx" ON "RefreshToken"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_otp_idx" ON "PasswordResetToken"("otp");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_otp_idx" ON "EmailVerificationToken"("otp");

-- CreateIndex
CREATE UNIQUE INDEX "NGOApplication_registrationNumber_key" ON "NGOApplication"("registrationNumber");

-- CreateIndex
CREATE INDEX "NGOApplication_status_idx" ON "NGOApplication"("status");

-- CreateIndex
CREATE INDEX "NGOApplication_focalPersonEmail_idx" ON "NGOApplication"("focalPersonEmail");

-- CreateIndex
CREATE INDEX "DisasterIncident_type_idx" ON "DisasterIncident"("type");

-- CreateIndex
CREATE INDEX "DisasterIncident_severity_idx" ON "DisasterIncident"("severity");

-- CreateIndex
CREATE INDEX "DisasterIncident_status_idx" ON "DisasterIncident"("status");

-- CreateIndex
CREATE INDEX "DisasterIncident_dataSource_idx" ON "DisasterIncident"("dataSource");

-- CreateIndex
CREATE INDEX "SOSRequest_priority_idx" ON "SOSRequest"("priority");

-- CreateIndex
CREATE INDEX "SOSRequest_status_idx" ON "SOSRequest"("status");

-- CreateIndex
CREATE INDEX "SOSRequest_urgencyScore_idx" ON "SOSRequest"("urgencyScore");

-- CreateIndex
CREATE INDEX "SOSRequest_disasterId_idx" ON "SOSRequest"("disasterId");

-- CreateIndex
CREATE INDEX "Shelter_status_idx" ON "Shelter"("status");

-- CreateIndex
CREATE INDEX "SupplyItem_category_idx" ON "SupplyItem"("category");

-- CreateIndex
CREATE INDEX "SupplyItem_status_idx" ON "SupplyItem"("status");

-- CreateIndex
CREATE INDEX "ResponderTeam_type_idx" ON "ResponderTeam"("type");

-- CreateIndex
CREATE INDEX "ResponderTeam_status_idx" ON "ResponderTeam"("status");

-- CreateIndex
CREATE INDEX "RescueTeamAuditLog_targetUserId_idx" ON "RescueTeamAuditLog"("targetUserId");

-- CreateIndex
CREATE INDEX "RescueTeamAuditLog_operatorId_idx" ON "RescueTeamAuditLog"("operatorId");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SOSRequest" ADD CONSTRAINT "SOSRequest_disasterId_fkey" FOREIGN KEY ("disasterId") REFERENCES "DisasterIncident"("id") ON DELETE SET NULL ON UPDATE CASCADE;
