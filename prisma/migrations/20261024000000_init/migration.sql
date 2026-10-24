-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('REPORTER', 'VOLUNTEER', 'FOSTER', 'DISPATCHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('REPORTED', 'RESCUED', 'VET', 'FOSTER', 'ADOPTED');

-- CreateEnum
CREATE TYPE "DogGender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('URGENT', 'UPDATE', 'FOSTER');

-- CreateEnum
CREATE TYPE "HelpType" AS ENUM ('TRANSPORT', 'FIRST_AID', 'FOSTER_HOLD', 'SUPPLIES');

-- CreateEnum
CREATE TYPE "InterestKind" AS ENUM ('FOSTER', 'ADOPTION');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('PENDING', 'CONTACTED', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ContributionKind" AS ENUM ('TRANSPORT', 'FEEDING', 'FOSTER_CHECK_IN', 'VET_VISIT', 'SHELTER', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "clerk_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "display_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'REPORTER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rescue_cases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'REPORTED',
    "status_note" TEXT,
    "summary" TEXT NOT NULL,
    "location_name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "age_label" TEXT,
    "breed" TEXT,
    "gender" "DogGender" NOT NULL DEFAULT 'UNKNOWN',
    "temperament" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "reported_by_id" UUID,
    "reporter_phone" TEXT,

    CONSTRAINT "rescue_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "case_id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "url" TEXT,
    "alt" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "case_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_status_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "case_id" UUID NOT NULL,
    "status" "CaseStatus" NOT NULL,
    "label" TEXT,
    "note" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_id" UUID,

    CONSTRAINT "case_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "case_id" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "vaccine" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by" TEXT,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_responses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "case_id" UUID NOT NULL,
    "volunteer_id" UUID,
    "helpType" "HelpType" NOT NULL,
    "eta_minutes" INTEGER,
    "phone" TEXT NOT NULL,
    "note" TEXT,
    "arrived_at" TIMESTAMP(3),

    CONSTRAINT "case_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_interests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "case_id" UUID NOT NULL,
    "user_id" UUID,
    "kind" "InterestKind" NOT NULL DEFAULT 'FOSTER',
    "status" "InterestStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "case_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "AlertCategory" NOT NULL,
    "case_id" UUID,
    "link" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_reads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "alert_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_id" UUID NOT NULL,
    "case_id" UUID,
    "kind" "ContributionKind" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "rescue_cases_slug_key" ON "rescue_cases"("slug");

-- CreateIndex
CREATE INDEX "rescue_cases_status_idx" ON "rescue_cases"("status");

-- CreateIndex
CREATE INDEX "rescue_cases_urgent_idx" ON "rescue_cases"("urgent");

-- CreateIndex
CREATE INDEX "rescue_cases_lat_lng_idx" ON "rescue_cases"("lat", "lng");

-- CreateIndex
CREATE INDEX "rescue_cases_deleted_at_idx" ON "rescue_cases"("deleted_at");

-- CreateIndex
CREATE INDEX "case_photos_case_id_sort_order_idx" ON "case_photos"("case_id", "sort_order");

-- CreateIndex
CREATE INDEX "case_status_events_case_id_occurred_at_idx" ON "case_status_events"("case_id", "occurred_at");

-- CreateIndex
CREATE INDEX "health_records_case_id_recorded_at_idx" ON "health_records"("case_id", "recorded_at");

-- CreateIndex
CREATE INDEX "case_responses_case_id_created_at_idx" ON "case_responses"("case_id", "created_at");

-- CreateIndex
CREATE INDEX "case_interests_case_id_status_idx" ON "case_interests"("case_id", "status");

-- CreateIndex
CREATE INDEX "alerts_category_published_at_idx" ON "alerts"("category", "published_at");

-- CreateIndex
CREATE INDEX "alerts_published_at_idx" ON "alerts"("published_at");

-- CreateIndex
CREATE INDEX "alert_reads_user_id_idx" ON "alert_reads"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "alert_reads_alert_id_user_id_key" ON "alert_reads"("alert_id", "user_id");

-- CreateIndex
CREATE INDEX "contributions_user_id_occurred_at_idx" ON "contributions"("user_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "rescue_cases" ADD CONSTRAINT "rescue_cases_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_photos" ADD CONSTRAINT "case_photos_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "rescue_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_status_events" ADD CONSTRAINT "case_status_events_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "rescue_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_status_events" ADD CONSTRAINT "case_status_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "rescue_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_responses" ADD CONSTRAINT "case_responses_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "rescue_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_responses" ADD CONSTRAINT "case_responses_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_interests" ADD CONSTRAINT "case_interests_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "rescue_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_interests" ADD CONSTRAINT "case_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "rescue_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_reads" ADD CONSTRAINT "alert_reads_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_reads" ADD CONSTRAINT "alert_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "rescue_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
