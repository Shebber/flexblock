/*
  Warnings:

  - Added the required column `apePrice` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `backplate` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nftContract` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nftTokenId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipCountry` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipStreet` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipZip` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "orderId" TEXT NOT NULL,
    "apeAmount" DECIMAL NOT NULL,
    "apePrice" DECIMAL NOT NULL,
    "txHash" TEXT,
    "nftContract" TEXT NOT NULL,
    "nftTokenId" TEXT NOT NULL,
    "nftImage" TEXT,
    "backplate" TEXT NOT NULL,
    "shipName" TEXT NOT NULL,
    "shipStreet" TEXT NOT NULL,
    "shipZip" TEXT NOT NULL,
    "shipCountry" TEXT NOT NULL,
    "flexPassTokenId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "wallet" TEXT NOT NULL,
    "customer" TEXT
);
INSERT INTO "new_Order" ("apeAmount", "createdAt", "id") SELECT "apeAmount", "createdAt", "id" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
