export default function Digit14Segment({ seg = {}, fx = {} }) {
  // fx helper logic bleibt gleich...
  const state = (k) => {
    if (fx.forceOff?.has(k)) return "off";
    if (fx.forceOn?.has(k)) return "on";
    return seg?.[k] ? "on" : "off";
  };

  const cls = (k) => {
    const s = state(k);
    const m = fx.magenta?.has(k) ? "magenta" : "";
    const w = fx.weak?.has(k) ? "weak" : "";
    const f = fx.flicker?.has(k) ? "flicker" : "";
    return `seg ${s} ${m} ${w} ${f}`.trim();
  };

  return (
    <svg viewBox="0 0 18 26" className="digit-svg" xmlns="http://www.w3.org/2000/svg">
      {/* --- AUSSENRAHMEN --- */}
      {/* A (Top) */}
      <rect className={cls("A")} x="4" y="1" width="10" height="3" rx="1.5" />

      {/* F (Top Left) & E (Bottom Left) */}
      <rect className={cls("F")} x="2" y="3" width="3" height="9" rx="1.5" />
      <rect className={cls("E")} x="2" y="14" width="3" height="9" rx="1.5" />

      {/* B (Top Right) & C (Bottom Right) */}
      <rect className={cls("B")} x="13" y="3" width="3" height="9" rx="1.5" />
      <rect className={cls("C")} x="13" y="14" width="3" height="9" rx="1.5" />

      {/* J (Bottom - im Map oft D genannt, hier J) */}
      <rect className={cls("J")} x="4" y="22" width="10" height="3" rx="1.5" />


      {/* --- MITTEL-VERTIKALE & HORIZONTALE --- */}
      
      {/* G1/G2 (Middle Horizontal Split) */}
      <rect className={cls("G1")} x="4" y="11" width="5" height="3" rx="1.5" />
      <rect className={cls("G2")} x="9" y="11" width="5" height="3" rx="1.5" />

      {/* I1/I2 (Center Vertical Split) */}
      <rect className={cls("I1")} x="8" y="3" width="2" height="8" rx="1" />
      <rect className={cls("I2")} x="8" y="15" width="2" height="8" rx="1" />


      {/* --- DIAGONALEN --- */}

      {/* M (Top Left Diag) - NEU! */}
      <polygon className={cls("M")} points="5,4 7,4 12,10 10,12" />
      
      {/* N (Top Right Diag) - NEU! */}
      <polygon className={cls("N")} points="13,4 11,4 6,10 8,12" />

      {/* K (Bottom Left Diag) */}
      <polygon className={cls("K")} points="4,14 7,12 12,18 9,20" />
      
      {/* L (Bottom Right Diag) */}
      <polygon className={cls("L")} points="6,14 9,12 14,18 11,20" />
    </svg>
  );
}