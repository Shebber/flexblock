// lib/pricing.ts
export const FLEXBLOCK_BASE_PRICE_EUR = 95; // inkl. Versand

// Rundung auf 0.1 APE
export function roundApe(amount: number, step = 0.1): number {
  const factor = 1 / step;
  return Math.round(amount * factor) / factor;
}
