import { defineChain } from 'viem';

export const apechain = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 33139),

  name: process.env.NEXT_PUBLIC_CHAIN_NAME || 'ApeChain',

  nativeCurrency: {
    name: 'ApeCoin',
    symbol: 'APE',
    decimals: 18,
  },

  rpcUrls: {
    default: {
      http: [
        process.env.RPC_URL ||
          'https://apechain.calderachain.xyz/http',
      ],
    },
    public: {
      http: [
        process.env.RPC_URL ||
          'https://apechain.calderachain.xyz/http',
      ],
    },
  },

  blockExplorers: {
    default: {
      name: 'ApeScan',
      url:
        process.env.NEXT_PUBLIC_EXPLORER_URL ||
        'https://apechain.calderaexplorer.xyz',
    },
  },

  // Optional, aber MetaMask liebt klare network descriptors
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
  },
});
