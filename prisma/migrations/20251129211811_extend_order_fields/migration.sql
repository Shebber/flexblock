/*
  Warnings:

  - You are about to drop the column `tokenId` on the `Order` table. All the data in the column will be lost.

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
    "wallet" TEXT,
    "nftContract" TEXT,
    "nftTokenId" INTEGER,
    "nftImage" TEXT,
    "backplate" TEXT,
    "shipName" TEXT,
    "shipStreet" TEXT,
    "shipZip" TEXT,
    "shipCountry" TEXT,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "trackingUrl" TEXT,
    "publicId" TEXT NOT NULL
);
INSERT INTO "new_Order" ("apeAmount", "createdAt", "id", "orderId", "publicId", "status", "trackingUrl", "wallet") SELECT "apeAmount", "createdAt", "id", "orderId", "publicId", "status", "trackingUrl", "wallet" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");
CREATE UNIQUE INDEX "Order_publicId_key" ON "Order"("publicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
