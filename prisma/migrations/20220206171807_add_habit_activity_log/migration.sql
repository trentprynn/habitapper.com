-- CreateTable
CREATE TABLE "HabitActivityLog" (
    "habitActivityLogId" SERIAL NOT NULL,
    "habitId" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HabitActivityLog_pkey" PRIMARY KEY ("habitActivityLogId")
);

-- AddForeignKey
ALTER TABLE "HabitActivityLog" ADD CONSTRAINT "HabitActivityLog_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("habitId") ON DELETE CASCADE ON UPDATE CASCADE;
