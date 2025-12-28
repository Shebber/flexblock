'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletConnectButton() {
  const [isClient, setIsClient] = useState(false);

  const { address, isConnected } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // Connected
  if (isConnected) return null;

  // Disconnected
  return null;
}

