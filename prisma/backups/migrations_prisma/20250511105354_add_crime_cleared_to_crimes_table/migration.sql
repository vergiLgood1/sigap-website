/*
  Warnings:

  - You are about to drop the `test` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "crimes" ADD COLUMN     "crime_cleared" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "test";
