import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import HardwareWalletButton from "./HardwareWalletButton";
import Digit14Segment from "./Digit14Segment";
import { segment14Map } from "./segment14Map";

// M und N sind hier wichtig für die neuen Diagonalen
const SEG_KEYS = ["A","B","C","E","F","G1","G2","I1","I2","J","K","L","M","N"];

// Chains, die im "Attract Mode" durchlaufen
const DEMO_CHAINS = [
  "ETHEREUM", "BASE", "POLYGON", "APECHAIN", 
  "BLAST", "ZORA", "BERACHAIN", "SOMNIA", 
  "ABSTRACT", "OPTIMISM", "ARBITRUM", "MONAD"
];

function pad16(s) {
  return (s || "").toUpperCase().padEnd(16, " ").slice(0, 16);
}

// Zentriert Text auf 16 Zeichen (für den Demo Mode)
function center16(text) {
  const s = (text || "").toUpperCase();
  if (s.length >= 16) return s.slice(0, 16);
  
  const totalPad = 16 - s.length;
  const leftPad = Math.floor(totalPad / 2);
  const rightPad = totalPad - leftPad;
  
  return " ".repeat(leftPad) + s + " ".repeat(rightPad);
}

function normalizeSeg(raw) {
  const r = raw || segment14Map[" "];
  return {
    ...r,
    J: r.J || r.D || 0,
    G1: r.G1 || r.H || 0,
    G2: r.G2 || r.H || 0,
    I1: r.I1 || r.I || 0,
    I2: r.I2 || r.I || 0,
    // 🟢 Neue Diagonalen durchreichen
    M: r.M || 0, 
    N: r.N || 0
  };
}

