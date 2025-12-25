-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BoardActivityType" ADD VALUE 'OWNERSHIP_TRANSFERRED';
ALTER TYPE "BoardActivityType" ADD VALUE 'BOARD_ARCHIVED';
ALTER TYPE "BoardActivityType" ADD VALUE 'BOARD_RESTORED';

-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;
