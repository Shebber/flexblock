"use client";

export default function VivamoBanner() {
  return (
    <div className="vivamo-banner">
      <video
        src="/vivamo-signature.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

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
      `}</style>
    </div>
  );
}
