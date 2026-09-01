-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "uftech_ai";

-- CreateTable
CREATE TABLE "uftech_ai"."Visitor" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrer" TEXT,
    "landingPage" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uftech_ai"."Lead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "topic" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "visitorId" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_visitorId_key" ON "uftech_ai"."Visitor"("visitorId");

-- AddForeignKey
ALTER TABLE "uftech_ai"."Lead" ADD CONSTRAINT "Lead_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "uftech_ai"."Visitor"("visitorId") ON DELETE SET NULL ON UPDATE CASCADE;
