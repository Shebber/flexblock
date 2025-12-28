"use client";

import { useEffect, useState } from "react";

export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchEth() {
    try {
      // 1. Versuch: CoinGecko
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur"
      );
      if (!res.ok) throw new Error("CoinGecko Error");
      
      const json = await res.json();
      if (json?.ethereum?.eur) {
        setEthPrice(json.ethereum.eur);
        setError(false);
        setLoading(false);
        return; // Erfolg!
      }
    } catch (err) {
      console.warn("CoinGecko failed, trying Coinbase...", err);
    }

    // 2. Versuch (Fallback): Coinbase API (sehr stabil & public)
    try {
      const res = await fetch("https://api.coinbase.com/v2/prices/ETH-EUR/spot");
      const json = await res.json();
      
      if (json?.data?.amount) {
        setEthPrice(Number(json.data.amount));
        setError(false);
      } else {
        throw new Error("Coinbase failed");
      }
    } catch (err) {
      console.error("All price fetches failed:", err);
      setError(true);
      // Optional: Letzter Notfall-Preis (Hardcoded) - NUR WENN DU WILLST
      // setEthPrice(3500); 
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEth();
    // Alle 5 Minuten (300000ms)
    const interval = setInterval(fetchEth, 300000);
    return () => clearInterval(interval);
  }, []);

  return { ethPrice, loading, error };
}