export default function WalletDisplay14() {
  const { status: accountStatus, address } = useAccount(); 

  // ✅ Stabiler Status für „Hardware-Farbe“
  const hwOnline = useMemo(() => {
    const hasAddr = !!address;
    if (accountStatus === "connected") return true;
    if ((accountStatus === "reconnecting" || accountStatus === "connecting") && hasAddr) return true;
    return false;
  }, [accountStatus, address]);

  const hwColor = hwOnline ? "aqua" : "magenta";

  // ------------------ Demo Mode (Chain Rotation) ------------------
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    // Läuft nur, wenn NICHT verbunden
    if (hwOnline) return;

    const t = setInterval(() => {
      setDemoIndex((prev) => (prev + 1) % DEMO_CHAINS.length);
    }, 2000); // Alle 2 Sekunden nächste Chain

    return () => clearInterval(t);
  }, [hwOnline]);

  // ------------------ Bottom row: address scroll then mask ------------------
  const [addrMode, setAddrMode] = useState("idle"); // idle | scrolling | masked
  const [addrOffset, setAddrOffset] = useState(0);

  const fullAddr = useMemo(() => {
    if (!address) return "";
    return address.toUpperCase().replace(/^0X/, "");
  }, [address]);

  useEffect(() => {
    if (!hwOnline || !fullAddr) {
      setAddrMode("idle");
      setAddrOffset(0);
      return;
    }
    setAddrMode("scrolling");
    setAddrOffset(0);
  }, [hwOnline, fullAddr]);

  useEffect(() => {
    if (addrMode !== "scrolling") return;

    const text = fullAddr;
    const maxOffset = Math.max(0, text.length - 16);

    const t = setInterval(() => {
      setAddrOffset((o) => {
        if (o >= maxOffset) {
          clearInterval(t);
          setAddrMode("masked");
          return maxOffset;
        }
        return o + 1;
      });
    }, 400);

    return () => clearInterval(t);
  }, [addrMode, fullAddr]);

  // 🟢 Neue Logik für Bottom Row: Demo vs. Scroll vs. Masked
  const bottomRow = useMemo(() => {
    // 1. Nicht verbunden -> Zeige Chains (Zentriert)
    if (!hwOnline || !fullAddr) {
      return center16(DEMO_CHAINS[demoIndex]);
    }
    // 2. Verbunden -> Scrolling
    if (addrMode === "scrolling") {
      const win = fullAddr.slice(addrOffset, addrOffset + 16);
      return pad16(win);
    }
    // 3. Verbunden -> Maskiert
    const last10 = fullAddr.slice(-10);
    return pad16(`XXX${last10}`);
  }, [hwOnline, fullAddr, addrMode, addrOffset, demoIndex]);

  // ------------------ Top row: “AI greeting/status” ------------------
  const LINES = useMemo(() => ([
    "WELCOME BACK",
    "SYSTEM READY",
    "SYNC COMPLETE",
    "AUTH REQUIRED",
    "HELLO HUMAN",
    "NICE TO SEE U",
    "LINK YOUR WALLET",
    "VERIFYING NODE",
    "LOADING MODULES",
    "DON'T PANIC :)",
  ]), []);

  const [topText, setTopText] = useState("CONNECT WALLET");

  useEffect(() => {
    if (accountStatus === "connecting") {
      setTopText("CONNECTING...");
      return;
    }
    if (accountStatus === "reconnecting") {
      setTopText("RECONNECTING...");
      return;
    }
    if (!hwOnline) {
      setTopText("CONNECT WALLET");
      return;
    }

    setTopText("ACCESS GRANTED");
    const t = setInterval(() => {
      const pick = LINES[Math.floor(Math.random() * LINES.length)];
      setTopText(pick);
    }, 4500);

    return () => clearInterval(t);
  }, [accountStatus, hwOnline, LINES]);

  const topRow = useMemo(() => pad16(topText), [topText]);

  // ------------------ FX engine V2 (High Energy) ------------------
  const [tick, setTick] = useState(0);
  useEffect(() => {
    // 🟢 Schnellerer Tick für flüssigere Animationen (75ms)
    const t = setInterval(() => setTick((x) => x + 1), 75);
    return () => clearInterval(t);
  }, []);

  const fxByIndex = useMemo(() => {
    const magenta = new Map();
    const weak = new Map();
    const flicker = new Map();
    const forceOn = new Map();
    const forceOff = new Map();

    const addFx = (map, idx, key) => {
      if (!map.has(idx)) map.set(idx, new Set());
      map.get(idx).add(key);
    };

    // 1. THE SWEEP (Scanner-Effekt von links nach rechts)
    const scanPos = tick % 40; // 32 Digits + Pause
    if (scanPos < 32) {
      // Der Scanner lässt Segmente kurz aufleuchten
      addFx(magenta, scanPos, "A");
      addFx(magenta, scanPos, "J"); 
      // Kleiner "Schweif"
      if (scanPos > 0) addFx(weak, scanPos - 1, "G1");
    }

    // 2. CHAOS BURST (Zufällige "Kurzschlüsse")
    const isBurst = (tick % 37) === 0 || Math.random() < 0.02;
    const glitchCount = isBurst ? Math.floor(Math.random() * 12) + 4 : 1;

    for (let i = 0; i < glitchCount; i++) {
      const idx = Math.floor(Math.random() * 32);
      const key = SEG_KEYS[Math.floor(Math.random() * SEG_KEYS.length)];
      const type = Math.random();

      if (type < 0.3) {
        addFx(flicker, idx, key);
      } else if (type < 0.5) {
        addFx(weak, idx, key);
      } else if (type < 0.7) {
        addFx(magenta, idx, key);
      } else if (type < 0.85) {
        addFx(forceOn, idx, key); // Ghost segments
      } else {
        addFx(forceOff, idx, key); // Dead segments
      }
    }

    const getFx = (i) => ({
      magenta: magenta.get(i) || new Set(),
      weak: weak.get(i) || new Set(),
      flicker: flicker.get(i) || new Set(),
      forceOn: forceOn.get(i) || new Set(),
      forceOff: forceOff.get(i) || new Set(),
    });

    return { getFx };
  }, [tick]);

  function renderRow(rowText, rowIndex) {
    return [...rowText].map((char, i) => {
      const raw = segment14Map[char] || segment14Map[" "];
      const seg = normalizeSeg(raw);

      const globalIndex = rowIndex * 16 + i;
      const fx = fxByIndex.getFx(globalIndex);

      return (
        <div key={i} className="digit">
          <Digit14Segment seg={seg} fx={fx} />
        </div>
      );
    });
  }

  return (
    <div className={`wallet-device ${hwOnline ? "connected" : "disconnected"} status-${accountStatus}`}>
      <div className="wallet-glass"></div>

      <img
        src="/wallec-connect-display.png"
        alt="wallet device"
        className="wallet-device-frame"
      />

      {/* LEDs */}
      <div className={`wallet-leds led-run ${hwOnline ? "" : "led-hyper"}`}>
        <div className={`led led-1 ${hwColor}`} />
        <div className={`led led-2 ${hwColor}`} />
        <div className={`led led-3 ${hwColor}`} />
        <div className={`led led-4 ${hwColor}`} />
      </div>

      <div className="wallet-display">
        <div className="display-row row-1">{renderRow(topRow, 0)}</div>
        <div className="display-row row-2">{renderRow(bottomRow, 1)}</div>
      </div>

      <HardwareWalletButton />
    </div>
  );
}