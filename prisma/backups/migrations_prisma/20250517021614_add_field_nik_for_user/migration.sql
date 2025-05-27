/*
  Warnings:

  - You are about to alter the column `phone` on the `units` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - A unique constraint covering the columns `[nik]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "officers" ADD COLUMN     "banned_reason" VARCHAR(255),
ADD COLUMN     "banned_until" TIMESTAMP(3),
ADD COLUMN     "is_banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "panic_strike" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spoofing_attempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "nik" VARCHAR(100) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "units" ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "banned_reason" VARCHAR(255),
ADD COLUMN     "is_banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "panic_strike" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spoofing_attempts" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "panic_button_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "officer_id" UUID,
    "incident_id" UUID NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "panic_button_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_panic_buttons_user_id" ON "panic_button_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_nik_key" ON "profiles"("nik");

-- CreateIndex
CREATE INDEX "idx_profiles_nik" ON "profiles"("nik");

-- AddForeignKey
ALTER TABLE "panic_button_logs" ADD CONSTRAINT "panic_button_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "panic_button_logs" ADD CONSTRAINT "panic_button_logs_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "officers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "panic_button_logs" ADD CONSTRAINT "panic_button_logs_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incident_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
