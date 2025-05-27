/*
  Warnings:

  - The primary key for the `patrol_units` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "officers" DROP CONSTRAINT "officers_patrol_unit_id_fkey";

-- AlterTable
ALTER TABLE "officers" ALTER COLUMN "patrol_unit_id" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "patrol_units" DROP CONSTRAINT "patrol_units_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "patrol_units_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "officers" ADD CONSTRAINT "officers_patrol_unit_id_fkey" FOREIGN KEY ("patrol_unit_id") REFERENCES "patrol_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
