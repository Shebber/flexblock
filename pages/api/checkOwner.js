import { createPublicClient, http, getAddress } from 'viem';
import { defineChain } from 'viem';
import { erc721Abi } from 'viem';

const apechain = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 33139),
  name: process.env.NEXT_PUBLIC_CHAIN_NAME || 'ApeChain',
  nativeCurrency: { name: process.env.NEXT_PUBLIC_SYMBOL || 'APE', symbol: process.env.NEXT_PUBLIC_SYMBOL || 'APE', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.RPC_URL || 'https://apechain.calderachain.xyz/http'] },
    public:  { http: [process.env.RPC_URL || 'https://apechain.calderachain.xyz/http'] },
  },
});

const client = createPublicClient({
  chain: apechain,
  transport: http(apechain.rpcUrls.default.http[0]),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { contract, tokenId } = req.body || {};
    if (!contract || !tokenId) return res.status(400).json({ error: 'Missing contract or tokenId' });

    // optional whitelist
    if (process.env.ALLOWED_COLLECTIONS) {
      const whitelist = process.env.ALLOWED_COLLECTIONS.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (!whitelist.includes(contract.toLowerCase())) {
        return res.status(400).json({ error: 'Collection not allowed (whitelist)' });
      }
    }

    const owner = await client.readContract({
      address: getAddress(contract),
      abi: erc721Abi,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    });

    return res.status(200).json({ owner });
  } catch (e) {
    return res.status(500).json({ error: e?.shortMessage || e?.message || 'Unknown error' });
  }
}
