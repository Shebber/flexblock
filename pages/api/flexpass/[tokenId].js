// pages/api/flexpass/[tokenId].js
export default function handler(req, res) {
  const tokenIdRaw = req.query?.tokenId;
  const tokenId = Array.isArray(tokenIdRaw) ? tokenIdRaw[0] : tokenIdRaw;

  const SITE =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://nftflexblock.xyz";

  // Wichtig: super-boring, direktes PNG, optional Cachebuster
  const imageUrl = `${SITE}/flexpass/certificate.png?v=1`;

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  // Indexer mögen stabile Caches
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

  res.status(200).json({
    name: `Flexblock Certificate #${tokenId}`,
    description: "Official Flexblock Certificate NFT",
    image: imageUrl,
    external_url: `${SITE}/verify/token/${tokenId}`,
    attributes: [
      { trait_type: "Type", value: "Production Pass" },
      { trait_type: "Network", value: "ApeChain" },
      { trait_type: "Serial", value: Number(tokenId) },
    ],
  });
}
