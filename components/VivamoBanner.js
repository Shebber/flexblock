"use client";

export default function VivamoBanner() {
  return (
    <div className="vivamo-banner">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/vivamo-signature-poster.jpg"
      >
        <source src="/vivamo-signature.mp4" type="video/mp4" />
      </video>

      <style jsx>{`
        .vivamo-banner {
          position: absolute;
          top: 40px;
          right: 40px;
          width: 260px;
          height: 440px;
          border-radius: 20px;
          overflow: hidden;
          z-index: 10;
          box-shadow: 0 0 30px #00e5ff33;
        }

        .vivamo-banner video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Mobile: etwas kleiner + sicher im Viewport */
        @media (max-width: 600px) {
          .vivamo-banner {
            top: 16px;
            right: 16px;
            width: 180px;
            height: 300px;
            border-radius: 16px;
            box-shadow: 0 0 20px #00e5ff22;
          }
        }
      `}</style>
    </div>
  );
}
