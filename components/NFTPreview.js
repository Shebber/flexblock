'use client';

export default function NFTPreview({ metadata }) {
  if (!metadata) return null;

  const image = metadata.image || metadata.image_url || null;

  let imgUrl = image;

  // Convert IPFS → HTTPS
  if (image && image.startsWith('ipfs://')) {
    imgUrl = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }

  return (
    <div className="nft-preview">
      <h4>NFT Preview</h4>

      {imgUrl ? (
        <img src={imgUrl} alt="NFT preview" className="nft-img" />
      ) : (
        <div className="nft-missing">No image found in metadata</div>
      )}

      <style jsx>{`
        .nft-preview {
          margin-top: 16px;
          padding: 12px;
          border: 1px solid #222;
          border-radius: 12px;
          background: #0c0c0c;
        }
        h4 {
          margin: 0 0 10px;
          opacity: 0.85;
        }
        .nft-img {
          width: 260px;
          border-radius: 10px;
          border: 1px solid #333;
        }
        .nft-missing {
          padding: 20px;
          opacity: 0.6;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
