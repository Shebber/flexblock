"use client";

import { useEffect } from "react";

export default function Toast({ message, onClose, duration = 2600 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className="toast-box">
      {message}

      <style jsx>{`
        .toast-box {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(20, 20, 20, 0.92);
          color: white;
          padding: 14px 22px;
          border-radius: 12px;
          border: 1px solid rgba(94, 234, 212, 0.4);
          backdrop-filter: blur(6px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.35);
          z-index: 20000;
          font-size: 15px;
          animation: fadeIn 0.25s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
