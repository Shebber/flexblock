import { ethers } from "ethers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { to, orderId } = req.body;

    if (!to || !orderId) {
      return res.status(400).json({ error: "Missing to or orderId" });
    }

    const RPC = process.env.RPC_URL;
    const PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
    const CONTRACT = process.env.FLEXPASS_CONTRACT;

    if (!RPC || !PRIVATE_KEY || !CONTRACT) {
      throw new Error("Mint env vars missing");
    }

    const provider = new ethers.JsonRpcProvider(RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const abi = [
      "function mintPass(address to, string orderId) public returns (uint256)",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    ];

    const contract = new ethers.Contract(CONTRACT, abi, signer);

    console.log("🪙 Minting FlexPass for", to, orderId);

    const tx = await contract.mintPass(to, orderId);
    const receipt = await tx.wait();

    // --------------------------------------------------
    // 🔍 ERC721 Transfer Event → tokenId extrahieren
    // --------------------------------------------------
    const transferEvent = receipt.logs.find(
      (log) =>
        log.topics &&
        log.topics[0] ===
          ethers.id("Transfer(address,address,uint256)")
    );

    const tokenId = transferEvent
      ? Number(BigInt(transferEvent.topics[3]))
      : null;

    if (!tokenId) {
      console.warn("⚠ Mint succeeded but tokenId not found");
    } else {
      console.log("✅ FlexPass tokenId:", tokenId);
    }

    return res.status(200).json({
      ok: true,
      tx: receipt.transactionHash,
      tokenId,
    });

  } catch (err) {
    console.error("❌ MINT ERROR:", err);
    return res.status(500).json({
      error: err?.message || "Mint failed",
    });
  }
}
