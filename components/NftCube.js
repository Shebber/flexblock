"use client";

export default function NftCube({ image, backplateColor }) {
  if (!image) return null;

  const finalBackColor = backplateColor || '#111111';

  return (
    <div className="scene">
      <div className="block">
        <div className="face face--front"></div>
        <div className="face face--print"></div>
        <div className="face face--back"></div>
        
        <div className="face face--right"></div>
        <div className="face face--left"></div>
        <div className="face face--top"></div>
        <div className="face face--bottom"></div>
      </div>

      <style jsx>{`
        .scene {
          /* ----- CONFIG ----- */
          --cube-size: 300px;
          --cube-depth: 15px; 
          --back-color: ${finalBackColor};
          /* Helles, transparentes Acryl-Blau für die Kanten */
          --glass-tint: rgba(220, 240, 255, 0.1); 
          --glass-edge: rgba(255, 255, 255, 0.3);

          width: var(--cube-size);
          height: var(--cube-size);
          perspective: 1200px;
          margin: 0 auto;
        }

        .block {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          
          /* 🟢 HIER GEÄNDERT: Von 16s auf 10s für schnellere Rotation */
          animation: rotateBlock 10s infinite linear;
        }

        .face {
          position: absolute;
          box-sizing: border-box;
        }

        /* 1. VORDERSEITE (GLAS) */
        .face--front {
          width: var(--cube-size);
          height: var(--cube-size);
          transform: rotateY(0deg) translateZ(calc(var(--cube-depth) / 2));
          
          background-color: var(--glass-tint);
          background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%);
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: inset 0 0 15px rgba(255,255,255,0.1);
          opacity: 0.9;
        }

        /* 2. MITTE (DRUCK) */
        .face--print {
          width: var(--cube-size);
          height: var(--cube-size);
          transform: rotateY(0deg) translateZ(0px);
          
          background-image: url('${image}');
          background-size: cover;
          background-position: center;
          filter: brightness(1.0) contrast(1.05);
        }

        /* 3. RÜCKSEITE (FARBE) */
        .face--back {
          width: var(--cube-size);
          height: var(--cube-size);
          transform: rotateY(180deg) translateZ(calc(var(--cube-depth) / 2));
          
          background-color: var(--back-color);
          filter: brightness(0.6);
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* =========================================================
           4. KANTEN (Physikalisch korrekte Gradienten)
           ========================================================= */

        /* --- RECHTS --- */
        .face--right {
          width: var(--cube-depth);
          height: var(--cube-size);
          top: 0;
          left: calc((var(--cube-size) - var(--cube-depth)) / 2);
          transform: rotateY( 90deg) translateZ(calc(var(--cube-size) / 2));
          border-top: 1px solid rgba(255,255,255,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.2);

          /* Verlauf: Links (Vorne) -> Rechts (Hinten) */
          background: linear-gradient(to right, 
            var(--glass-edge) 0%, rgba(255,255,255,0.05) 45%, 
            var(--back-color) 50%, var(--back-color) 100%);
        }

        /* --- LINKS (Umgekehrt!) --- */
        .face--left {
          width: var(--cube-depth);
          height: var(--cube-size);
          top: 0;
          left: calc((var(--cube-size) - var(--cube-depth)) / 2);
          transform: rotateY(-90deg) translateZ(calc(var(--cube-size) / 2));
          border-top: 1px solid rgba(255,255,255,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.2);

          /* Verlauf: Rechts (Vorne) -> Links (Hinten) */
          background: linear-gradient(to left, 
            var(--glass-edge) 0%, rgba(255,255,255,0.05) 45%, 
            var(--back-color) 50%, var(--back-color) 100%);
        }

        /* --- UNTEN --- */
        .face--bottom {
          width: var(--cube-size);
          height: var(--cube-depth);
          left: 0;
          top: calc((var(--cube-size) - var(--cube-depth)) / 2);
          transform: rotateX(-90deg) translateZ(calc(var(--cube-size) / 2));
          border-left: 1px solid rgba(255,255,255,0.2);
          border-right: 1px solid rgba(255,255,255,0.2);

          /* Verlauf: Oben (Vorne) -> Unten (Hinten) */
          background: linear-gradient(to bottom, 
            var(--glass-edge) 0%, rgba(255,255,255,0.05) 45%, 
            var(--back-color) 50%, var(--back-color) 100%);
        }

        /* --- OBEN (Umgekehrt!) --- */
        .face--top {
          width: var(--cube-size);
          height: var(--cube-depth);
          left: 0;
          top: calc((var(--cube-size) - var(--cube-depth)) / 2);
          transform: rotateX( 90deg) translateZ(calc(var(--cube-size) / 2));
          border-left: 1px solid rgba(255,255,255,0.2);
          border-right: 1px solid rgba(255,255,255,0.2);

          /* Verlauf: Unten (Vorne) -> Oben (Hinten) */
          background: linear-gradient(to top, 
            var(--glass-edge) 0%, rgba(255,255,255,0.05) 45%, 
            var(--back-color) 50%, var(--back-color) 100%);
        }

        @keyframes rotateBlock {
          0% { transform: rotateX(-15deg) rotateY(0deg); }
          100% { transform: rotateX(-15deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}