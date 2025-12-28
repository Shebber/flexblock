// lib/calcPrice.ts

export function calcApeAmount(apePrice: number): number {
  const eur = 10; // Basispreis

  if (!apePrice || apePrice <= 0 || isNaN(apePrice)) {
    return 1; // sinnvoller Fallback
  }

  const amount = eur / apePrice;

  // ⭐ Keine Nachkommastellen, abgerundet
  return Math.floor(amount);
}
