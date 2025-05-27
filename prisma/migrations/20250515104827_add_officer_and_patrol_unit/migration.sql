-- CreateTable
CREATE TABLE "patrol_units" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unit_id" VARCHAR(20) NOT NULL,
    "location_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patrol_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officers" (
    "id" TEXT NOT NULL,
    "unit_id" VARCHAR(20) NOT NULL,
    "role_id" UUID NOT NULL,
    "nrp" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "rank" VARCHAR(100),
    "position" VARCHAR(100),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "avatar" TEXT,
    "valid_until" TIMESTAMP(3),
    "qr_code" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "patrol_unitsId" UUID,

    CONSTRAINT "officers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_patrol_units_unit_id" ON "patrol_units"("unit_id");

-- CreateIndex
CREATE INDEX "idx_patrol_units_location_id" ON "patrol_units"("location_id");

-- CreateIndex
CREATE INDEX "idx_patrol_units_name" ON "patrol_units"("name");

-- CreateIndex
CREATE INDEX "idx_patrol_units_type" ON "patrol_units"("type");

-- CreateIndex
CREATE INDEX "idx_patrol_units_status" ON "patrol_units"("status");

-- CreateIndex
CREATE UNIQUE INDEX "officers_nrp_key" ON "officers"("nrp");

-- CreateIndex
CREATE INDEX "idx_officers_unit_id" ON "officers"("unit_id");

-- CreateIndex
CREATE INDEX "idx_officers_nrp" ON "officers"("nrp");

-- CreateIndex
CREATE INDEX "idx_officers_name" ON "officers"("name");

-- CreateIndex
CREATE INDEX "idx_officers_rank" ON "officers"("rank");

-- CreateIndex
CREATE INDEX "idx_officers_position" ON "officers"("position");

-- CreateIndex
CREATE INDEX "idx_units_location_district" ON "units"("district_id", "location");

-- AddForeignKey
ALTER TABLE "patrol_units" ADD CONSTRAINT "patrol_units_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patrol_units" ADD CONSTRAINT "patrol_units_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("code_unit") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "officers" ADD CONSTRAINT "officers_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("code_unit") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "officers" ADD CONSTRAINT "officers_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "officers" ADD CONSTRAINT "officers_patrol_unitsId_fkey" FOREIGN KEY ("patrol_unitsId") REFERENCES "patrol_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
