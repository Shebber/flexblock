import { ethers } from "ethers";

export async function mintFlexPass({ to, orderId }) {
  try {
    if (!to || !orderId) throw new Error("Missing to or orderId");

    // 👉 Wichtig: Mint soll auf ApeChain laufen.
    // Wenn du später BASE_RPC_URL / APECHAIN_RPC_URL trennst, nimmt er automatisch ApeChain.
    const RPC = process.env.APECHAIN_RPC_URL || process.env.RPC_URL;
    const PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
    const CONTRACT = process.env.FLEXPASS_CONTRACT;

    if (!RPC || !PRIVATE_KEY || !CONTRACT) {
      throw new Error("Missing APECHAIN_RPC_URL/RPC_URL / OWNER_PRIVATE_KEY / FLEXPASS_CONTRACT env vars");
    }

    const provider = new ethers.JsonRpcProvider(RPC);

    // 🔍 Sofort sehen, ob du auf der richtigen Chain bist
    const net = await provider.getNetwork();
    console.log("🔗 FlexPass mint chainId:", Number(net.chainId));

    // 🔍 Sofort sehen, ob an der Adresse wirklich Code liegt (falscher RPC/Adresse -> 0x)
    const code = await provider.getCode(CONTRACT);
    if (!code || code === "0x") {
      throw new Error(`No contract code at ${CONTRACT} on chainId ${Number(net.chainId)} (wrong RPC or address)`);
    }

    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const abi = [
      "function mintPass(address to, string orderId) public returns (uint256)",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    ];

    const contract = new ethers.Contract(CONTRACT, abi, signer);
    const iface = new ethers.Interface(abi);

    // 🧪 Optionaler Fallback: erwartete TokenId vorab (falls Event-Parsing zickt)
    let expectedTokenId = null;
    try {
      expectedTokenId = await contract.mintPass.staticCall(to, orderId);
      console.log("🧪 Expected tokenId (staticCall):", expectedTokenId.toString());
    } catch (e) {
      console.warn("⚠ staticCall failed (not fatal):", e?.shortMessage || e?.message || String(e));
    }

    console.log("🪙 Minting FlexPass for", to, "order", orderId);

    const tx = await contract.mintPass(to, orderId);
    const receipt = await tx.wait();

    console.log("🧾 Mint receipt:", tx.hash, "status:", receipt.status, "logs:", receipt.logs?.length ?? 0);

    if (receipt.status !== 1) {
      throw new Error(`Mint tx failed (status=${receipt.status})`);
    }

    const toNorm = ethers.getAddress(to).toLowerCase();
    const contractNorm = CONTRACT.toLowerCase();

    // ✅ Robust: Logs vom richtigen Contract parsen und Transfer finden
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
        // Log passt nicht zur ABI -> ignorieren
      }
    }

    // Wenn Transfer nicht gefunden: Fallback auf staticCall-Wert
    if (tokenId == null && expectedTokenId != null) {
      tokenId = Number(BigInt(expectedTokenId));
      console.warn("⚠ Transfer event not found; using tokenId from staticCall:", tokenId);
    }

    if (tokenId == null) {
      throw new Error("Transfer event not found");
    }

    console.log("✅ FlexPass minted. TokenID:", tokenId);

    return {
      ok: true,
      tokenId,
      txHash: receipt.transactionHash || tx.hash,
    };
  } catch (err) {
    console.error("❌ FLEXPASS MINT FAILED:", err);
    return {
      ok: false,
      error: err?.shortMessage || err?.message || String(err),
    };
  }
}
