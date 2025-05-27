/*
  Warnings:

  - Added the required column `city_id` to the `units` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "units_district_id_key";

-- AlterTable
ALTER TABLE "units" ADD COLUMN     "city_id" VARCHAR(20) NOT NULL,
ADD CONSTRAINT "units_pkey" PRIMARY KEY ("code_unit");

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
