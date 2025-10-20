-- CreateTable
CREATE TABLE "historical_simulations" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dataType" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "insights" JSONB NOT NULL,
    "regrets" JSONB NOT NULL,
    "corrections" JSONB NOT NULL,
    "appliedCorrections" BOOLEAN NOT NULL DEFAULT false,
    "correctionTimestamp" TIMESTAMP(3),

    CONSTRAINT "historical_simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "present_vital_signs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collectionPeriod" TEXT NOT NULL,
    "metabolicRate" DOUBLE PRECISION NOT NULL,
    "neuralDensity" DOUBLE PRECISION NOT NULL,
    "memoryUsage" DOUBLE PRECISION NOT NULL,
    "responseTime" DOUBLE PRECISION NOT NULL,
    "errorRate" DOUBLE PRECISION NOT NULL,
    "throughput" DOUBLE PRECISION NOT NULL,
    "availability" DOUBLE PRECISION NOT NULL,
    "icvConfidence" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "present_vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "future_simulations" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scenarioType" TEXT NOT NULL,
    "timeHorizon" TEXT NOT NULL,
    "externalFactors" JSONB NOT NULL,
    "parameters" JSONB NOT NULL,
    "outcomes" JSONB NOT NULL,
    "probabilities" JSONB NOT NULL,
    "riskFactors" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,

    CONSTRAINT "future_simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation_runs" (
    "id" TEXT NOT NULL,
    "ghostType" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "duration" INTEGER,
    "config" JSONB NOT NULL,
    "summary" JSONB,
    "error" TEXT,

    CONSTRAINT "simulation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cognitive_insights" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ghostSource" TEXT NOT NULL,
    "insightType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidence" JSONB NOT NULL,
    "action" JSONB,
    "impact" JSONB,

    CONSTRAINT "cognitive_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chamber_audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "userId" TEXT,
    "details" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chamber_audit_logs_pkey" PRIMARY KEY ("id")
);
