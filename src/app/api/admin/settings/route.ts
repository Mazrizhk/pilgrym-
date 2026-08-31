export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { commissionRate, maintenanceMode, bannerText, freePackageLimit } = await req.json();

  const existing = await prisma.platformSettings.findFirst();
  const data = { commissionRate: Number(commissionRate), maintenanceMode: Boolean(maintenanceMode), bannerText: bannerText || null, freePackageLimit: Number(freePackageLimit) };

  const settings = existing
    ? await prisma.platformSettings.update({ where: { id: existing.id }, data })
    : await prisma.platformSettings.create({ data });

  return NextResponse.json(settings);
}
