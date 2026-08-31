import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId, reason } = await req.json();

  if (!bookingId || !reason?.trim()) {
    return NextResponse.json({ error: "bookingId and reason are required" }, { status: 400 });
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: session.user.id },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Cannot raise a dispute on a completed or cancelled booking" }, { status: 400 });
  }

  const existingDispute = await prisma.dispute.findFirst({ where: { bookingId } });
  if (existingDispute) {
    return NextResponse.json({ error: "A dispute already exists for this booking" }, { status: 409 });
  }

  const dispute = await prisma.$transaction([
    prisma.dispute.create({ data: { bookingId, reason, status: "OPEN" } }),
    prisma.booking.update({ where: { id: bookingId }, data: { status: "DISPUTED" } }),
  ]);

  return NextResponse.json(dispute[0], { status: 201 });
}
