export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const agency = await prisma.agency.findUnique({ where: { userId: session.user.id } });
  if (!agency) return NextResponse.json({ error: "Agency not found" }, { status: 404 });

  const pkg = await prisma.package.findFirst({
    where: { id, agencyId: agency.id },
  });
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pkg);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const agency = await prisma.agency.findUnique({ where: { userId: session.user.id } });
  if (!agency) return NextResponse.json({ error: "Agency not found" }, { status: 404 });

  const existing = await prisma.package.findFirst({ where: { id, agencyId: agency.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const {
    title, shortDescription, description, type, durationNights, seatsTotal,
    pricePerPerson, originalPrice, departureDate, returnDate,
    makkahHotel, makkahHotelStars, makkahHotelDistance,
    madinahHotel, madinahHotelStars, madinahHotelDistance,
    includesFlights, includesVisa, includesTransport, includesMeals, status,
  } = body;

  const updated = await prisma.package.update({
    where: { id },
    data: {
      title, shortDescription, description, type, status,
      durationNights: Number(durationNights),
      seatsTotal: Number(seatsTotal),
      pricePerPerson: Number(pricePerPerson),
      originalPrice: Number(originalPrice) || null,
      departureDate: departureDate ? new Date(departureDate) : undefined,
      returnDate: returnDate ? new Date(returnDate) : undefined,
      makkahHotel, makkahHotelStars: Number(makkahHotelStars), makkahHotelDistance,
      madinahHotel, madinahHotelStars: Number(madinahHotelStars), madinahHotelDistance,
      includesFlights: Boolean(includesFlights),
      includesVisa: Boolean(includesVisa),
      includesTransport: Boolean(includesTransport),
      includesMeals: Boolean(includesMeals),
    },
  });
  return NextResponse.json(updated);
}
