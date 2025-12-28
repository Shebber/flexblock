// pages/api/flexpass/[tokenId].js
export default function handler(req, res) {
  const { tokenId } = req.query;

  res.status(200).json({
    name: `Flexblock FlexPass #${tokenId}`,
    description:
      "Flexblock FlexPass – production-linked token for a premium acrylic NFT display.",
    image: "https://www.rockshebbich.de/flexblock/certificate.png",
  });
}
