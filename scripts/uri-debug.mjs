import { createPublicClient, http, decodeAbiParameters } from "viem";

const RPC = process.env.APE_RPC || "https://rpc.apechain.com";
const CONTRACT = "0x1d5E47e5b560933bf6f1A8D444261d21997Cd4A6";
const tokenId = BigInt(process.argv[2] || "8");

const client = createPublicClient({ transport: http(RPC) });

const abi = [
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "uri",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  {
    type: "function",
    name: "supportsInterface",
    stateMutability: "view",
    inputs: [{ name: "interfaceId", type: "bytes4" }],
    outputs: [{ type: "bool" }],
  },
];

const ERC721_ID = "0x80ac58cd";
const ERC721_METADATA_ID = "0x5b5e139f";

async function main() {
  const chainId = await client.getChainId();
  const code = await client.getBytecode({ address: CONTRACT });
  console.log("RPC:", RPC);
  console.log("chainId:", chainId);
  console.log("contract code bytes:", code ? code.length : 0);
  console.log("tokenId:", tokenId.toString());

  // ERC165 checks
  try {
    const is721 = await client.readContract({ address: CONTRACT, abi, functionName: "supportsInterface", args: [ERC721_ID] });
    const isMeta = await client.readContract({ address: CONTRACT, abi, functionName: "supportsInterface", args: [ERC721_METADATA_ID] });
    console.log("supports ERC721:", is721);
    console.log("supports ERC721Metadata:", isMeta);
  } catch (e) {
    console.log("supportsInterface() error:", e?.shortMessage || e?.message || e);
  }

  // name/symbol
  try {
    console.log("name:", await client.readContract({ address: CONTRACT, abi, functionName: "name" }));
    console.log("symbol:", await client.readContract({ address: CONTRACT, abi, functionName: "symbol" }));
  } catch (e) {
    console.log("name/symbol error:", e?.shortMessage || e?.message || e);
  }

  // tokenURI
  try {
    const u = await client.readContract({ address: CONTRACT, abi, functionName: "tokenURI", args: [tokenId] });
    console.log("tokenURI:", u);
  } catch (e) {
    console.log("tokenURI error:", e?.shortMessage || e?.message || e);
  }

  // uri (1155 fallback)
  try {
    const u = await client.readContract({ address: CONTRACT, abi, functionName: "uri", args: [tokenId] });
    console.log("uri:", u);
  } catch (e) {
    console.log("uri() error:", e?.shortMessage || e?.message || e);
  }

  // raw eth_call (zeigt, ob die Funktion überhaupt existiert)
  // tokenURI selector: 0xc87b56dd
  const data =
    "0xc87b56dd" +
    tokenId.toString(16).padStart(64, "0");
  try {
    const raw = await client.call({ to: CONTRACT, data });
    console.log("raw tokenURI eth_call:", raw.data);
    if (raw.data && raw.data !== "0x") {
      try {
        const [decoded] = decodeAbiParameters([{ type: "string" }], raw.data);
        console.log("raw decoded string:", decoded);
      } catch (e) {
        console.log("raw decode error:", e?.message || e);
      }
    }
  } catch (e) {
    console.log("raw eth_call error:", e?.shortMessage || e?.message || e);
  }
}

main();
