/*
  Warnings:

  - The primary key for the `evidence` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `officers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `patrol_unitsId` on the `officers` table. All the data in the column will be lost.
  - The `id` column on the `officers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `patrol_units` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `evidence` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `patrol_units` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `evidence` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `patrol_unit_id` to the `officers` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `patrol_units` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "officers" DROP CONSTRAINT "officers_patrol_unitsId_fkey";

-- AlterTable
ALTER TABLE "evidence" DROP CONSTRAINT "evidence_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(20) NOT NULL,
ADD CONSTRAINT "evidence_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "officers" DROP CONSTRAINT "officers_pkey",
DROP COLUMN "patrol_unitsId",
ADD COLUMN     "patrol_unit_id" VARCHAR(20) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "officers_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "patrol_units" DROP CONSTRAINT "patrol_units_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(20) NOT NULL,
ADD CONSTRAINT "patrol_units_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_id_key" ON "evidence"("id");

-- CreateIndex
CREATE UNIQUE INDEX "patrol_units_id_key" ON "patrol_units"("id");

-- AddForeignKey
ALTER TABLE "officers" ADD CONSTRAINT "officers_patrol_unit_id_fkey" FOREIGN KEY ("patrol_unit_id") REFERENCES "patrol_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
