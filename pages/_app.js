import "../styles.css";

import { SessionProvider } from "next-auth/react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { walletConnect, metaMask } from "wagmi/connectors";
import { base } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Optional: echte Domain aus ENV ziehen, fallback auf nftflexblock
const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nftflexblock.xyz";

// ⭐ Wagmi-Config: Nur BASE Mainnet
const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http("https://mainnet.base.org"), // oder eigener RPC
  },
  ssr: true,

  connectors: [
    // ✅ MetaMask explizit (verhindert Konflikte mit Phantom/Trust/MagicEden)
    metaMask(),

    // ✅ WalletConnect als Extension-unabhängige Option
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "Flexblock",
        description: "Flexblock Production Checkout",
        url: appUrl,
        // Wichtig: Diese Datei muss existieren (public/logo.png)
        icons: [`${appUrl}/logo.png`],
      },
      qrModalOptions: {
        themeMode: "dark",
        explorerExcludedWalletIds: "ALL",
        recommendedWalletIds: [
          "c38b2ae4-4d8d-4b90-9f3d-92f764f4bfe1", // MetaMask
          "bb6ca25e-0e5c-4d93-8bf2-ca0d44e551e3", // Coinbase
          "8e6cdf6b-6d49-4b88-9d69-c17e13780a3d", // Ledger
          "1ee8cf77-3e7c-4f70-b2f0-fc50f0e29fa4", // Rabby
          "a4e0f39c-e69e-4029-8d28-f27e1bbd4412", // OKX
          "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa", // Coinbase Wallet (Mobile)
        ],
      },
    }),
  ],
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
