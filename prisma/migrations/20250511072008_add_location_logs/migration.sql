/*
  Warnings:

  - You are about to drop the column `distance` on the `locations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "locations" DROP COLUMN "distance",
ADD COLUMN     "distance_from_unit" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "location_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location"  gis.geography(Point,4326) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_location_logs_timestamp" ON "location_logs"("timestamp");

-- CreateIndex
CREATE INDEX "idx_location_logs_user_id" ON "location_logs"("user_id");
