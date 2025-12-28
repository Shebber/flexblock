"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function WalletStatus({ ui = "full", onActions }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  const [open, setOpen] = useState(false);

  function mask(addr) {
    return addr ? addr.slice(0, 6) + "…" + addr.slice(-4) : "";
  }

  // 🔑 LOGIC EXPORT (für WalletDisplay14)
  useEffect(() => {
    if (!onActions) return;

    onActions({
      address,
      isConnected,
      connect,
      connectors,
      disconnect,
    });
  }, [onActions, address, isConnected, connect, connectors, disconnect]);

  // 🧠 LOGIC-ONLY MODE → KEINE UI
  if (ui === "none") return null;

  const style = {
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    border: "1px solid",
    userSelect: "none",
  };

  // ----------------------------------------
  // 🔴 DISCONNECTED (UI MODE)
  // ----------------------------------------
  if (!isConnected) {
    return (
      <div style={{ position: "relative" }}>
        <div
          onClick={() => setOpen(!open)}
          style={{
            ...style,
            color: "#ff6b6b",
            borderColor: "#ff6b6b",
          }}
        >
          Connect Wallet
        </div>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: 0,
              minWidth: "200px",
              background: "#0f1317",
              border: "1px solid #2a323a",
              borderRadius: "10px",
              padding: "10px",
              zIndex: 999,
            }}
          >
            {connectors.map((c) => {
              const name = c.name;
              if (
                !["MetaMask", "Rabby", "Coinbase Wallet", "WalletConnect"].includes(
                  name
                )
              )
                return null;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    connect({ connector: c });
                    setOpen(false);
                  }}
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    color: "#e6e9ee",
                  }}
                >
                  {name}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------
  // 🟢 CONNECTED (UI MODE)
  // ----------------------------------------
  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          ...style,
          color: "#37d67a",
          borderColor: "#37d67a",
        }}
      >
        {mask(address)}
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: 0,
            background: "#0f1317",
            border: "1px solid #2a323a",
            borderRadius: "10px",
            padding: "10px",
            minWidth: "200px",
            zIndex: 999,
          }}
        >
          <div
            style={{
              padding: "8px",
              cursor: "pointer",
              borderRadius: "6px",
              color: "#ff6b6b",
            }}
            onClick={() => disconnect()}
          >
            Disconnect
          </div>
        </div>
      )}
    </div>
  );
}

