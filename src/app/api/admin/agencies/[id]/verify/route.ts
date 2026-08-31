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
  const { status, notes } = await req.json();

  const validStatuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const agency = await prisma.agency.update({
    where: { id },
    data: { verificationStatus: status, verificationNotes: notes ?? null },
  });
  return NextResponse.json(agency);
}
