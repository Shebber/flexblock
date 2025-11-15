// pages/api/fetchMetadata.js
import { createPublicClient, http } from 'viem';
import { apechain } from '../../utils/chain';
import { ABI_ERC721 } from '../../utils/abi';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const { contract, tokenId } = req.body;

    if (!contract || !tokenId) {
      return res.status(400).json({ error: 'Missing inputs' });
    }

    const client = createPublicClient({
      chain: apechain,
      transport: http(),
    });

    // 1) tokenURI vom Contract holen
    let tokenURI = await client.readContract({
      address: contract,
      abi: ABI_ERC721,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });

    // 2) URI normalisieren
    tokenURI = normalizeURI(tokenURI);

    // 3) Metadaten laden
    const metaRes = await fetch(tokenURI);
    if (!metaRes.ok) throw new Error(`Metadata fetch failed (${metaRes.status})`);

    const metadata = await metaRes.json();

    // 4) Bild normalisieren
    let image = metadata.image || metadata.image_url;
    if (image) image = normalizeURI(image);

    return res.status(200).json({
      tokenURI,
      metadata,
      image,
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// small helper
function normalizeURI(uri) {
  if (!uri) return null;

  // ipfs:// → HTTPS gateway
  if (uri.startsWith('ipfs://')) {
    const hash = uri.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${hash}`;
  }

  // bfay… ohne ipfs://
  if (/^[a-z0-9]{46,}$/i.test(uri)) {
    return `https://ipfs.io/ipfs/${uri}`;
  }

  return uri;
}
