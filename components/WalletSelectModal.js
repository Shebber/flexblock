'use client';

export default function WalletSelectModal({ isOpen, onClose, onMetaMask, onWalletConnect }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Connect Wallet</h2>

        <p style={styles.subtitle}>
          Choose one of the available wallet options to continue.
        </p>

        <button style={styles.button} onClick={onMetaMask}>
          <span style={styles.icon}>🦊</span>
          MetaMask
        </button>

        <button style={styles.button} onClick={onWalletConnect}>
          <span style={styles.icon}>🔗</span>
          WalletConnect
        </button>

        <button style={styles.close} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.72)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.25s ease-out',
  },
  modal: {
    background: 'rgba(10,10,10,0.92)',
    borderRadius: 20,
    padding: '32px 24px',
    width: '92%',
    maxWidth: 420,
    border: '1px solid rgba(0,255,255,0.15)',
    boxShadow: `
      0 0 20px rgba(0,255,255,0.12),
      0 0 40px rgba(0,255,255,0.05)
    `,
    animation: 'scaleIn 0.25s ease-out',
    transformOrigin: 'center',
  },
  title: {
    fontSize: 26,
    marginBottom: 8,
    fontWeight: 600,
    color: '#e5f9ff',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 22,
    fontSize: 14,
    color: '#a0c5cc',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    padding: '14px 18px',
    background: 'linear-gradient(135deg, #0e0e0e 0%, #151515 100%)',
    border: '1px solid rgba(0,255,255,0.25)',
    borderRadius: 14,
    marginBottom: 12,
    fontSize: 17,
    cursor: 'pointer',
    color: '#e6feff',
    transition: 'all 0.18s ease-out',
  },
  icon: {
    fontSize: 20,
  },
  close: {
    width: '100%',
    marginTop: 8,
    padding: '8px',
    color: '#7e9ea8',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    opacity: 0.6,
  },
};
