// lib/flexpass.js
import { ethers } from "ethers";

const short = (s) => (s ? `${String(s).slice(0, 8)}…${String(s).slice(-6)}` : null);

function pickErr(err) {
  // Möglichst viel Signal, aber nicht ewig lang
  return {
    message: err?.message,
    shortMessage: err?.shortMessage,
    code: err?.code,
    reason: err?.reason,
    action: err?.action,
    data: err?.data,
    info: err?.info,
    error: err?.error, // ethers packt nested rpc error manchmal hier rein
  };
}

export async function mintFlexPass({ to, orderId }) {
  try {
    if (!to || !orderId) throw new Error("Missing to or orderId");

    // ApeChain bevorzugen
    const RPC = process.env.APECHAIN_RPC_URL || process.env.RPC_URL;
    const PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
    const CONTRACT = process.env.FLEXPASS_CONTRACT;

    // 🧪 Super frühes Env-Signal (ohne Private Key zu loggen!)
    console.log("🧪 flexpass env", {
      rpcSet: RPC ? "yes" : "no",
      rpcIsApechain: !!process.env.APECHAIN_RPC_URL,
      hasPriv: !!PRIVATE_KEY,
      contract: CONTRACT ? short(CONTRACT) : null,
      orderId: String(orderId),
      to: short(to),
    });

    if (!RPC || !PRIVATE_KEY || !CONTRACT) {
      throw new Error(
        "Missing env vars: APECHAIN_RPC_URL/RPC_URL / OWNER_PRIVATE_KEY / FLEXPASS_CONTRACT"
      );
    }

    // Provider
    const provider = new ethers.JsonRpcProvider(RPC);

    // 🔍 Chain + Contract Code Check
    const net = await provider.getNetwork();
    const chainId = Number(net.chainId);
    console.log("🔗 FlexPass mint chainId:", chainId);

    const code = await provider.getCode(CONTRACT);
    const hasCode = !!code && code !== "0x";
    console.log("🧾 FlexPass contract code present:", hasCode);

    if (!hasCode) {
      throw new Error(
        `No contract code at ${CONTRACT} on chainId ${chainId} (wrong RPC or address)`
      );
    }

    // Signer
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const signerAddr = await signer.getAddress();
    console.log("🧑‍💻 Mint signer:", short(signerAddr));

    // ABI
    const abi = [
      "function mintPass(address to, string orderId) public returns (uint256)",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    ];

    const contract = new ethers.Contract(CONTRACT, abi, signer);
    const iface = new ethers.Interface(abi);

    const toNorm = ethers.getAddress(to).toLowerCase();
    const contractNorm = ethers.getAddress(CONTRACT).toLowerCase();

    // 🧪 Preflight: staticCall (zeigt Reverts sauber)
    let expectedTokenId = null;
    try {
      expectedTokenId = await contract.mintPass.staticCall(to, String(orderId));
      console.log("🧪 Expected tokenId (staticCall):", expectedTokenId.toString());
    } catch (e) {
      const info = pickErr(e);
      console.warn("⚠ staticCall failed (not fatal):", info);
      // nicht fatal — wir versuchen echten Mint trotzdem
    }

    // Optional: nonce/gas debug (hilft bei stuck / replacement errors)
    try {
      const nonce = await signer.getNonce();
      console.log("🧪 signer nonce:", nonce);
    } catch {}

    console.log("🪙 Minting FlexPass…", { to: short(to), orderId: String(orderId) });

    // Send tx
    let tx;
    try {
      tx = await contract.mintPass(to, String(orderId));
      console.log("🚀 Mint tx sent:", tx?.hash);
    } catch (e) {
      const info = pickErr(e);
      console.error("❌ mintPass() send failed:", info);
      return { ok: false, error: info.shortMessage || info.message || "mintPass send failed", details: info };
    }

    // Wait receipt
    let receipt;
    try {
      receipt = await tx.wait();
      console.log("🧾 Mint receipt:", {
        hash: tx.hash,
        status: receipt?.status,
        logs: receipt?.logs?.length ?? 0,
      });
    } catch (e) {
      const info = pickErr(e);
      console.error("❌ tx.wait() failed:", info);
      return { ok: false, error: info.shortMessage || info.message || "tx.wait failed", details: info };
    }

    if (!receipt || receipt.status !== 1) {
      throw new Error(`Mint tx failed (status=${receipt?.status})`);
    }

    // ✅ Robust: Transfer Event finden
    let tokenId = null;

    for (const log of receipt.logs || []) {
      if (!log || (log.address || "").toLowerCase() !== contractNorm) continue;

      try {
        const parsed = iface.parseLog({ topics: log.topics, data: log.data });
        if (parsed?.name === "Transfer") {
          const toAddr = ethers.getAddress(parsed.args.to).toLowerCase();
          if (toAddr === toNorm) {
            tokenId = Number(BigInt(parsed.args.tokenId));
            break;
          }
        }
      } catch {
        // ignore
      }
    }

    // Fallback: staticCall tokenId
    if (tokenId == null && expectedTokenId != null) {
      tokenId = Number(BigInt(expectedTokenId));
      console.warn("⚠ Transfer not found; using tokenId from staticCall:", tokenId);
    }

    if (tokenId == null) {
      throw new Error("Transfer event not found (and no staticCall fallback)");
    }

    console.log("✅ FlexPass minted. TokenID:", tokenId);

    return {
      ok: true,
      tokenId,
      txHash: receipt.transactionHash || tx.hash,
      chainId,
      contract: CONTRACT,
    };
  } catch (err) {
    const info = pickErr(err);
    console.error("❌ FLEXPASS MINT FAILED:", info);
    return {
      ok: false,
      error: info.shortMessage || info.message || String(err),
      details: info,
    };
  }
}
