/*
  Warnings:

  - You are about to drop the column `apePrice` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `backplate` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `nftContract` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `nftImage` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `nftTokenId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shipCountry` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shipName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shipStreet` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shipZip` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `txHash` on the `Order` table. All the data in the column will be lost.
  - Added the required column `publicId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apeAmount" DECIMAL NOT NULL,
    "wallet" TEXT,
    "tokenId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'open',
    "trackingUrl" TEXT
);
INSERT INTO "new_Order" ("apeAmount", "createdAt", "id", "orderId", "status", "wallet") SELECT "apeAmount", "createdAt", "id", "orderId", "status", "wallet" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");
CREATE UNIQUE INDEX "Order_publicId_key" ON "Order"("publicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
