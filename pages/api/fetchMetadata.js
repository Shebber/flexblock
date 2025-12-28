import { ethers } from "ethers";
// 🟢 Importiere deine Helper-Funktion (Pfad ggf. anpassen auf ../../utils/helpers wenn du Option B gewählt hast)
import { normalizeIpfsUrl } from "../../lib/utils"; 

// Konfiguration der RPCs (Hier weiß der Server, wo er suchen muss)
const RPC_URLS = {
  1: "https://eth.llamarpc.com",                // Ethereum
  137: "https://polygon-rpc.com",               // Polygon
  8453: "https://mainnet.base.org",             // Base
  33139: "https://rpc.apechain.com/http",       // ApeChain
  2741: "https://api.mainnet.abs.xyz",          // Abstract
  5031: "https://api.infra.mainnet.somnia.network/", // Somnia Mainnet
  
  // 🟢 NEUE CHAINS
  81457: "https://rpc.blast.io",                // Blast Mainnet
  7777777: "https://rpc.zora.energy",           // Zora Mainnet
  80094: "https://rpc.berachain.com",           // Berachain Mainnet

  // Andere
  10143: "https://testnet-rpc.monad.xyz",       // Monad Testnet
  10: "https://mainnet.optimism.io",            // Optimism
  42161: "https://arb1.arbitrum.io/rpc",        // Arbitrum One
  43114: "https://api.avax.network/ext/bc/C/rpc", // Avalanche
  56: "https://bsc-dataseed.binance.org/"       // BSC
};

// ABIs für ERC721 (tokenURI) und ERC1155 (uri)
const ABI = [
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function uri(uint256 tokenId) view returns (string)"
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { contract, contractAddress, tokenId, chainId } = req.body;
    
    // Frontend schickt manchmal "contract", manchmal "contractAddress" -> wir fangen beides ab
    const targetContract = contractAddress || contract;

    // 1. Validierung: Haben wir alle Infos?
    if (!targetContract || !tokenId || !chainId) {
      console.warn("⚠️ fetchMetadata: Missing params", { targetContract, tokenId, chainId });
      return res.status(400).json({ error: "Missing contract, tokenId or chainId" });
    }

    // 2. RPC URL anhand der chainId wählen
    const rpcUrl = RPC_URLS[chainId];
    if (!rpcUrl) {
      throw new Error(`No RPC configured for Chain ID ${chainId}`);
    }

    // 3. Contract instanziieren
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const nftContract = new ethers.Contract(targetContract, ABI, provider);

    // 4. URI abrufen (Versuche erst ERC721, dann ERC1155)
    let tokenUri;
    try {
      tokenUri = await nftContract.tokenURI(tokenId);
    } catch (e) {
      try {
        // Fallback für ERC1155 (z.B. Somnia Variance könnte 1155 sein)
        tokenUri = await nftContract.uri(tokenId);
      } catch (e2) {
        throw new Error("Smart Contract has no tokenURI/uri function or reverted.");
      }
    }

    if (!tokenUri) throw new Error("Contract returned empty URI");

    // 5. IPFS in HTTPS umwandeln
    let fetchUrl = normalizeIpfsUrl(tokenUri);

    // ERC1155 ID Replacement ({id} -> Hex)
    if (fetchUrl.includes("{id}")) {
      const hexId = BigInt(tokenId).toString(16).padStart(64, "0");
      fetchUrl = fetchUrl.replace("{id}", hexId);
    }

    // 6. JSON laden
    // Spezialfall: Base64 kodierte Metadata (On-Chain)
    if (fetchUrl.startsWith("data:application/json;base64,")) {
      const base64 = fetchUrl.replace("data:application/json;base64,", "");
      const jsonString = Buffer.from(base64, "base64").toString("utf-8");
      return res.status(200).json(JSON.parse(jsonString));
    }

    // Normaler Fetch
    const metaRes = await fetch(fetchUrl);
    if (!metaRes.ok) throw new Error(`HTTP ${metaRes.status} fetching metadata`);

    const metadata = await metaRes.json();

    // 7. Bild-URL im JSON auch normalisieren (fürs Frontend)
    let image = metadata.image || metadata.image_url;
    if (image) {
      metadata.image = normalizeIpfsUrl(image);
    }

    // Sauberes Ergebnis zurückgeben
    return res.status(200).json({
      name: metadata.name,
      image: metadata.image,
      description: metadata.description,
      raw: metadata
    });

  } catch (err) {
    console.error("❌ METADATA ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
}