export default function handler(req, res) {
  const { tokenId } = req.query;

  res.status(200).json({
    name: `Flexblock Certificate #${tokenId}`,
    description: "Official Flexblock Production Certificate NFT",

    // 🔒 IMMER gleiches Bild (Zertifikat)
    image: "https://www.rockshebbich.de/flexblock/certificate.png",

    // 🔑 DAS ist der Trigger für Verify
    external_url: `https://nftflexblock.xyz/verify/token/${tokenId}`,

    attributes: [
      { trait_type: "Type", value: "Production Pass" },
      { trait_type: "Network", value: "ApeChain" },
      { trait_type: "Serial", value: Number(tokenId) }
    ]
  });
}
