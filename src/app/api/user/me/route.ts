export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
  });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, phone } = await req.json();
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, phone: phone || null },
    select: { id: true, name: true, email: true, phone: true },
  });
  return NextResponse.json(user);
}
