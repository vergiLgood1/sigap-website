/*
  Warnings:

  - You are about to drop the column `unit_id` on the `unit_statistics` table. All the data in the column will be lost.
  - The primary key for the `units` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `units` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code_unit,month,year]` on the table `unit_statistics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code_unit` to the `unit_statistics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "unit_statistics" DROP CONSTRAINT "unit_statistics_unit_id_fkey";

-- DropIndex
DROP INDEX "unit_statistics_unit_id_month_year_key";

-- AlterTable
ALTER TABLE "unit_statistics" DROP COLUMN "unit_id",
ADD COLUMN     "code_unit" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "units" DROP CONSTRAINT "units_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "units_pkey" PRIMARY KEY ("code_unit");

-- CreateIndex
CREATE UNIQUE INDEX "unit_statistics_code_unit_month_year_key" ON "unit_statistics"("code_unit", "month", "year");

-- AddForeignKey
ALTER TABLE "unit_statistics" ADD CONSTRAINT "unit_statistics_code_unit_fkey" FOREIGN KEY ("code_unit") REFERENCES "units"("code_unit") ON DELETE CASCADE ON UPDATE NO ACTION;
