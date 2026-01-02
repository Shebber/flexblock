// lib/productionSig.js
import crypto from "crypto";

export function signProduction({ orderId, publicId, sigTs }) {
  const secret = process.env.PRODUCTION_SIG_SECRET;
  if (!secret) throw new Error("Missing PRODUCTION_SIG_SECRET");

  const payload = `${String(orderId)}|${String(publicId)}|${String(sigTs)}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyProduction({ orderId, publicId, sigTs, sig }) {
  if (!orderId || !publicId || !sigTs || !sig) return false;

  const expected = signProduction({ orderId, publicId, sigTs });
  return timingSafeEqualHex(expected, String(sig));
}

function timingSafeEqualHex(a, b) {
  try {
    const ab = Buffer.from(String(a), "hex");
    const bb = Buffer.from(String(b), "hex");
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}
