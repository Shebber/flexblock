export default function Privacy() {
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
      }}>Privacy Policy</h1>

      <p style={{ opacity: 0.8 }}>
        This privacy policy explains how Flexblock collects, uses, and protects your data.
      </p>

      <hr style={{ margin: '30px 0', borderColor: '#222' }} />

      <h3>1. Data Collection</h3>
      <p>We only collect data required for order processing and customer support.</p>

      <h3>2. Third-Party Services</h3>
      <p>Some data may be processed through secure third-party providers (e.g. payment services).</p>

      <h3>3. Contact</h3>
      <p>If you have questions about your data, contact: privacy@vivamo.de</p>

      <p style={{ marginTop: 40, opacity: 0.7 }}>
        Updated: {new Date().getFullYear()}
      </p>
    </div>
  );
}
