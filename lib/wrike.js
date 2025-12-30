// lib/wrike.js
const WRIKE_API = "https://www.wrike.com/api/v4";

function getToken() {
  return process.env.WRIKE_TOKEN;
}

// Eure Custom Status IDs
export const FLEX_STATUS = {
  ORDER: "IEAATM5VJMGPIOUI",
  PRODUCTION: "IEAATM5VJMGPIOUS",
  SHIPPED: "IEAATM5VJMGPIOU4",
};

// Wrike-safe Helper
export function wrikeSafe(input = "") {
  return String(input)
    .replace(/\u2026/g, "...")
    .replace(/[–—]/g, "-")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();
}

// Request Helper
async function wrikeRequest(path, method = "GET", form = null) {
  const token = getToken();
  if (!token) throw new Error("WRIKE_TOKEN missing");

  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  if (form) {
    opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
    opts.body = new URLSearchParams(form);
  }

  const res = await fetch(`${WRIKE_API}${path}`, opts);
  const text = await res.text();

  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }

  if (!res.ok) {
    const msg =
      json?.errorDescription ||
      json?.error ||
      json?.raw ||
      res.statusText ||
      "Wrike API error";

    throw new Error(`Wrike ${res.status} ${method} ${path}: ${msg}`);
  }

  return json;
}

/**
 * Task erstellen
 * API-Parameter für Custom Status ist: "customStatus"
 */
export async function createWrikeTask({ folderId, title, description, customStatusId, statusId } = {}) {
  const token = getToken();
  if (!token || !folderId) {
    console.warn("⚠ Wrike not configured (missing token or folderId)");
    return null;
  }

  const form = {
    title: wrikeSafe(title || "Flexblock Order"),
    description: wrikeSafe(description || ""),
  };

  const statusToUse = customStatusId || statusId;
  if (statusToUse) {
    form.customStatus = statusToUse;
  }

  const json = await wrikeRequest(`/folders/${folderId}/tasks`, "POST", form);
  return json?.data?.[0]?.id || null;
}

/**
 * Status nachträglich ändern (falls nötig)
 */
export async function setTaskStatus(taskId, customStatusId) {
  const token = getToken();
  if (!token || !taskId || !customStatusId) return null;
  return wrikeRequest(`/tasks/${taskId}`, "PUT", { customStatus: customStatusId });
}
