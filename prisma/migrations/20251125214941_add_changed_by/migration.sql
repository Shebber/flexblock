/*
  Warnings:

  - Added the required column `changedBy` to the `TreasuryAdjustment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TreasuryAdjustment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousApe" DECIMAL NOT NULL,
    "newApe" DECIMAL NOT NULL,
    "deltaApe" DECIMAL NOT NULL,
    "reason" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL
);
INSERT INTO "new_TreasuryAdjustment" ("createdAt", "deltaApe", "id", "newApe", "previousApe", "reason") SELECT "createdAt", "deltaApe", "id", "newApe", "previousApe", "reason" FROM "TreasuryAdjustment";
DROP TABLE "TreasuryAdjustment";
ALTER TABLE "new_TreasuryAdjustment" RENAME TO "TreasuryAdjustment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
