import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { current, next } = await req.json();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) return NextResponse.json({ error: "No password set" }, { status: 400 });

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  const hashed = await bcrypt.hash(next, 12);
  await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });
  return NextResponse.json({ ok: true });
}
