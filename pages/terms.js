export default function Terms() {
  return (
    <div style={{
      maxWidth: '820px',
      margin: '80px auto',
      padding: '0 24px 80px',
      lineHeight: 1.6,
      color: '#eaeaea',
      fontFamily: 'ui-sans-serif, system-ui',
    }}>
      <h1 style={{
        fontSize: '38px',
        marginBottom: '20px',
        letterSpacing: '-0.5px',
      }}>Terms & Conditions</h1>

      <p style={{ opacity: 0.8 }}>
        These terms govern the purchase of physical Flexblock pieces and related services.
      </p>

      <hr style={{ margin: '30px 0', borderColor: '#222' }} />

      <h3>1. Orders</h3>
      <p>All orders require successful NFT ownership verification and payment.</p>

      <h3>2. Shipping</h3>
      <p>Shipping times depend on production volume and destination.</p>

      <h3>3. Returns</h3>
      <p>Custom NFT prints cannot be returned unless defective.</p>

      <p style={{ marginTop: 40, opacity: 0.7 }}>
        Updated: {new Date().getFullYear()}
      </p>
    </div>
  );
}
