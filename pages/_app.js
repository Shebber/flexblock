import '../styles.css';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { metaMask, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apechain } from '../utils/chain';
import { createPublicClient } from 'viem';

const queryClient = new QueryClient();

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const config = createConfig({
  chains: [apechain],
  connectors: [
    metaMask({ shimDisconnect: true }),
    walletConnect({
      projectId,
      metadata: {
        name: 'Flexblock',
        description: 'NFT → Acrylic Print Shop',
        url: 'https://flexblock.xyz',
        icons: [],
      },
    }),
  ],
  transports: {
    [apechain.id]: http(apechain.rpcUrls.default.http[0]),
  },
  ssr: false,
});

// ⭐ CRUCIAL for debugging & wallet buttons
if (typeof window !== 'undefined') {
  window.wagmiConfig = config;
}

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
