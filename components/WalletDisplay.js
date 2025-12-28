import HardwareWalletButton from "./HardwareWalletButton";
import { useAccount, useConnect } from "wagmi";
import DigitSegment from "./DigitSegment";
import { segmentMap } from "./segmentMap";
import { useEffect, useState } from "react";

export default function WalletDisplay() {
  const { isConnected, address } = useAccount();
  const { status } = useConnect();

  //
  // -------- SEGMENT-ERSATZ (nur das Nötigste) ------------------
  //
  // Wichtig: nur Zeichen erzeugen, für die segmentMap Einträge hat!
  //
  function normalizeText(text) {
    return text
      .toUpperCase()
      .replace(/W/g, "UU")   // breites W → UU
      .replace(/M/g, "NN");  // optional: M → NN (nur, wenn N in segmentMap existiert)
  }

  //
  // -------- DISPLAY TEXT LOGIK --------------------------------
  //
  function getDisplayText() {
    if (status === "pending") return "CONNECTING...";
    if (!isConnected) return "CONNECT WALLET";

    if (address)
      return `CONNECTED ${address.slice(0, 6)}...${address.slice(-4)}`;

    return "CONNECTED";
  }

  const rawText = getDisplayText();
  const normalized = normalizeText(rawText);

  //
  // -------- SCROLLING MECHANIK --------------------------------
  //
  const SCROLL_SPEED = 300;     // ms pro Schritt
  const DISPLAY_WIDTH = 16;     // 16 Zeichen pro Zeile

  const [scrollIndex, setScrollIndex] = useState(0);

  // Scroll-Text mit kleinem Puffer am Ende
  const scrollText = normalized + "    ";

  useEffect(() => {
    // Bei neuem Text: zurücksetzen
    setScrollIndex(0);

    const interval = setInterval(() => {
      setScrollIndex((prev) =>
        prev + 1 < scrollText.length ? prev + 1 : 0
      );
    }, SCROLL_SPEED);

    return () => clearInterval(interval);
  }, [normalized, scrollText.length]);

  // Sichtbares „Fenster“ über 32 Zeichen (2×16)
  function getScrollWindow(text, start) {
    const padded = text.padEnd(32, " ");
    return [
      padded.slice(start, start + DISPLAY_WIDTH),
      padded.slice(start + DISPLAY_WIDTH, start + 2 * DISPLAY_WIDTH),
    ];
  }

  const [row1, row2] = getScrollWindow(scrollText, scrollIndex);

  //
  // -------- DIGIT RENDERING (7-Segment) ------------------------
  //
  function renderRow(rowText) {
    return [...rowText].map((char, i) => (
      <div key={i} className="digit">
        <DigitSegment segments={segmentMap[char] || segmentMap[" "]} />
      </div>
    ));
  }

  //
  // -------- LED STATUS ----------------------------------------
  //
  const ledState =
    isConnected
      ? "aqua"
      : status === "pending"
      ? "magenta chase"
      : "magenta";

  return (
    <div className="wallet-device">

      {/* Frontglas */}
      <div className="wallet-glass"></div>

      {/* Rahmen */}
      <img
        src="/wallec-connect-display.png"
        alt="wallet device"
        className="wallet-device-frame"
      />

      {/* LEDs links */}
      <div className="wallet-leds">
        <div className={`led led-1 ${ledState} ${ledState.includes("chase") ? "chase-1" : ""}`} />
        <div className={`led led-2 ${ledState} ${ledState.includes("chase") ? "chase-2" : ""}`} />
        <div className={`led led-3 ${ledState} ${ledState.includes("chase") ? "chase-3" : ""}`} />
        <div className={`led led-4 ${ledState} ${ledState.includes("chase") ? "chase-4" : ""}`} />
      </div>

      {/* DISPLAY MATRIX */}
      <div className="wallet-display">
        <div className="display-row row-1">{renderRow(row1)}</div>
        <div className="display-row row-2">{renderRow(row2)}</div>
      </div>

      {/* WALLET BUTTON */}
      <HardwareWalletButton />

    </div>
  );
}
