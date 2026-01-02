import prisma from "../../../lib/prisma";

export async function getServerSideProps(ctx) {
  const tokenId = Number(ctx.params.tokenId);
  if (!Number.isFinite(tokenId)) return { notFound: true };

  const order = await prisma.order.findFirst({
    where: { flexPassTokenId: tokenId },
    select: { publicId: true, verifyUrl: true },
  });

  const dest = order?.verifyUrl || (order?.publicId ? `/verify/${order.publicId}` : null);
  if (!dest) return { notFound: true };

  return {
    redirect: { destination: dest, permanent: false },
  };
}

export default function TokenVerifyRedirect() {
  return null;
}
