/*
  Warnings:

  - You are about to drop the column `customer` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `flexPassTokenId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Order` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "apeAmount" DECIMAL NOT NULL,
    "apePrice" DECIMAL,
    "txHash" TEXT,
    "nftContract" TEXT NOT NULL,
    "nftTokenId" TEXT NOT NULL,
    "nftImage" TEXT,
    "backplate" TEXT,
    "shipName" TEXT NOT NULL,
    "shipStreet" TEXT NOT NULL,
    "shipZip" TEXT NOT NULL,
    "shipCountry" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'paid'
);
INSERT INTO "new_Order" ("apeAmount", "apePrice", "backplate", "createdAt", "id", "nftContract", "nftImage", "nftTokenId", "orderId", "shipCountry", "shipName", "shipStreet", "shipZip", "status", "txHash", "wallet") SELECT "apeAmount", "apePrice", "backplate", "createdAt", "id", "nftContract", "nftImage", "nftTokenId", "orderId", "shipCountry", "shipName", "shipStreet", "shipZip", "status", "txHash", "wallet" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
