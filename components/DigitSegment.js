export default function DigitSegment({ segments = {} }) {
  // segments = { A: true, B: false, ... }

  return (
    <svg
      viewBox="0 0 60 100"
      className="digit-svg"
      preserveAspectRatio="none"
    >
      {/* A */}
      <rect
        className={`seg ${segments.A ? "on" : "off"}`}
        x="10" y="0" width="40" height="12" rx="3"
      />
      {/* B */}
      <rect
        className={`seg ${segments.B ? "on" : "off"}`}
        x="50" y="10" width="12" height="40" rx="3"
      />
      {/* C */}
      <rect
        className={`seg ${segments.C ? "on" : "off"}`}
        x="50" y="50" width="12" height="40" rx="3"
      />
      {/* D */}
      <rect
        className={`seg ${segments.D ? "on" : "off"}`}
        x="10" y="88" width="40" height="12" rx="3"
      />
      {/* E */}
      <rect
        className={`seg ${segments.E ? "on" : "off"}`}
        x="0"  y="50" width="12" height="40" rx="3"
      />
      {/* F */}
      <rect
        className={`seg ${segments.F ? "on" : "off"}`}
        x="0"  y="10" width="12" height="40" rx="3"
      />
      {/* G */}
      <rect
        className={`seg ${segments.G ? "on" : "off"}`}
        x="10" y="44" width="40" height="12" rx="3"
      />
    </svg>
  );
}
