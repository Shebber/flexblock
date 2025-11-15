'use client';
import { useState, useEffect } from 'react';
import WalletConnectButton from '../components/WalletConnectButton';
import PayButton from '../components/PayButton';
import { useAccount } from 'wagmi';

export default function Home() {
  /* --------------------------------------------------
     STATE
  -------------------------------------------------- */
  const [size, setSize] = useState(null);
  const [backplate, setBackplate] = useState(null);

  // NFT Check
  const [contract, setContract] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [ownerCheck, setOwnerCheck] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [nftImage, setNftImage] = useState(null);
  const [isOwnerValid, setIsOwnerValid] = useState(false);


// Wallet state
const { address, isConnected } = useAccount();


 // Shipping
const [shipName, setShipName] = useState('');
const [shipStreet, setShipStreet] = useState('');
const [shipZip, setShipZip] = useState('');
const [shipCountry, setShipCountry] = useState('');

// Check if shipping is complete
const shippingComplete =
  shipName.trim() !== '' &&
  shipStreet.trim() !== '' &&
  shipZip.trim() !== '' &&
  shipCountry.trim() !== '';


  /* --------------------------------------------------
     COLORS (20 Backplates)
  -------------------------------------------------- */
  const backplateColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Crimson', hex: '#d72638' },
    { name: 'Sunset', hex: '#ff6a00' },
    { name: 'Lemon', hex: '#ffdd00' },
    { name: 'Mint', hex: '#37d67a' },
    { name: 'Aqua', hex: '#1fb6ff' },
    { name: 'Azure', hex: '#0066ff' },
    { name: 'Indigo', hex: '#4b0082' },
    { name: 'Violet', hex: '#8e44ad' },
    { name: 'Magenta', hex: '#ff33cc' },
    { name: 'Grey', hex: '#888888' },
    { name: 'Stone', hex: '#aaaaaa' },
    { name: 'Slate', hex: '#556270' },
    { name: 'Forest', hex: '#0b6623' },
    { name: 'Sand', hex: '#d7b98c' },
    { name: 'Rose', hex: '#e7a1b0' },
    { name: 'Sky', hex: '#87ceeb' },
    { name: 'Ocean', hex: '#005f73' },
    { name: 'Copper', hex: '#b87333' },
  ];

/* --------------------------------------------------
   NFT Ownership Check
-------------------------------------------------- */
async function verifyOwnership() {
  setChecking(true);
  setOwnerCheck(null);
  setError('');
  setIsOwnerValid(false);
  setNftImage(null);

  try {
    const res = await fetch('/api/checkOwner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contract, tokenId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');

    const owner = data.owner;
    if (!address) {
      setError('Please connect your wallet first.');
      return;
    }

    // 🔥 Compare connected wallet with on-chain owner
    if (owner.toLowerCase() !== address.toLowerCase()) {
      setError('You do not own this NFT.');
      setIsOwnerValid(false);
      return;
    }

    // Ownership is valid
    setOwnerCheck({ owner });
    setIsOwnerValid(true);

    // Fetch metadata
    try {
      const metaRes = await fetch('/api/fetchMetadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract, tokenId }),
      });

      const meta = await metaRes.json();
      if (meta.image) setNftImage(meta.image);
    } catch (e) {
      console.error('Metadata fetch failed:', e);
    }

  } catch (e) {
    setError(e.message);
  } finally {
    setChecking(false);
  }
}

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <>
      {/* --------------------------------------------------
          HEADER / TOPBAR
      -------------------------------------------------- */}
      <div className="topbar glass">
  <div className="header-left">
    <img src="/logo.svg" className="logo-flexblock glow" alt="Flexblock" />

    <div className="chain-tag">
  <img src="/apelogo.svg" className="chain-icon" alt="ApeChain" />
  <span>ApeChain</span>
</div>

  </div>

  <div className="header-right">
    <div className="powered-wrap">
      <span className="powered-label">powered by</span>
      <a href="https://www.vivamo.de" target="_blank" rel="noopener noreferrer">
  <img src="/vivamo.svg" className="logo-vivamo" alt="vivamo" />
</a>

    </div>
  </div>
</div>

<section className="hero">

  <div className="hero-inner">

    <div className="hero-content">
      <h1>Bring your NFT<br />to life.</h1>

      <p>
        Premium acrylic wall art with integrated NFC linking to your digital collectible.
      </p>

      <a href="#builder" className="hero-btn">Build your Flexblock</a>
    </div>

  </div>

  {/* HERO IMAGE FIXED RIGHT */}
  <div className="hero-img-fixed">
    <img src="/hero-hop.jpg" alt="Flexblock Hero" />
  </div>

</section>

<section className="filmstrip">
  <div className="filmstrip-track">
    {/* Bildset 1 */}
    <img src="/gallery/1.jpg" />
    <img src="/gallery/2.jpg" />
    <img src="/gallery/3.jpg" />
    <img src="/gallery/4.jpg" />
    <img src="/gallery/5.jpg" />
    <img src="/gallery/6.jpg" />

    {/* Bildset 2 – identisch für Loop-Effekt */}
    <img src="/gallery/1.jpg" />
    <img src="/gallery/2.jpg" />
    <img src="/gallery/3.jpg" />
    <img src="/gallery/4.jpg" />
    <img src="/gallery/5.jpg" />
    <img src="/gallery/6.jpg" />
  </div>
