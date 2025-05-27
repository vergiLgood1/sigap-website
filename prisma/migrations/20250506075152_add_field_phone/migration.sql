/*
  Warnings:

  - You are about to drop the column `code_unit` on the `unit_statistics` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[unit_id,month,year]` on the table `unit_statistics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[district_id]` on the table `units` will be added. If there are existing duplicate values, this will fail.
  - Made the column `year` on table `crimes` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `unit_id` to the `unit_statistics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "unit_statistics" DROP CONSTRAINT "unit_statistics_code_unit_fkey";

-- DropForeignKey
ALTER TABLE "units" DROP CONSTRAINT "units_district_id_fkey";

-- DropIndex
DROP INDEX "unit_statistics_code_unit_month_year_key";

-- AlterTable
ALTER TABLE "crimes" ALTER COLUMN "year" SET NOT NULL;

-- AlterTable
ALTER TABLE "unit_statistics" DROP COLUMN "code_unit",
ADD COLUMN     "unit_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "units" ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "units_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "unit_statistics_unit_id_month_year_key" ON "unit_statistics"("unit_id", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "units_district_id_key" ON "units"("district_id");

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_statistics" ADD CONSTRAINT "unit_statistics_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
