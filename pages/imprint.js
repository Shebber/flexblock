export default function Imprint() {
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
      }}>Imprint</h1>

      <p style={{ opacity: 0.8 }}>
        This page contains the legally required imprint information for Flexblock by Vivamo GmbH.
      </p>

      <hr style={{ margin: '30px 0', borderColor: '#222' }} />

      <p><strong>Company:</strong><br />Vivamo GmbH</p>
      <p><strong>Address:</strong><br />Herner Str.299, 44809 Bochum, Germany</p>
      <p><strong>Contact:</strong><br />seb@vivamo.de</p>

      <p style={{ marginTop: 40, opacity: 0.7 }}>
        For any legal inquiries, please contact us via the email above.
      </p>
    </div>
  );
}
