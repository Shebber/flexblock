-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "apeAmount" DECIMAL,
    "apePrice" DECIMAL,
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
INSERT INTO "new_Order" ("apeAmount", "apePrice", "backplate", "createdAt", "flexPassTokenId", "flexblockId", "id", "nftContract", "nftImage", "nftTokenId", "orderId", "publicId", "shipCity", "shipCountry", "shipName", "shipStreet", "shipZip", "status", "trackingUrl", "txHash", "verifyUrl", "wallet") SELECT "apeAmount", "apePrice", "backplate", "createdAt", "flexPassTokenId", "flexblockId", "id", "nftContract", "nftImage", "nftTokenId", "orderId", "publicId", "shipCity", "shipCountry", "shipName", "shipStreet", "shipZip", "status", "trackingUrl", "txHash", "verifyUrl", "wallet" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");
CREATE UNIQUE INDEX "Order_publicId_key" ON "Order"("publicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
