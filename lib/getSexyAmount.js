
// ---------------------------------------------------------
// getSexyAmount.js — FINAL ETH-ONLY VERSION FOR BASE
// ---------------------------------------------------------

export function getSexyAmount(rawEth) {
  if (!rawEth || rawEth <= 0) return 0;

  // Optional: Mindestbetrag anpassen.
  // Wenn wir genauer werden, können wir auch kleinere Beträge zulassen.
  // Vorher: 0.005 (ca. 15€). Neu: z.B. 0.001 (ca. 3€) oder so lassen.
  if (rawEth < 0.001) return 0.001; 

  // Wir nutzen jetzt pauschal 4 Nachkommastellen für alles.
  // Das ist präzise genug (ca. 30 Cent Genauigkeit bei 3000€/ETH)
  // und sieht immer noch sauber aus (z.B. 0.0452 ETH).
  
  return Number(rawEth.toFixed(4));
}