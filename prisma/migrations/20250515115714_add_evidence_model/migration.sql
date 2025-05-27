-- CreateTable
CREATE TABLE "evidence" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "incident_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_evidence_incident_id" ON "evidence"("incident_id");

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incident_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
