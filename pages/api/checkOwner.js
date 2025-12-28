// pages/api/checkOwner.js

import { createPublicClient, http, isAddress } from "viem";
import { supportedChains } from "../../utils/chains";

// ─────────────────────────────────────────────────────────────
// 1) ABIs
// ─────────────────────────────────────────────────────────────

const ERC721_ABI = [
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "owner", type: "address" }],
  },
];

const ERC1155_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "balance", type: "uint256" }],
  },
];

// ─────────────────────────────────────────────────────────────
// 2) Chains Konfiguration
// ─────────────────────────────────────────────────────────────

function getSupportedChains() {
  // 🟢 AUTOMATISCH: Wir wandeln die Liste aus utils/chains.js
  // in das Format um, das diese Funktion braucht.
  return supportedChains.map((chain) => ({
    chain: chain,
    label: chain.name, // Nimmt den Namen (z.B. "Polygon", "Base") direkt aus der Config
  }));
}

// Reihenfolge: zuerst Chain aus Request (falls bekannt), dann Rest
function orderChains(chainConfigs, preferredChainId) {
  if (!preferredChainId) return chainConfigs;

  const preferredId = Number(preferredChainId);
  const preferred = chainConfigs.find((c) => c.chain.id === preferredId);

  if (!preferred) return chainConfigs;

  return [
    preferred,
    ...chainConfigs.filter((c) => c.chain.id !== preferredId),
  ];
}

// Helper: Ist das ein "0x"-Fehler (Contract existiert nicht auf Chain)?
function isZeroDataError(err) {
  const msg =
    err?.shortMessage ||
    err?.cause?.shortMessage ||
    (Array.isArray(err?.metaMessages) ? err.metaMessages.join("\n") : "") ||
    "";
  return msg.includes('returned no data ("0x")');
}

// ─────────────────────────────────────────────────────────────
// 3) API Handler
// ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST only" });
  }

  try {
    const { contract, tokenId, wallet, chainId } = req.body;

    // Basic Validation
    if (!contract || !tokenId || !wallet) {
      return res.status(400).json({
        ok: false,
        type: "BAD_REQUEST",
        message: "contract, tokenId and wallet are required.",
      });
    }

    if (!isAddress(contract) || !isAddress(wallet)) {
      return res.status(400).json({
        ok: false,
        type: "BAD_REQUEST",
        message: "Invalid contract or wallet address.",
      });
    }

    let tokenIdBigInt;
    try {
      tokenIdBigInt = BigInt(tokenId);
    } catch (e) {
      return res.status(400).json({
        ok: false,
        type: "BAD_REQUEST",
        message: "tokenId must be a valid integer.",
      });
    }

    const normalizedWallet = wallet.toLowerCase();
    const allChains = getSupportedChains();

    // Sortieren: Bevorzugte Chain zuerst
    const chainsToTry = orderChains(allChains, chainId);

    console.log(
      "🔍 Ownership Check:",
      contract,
      "Token",
      tokenId,
      "Wallet",
      wallet,
      "| Preferred chainId:",
      chainId
    );

    let lastError = null;

    // ─────────────────────────────────────────────────────
    // Schleife durch Chains
    // ─────────────────────────────────────────────────────
    for (const cfg of chainsToTry) {
      const { chain, label } = cfg;

      // 🟢 WICHTIG: Hier ist der Fix!
      // Wir schalten 'multicall' aus, damit öffentliche RPCs (Llama/Ankr) nicht blockieren.
      const client = createPublicClient({
        chain,
        transport: http(),
        batch: { 
          multicall: false 
        } 
      });

      console.log(`🌐 Trying chain ${label} (id=${chain.id})…`);

      // ───────────── ERST: ERC721 ownerOf ─────────────
      try {
        const owner = await client.readContract({
          address: contract,
          abi: ERC721_ABI,
          functionName: "ownerOf",
          args: [tokenIdBigInt],
        });

        console.log(`✅ ERC721 ownerOf on ${label}:`, owner);

        if (owner.toLowerCase() === normalizedWallet) {
          return res.status(200).json({
            ok: true,
            chain: label,
            chainId: chain.id,
            standard: "ERC721",
          });
        } else {
          return res.status(200).json({
            ok: false,
            type: "OWNERSHIP_FAILED",
            message: `NFT is owned by ${owner}, not by connected wallet.`,
            chain: label,
            standard: "ERC721",
          });
        }
      } catch (err) {
        lastError = err;
        
        // Fehleranalyse: Wenn Contract gar nicht da ist -> weiter zu 1155
        if (isZeroDataError(err)) {
          console.log(`ℹ️ ERC721 not present on ${label}, trying ERC1155…`);
        } else {
            // Andere Fehler (z.B. Revert weil Token nicht existiert) loggen wir nur
          console.log(`⚠️ ERC721 error on ${label}:`, err.shortMessage || "Unknown error");
        }
      }

      // ───────────── ZWEITENS: ERC1155 balanceOf ─────────────
      try {
        const balance = await client.readContract({
          address: contract,
          abi: ERC1155_ABI,
          functionName: "balanceOf",
          args: [wallet, tokenIdBigInt],
        });

        console.log(`✅ ERC1155 balanceOf on ${label}:`, balance.toString());

        if (balance > 0n) {
          return res.status(200).json({
            ok: true,
            chain: label,
            chainId: chain.id,
            standard: "ERC1155",
          });
        } else {
          console.log(`ℹ️ ERC1155 balance is 0 on ${label}.`);
        }
      } catch (err) {
        lastError = err;
        if (isZeroDataError(err)) {
          console.log(`ℹ️ ERC1155 not present on ${label}, trying next chain…`);
          continue;
        } else {
          console.log(`⚠️ ERC1155 error on ${label}:`, err.shortMessage || "Unknown error");
          continue;
        }
      }
    }

    // Wenn wir hier ankommen, wurde nichts gefunden
    console.warn("❌ Token not found on any configured chain.");
    return res.status(200).json({
      ok: false,
      type: "TOKEN_NOT_FOUND",
      message: "Token could not be found on any configured network.",
      lastError: lastError?.shortMessage || null,
    });

  } catch (err) {
    console.error("❌ checkOwner FATAL:", err);
    return res.status(500).json({
      ok: false,
      type: "SERVER_ERROR",
      message: err.message || "Internal error during ownership check.",
    });
  }
}