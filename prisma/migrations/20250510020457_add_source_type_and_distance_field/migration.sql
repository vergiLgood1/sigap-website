-- AlterTable
ALTER TABLE "crimes" ADD COLUMN     "source_type" VARCHAR(100);

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "distance" DOUBLE PRECISION;
