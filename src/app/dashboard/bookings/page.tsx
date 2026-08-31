import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatLKR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, "warning" | "default" | "success" | "secondary" | "destructive"> = {
  PAID: "warning",
  PROCESSING: "default",
  CONFIRMED: "success",
  COMPLETED: "secondary",
  DISPUTED: "destructive",
  REFUNDED: "secondary",
  CANCELLED: "secondary",
};

const statusLabels: Record<string, string> = {
  PAID: "Payment Received — Awaiting Confirmation",
  PROCESSING: "Agency is Processing",
  CONFIRMED: "Booking Confirmed ✓",
  COMPLETED: "Journey Completed",
  DISPUTED: "Dispute In Progress",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

export const metadata = { title: "My Bookings" };

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session) return null;
  const sp = await searchParams;
  const tab = sp.tab ?? "all";

  const statusFilter: Record<string, string[]> = {
    all: [],
    active: ["PAID", "PROCESSING", "CONFIRMED"],
    completed: ["COMPLETED"],
    cancelled: ["CANCELLED", "REFUNDED"],
  };

  const where: Record<string, unknown> = { customerId: session.user.id };
  if (statusFilter[tab]?.length) where.status = { in: statusFilter[tab] };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      package: {
        select: {
          title: true,
          slug: true,
          departureDate: true,
          agency: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const tabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">My Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/bookings?tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-[#0891b2] text-[#0891b2]"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">🕌</div>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-2">No bookings found</h3>
          <p className="text-[#64748B] mb-6">
            {tab === "all" ? "You haven't made any bookings yet." : `No ${tab} bookings.`}
          </p>
          <Link href="/packages">
            <Button>Browse Packages</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0F172A] truncate">
                    {booking.package.title}
                  </p>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    {booking.package.agency.name}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-[#64748B]">
                    <span className="font-mono">{booking.bookingRef}</span>
                    <span>·</span>
                    <span>Departs {formatDate(booking.travelDate)}</span>
                    <span>·</span>
                    <span>
                      {booking.adults} adult{booking.adults > 1 ? "s" : ""}
                      {booking.children > 0 ? `, ${booking.children} child${booking.children > 1 ? "ren" : ""}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-lg font-bold text-[#0891b2]">
                    {formatLKR(booking.totalAmount)}
                  </span>
                  <Badge variant={statusColors[booking.status] ?? "secondary"}>
                    {statusLabels[booking.status] ?? booking.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 flex-wrap">
                <Link href={`/dashboard/bookings/${booking.bookingRef}`}>
                  <Button size="sm">View Details</Button>
                </Link>
                <Link href={`/dashboard/messages`}>
                  <Button size="sm" variant="outline">Message Agency</Button>
                </Link>
                {["PAID", "PROCESSING", "CONFIRMED"].includes(booking.status) && (
                  <Link href={`/dashboard/bookings/${booking.bookingRef}#dispute`}>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                      Raise Dispute
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
