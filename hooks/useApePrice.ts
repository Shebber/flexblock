"use client";

import { useState, useEffect } from "react";

export function useApePrice() {
  const [apePrice, setApePrice] = useState<number>(0);

  useEffect(() => {
    async function load() {
      try {
        // Hauptquelle: CoinGecko
        const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=apecoin&vs_currencies=eur");
        const j = await r.json();

        if (j?.apecoin?.eur) {
          setApePrice(j.apecoin.eur);
          return;
        }
      } catch {}

      // Fallback 1 — Dexscreener
      try {
        const r2 = await fetch("https://api.dexscreener.com/latest/dex/tokens/APE");
        const j2 = await r2.json();
        if (j2?.priceUsd) {
          const eur = Number(j2.priceUsd) * 0.92;
          setApePrice(eur);
          return;
        }
      } catch {}

      // Letzter Fallback — fixer Wert (Notbetrieb)
      setApePrice(1.5);
    }

    load();
  }, []);

  return { apePrice };
}
