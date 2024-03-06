-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('LIVE', 'NOT_LIVE');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'NOT_LIVE';
