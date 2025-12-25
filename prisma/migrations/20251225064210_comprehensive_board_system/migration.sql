/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `boardId` on the `Pin` table. All the data in the column will be lost.
  - Added the required column `name` to the `Board` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BoardVisibility" AS ENUM ('PRIVATE', 'PUBLIC', 'SHARED');

-- CreateEnum
CREATE TYPE "BoardLayoutMode" AS ENUM ('MASONRY', 'GRID', 'TIMELINE', 'MAP');

-- CreateEnum
CREATE TYPE "BoardThemeColor" AS ENUM ('TRAVEL_BLUE', 'EXPLORER_TEAL', 'CORAL_ADVENTURE', 'GOLD_LUXURY', 'MINIMAL_SLATE');

-- CreateEnum
CREATE TYPE "TripCategory" AS ENUM ('BACKPACKING', 'LUXURY', 'SOLO', 'GROUP', 'COUPLES', 'NATURE', 'CITY', 'FOOD', 'FESTIVALS', 'HIDDEN_GEMS');

-- CreateEnum
CREATE TYPE "BoardMemberRole" AS ENUM ('OWNER', 'CO_ADMIN', 'CAN_ADD_PINS', 'CAN_COMMENT', 'VIEW_ONLY');

-- CreateEnum
CREATE TYPE "PinRelevance" AS ENUM ('MUST_VISIT', 'MAYBE', 'BACKUP');

-- CreateEnum
CREATE TYPE "BoardActivityType" AS ENUM ('CREATED', 'PIN_ADDED', 'PIN_REMOVED', 'MEMBER_ADDED', 'MEMBER_REMOVED', 'COMMENT_ADDED', 'SETTINGS_UPDATED', 'COVER_CHANGED');

-- DropForeignKey
ALTER TABLE "Pin" DROP CONSTRAINT "Pin_boardId_fkey";

-- DropIndex
DROP INDEX "Pin_boardId_idx";

-- AlterTable
ALTER TABLE "Board" DROP COLUMN "isPublic",
DROP COLUMN "title",
ADD COLUMN     "autoGenCover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hashtags" TEXT[],
ADD COLUMN     "layoutMode" "BoardLayoutMode" NOT NULL DEFAULT 'MASONRY',
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "themeColor" "BoardThemeColor" NOT NULL DEFAULT 'TRAVEL_BLUE',
ADD COLUMN     "tripCategory" "TripCategory",
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visibility" "BoardVisibility" NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "Pin" DROP COLUMN "boardId";

-- CreateTable
CREATE TABLE "BoardMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "role" "BoardMemberRole" NOT NULL DEFAULT 'VIEW_ONLY',
    "invitedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardPinRelation" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "pinId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "relevance" "PinRelevance",
    "boardNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardPinRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedBoard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedBoard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardActivityLog" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" "BoardActivityType" NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pinId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedPin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pinId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoardMember_userId_idx" ON "BoardMember"("userId");

-- CreateIndex
CREATE INDEX "BoardMember_boardId_idx" ON "BoardMember"("boardId");

-- CreateIndex
CREATE INDEX "BoardMember_role_idx" ON "BoardMember"("role");

-- CreateIndex
CREATE UNIQUE INDEX "BoardMember_userId_boardId_key" ON "BoardMember"("userId", "boardId");

-- CreateIndex
CREATE INDEX "BoardPinRelation_boardId_idx" ON "BoardPinRelation"("boardId");

-- CreateIndex
CREATE INDEX "BoardPinRelation_pinId_idx" ON "BoardPinRelation"("pinId");

-- CreateIndex
CREATE INDEX "BoardPinRelation_order_idx" ON "BoardPinRelation"("order");

-- CreateIndex
CREATE UNIQUE INDEX "BoardPinRelation_boardId_pinId_key" ON "BoardPinRelation"("boardId", "pinId");

-- CreateIndex
CREATE INDEX "BoardComment_userId_idx" ON "BoardComment"("userId");

-- CreateIndex
CREATE INDEX "BoardComment_boardId_idx" ON "BoardComment"("boardId");

-- CreateIndex
CREATE INDEX "BoardComment_createdAt_idx" ON "BoardComment"("createdAt");

-- CreateIndex
CREATE INDEX "BoardLike_userId_idx" ON "BoardLike"("userId");

-- CreateIndex
CREATE INDEX "BoardLike_boardId_idx" ON "BoardLike"("boardId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardLike_userId_boardId_key" ON "BoardLike"("userId", "boardId");

-- CreateIndex
CREATE INDEX "SavedBoard_userId_idx" ON "SavedBoard"("userId");

-- CreateIndex
CREATE INDEX "SavedBoard_boardId_idx" ON "SavedBoard"("boardId");

-- CreateIndex
CREATE INDEX "SavedBoard_createdAt_idx" ON "SavedBoard"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedBoard_userId_boardId_key" ON "SavedBoard"("userId", "boardId");

-- CreateIndex
CREATE INDEX "BoardActivityLog_boardId_idx" ON "BoardActivityLog"("boardId");

-- CreateIndex
CREATE INDEX "BoardActivityLog_userId_idx" ON "BoardActivityLog"("userId");

-- CreateIndex
CREATE INDEX "BoardActivityLog_createdAt_idx" ON "BoardActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "BoardActivityLog_boardId_createdAt_idx" ON "BoardActivityLog"("boardId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_pinId_idx" ON "Report"("pinId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_userId_pinId_key" ON "Report"("userId", "pinId");

-- CreateIndex
CREATE INDEX "SavedPin_userId_idx" ON "SavedPin"("userId");

-- CreateIndex
CREATE INDEX "SavedPin_pinId_idx" ON "SavedPin"("pinId");

-- CreateIndex
CREATE INDEX "SavedPin_createdAt_idx" ON "SavedPin"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedPin_userId_pinId_key" ON "SavedPin"("userId", "pinId");

-- CreateIndex
CREATE INDEX "Board_visibility_idx" ON "Board"("visibility");

-- CreateIndex
CREATE INDEX "Board_tripCategory_idx" ON "Board"("tripCategory");

-- CreateIndex
CREATE INDEX "Board_createdAt_idx" ON "Board"("createdAt");

-- CreateIndex
CREATE INDEX "Board_viewCount_idx" ON "Board"("viewCount");

-- CreateIndex
CREATE INDEX "Pin_createdAt_idx" ON "Pin"("createdAt");

-- CreateIndex
CREATE INDEX "Pin_category_createdAt_idx" ON "Pin"("category", "createdAt");

-- CreateIndex
CREATE INDEX "Pin_costLevel_createdAt_idx" ON "Pin"("costLevel", "createdAt");

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardPinRelation" ADD CONSTRAINT "BoardPinRelation_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardPinRelation" ADD CONSTRAINT "BoardPinRelation_pinId_fkey" FOREIGN KEY ("pinId") REFERENCES "Pin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardComment" ADD CONSTRAINT "BoardComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardComment" ADD CONSTRAINT "BoardComment_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardLike" ADD CONSTRAINT "BoardLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardLike" ADD CONSTRAINT "BoardLike_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedBoard" ADD CONSTRAINT "SavedBoard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedBoard" ADD CONSTRAINT "SavedBoard_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardActivityLog" ADD CONSTRAINT "BoardActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardActivityLog" ADD CONSTRAINT "BoardActivityLog_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_pinId_fkey" FOREIGN KEY ("pinId") REFERENCES "Pin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPin" ADD CONSTRAINT "SavedPin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedPin" ADD CONSTRAINT "SavedPin_pinId_fkey" FOREIGN KEY ("pinId") REFERENCES "Pin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
