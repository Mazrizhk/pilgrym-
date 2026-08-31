export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCommission } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId, adults, children, totalAmount, travellers, notes } = await req.json();

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      select: { id: true, seatsAvailable: true, status: true, agencyId: true, pricePerPerson: true },
    });

    if (!pkg || pkg.status !== "ACTIVE") {
      return NextResponse.json({ error: "Package not available." }, { status: 400 });
    }

    if (pkg.seatsAvailable < adults) {
      return NextResponse.json(
        { error: `Only ${pkg.seatsAvailable} seats are available.` },
        { status: 400 }
      );
    }

    // Generate booking ref
    const year = new Date().getFullYear();
    const countThisYear = await prisma.booking.count({
      where: { createdAt: { gte: new Date(`${year}-01-01`) } },
    });
    const bookingRef = `PIL-${year}-${String(countThisYear + 1).padStart(4, "0")}`;

    const { commissionAmount, agencyAmount } = calculateCommission(totalAmount);

    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          customerId: session.user.id,
          packageId,
          bookingRef,
          status: "PAID",
          adults,
          children: children ?? 0,
          totalAmount,
          commissionAmount,
          agencyAmount,
          travelDate: pkg.pricePerPerson ? new Date() : new Date(),
          travellers: travellers ?? null,
          notes: notes || null,
        },
      }),
      prisma.package.update({
        where: { id: packageId },
        data: { seatsAvailable: { decrement: adults } },
      }),
    ]);

    return NextResponse.json({ bookingRef: booking.bookingRef }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 });
  }
}
