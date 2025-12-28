import { base, baseSepolia } from "wagmi/chains";

export const CHAINS = {
  BASE_MAINNET: {
    ...base,
    rpcUrls: {
      default: { http: ["https://mainnet.base.org"] },
      public: { http: ["https://mainnet.base.org"] },
    },
  },

  BASE_TESTNET: {
    ...baseSepolia,
    rpcUrls: {
      default: { http: ["https://sepolia.base.org"] },
      public: { http: ["https://sepolia.base.org"] },
    },
  },
};
