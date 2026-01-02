'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function HardwareWalletButton() {
  const { isConnected } = useAccount();
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);


  const list = useMemo(() => {
    const arr = Array.isArray(connectors) ? connectors : [];

    // 1) Dedupe by id
    const byId = [];
    const seen = new Set();
    for (const c of arr) {
      if (!c?.id) continue;
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      byId.push(c);
    }

    // 2) Prefer order
    const pick = (id) => byId.find((c) => c.id === id);
    const preferred = [
      pick('walletConnect'),
      pick('metaMask'),
      pick('injected'),
    ].filter(Boolean);

    const merged = [...preferred, ...byId.filter((c) => !preferred.includes(c))];

    // 3) Dedupe MetaMask by name (falls zwei Connectoren beide "MetaMask" heißen)
    const out = [];
    let hasMetaMaskName = false;
    for (const c of merged) {
      if (c?.name === 'MetaMask') {
        if (hasMetaMaskName) continue;
        hasMetaMaskName = true;
      }
      out.push(c);
    }

    return out;
  }, [connectors]);

  const handleMainClick = () => {
    if (isConnected) disconnect();
    else setOpen(true);
  };

  // Dein bestehendes Styling bleibt
  let cls = 'wallet-button ';
  if (status === 'pending') cls += 'magenta pulse';
  else if (isConnected) cls += 'aqua';
  else cls += 'magenta';

  const modal = open && !isConnected ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2147483647, // wirklich ganz oben
        pointerEvents: 'auto',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          background: '#12161b',
          padding: 16,
          borderRadius: 14,
          minWidth: 280,
          boxShadow: '0 18px 60px rgba(0,0,0,.55)',
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: 10, opacity: 0.85 }}>Wallet wählen</div>

        {list.map((c) => {
          // MetaMask kann "not ready" sein, wenn nicht installiert
          const disabled = (c.id === 'metaMask' && !c.ready);

          return (
            <button
              key={c.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                connect({ connector: c });
              }}
              style={{
                width: '100%',
                padding: 10,
                marginBottom: 8,
                borderRadius: 10,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                pointerEvents: 'auto',
              }}
            >
              {c.name}{disabled ? ' (nicht installiert)' : ''}
            </button>
          );
        })}

        {error?.message && (
          <div style={{ marginTop: 10, opacity: 0.85, fontSize: 12 }}>
            {error.message}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button className={cls} type="button" onClick={handleMainClick}></button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
