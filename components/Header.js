import WalletDisplay from "./WalletDisplay";

export default function Header() {
  return (
    <header className="flexblock-header">
      <div className="header-inner">
        <div className="logo">FLEXBLOCK</div>

        {/* Wallet-Gerät oben rechts */}
        <WalletDisplay />
      </div>
    </header>
  );
}
