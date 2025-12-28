"use client";

export function FlexblockPrice({ apeAmount, eurPrice }) {
  return (
    <div>
      {apeAmount !== null ? (
        <>
          <p style={{ fontSize: "22px", fontWeight: 600 }}>
            {apeAmount} APE
          </p>
          <p className="sub">
            approx. {eurPrice} € (universe-wide shipping included)
          </p>
          <p className="sub">
            Chain oracle synced: {new Date().toLocaleTimeString()}
          </p>
        </>
      ) : (
        <p>Preis konnte nicht geladen werden.</p>
      )}
    </div>
  );
}

