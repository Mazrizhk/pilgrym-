import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const formData = await req.formData();
  const notes = formData.get("notes")?.toString() ?? "";

  const agency = await prisma.agency.findUnique({ where: { userId: session.user.id } });
  if (!agency) return NextResponse.json({ error: "Agency not found" }, { status: 404 });

  const booking = await prisma.booking.findFirst({
    where: { id, package: { agencyId: agency.id } },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  await prisma.booking.update({ where: { id }, data: { internalNotes: notes } });

  return NextResponse.redirect(new URL(`/agency/bookings/${booking.bookingRef}`, req.url));
}
