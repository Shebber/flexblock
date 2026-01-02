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
        enableExplorer: true,

        explorerRecommendedWalletIds: [
          "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
          "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369",
          "18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1",
          "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa",
          "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
          "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709",
          "fe68cea63541aa53ce020de7398968566dfe8f3725663a564cac89490247ed49",
          "a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393",
        ],

        // Wenn du wirklich NUR diese anzeigen willst, aktiviere diese Zeile:
        // explorerExcludedWalletIds: "ALL",

        // ✅ Fix für "Failed to Copy" (vor allem auf Mobile / http)
        onCopyClipboard: (value) => {
          // nur im Browser
          if (typeof window === "undefined") return;

          // 1) Modern Clipboard API
          try {
            if (navigator?.clipboard?.writeText) {
              navigator.clipboard.writeText(value);
              return;
            }
          } catch (_) {}

          // 2) Fallback via execCommand (funktioniert oft auch wenn Clipboard API blockt)
          try {
            const ta = document.createElement("textarea");
            ta.value = value;
            ta.setAttribute("readonly", "");
            ta.style.position = "fixed";
            ta.style.top = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
          } catch (_) {}
        },
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
