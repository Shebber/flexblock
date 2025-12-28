i// pages/api/onedriveUpload.js
import fs from "fs";

function env(nameA, nameB) {
  return process.env[nameA] || (nameB ? process.env[nameB] : undefined);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { orderId, absoluteImagePath } = req.body || {};
    if (!orderId || !absoluteImagePath) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    if (!fs.existsSync(absoluteImagePath)) {
      return res.status(404).json({ error: "File not found on server", absoluteImagePath });
    }

    const TENANT = env("GRAPH_TENANT_ID", "ONEDRIVE_TENANT_ID");
    const CLIENT_ID = env("GRAPH_CLIENT_ID", "ONEDRIVE_CLIENT_ID");
    const CLIENT_SECRET = env("GRAPH_CLIENT_SECRET", "ONEDRIVE_CLIENT_SECRET");
    const USER_ID = env("GRAPH_USER_ID", "ONEDRIVE_USER_ID");
    const FOLDER_PATH = env("GRAPH_FOLDER_PATH", "ONEDRIVE_FOLDER_PATH") || "/";

    if (!TENANT || !CLIENT_ID || !CLIENT_SECRET || !USER_ID) {
      return res.status(500).json({
        error: "Graph env missing",
        missing: {
          TENANT: !TENANT,
          CLIENT_ID: !CLIENT_ID,
          CLIENT_SECRET: !CLIENT_SECRET,
          USER_ID: !USER_ID,
        },
      });
    }

    // 1) Token (client_credentials)
    const tokenRes = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    });

    const tokenText = await tokenRes.text();
    const tokenJson = tokenText ? JSON.parse(tokenText) : null;

    if (!tokenRes.ok || !tokenJson?.access_token) {
      return res.status(500).json({
        error: "Failed to acquire token",
        status: tokenRes.status,
        details: tokenJson || tokenText,
      });
    }

    const accessToken = tokenJson.access_token;

    // 2) Datei lesen
    const fileBuffer = fs.readFileSync(absoluteImagePath);
    const filename = `${orderId}.jpg`;

    // folder clean
    const folder = (FOLDER_PATH.startsWith("/") ? FOLDER_PATH : `/${FOLDER_PATH}`).replace(/\/+$/, "");
    const graphPath = `/users/${USER_ID}/drive/root:${folder}/${filename}:/content`;

    // 3) Upload (PUT)
    const uploadRes = await fetch(`https://graph.microsoft.com/v1.0${graphPath}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "image/jpeg",
      },
      body: fileBuffer,
    });

    const uploadText = await uploadRes.text();
    const uploadJson = uploadText ? JSON.parse(uploadText) : null;

    if (!uploadRes.ok) {
      return res.status(500).json({
        error: "Upload failed",
        status: uploadRes.status,
        details: uploadJson || uploadText,
      });
    }

    return res.status(200).json({
      ok: true,
      oneDriveItem: uploadJson,
      webUrl: uploadJson?.webUrl || null,
      id: uploadJson?.id || null,
    });
  } catch (err) {
    return res.status(500).json({
      error: "OneDrive API failed",
      details: err?.message || String(err),
    });
  }
}
