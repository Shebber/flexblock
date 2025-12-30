const groups = {
  core: [
    "NEXT_PUBLIC_SITE_URL",
    "NEXTAUTH_SECRET",
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID",
  ],
  email_brevo: ["BREVO_USER", "BREVO_PASS", "EMAIL_FROM"],
  payments_chain: ["RPC_URL", "NEXT_PUBLIC_RECIPIENT_ADDRESS"],
  mint_apechain: ["OWNER_PRIVATE_KEY", "FLEXPASS_CONTRACT"],
  wrike: ["WRIKE_ENABLED", "WRIKE_TOKEN", "WRIKE_FOLDER_ID"],
  onedrive_powerautomate: [],
  // falls du statt PowerAutomate direkt Graph nutzt (optional, nur wenn du’s wirklich so gebaut hast):
  graph_onedrive_app_only: [
  "GRAPH_TENANT_ID",
  "GRAPH_CLIENT_ID",
  "GRAPH_CLIENT_SECRET",
  "GRAPH_USER_ID",
  // optional:
  // "GRAPH_FOLDER_PATH",
],



};

let missingTotal = 0;

for (const [name, vars] of Object.entries(groups)) {
  const missing = vars.filter((v) => !process.env[v] || process.env[v].trim() === "");
  const ok = vars.filter((v) => !missing.includes(v));

  console.log(`\n[${name}]`);
  ok.forEach((v) => console.log(`  ✅ ${v}`));
  missing.forEach((v) => console.log(`  ❌ ${v}`));
  missingTotal += missing.length;
}

console.log(`\nMissing total: ${missingTotal}`);
process.exit(missingTotal ? 1 : 0);
