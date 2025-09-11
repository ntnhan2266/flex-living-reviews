-- CreateTable
CREATE TABLE "ReviewApproval" (
    "reviewId" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "updatedAt" DATETIME NOT NULL
);
