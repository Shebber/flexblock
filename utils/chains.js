// utils/chains.js

// --------------------------------------------------------------------------
// 1. ETHEREUM MAINNET (ID: 1)
// --------------------------------------------------------------------------
export const ethereum = {
  id: 1,
  name: "Ethereum",
  network: "homestead",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { 
      http: [
        "https://eth.llamarpc.com",        // 1. Aggregator (sehr stabil)
        "https://rpc.ankr.com/eth",        // 2. Ankr
        "https://cloudflare-eth.com",      // 3. Cloudflare
        "https://ethereum.publicnode.com"  // 4. Fallback
      ] 
    },
    public: { 
      http: ["https://eth.llamarpc.com"] 
    },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://etherscan.io" },
  },
};
// --------------------------------------------------------------------------
// 2. POLYGON (ID: 137)
// --------------------------------------------------------------------------
export const polygon = {
  id: 137,
  name: "Polygon",
  network: "matic",
  nativeCurrency: { name: "Polygon Ecosystem Token", symbol: "POL", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://polygon-rpc.com"] },
    public: { http: ["https://polygon-rpc.com"] },
  },
  blockExplorers: {
    default: { name: "PolygonScan", url: "https://polygonscan.com" },
  },
};

// --------------------------------------------------------------------------
// 3. BLAST (ID: 81457)
// --------------------------------------------------------------------------
export const blast = {
  id: 81457,
  name: "Blast",
  network: "blast",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.blast.io"] },
    public: { http: ["https://rpc.blast.io"] },
  },
  blockExplorers: {
    default: { name: "BlastScan", url: "https://blastscan.io" },
  },
};

// --------------------------------------------------------------------------
// 4. ZORA (ID: 7777777)
// --------------------------------------------------------------------------
export const zora = {
  id: 7777777,
  name: "Zora",
  network: "zora",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.zora.energy"] },
    public: { http: ["https://rpc.zora.energy"] },
  },
  blockExplorers: {
    default: { name: "Zora Explorer", url: "https://explorer.zora.energy" },
  },
};

// --------------------------------------------------------------------------
// 5. BERACHAIN (ID: 80094)
// --------------------------------------------------------------------------
export const berachain = {
  id: 80094,
  name: "Berachain",
  network: "berachain",
  nativeCurrency: { name: "Bera", symbol: "BERA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.berachain.com"] },
    public: { http: ["https://rpc.berachain.com"] },
  },
  blockExplorers: {
    default: { name: "Berascan", url: "https://berascan.com" },
  },
};

// --------------------------------------------------------------------------
// 6. BASE (ID: 8453)
// --------------------------------------------------------------------------
export const base = {
  id: 8453,
  name: "Base",
  network: "base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.base.org"] },
    public: { http: ["https://mainnet.base.org"] },
  },
  blockExplorers: {
    default: { name: "BaseScan", url: "https://basescan.org" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5022,
    },
  },
};

// --------------------------------------------------------------------------
// 7. APECHAIN (ID: 33139)
// --------------------------------------------------------------------------
export const apechain = {
  id: 33139,
  name: "ApeChain",
  network: "apechain",
  nativeCurrency: { name: "ApeCoin", symbol: "APE", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.apechain.com/http"] },
    public: { http: ["https://rpc.apechain.com/http"] },
  },
  blockExplorers: {
    default: { name: "ApeScan", url: "https://apescan.io" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1,
    },
  },
};

// --------------------------------------------------------------------------
// 8. ABSTRACT (ID: 2741)
// --------------------------------------------------------------------------
export const abstract = {
  id: 2741,
  name: "Abstract",
  network: "abstract",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.mainnet.abs.xyz"] },
    public: { http: ["https://api.mainnet.abs.xyz"] },
  },
  blockExplorers: {
    default: { name: "Abscan", url: "https://abscan.org" },
  },
};

// --------------------------------------------------------------------------
// 9. SOMNIA (ID: 5031)
// --------------------------------------------------------------------------
export const somnia = {
  id: 5031,
  name: "Somnia",
  network: "somnia",
  nativeCurrency: { name: "Somnia", symbol: "SOMI", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.infra.mainnet.somnia.network/"] },
    public: { http: ["https://api.infra.mainnet.somnia.network/"] },
  },
  blockExplorers: {
    default: { name: "Somnia Explorer", url: "https://explorer.somnia.network" },
  },
  testnet: false,
};

// --------------------------------------------------------------------------
// 10. MONAD (Testnet & Mainnet Placeholder)
// --------------------------------------------------------------------------
export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  network: "monad-testnet",
  nativeCurrency: { name: "Monad Test Token", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
    public: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "Monad Testnet Explorer", url: "https://testnet.monadexplorer.com" },
  },
  testnet: true,
};

// --------------------------------------------------------------------------
// 11. OPTIMISM (ID: 10)
// --------------------------------------------------------------------------
export const optimism = {
  id: 10,
  name: "OP Mainnet",
  network: "optimism",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://mainnet.optimism.io"] },
    public: { http: ["https://mainnet.optimism.io"] },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://optimistic.etherscan.io" },
  },
};

// --------------------------------------------------------------------------
// 12. ARBITRUM ONE (ID: 42161)
// --------------------------------------------------------------------------
export const arbitrum = {
  id: 42161,
  name: "Arbitrum One",
  network: "arbitrum",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://arb1.arbitrum.io/rpc"] },
    public: { http: ["https://arb1.arbitrum.io/rpc"] },
  },
  blockExplorers: {
    default: { name: "Arbiscan", url: "https://arbiscan.io" },
  },
};

// --------------------------------------------------------------------------
// 13. AVALANCHE C-CHAIN (ID: 43114)
// --------------------------------------------------------------------------
export const avalanche = {
  id: 43114,
  name: "Avalanche",
  network: "avalanche-c",
  nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
    public: { http: ["https://api.avax.network/ext/bc/C/rpc"] },
  },
  blockExplorers: {
    default: { name: "Snowtrace", url: "https://snowtrace.io" },
  },
};

// --------------------------------------------------------------------------
// 14. BINANCE SMART CHAIN (ID: 56)
// --------------------------------------------------------------------------
export const bsc = {
  id: 56,
  name: "BNB Smart Chain",
  network: "bsc",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://bsc-dataseed.binance.org/"] },
    public: { http: ["https://bsc-dataseed.binance.org/"] },
  },
  blockExplorers: {
    default: { name: "BscScan", url: "https://bscscan.com" },
  },
};

// --------------------------------------------------------------------------
// EXPORT LISTE (Alles gesammelt)
// --------------------------------------------------------------------------
export const supportedChains = [
  ethereum, 
  polygon, 
  base, 
  blast,        // 🟢 NEU
  zora,         // 🟢 NEU
  berachain,    // 🟢 NEU (Mainnet)
  apechain, 
  abstract, 
  somnia, 
  monadTestnet,
  optimism, 
  arbitrum, 
  avalanche, 
  bsc
];