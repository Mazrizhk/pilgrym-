import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import MessageThread from "@/components/MessageThread";
import Link from "next/link";

export const metadata = { title: "Agency Messages" };

export default async function AgencyMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const session = await auth();
  if (!session) return null;
  const sp = await searchParams;

  const agency = await prisma.agency.findUnique({ where: { userId: session.user.id } });
  if (!agency) return null;

  const bookings = await prisma.booking.findMany({
    where: { package: { agencyId: agency.id } },
    include: {
      package: { select: { title: true } },
      customer: { select: { name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeBookingId = sp.booking ?? bookings[0]?.id;

  let messages: Array<{ id: string; content: string; createdAt: string; read: boolean; sender: { id: string; name: string; role: string } }> = [];
  if (activeBookingId) {
    const msgs = await prisma.message.findMany({
      where: { bookingId: activeBookingId },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });
    messages = msgs.map((m) => ({
      id: m.id, content: m.content, createdAt: m.createdAt.toISOString(),
      read: m.read, sender: m.sender,
    }));
  }

  const activeBooking = bookings.find((b) => b.id === activeBookingId);

  if (bookings.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-4">💬</div>
        <h3 className="text-lg font-semibold text-[#0F172A] mb-2">No messages yet</h3>
        <p className="text-[#64748B]">Messages appear when customers contact you about their bookings.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Messages</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex h-[600px]">
          <div className="w-72 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-medium text-[#64748B]">Customer Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {bookings.map((b) => {
                const lastMsg = b.messages[0];
                const isActive = b.id === activeBookingId;
                const unread = b.messages.filter((m) => !m.read).length;
                return (
                  <Link
                    key={b.id}
                    href={`/agency/messages?booking=${b.id}`}
                    className={`block p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isActive ? "bg-cyan-50 border-l-2 border-l-[#0891b2]" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{b.customer.name}</p>
                      {unread > 0 && (
                        <span className="w-5 h-5 bg-[#0891b2] text-white text-xs rounded-full flex items-center justify-center shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] truncate mt-0.5">{b.package.title}</p>
                    {lastMsg && (
                      <p className="text-xs text-[#64748B] truncate mt-1">{lastMsg.content}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {activeBooking ? (
              <>
                <div className="p-4 border-b border-gray-100">
                  <p className="font-medium text-[#0F172A]">{activeBooking.customer.name}</p>
                  <p className="text-xs text-[#64748B]">{activeBooking.package.title} · {activeBooking.bookingRef}</p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <MessageThread
                    bookingId={activeBookingId!}
                    currentUserId={session.user.id}
                    initialMessages={messages}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#64748B] text-sm">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
