/*
  Warnings:

  - You are about to drop the column `apeAmount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `apePrice` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deltaApe` on the `TreasuryAdjustment` table. All the data in the column will be lost.
  - You are about to drop the column `newApe` on the `TreasuryAdjustment` table. All the data in the column will be lost.
  - You are about to drop the column `previousApe` on the `TreasuryAdjustment` table. All the data in the column will be lost.
  - Added the required column `deltaEth` to the `TreasuryAdjustment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newEth` to the `TreasuryAdjustment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousEth` to the `TreasuryAdjustment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "ethAmount" DECIMAL,
    "ethPrice" DECIMAL,
    "txHash" TEXT,
    "wallet" TEXT,
    "nftContract" TEXT NOT NULL,
    "nftTokenId" INTEGER NOT NULL,
    "nftImage" TEXT,
    "backplate" TEXT,
    "backplateCode" TEXT,
    "promo" BOOLEAN DEFAULT false,
    "promoCode" TEXT,
    "promoDiscount" INTEGER DEFAULT 0,
    "finalPriceEUR" INTEGER,
    "promoPickup" BOOLEAN DEFAULT false,
    "shipName" TEXT NOT NULL,
    "shipStreet" TEXT,
    "shipZip" TEXT,
    "shipCity" TEXT,
    "shipCountry" TEXT,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "trackingUrl" TEXT,
    "publicId" TEXT,
    "flexblockId" TEXT,
    "verifyUrl" TEXT,
    "flexPassTokenId" INTEGER,
    "localImagePath" TEXT,
    "convertedCloudPath" TEXT,
    "wrikeTaskId" TEXT
);
INSERT INTO "new_Order" ("backplate", "backplateCode", "convertedCloudPath", "createdAt", "finalPriceEUR", "flexPassTokenId", "flexblockId", "id", "localImagePath", "nftContract", "nftImage", "nftTokenId", "orderId", "promo", "promoCode", "promoDiscount", "promoPickup", "publicId", "shipCity", "shipCountry", "shipName", "shipStreet", "shipZip", "status", "trackingUrl", "txHash", "verifyUrl", "wallet", "wrikeTaskId") SELECT "backplate", "backplateCode", "convertedCloudPath", "createdAt", "finalPriceEUR", "flexPassTokenId", "flexblockId", "id", "localImagePath", "nftContract", "nftImage", "nftTokenId", "orderId", "promo", "promoCode", "promoDiscount", "promoPickup", "publicId", "shipCity", "shipCountry", "shipName", "shipStreet", "shipZip", "status", "trackingUrl", "txHash", "verifyUrl", "wallet", "wrikeTaskId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");
CREATE UNIQUE INDEX "Order_publicId_key" ON "Order"("publicId");
CREATE TABLE "new_TreasuryAdjustment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousEth" DECIMAL NOT NULL,
    "newEth" DECIMAL NOT NULL,
    "deltaEth" DECIMAL NOT NULL,
    "reason" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL
);
INSERT INTO "new_TreasuryAdjustment" ("changedBy", "createdAt", "id", "reason") SELECT "changedBy", "createdAt", "id", "reason" FROM "TreasuryAdjustment";
DROP TABLE "TreasuryAdjustment";
ALTER TABLE "new_TreasuryAdjustment" RENAME TO "TreasuryAdjustment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
