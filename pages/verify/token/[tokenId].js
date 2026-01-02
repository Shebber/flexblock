import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getServerSideProps({ params }) {
  const { tokenId } = params;

  // 🔎 Order finden, die diesen FlexPass minted hat
  const order = await prisma.order.findFirst({
    where: {
      flexPassTokenId: Number(tokenId),
    },
    select: {
      publicId: true,
    },
  });

  // ❌ Kein Match → Info-Seite
  if (!order?.publicId) {
    return {
      notFound: true,
    };
  }

  // ✅ Weiterleitung auf bestehende Verify-Seite
  return {
    redirect: {
      destination: `/verify/${order.publicId}`,
      permanent: false,
    },
  };
}

export default function TokenRedirect() {
  return null;
}
