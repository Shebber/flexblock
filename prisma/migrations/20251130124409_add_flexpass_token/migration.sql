/*
  Warnings:

  - Made the column `nftContract` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nftTokenId` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipCountry` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipName` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipStreet` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `shipZip` on table `Order` required. This step will fail if there are existing NULL values in that column.

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
    "nftContract" TEXT NOT NULL,
    "nftTokenId" INTEGER NOT NULL,
    "nftImage" TEXT,
    "backplate" TEXT,
    "shipName" TEXT NOT NULL,
    "shipStreet" TEXT NOT NULL,
    "shipZip" TEXT NOT NULL,
    "shipCountry" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'paid',
    "trackingUrl" TEXT,
    "publicId" TEXT NOT NULL,
    "flexPassTokenId" INTEGER
);
INSERT INTO "new_Order" ("apeAmount", "apePrice", "backplate", "createdAt", "id", "nftContract", "nftImage", "nftTokenId", "orderId", "publicId", "shipCountry", "shipName", "shipStreet", "shipZip", "status", "trackingUrl", "txHash", "wallet") SELECT "apeAmount", "apePrice", "backplate", "createdAt", "id", "nftContract", "nftImage", "nftTokenId", "orderId", "publicId", "shipCountry", "shipName", "shipStreet", "shipZip", "status", "trackingUrl", "txHash", "wallet" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");
CREATE UNIQUE INDEX "Order_publicId_key" ON "Order"("publicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
