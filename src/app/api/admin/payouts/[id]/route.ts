export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { status, stripeTransferId } = await req.json();

  const updated = await prisma.payout.update({
    where: { id },
    data: { status, stripeTransferId: stripeTransferId ?? undefined },
  });
  return NextResponse.json(updated);
}
