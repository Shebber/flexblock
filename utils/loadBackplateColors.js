// utils/loadBackplateColors.js
import colors from "../data/backplateColors.json";

/**
 * ✅ SSR-safe: keinerlei fetch / API calls.
 * Liefert sofort die aktivierten Farben aus dem JSON (Fallback).
 */
export function getAvailableBackplateColors() {
  const list = Array.isArray(colors?.colors) ? colors.colors : [];
  return list.filter((c) => c && c.enabled);
}

/**
 * Optional: alle Farben (auch disabled) – z.B. fürs Admin UI
 */
export function getAllBackplateColors() {
  return Array.isArray(colors?.colors) ? colors.colors : [];
}
