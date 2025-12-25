-- CreateTable
CREATE TABLE "TimelineDay" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelinePinAssignment" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "pinId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelinePinAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimelineDay_boardId_idx" ON "TimelineDay"("boardId");

-- CreateIndex
CREATE INDEX "TimelineDay_boardId_dayNumber_idx" ON "TimelineDay"("boardId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TimelineDay_boardId_dayNumber_key" ON "TimelineDay"("boardId", "dayNumber");

-- CreateIndex
CREATE INDEX "TimelinePinAssignment_dayId_idx" ON "TimelinePinAssignment"("dayId");

-- CreateIndex
CREATE INDEX "TimelinePinAssignment_pinId_idx" ON "TimelinePinAssignment"("pinId");

-- CreateIndex
CREATE INDEX "TimelinePinAssignment_dayId_order_idx" ON "TimelinePinAssignment"("dayId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TimelinePinAssignment_dayId_pinId_key" ON "TimelinePinAssignment"("dayId", "pinId");

-- AddForeignKey
ALTER TABLE "TimelineDay" ADD CONSTRAINT "TimelineDay_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelinePinAssignment" ADD CONSTRAINT "TimelinePinAssignment_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "TimelineDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelinePinAssignment" ADD CONSTRAINT "TimelinePinAssignment_pinId_fkey" FOREIGN KEY ("pinId") REFERENCES "Pin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
