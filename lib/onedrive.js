import fs from "fs";
// Hinweis: Ab Node 18 ist 'fetch' global verfügbar.
// Falls du eine ältere Version nutzt, lass den Import drin:
// import fetch from "node-fetch"; 

function encodeGraphPath(p = "") {
  return p.split("/").map(encodeURIComponent).join("/").replace(/%2F/g, "/");
}

function normalizeFolderPath(p = "/") {
  const s = String(p || "/").trim();
  if (!s) return "/";
  return s.startsWith("/") ? s : `/${s}`;
}

export async function uploadToOneDrive(localPath, filename) {
  try {
    const {
      GRAPH_TENANT_ID,
      GRAPH_CLIENT_ID,
      GRAPH_CLIENT_SECRET,
      GRAPH_FOLDER_PATH,
      GRAPH_USER_ID,
    } = process.env;

    if (!GRAPH_TENANT_ID || !GRAPH_CLIENT_ID || !GRAPH_CLIENT_SECRET || !GRAPH_USER_ID) {
      throw new Error("Missing GRAPH env variables");
    }

    if (!fs.existsSync(localPath)) {
      throw new Error(`Local file not found: ${localPath}`);
    }

    // 1) DATEIGRÖSSE PRÜFEN
    const stats = fs.statSync(localPath);
    const fileSize = stats.size;
    const isLargeFile = fileSize > 4 * 1024 * 1024; // > 4MB

    console.log(`☁ OneDrive: Preparing upload for ${filename} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    // 2) TOKEN HOLEN
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${GRAPH_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GRAPH_CLIENT_ID,
          client_secret: GRAPH_CLIENT_SECRET,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }),
      }
    );

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new Error(`Token Error: ${JSON.stringify(tokenJson)}`);
    }
    const accessToken = tokenJson.access_token;

    // 3) PFADE VORBEREITEN
    const folder = normalizeFolderPath(GRAPH_FOLDER_PATH || "/");
    // Pfad zusammenbauen und doppelte Slashes entfernen
    const relativeItemPath = `${folder}/${filename}`.replace(/\/+/g, "/"); 
    // Graph API Pfadlogik: /users/{id}/drive/root:{path}:
    const basePath = `https://graph.microsoft.com/v1.0/users/${GRAPH_USER_ID}/drive/root:${encodeGraphPath(relativeItemPath)}`;

    const fileBuffer = fs.readFileSync(localPath);

    // ==========================================
    // STRATEGIE A: SIMPLE UPLOAD (< 4MB)
    // ==========================================
    if (!isLargeFile) {
      const uploadUrl = `${basePath}:/content`;
      
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "image/jpeg", 
        },
        body: fileBuffer,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Simple Upload failed: ${errText}`);
      }
      
      const json = await res.json();
      return { ok: true, webUrl: json.webUrl, method: "simple" };
    }

    // ==========================================
    // STRATEGIE B: UPLOAD SESSION (> 4MB)
    // ==========================================
    // 1. Session erstellen
    const createSessionUrl = `${basePath}:/createUploadSession`;
    const sessionRes = await fetch(createSessionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item: {
          "@microsoft.graph.conflictBehavior": "replace", // Überschreiben wenn existiert
          name: filename
        }
      })
    });

    if (!sessionRes.ok) {
        const errText = await sessionRes.text();
        throw new Error(`Create Session failed: ${errText}`);
    }

    const sessionJson = await sessionRes.json();
    const uploadUrl = sessionJson.uploadUrl;

    // 2. Datei in die Session pushen
    // Hinweis: Für SEHR große Dateien (>100MB) müsste man hier "chunken".
    // Für typische Druckdateien (5-50MB) kann man oft den ganzen Buffer in die Session PUTen,
    // solange das Timeout nicht zuschlägt. Wir machen hier den "One-Shot" in die Session.
    
    const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
            "Content-Length": fileSize,
            "Content-Range": `bytes 0-${fileSize - 1}/${fileSize}`
        },
        body: fileBuffer
    });

    if (!uploadRes.ok && uploadRes.status !== 201 && uploadRes.status !== 200) {
        const errText = await uploadRes.text();
        throw new Error(`Session Put failed: ${errText}`);
    }

    const finalJson = await uploadRes.json();
    return { ok: true, webUrl: finalJson.webUrl, method: "session" };

  } catch (err) {
    console.error("❌ OneDrive upload failed:", err.message);
    // Wir werfen den Fehler weiter, damit der Caller (api/production.js) ihn loggen kann
    throw err; 
  }
}