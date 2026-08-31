import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { PackageType, PackageStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "AGENCY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
      include: { subscription: true },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    const body = await req.json();

    // Check free plan limits
    const plan = agency.subscription?.plan ?? "FREE";
    if (plan === "FREE") {
      const activeCount = await prisma.package.count({
        where: { agencyId: agency.id, status: { in: ["ACTIVE", "DRAFT"] } },
      });
      if (activeCount >= 5 && body.status === "ACTIVE") {
        return NextResponse.json(
          { error: "Free plan allows up to 5 packages. Upgrade to publish more." },
          { status: 403 }
        );
      }
    }

    const slug = await generateUniqueSlug(body.title, agency.slug);

    const pkg = await prisma.package.create({
      data: {
        agencyId: agency.id,
        title: body.title,
        slug,
        description: body.description,
        shortDescription: body.shortDescription || null,
        type: body.type as PackageType,
        durationDays: (body.durationNights ?? 11) + 1,
        durationNights: body.durationNights ?? 11,
        departureCity: body.departureCity ?? "Colombo",
        departureDate: new Date(body.departureDate),
        returnDate: new Date(body.returnDate),
        seatsTotal: body.seatsTotal,
        seatsAvailable: body.seatsTotal,
        pricePerPerson: body.pricePerPerson,
        originalPrice: body.originalPrice || null,
        status: (body.status as PackageStatus) ?? PackageStatus.DRAFT,
        hotelMakkah: body.hotelMakkah || null,
        hotelMakkahStars: body.hotelMakkahStars || null,
        hotelMadinah: body.hotelMadinah || null,
        hotelMadinahStars: body.hotelMadinahStars || null,
        hotelDistanceMakkah: body.hotelDistanceMakkah || null,
        hotelDistanceMadinah: body.hotelDistanceMadinah || null,
        visaIncluded: body.visaIncluded ?? true,
        flightIncluded: body.flightIncluded ?? true,
        transportIncluded: body.transportIncluded ?? true,
        mealsIncluded: body.mealsIncluded ?? false,
        publishedAt: body.status === "ACTIVE" ? new Date() : null,
      },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    console.error("Create package error:", error);
    return NextResponse.json({ error: "Failed to create package." }, { status: 500 });
  }
}

async function generateUniqueSlug(title: string, agencySlug: string): Promise<string> {
  const base = slugify(`${title}-${agencySlug}`);
  let slug = base;
  let i = 1;
  while (await prisma.package.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}
