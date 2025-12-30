// lib/promo.js
export function applyPromo(promoCode, basePriceEUR) {
  const base = Math.round(Number(basePriceEUR));
  const c = String(promoCode || "").trim().toUpperCase();

  const result = {
    promo: false,
    promoCode: null,
    promoPickup: false,
    promoDiscount: 0,
    finalPriceEUR: base,
  };

  if (!c) return result;

  const now = new Date();
  const expiry = new Date("2026-02-20T23:59:59Z");

  // OGAPES20: -20 EUR
  if (c === "OGAPES20") {
    if (now > expiry) return result;
    const discount = 20;
    return {
      promo: true,
      promoCode: "OGAPES20",
      promoPickup: false,
      promoDiscount: discount,
      finalPriceEUR: Math.max(0, base - discount),
    };
  }

  // SHEBBERFAM90: Fixpreis 25 EUR + Pickup
  if (c === "SHEBBERFAM90") {
    const fixed = 25;
    return {
      promo: true,
      promoCode: "SHEBBERFAM90",
      promoPickup: true,
      promoDiscount: Math.max(0, base - fixed), // fürs Reporting
      finalPriceEUR: fixed,
    };
  }

  return result;
}
