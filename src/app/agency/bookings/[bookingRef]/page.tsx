import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatLKR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BookingStatusUpdater from "@/components/BookingStatusUpdater";
import MessageThread from "@/components/MessageThread";

export default async function AgencyBookingDetailPage({
  params,
}: {
  params: Promise<{ bookingRef: string }>;
}) {
  const session = await auth();
  if (!session) return null;
  const { bookingRef } = await params;

  const agency = await prisma.agency.findUnique({ where: { userId: session.user.id } });
  if (!agency) return null;

  const booking = await prisma.booking.findFirst({
    where: { bookingRef, package: { agencyId: agency.id } },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      package: { select: { title: true, departureDate: true, pricePerPerson: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!booking) notFound();

  const statusColors: Record<string, "warning" | "default" | "success" | "secondary" | "destructive"> = {
    PAID: "warning", PROCESSING: "default", CONFIRMED: "success",
    COMPLETED: "secondary", DISPUTED: "destructive",
  };

  const showContact = ["CONFIRMED", "COMPLETED", "DISPUTED"].includes(booking.status);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/agency/bookings" className="text-sm text-[#0891b2] hover:underline">← Bookings</Link>
        <span className="text-[#64748B]">/</span>
        <span className="text-sm font-mono text-[#64748B]">{booking.bookingRef}</span>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{booking.package.title}</h1>
          <p className="text-sm text-[#64748B] mt-1">{booking.bookingRef} · {formatDate(booking.travelDate)}</p>
        </div>
        <Badge variant={statusColors[booking.status] ?? "secondary"} className="text-sm px-3 py-1">
          {booking.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Customer info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Customer Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Name</span>
              <span className="text-[#0F172A] font-medium">{booking.customer.name}</span>
            </div>
            {showContact ? (
              <>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Email</span>
                  <span className="text-[#0F172A]">{booking.customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Phone</span>
                  <span className="text-[#0F172A]">{booking.customer.phone ?? "—"}</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
                Contact details visible once booking is Confirmed.
              </p>
            )}
            <div className="flex justify-between">
              <span className="text-[#64748B]">Adults</span>
              <span className="text-[#0F172A]">{booking.adults}</span>
            </div>
            {booking.children > 0 && (
              <div className="flex justify-between">
                <span className="text-[#64748B]">Children</span>
                <span className="text-[#0F172A]">{booking.children}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Payment Breakdown</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Total Paid by Customer</span>
              <span className="text-[#0F172A] font-medium">{formatLKR(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Pilgrym Commission (5%)</span>
              <span className="text-red-600">−{formatLKR(booking.commissionAmount)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-100 pt-2">
              <span className="text-[#0F172A]">Your Payout</span>
              <span className="text-emerald-600 text-lg">{formatLKR(booking.agencyAmount)}</span>
            </div>
          </div>
          <p className="text-xs text-[#64748B] mt-3 bg-[#F8FAFC] rounded p-2">
            Payout released after booking status is set to COMPLETED.
          </p>
        </div>
      </div>

      {/* Status updater */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-[#0F172A] mb-4">Update Booking Status</h2>
        <BookingStatusUpdater
          bookingId={booking.id}
          currentStatus={booking.status}
          bookingRef={booking.bookingRef}
        />
      </div>

      {/* Internal notes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-[#0F172A] mb-3">Internal Notes</h2>
        <InternalNotes bookingId={booking.id} initialNotes={booking.internalNotes ?? ""} />
      </div>

      {/* Message thread */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-[#0F172A]">Messages with Customer</h2>
        </div>
        <MessageThread
          bookingId={booking.id}
          currentUserId={session.user.id}
          initialMessages={booking.messages.map((m) => ({
            id: m.id,
            content: m.content,
            createdAt: m.createdAt.toISOString(),
            read: m.read,
            sender: m.sender,
          }))}
        />
      </div>
    </div>
  );
}

function InternalNotes({ bookingId, initialNotes }: { bookingId: string; initialNotes: string }) {
  return (
    <form action={`/api/agency/bookings/${bookingId}/notes`} method="POST">
      <textarea
        name="notes"
        defaultValue={initialNotes}
        rows={3}
        placeholder="Internal notes (not visible to customer)…"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none"
      />
      <button type="submit" className="mt-2 px-3 py-1.5 text-xs bg-[#0891b2] text-white rounded-lg hover:bg-[#0e7490]">
        Save Notes
      </button>
    </form>
  );
}
