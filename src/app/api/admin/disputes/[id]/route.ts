import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { status, resolution } = await req.json();

  const updated = await prisma.dispute.update({
    where: { id },
    data: {
      status,
      resolution: resolution ?? undefined,
      resolvedAt: ["RESOLVED", "CLOSED"].includes(status) ? new Date() : undefined,
    },
  });
  return NextResponse.json(updated);
}
