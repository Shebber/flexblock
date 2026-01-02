import { createPublicClient, http } from "viem";

// ApeChain Chain-Objekt (nur fürs Client-Setup)
const apechain = {
  id: 33139,
  name: "ApeChain",
  nativeCurrency: { name: "ApeCoin", symbol: "APE", decimals: 18 },
  rpcUrls: { default: { http: [process.env.APE_RPC] } },
};

const RPC = process.env.APE_RPC;
if (!RPC) {
  console.error("Bitte APE_RPC setzen, z.B. APE_RPC=https://<dein-apechain-rpc>");
  process.exit(1);
}

const client = createPublicClient({
  chain: apechain,
  transport: http(RPC),
});

const CONTRACT = "0x1d5E47e5b560933bf6f1A8D444261d21997Cd4A6";
const tokenId = BigInt(process.argv[2] || "8");

// Minimal-ABI (reicht!)
const abi_tokenURI = [
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
];

// Fallbacks (falls der Contract was “Custom” macht)
const abi_uri = [
  {
    type: "function",
    name: "uri",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
];

async function main() {
  try {
    const uri = await client.readContract({
      address: CONTRACT,
      abi: abi_tokenURI,
      functionName: "tokenURI",
      args: [tokenId],
    });
    console.log("tokenURI:", uri);
    return;
  } catch (e) {
    // tokenURI hat evtl. revertet oder existiert nicht
  }

  try {
    const uri = await client.readContract({
      address: CONTRACT,
      abi: abi_uri,
      functionName: "uri",
      args: [tokenId],
    });
    console.log("uri:", uri);
    return;
  } catch (e) {}

  console.log("Weder tokenURI() noch uri() konnte gelesen werden (oder RPC/Contract stimmt nicht).");
}

main();
