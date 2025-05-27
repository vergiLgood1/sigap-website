/*
  Warnings:

  - Added the required column `city_id` to the `units` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "units" ADD COLUMN     "city_id" VARCHAR(20) NOT NULL,
ALTER COLUMN "district_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
