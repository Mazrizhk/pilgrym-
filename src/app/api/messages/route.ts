import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId, content } = await req.json();
  if (!bookingId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify access
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [
        { customerId: session.user.id },
        { package: { agency: { userId: session.user.id } } },
      ],
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await prisma.message.create({
    data: { bookingId, senderId: session.user.id, content: content.trim() },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });

  return NextResponse.json({
    id: message.id,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    read: message.read,
    sender: message.sender,
  });
}
