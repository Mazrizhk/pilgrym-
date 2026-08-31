import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const agency = await prisma.agency.findUnique({
    where: { userId: session.user.id },
    select: {
      name: true, slug: true, city: true, phone: true, email: true,
      website: true, description: true, yearsExperience: true,
      licenseNumber: true, bankName: true, bankAccount: true, bankBranch: true,
    },
  });
  if (!agency) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agency);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "AGENCY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { name, city, phone, email, website, description, yearsExperience, licenseNumber, bankName, bankAccount, bankBranch } = body;

  const updated = await prisma.agency.update({
    where: { userId: session.user.id },
    data: { name, city, phone, email, website, description, yearsExperience: Number(yearsExperience), licenseNumber, bankName, bankAccount, bankBranch },
  });
  return NextResponse.json(updated);
}
