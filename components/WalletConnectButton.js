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

  if (!isClient) {
    return (
      <button className="btn-disabled">
        Loading…
      </button>
    );
  }

  // Connected state
  if (isConnected) {
    return (
      <div className="wallet-box">
        <div className="wallet-address">
          Connected: <code>{address}</code>
        </div>
        <button className="btn-secondary" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  // Disconnected: show available connectors
  return (
    <div className="wallet-buttons">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={status === 'pending'}
          className="btn-primary"
        >
          Connect {connector.name}
        </button>
      ))}

      {status === 'pending' && (
        <p style={{ opacity: 0.6, marginTop: 4 }}>Waiting for Wallet…</p>
      )}

      {error && (
        <p style={{ color: 'salmon', marginTop: 4 }}>{error.message}</p>
      )}
    </div>
  );
}
