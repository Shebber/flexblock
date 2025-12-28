// utils/orderId.js

// Erzeugt eine nicht-sequenzielle, aber lesbare Order-ID z.B.:
// FLX-241122-9XK7QF
export function generateOrderId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ohne 0,1,I,O
  let randomPart = '';

  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * alphabet.length);
    randomPart += alphabet[idx];
  }

  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  return `FLX-${yy}${mm}${dd}-${randomPart}`;
}
