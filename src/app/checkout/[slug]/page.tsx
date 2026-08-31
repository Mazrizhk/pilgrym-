import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckoutFlow from "@/components/CheckoutFlow";

export const metadata = {
  title: "Checkout — Pilgrym",
};

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ adults?: string; children?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { slug } = await params;
  const sp = await searchParams;

  const pkg = await prisma.package.findUnique({
    where: { slug },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      agency: { select: { name: true, verificationStatus: true } },
      inclusions: { where: { included: true } },
    },
  });

  if (!pkg || pkg.status !== "ACTIVE") notFound();

  const adults = parseInt(sp.adults ?? "1");
  const children = parseInt(sp.children ?? "0");

  return (
    <CheckoutFlow
      package={pkg}
      adults={adults}
      children={children}
      userId={session.user.id}
      userEmail={session.user.email ?? ""}
      userName={session.user.name ?? ""}
    />
  );
}
