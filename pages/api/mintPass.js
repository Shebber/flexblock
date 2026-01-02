import { ethers } from "ethers";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    // ✅ Schutz: Endpoint darf nicht öffentlich mintbar sein
    const adminKey = req.headers["x-admin-key"];
    if (!process.env.MINT_ADMIN_KEY || adminKey !== process.env.MINT_ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { to, orderId } = req.body;
    if (!to || !orderId) return res.status(400).json({ error: "Missing to or orderId" });

    // ✅ Order über orderId finden (dein @unique Feld)
    const order = await prisma.order.findUnique({
      where: { orderId: String(orderId) },
      select: { orderId: true, publicId: true, verifyUrl: true, wallet: true, flexPassTokenId: true },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Optional: verhindern, dass an "falsche" Wallet gemintet wird
    if (order.wallet && order.wallet.toLowerCase() !== String(to).toLowerCase()) {
      return res.status(400).json({ error: "Wallet mismatch for this order" });
    }

    // ✅ Idempotent: wenn schon gemintet, gib’s zurück
    if (order.flexPassTokenId != null) {
      return res.status(200).json({
        ok: true,
        alreadyMinted: true,
        tokenId: order.flexPassTokenId,
        externalUrl: `https://nftflexblock.xyz/verify/token/${order.flexPassTokenId}`,
        verifyUrl: order.verifyUrl || (order.publicId ? `https://nftflexblock.xyz/verify/${order.publicId}` : null),
      });
    }

    // 👉 Mint soll auf ApeChain laufen
    const RPC = process.env.APECHAIN_RPC_URL || process.env.RPC_URL;
    const PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
    const CONTRACT = process.env.FLEXPASS_CONTRACT;

    if (!RPC || !PRIVATE_KEY || !CONTRACT) throw new Error("Mint env vars missing");

    const provider = new ethers.JsonRpcProvider(RPC);

    // Debug: chainId ausgeben
    const net = await provider.getNetwork();
    console.log("🔗 Mint chainId:", Number(net.chainId));

    const code = await provider.getCode(CONTRACT);
    if (!code || code === "0x") {
      throw new Error(`No contract code at ${CONTRACT} on chainId ${Number(net.chainId)}`);
    }

    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const abi = [
      "function mintPass(address to, string orderId) public returns (uint256)",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    ];

    const contract = new ethers.Contract(CONTRACT, abi, signer);
    const iface = new ethers.Interface(abi);

    console.log("🪙 Minting FlexPass for", to, "order", orderId);

    const tx = await contract.mintPass(to, String(orderId));
    const receipt = await tx.wait();

    if (receipt.status !== 1) throw new Error(`Mint tx failed (status=${receipt.status})`);

    // ✅ Robust: Logs vom richtigen Contract parsen + Transfer an die richtige TO-Adresse finden
    const toNorm = ethers.getAddress(to).toLowerCase();
    const contractNorm = CONTRACT.toLowerCase();

    let tokenId = null;

    for (const log of receipt.logs || []) {
      if (!log?.address || log.address.toLowerCase() !== contractNorm) continue;

      try {
        const parsed = iface.parseLog({ topics: log.topics, data: log.data });
        if (parsed?.name !== "Transfer") continue;

        const toAddr = ethers.getAddress(parsed.args.to).toLowerCase();
        if (toAddr !== toNorm) continue;

        tokenId = Number(BigInt(parsed.args.tokenId));
        break;
      } catch {
        // ignore
      }
    }

    if (tokenId == null) throw new Error("Mint succeeded but tokenId not found");

    console.log("✅ FlexPass tokenId:", tokenId);

    // ✅ in Order schreiben
    await prisma.order.update({
      where: { orderId: String(orderId) },
      data: {
        flexPassTokenId: tokenId,
        // flexPassTxHash: receipt.transactionHash, // <-- nur wenn du das Feld ergänzt hast
      },
    });

    return res.status(200).json({
      ok: true,
      txHash: receipt.transactionHash,
      tokenId,
      externalUrl: `https://nftflexblock.xyz/verify/token/${tokenId}`,
      verifyUrl: order.verifyUrl || (order.publicId ? `https://nftflexblock.xyz/verify/${order.publicId}` : null),
    });
  } catch (err) {
    console.error("❌ MINT ERROR:", err);
    return res.status(500).json({ error: err?.shortMessage || err?.message || String(err) });
  }
}
