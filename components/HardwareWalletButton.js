'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function HardwareWalletButton() {
  const { isConnected } = useAccount();
  const { connect, connectors, status } = useConnect();
  const { disconnect } = useDisconnect();

  // ersten Connector auswählen, der bereit ist
  const connector = connectors?.find(c => c.ready) || connectors?.[0];

  const handleClick = () => {
    if (!isConnected) {
      if (connector) connect({ connector });
    } else {
      disconnect();
    }
  };

  // STATUSSTEUERUNG FÜR STYLING
  let cls = "wallet-button ";

  if (status === "pending") {
    cls += "magenta pulse";       // beim Verbinden pulsierend
  } else if (isConnected) {
    cls += "aqua";                // verbunden → aqua
  } else {
    cls += "magenta";             // getrennt → magenta
  }

  return <button className={cls} onClick={handleClick}></button>;
}
