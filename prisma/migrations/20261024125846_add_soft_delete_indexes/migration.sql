-- CreateIndex
CREATE INDEX "alert_reads_deleted_at_idx" ON "alert_reads"("deleted_at");

-- CreateIndex
CREATE INDEX "alerts_deleted_at_idx" ON "alerts"("deleted_at");

-- CreateIndex
CREATE INDEX "case_interests_deleted_at_idx" ON "case_interests"("deleted_at");

-- CreateIndex
CREATE INDEX "case_photos_deleted_at_idx" ON "case_photos"("deleted_at");

-- CreateIndex
CREATE INDEX "case_responses_deleted_at_idx" ON "case_responses"("deleted_at");

-- CreateIndex
CREATE INDEX "case_status_events_deleted_at_idx" ON "case_status_events"("deleted_at");

-- CreateIndex
CREATE INDEX "contributions_deleted_at_idx" ON "contributions"("deleted_at");

-- CreateIndex
CREATE INDEX "health_records_deleted_at_idx" ON "health_records"("deleted_at");