</section>



      {/* --------------------------------------------------
    STEP 1: SELECT SIZE
-------------------------------------------------- */}
<section className="size-section" id="builder">
  <h2>Select your size</h2>

  <p className="sub size-description">
  <strong>Wall-mounted acrylic artwork based on your NFT.</strong><br/>
  Premium UV print on 5mm crystal-clear acrylic with white & blockout layer.<br/>
  Includes custom 3mm acrylic backplate, designed to generate a soft glow effect<br/>
  on white walls.  Comes with a fully embedded NFC tag inside the piece,<br/>
  enabling direct scan-to-web interaction when mounted. Wall mount kit attached.
</p>

<p className="sub size-table">
  XC30 — 300×300 mm<br/>
  XC60 — 600×600 mm<br/>
  XC90 — 900×900 mm
</p>


  <div className="size-grid">

    {/* XC30 */}
    <div
  className={`size-card ${size === 'XC30' ? 'selected' : ''}`}
  onClick={() => setSize('XC30')}
>
  <div className="size-line">
    <img src="/icon.svg" className="size-icon" />
    <span className="size-number">30</span>
  </div>

  <div className="size-price-group">
    <span className="old-price">89 €</span>
    <span className="new-price">49 €</span>
  </div>
</div>


    {/* XC60 */}
    <div className="size-card" onClick={() => setSize('XC60')}>
  <div className="size-line">
    <img src="/icon.svg" className="size-icon" />
    <span className="size-number">60</span>
  </div>
  <div className="size-price">249 €</div>
</div>

    {/* XC90 */}
    <div className="size-card" onClick={() => setSize('XC90')}>
  <div className="size-line">
    <img src="/icon.svg" className="size-icon" />
    <span className="size-number">90</span>
  </div>
  <div className="size-price">499 €</div>
</div>

  </div>
</section>


      {/* --------------------------------------------------
          STEP 2: BACKPLATE COLORS
      -------------------------------------------------- */}
      {size && (
        <section className="backplate-section">
          <h2>Select backplate color</h2>
          <p className="sub">Match your NFT’s color palette.</p>

          <div className="color-grid">
            {backplateColors.map((c) => (
              <div
                key={c.hex}
                className={`color-swatch ${backplate === c.hex ? 'selected' : ''}`}
                onClick={() => setBackplate(c.hex)}
                style={{ backgroundColor: c.hex }}
              >
                <span className="color-label">{c.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

{/* --------------------------------------------------
      STEP 3: WALLET CONNECT
-------------------------------------------------- */}
{size && backplate && (
  <div className="container">
    <div className="card">
      <h3>Wallet</h3>
      <p className="sub">Connect your wallet to verify NFT ownership.</p>

      <WalletConnectButton />
    </div>
  </div>
)}



{/* --------------------------------------------------
      STEP 4: NFT OWNER CHECK
-------------------------------------------------- */}
{size && backplate && isConnected && (
  <div className="container">
    <div className="card">
      <h3>NFT Ownership Check</h3>
      <p className="sub">Verify that you own the NFT you want to print.</p>

      <div className="row">
        <input
          placeholder="ERC-721 contract (0x…)"
          style={{ flex: 1 }}
          value={contract}
          onChange={(e) => setContract(e.target.value)}
        />
        <input
          placeholder="Token ID"
          style={{ width: 120 }}
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <button
          disabled={!isConnected || checking || !contract || !tokenId}
          onClick={verifyOwnership}
        >
          {checking ? 'Checking…' : 'Verify'}
        </button>
      </div>

      {error && <p style={{ color: 'salmon' }}>{error}</p>}

      {isOwnerValid && nftImage && (
        <div className="verify-row">
          <img
            src={nftImage}
            alt="NFT Preview"
            style={{
              width: '260px',
              borderRadius: '14px',
              border: '1px solid #222',
              boxShadow: '0 0 18px #00e5ff30'
            }}
          />

          <div className="verified-badge">✓ VERIFIED</div>
        </div>
      )}
    </div>
  </div>
)}



{/* --------------------------------------------------
      STEP 5: SHIPPING
-------------------------------------------------- */}
{size && backplate && isConnected && isOwnerValid && (
  <div className="container">
    <div className="card">
      <h3>Shipping Address</h3>
      <p className="sub">We need this to ship your Flexblock.</p>

      <div className="form-grid">
        <input
          placeholder="Full name"
          value={shipName}
          onChange={(e) => setShipName(e.target.value)}
        />
        <input
          placeholder="Street + house number"
          value={shipStreet}
          onChange={(e) => setShipStreet(e.target.value)}
        />
        <input
          placeholder="ZIP / City"
          value={shipZip}
          onChange={(e) => setShipZip(e.target.value)}
        />
        <input
          placeholder="Country"
          value={shipCountry}
          onChange={(e) => setShipCountry(e.target.value)}
        />
      </div>
    </div>
  </div>
)}



{/* --------------------------------------------------
      STEP 6: PAYMENT
-------------------------------------------------- */}
{size && backplate && isConnected && isOwnerValid &&
 shipName && shipStreet && shipZip && shipCountry && (
  <div className="container">
    <div className="card">
      <h3>Payment</h3>
      <p className="sub">Send APE to complete your order.</p>

      <PayButton
        recipient={process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS}
      />
    </div>
  </div>
)}


      {/* --------------------------------------------------
          FOOTER
      -------------------------------------------------- */}
      <footer className="footer">
        
        <p>© {new Date().getFullYear()} Flexblock · All rights reserved.</p>

        <div className="footer-nav">
  <a href="/imprint">Imprint</a>
  <a href="/privacy">Privacy</a>
  <a href="/terms">Terms</a>
</div>

      </footer>
    </>
  );
}
