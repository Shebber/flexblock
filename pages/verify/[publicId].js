import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { publicId } = context.params;

  const order = await prisma.order.findUnique({
    where: { publicId },
  });

  if (!order) {
    return { props: { found: false, publicId } };
  }

  return {
    props: {
      found: true,
      order: JSON.parse(JSON.stringify(order)),
      publicId,
    },
  };
}

export default function VerifyPage({ found, order, publicId }) {
  if (!found) {
    return (
      <div className="verify-page">
        <header className="verify-head">
          <h1 className="verify-title">Flexblock Verification</h1>
          <p className="verify-sub">No record found for this NFC tag.</p>
        </header>

        <div className="verify-card verify-card--danger">
          <h2 className="verify-h2">Invalid / Unknown Flexblock</h2>
          <p className="verify-p">This Flexblock has no registered production record.</p>
        </div>
      </div>
    );
  }

  const explorer = order.txHash
    ? `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${order.txHash}`
    : null;

  return (
    <div className="verify-page">
      <header className="verify-head">
        <h1 className="verify-title">Flexblock Verification</h1>
        <p className="verify-sub">Authenticity Record for NFC ID {publicId}</p>
      </header>

      <div className="verify-badge">
        <span className="verify-badge__dot">✓</span>
        Authentic Flexblock
      </div>

      <div className="verify-grid">
        {/* NFT */}
        <section className="verify-card">
          <h2 className="verify-h2">NFT</h2>

          {order.nftImage && (
            <div className="verify-nft">
              <img src={order.nftImage} alt="NFT" className="verify-nft__img" />
            </div>
          )}

          <p className="verify-p"><strong>Contract:</strong> {order.nftContract}</p>
          <p className="verify-p"><strong>Token:</strong> {order.nftTokenId}</p>
        </section>

        {/* Order */}
        <section className="verify-card">
          <h2 className="verify-h2">Order Details</h2>

          <p className="verify-p"><strong>Order ID:</strong> {order.orderId}</p>
          <p className="verify-p"><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p className="verify-p"><strong>ETH Paid:</strong> {order.ethAmount?.toString?.() ?? String(order.ethAmount)}</p>
          <p className="verify-p"><strong>Backplate:</strong> {order.backplate}</p>
          <p className="verify-p"><strong>Wallet:</strong> {order.wallet}</p>

          {explorer && (
            <p className="verify-p">
              <strong>Transaction:</strong>{" "}
              <a href={explorer} className="verify-link" target="_blank" rel="noreferrer">
                {order.txHash.slice(0, 12)}…
              </a>
            </p>
          )}
        </section>

        {/* Shipping (full width) */}
        <section className="verify-card verify-card--wide">
          <h2 className="verify-h2">Shipping</h2>

          {order.status === "paid" && <span className="verify-pill verify-pill--warn">In Production</span>}
          {order.status === "shipped" && <span className="verify-pill verify-pill--ok">Shipped</span>}

          {order.status === "shipped" && order.trackingUrl && (
            <p className="verify-p" style={{ marginTop: 10 }}>
              <strong>Tracking:</strong>{" "}
              <a href={order.trackingUrl} className="verify-link" target="_blank" rel="noopener noreferrer">
                {order.trackingUrl}
              </a>
            </p>
          )}

          <div className="verify-addr">
            <strong>Recipient:</strong><br />
            {order.shipName}<br />
            {order.shipStreet}<br />
            {order.shipZip} – {order.shipCountry}
          </div>
        </section>
      </div>

      <p className="verify-footer">© {new Date().getFullYear()} Flexblock</p>
    </div>
  );
}
