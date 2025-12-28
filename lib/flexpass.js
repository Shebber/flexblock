import { ethers } from "ethers";

export async function mintFlexPass({ to, orderId }) {
  try {
    if (!to || !orderId) {
      throw new Error("Missing to or orderId");
    }

    const RPC = process.env.RPC_URL;
    const PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
    const CONTRACT = process.env.FLEXPASS_CONTRACT;

    if (!RPC || !PRIVATE_KEY || !CONTRACT) {
      throw new Error("Missing RPC / PRIVATE_KEY / CONTRACT env vars");
    }

    const provider = new ethers.JsonRpcProvider(RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const abi = [
      "function mintPass(address to, string orderId) public returns (uint256)",
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    ];

    const contract = new ethers.Contract(CONTRACT, abi, signer);

    console.log("🪙 Minting FlexPass for", to, "order", orderId);

    const tx = await contract.mintPass(to, orderId);
    const receipt = await tx.wait();

    // 🔍 Transfer-Event suchen
    const transferEvent = receipt.logs.find(
      (l) =>
        l.topics &&
        l.topics[0] ===
          ethers.id("Transfer(address,address,uint256)")
    );

    if (!transferEvent) {
      throw new Error("Transfer event not found");
    }

    const tokenId = parseInt(transferEvent.topics[3], 16);

    console.log("✅ FlexPass minted. TokenID:", tokenId);

    return {
      ok: true,
      tokenId,
      txHash: receipt.transactionHash,
    };

  } catch (err) {
    console.error("❌ FLEXPASS MINT FAILED:", err);
    return {
      ok: false,
      error: err.message,
    };
  }
}
