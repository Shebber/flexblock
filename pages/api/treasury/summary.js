

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // 1. Umsätze (Summe aller ETH aus Orders)
    const orders = await prisma.order.findMany();
    // ACHTUNG: Stelle sicher, dass dein Prisma-Modell jetzt 'ethAmount' heißt!
    const totalEthCollected = orders.reduce(
      (sum, o) => sum + Number(o.ethAmount || 0), 
      0
    );

    // 2. Treasury Anpassungen (Summe aller manuellen Korrekturen)
    const adjustments = await prisma.treasuryAdjustment.findMany({
      orderBy: { createdAt: "desc" },
    });

    const deltaSum = adjustments.reduce(
      (sum, a) => sum + Number(a.deltaEth || 0),
      0
    );

    // Aktueller Bestand (Rechnerisch)
    const treasuryEth = totalEthCollected + deltaSum;

    // 3. Kursdaten live von CoinGecko (Ethereum statt ApeCoin)
    // ID: ethereum
    const priceRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur&include_24hr_change=true"
    );
    const priceJson = await priceRes.json();

    const ethPriceEur = priceJson.ethereum.eur;
    const priceChange24h = priceJson.ethereum.eur_24h_change;

    // 4. 30 Tage Kursverlauf (Ethereum)
    const chartRes = await fetch(
      "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=eur&days=30"
    );
    const chartJson = await chartRes.json();

    const chartData = chartJson.prices.map(([timestamp, price]) => ({
      x: timestamp,
      y: price,
    }));

    // 30-Tage Durchschnitt berechnen
    const avg =
      chartData.reduce((sum, p) => sum + p.y, 0) / chartData.length;

    // Signal: Ist aktueller Preis über dem 30-Tage-Schnitt?
    const signal = ethPriceEur > avg ? "green" : "red";

    return res.status(200).json({
      totalEthCollected,
      treasuryEth,
      ethPriceEur,      // Vorher apePriceEur
      priceChange24h,
      chartData,
      average30d: avg,
      signal,
      adjustments,
    });
  } catch (err) {
    console.error("Summary Error:", err);
    return res.status(500).json({ error: "Server error fetching summary" });
  }
}