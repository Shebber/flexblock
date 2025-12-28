// lib/utils.js

export function normalizeIpfsUrl(url) {
  if (!url) return null;

  // Falls es schon http ist, nichts tun
  if (url.startsWith("http") || url.startsWith("https")) {
    return url;
  }

  // IPFS Protokoll ersetzen
  if (url.startsWith("ipfs://")) {
    // Wir nutzen hier das öffentliche ipfs.io Gateway
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  // Manchmal kommt nur der Hash "Qm..." (ohne Protokoll)
  if (url.startsWith("Qm") && url.length > 40) {
    return `https://ipfs.io/ipfs/${url}`;
  }

  return url;
}