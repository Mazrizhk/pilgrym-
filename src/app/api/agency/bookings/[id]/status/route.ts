export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const validTransitions: Record<string, string> = {
  PAID: "PROCESSING",
  PROCESSING: "CONFIRMED",
  CONFIRMED: "COMPLETED",
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  const booking = await prisma.booking.findFirst({
    where: { id, package: { agency: { userId: session.user.id } } },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (validTransitions[booking.status] !== status) {
    return NextResponse.json(
      { error: `Cannot transition from ${booking.status} to ${status}` },
      { status: 400 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}
