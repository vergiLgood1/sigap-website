-- AlterTable
ALTER TABLE "evidence" ADD COLUMN     "caption" VARCHAR(255),
ADD COLUMN     "description" VARCHAR(255),
ADD COLUMN     "metadata" JSONB;
