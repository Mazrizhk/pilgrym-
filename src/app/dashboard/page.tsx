import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatLKR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, MessageSquare, Calendar } from "lucide-react";

const statusColors: Record<string, string> = {
  PAID: "warning",
  PROCESSING: "default",
  CONFIRMED: "success",
  COMPLETED: "secondary",
  DISPUTED: "destructive",
  REFUNDED: "secondary",
  CANCELLED: "secondary",
};

const statusLabels: Record<string, string> = {
  PAID: "Payment Received",
  PROCESSING: "Processing",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  DISPUTED: "Dispute In Progress",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const [bookings, unreadMessages] = await Promise.all([
    prisma.booking.findMany({
      where: { customerId: session.user.id },
      include: {
        package: {
          select: { title: true, slug: true, departureDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.message.count({
      where: {
        booking: { customerId: session.user.id },
        read: false,
        senderId: { not: session.user.id },
      },
    }),
  ]);

  const activeBookings = bookings.filter((b) =>
    ["PAID", "PROCESSING", "CONFIRMED"].includes(b.status)
  );
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");

  // Find nearest upcoming departure
  const upcomingBooking = bookings
    .filter((b) => ["CONFIRMED"].includes(b.status) && new Date(b.travelDate) > new Date())
    .sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime())[0];

  const daysUntilDeparture = upcomingBooking
    ? Math.ceil((new Date(upcomingBooking.travelDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Assalamu Alaikum, {session.user.name?.split(" ")[0]} 🤲
        </h1>
        <p className="text-[#64748B] mt-1">Welcome to your Pilgrym dashboard</p>
      </div>

      {/* Countdown banner */}
      {upcomingBooking && daysUntilDeparture !== null && (
        <div className="bg-gradient-to-r from-[#0891b2] to-[#0e7490] rounded-xl p-5 mb-6 text-white">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-cyan-200" />
            <div>
              <p className="font-bold text-lg">
                Your journey begins in {daysUntilDeparture} days! ✈️
              </p>
              <p className="text-cyan-200 text-sm">
                {upcomingBooking.package.title} · Departing {formatDate(upcomingBooking.travelDate)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-[#0891b2]" />
            </div>
            <span className="text-sm text-[#64748B]">Active Bookings</span>
          </div>
          <div className="text-3xl font-bold text-[#0F172A]">{activeBookings.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <span className="text-emerald-600 text-lg">✓</span>
            </div>
            <span className="text-sm text-[#64748B]">Completed Journeys</span>
          </div>
          <div className="text-3xl font-bold text-[#0F172A]">{completedBookings.length}</div>
        </div>
        <Link href="/dashboard/messages" className="block">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm text-[#64748B]">Unread Messages</span>
            </div>
            <div className="text-3xl font-bold text-[#0F172A]">{unreadMessages}</div>
          </div>
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-[#0F172A]">Recent Bookings</h2>
          <Link href="/dashboard/bookings">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🕌</div>
            <h3 className="font-medium text-[#0F172A] mb-2">No bookings yet</h3>
            <p className="text-sm text-[#64748B] mb-4">Start your blessed journey today</p>
            <Link href="/packages">
              <Button>Browse Packages</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-5 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#0F172A] text-sm truncate">{booking.package.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#64748B]">{booking.bookingRef}</span>
                    <span className="text-xs text-[#64748B]">·</span>
                    <span className="text-xs text-[#64748B]">{formatDate(booking.travelDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={(statusColors[booking.status] ?? "secondary") as "warning" | "default" | "success" | "secondary" | "destructive" | "outline" | "gold" | "verified"}>
                    {statusLabels[booking.status]}
                  </Badge>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {formatLKR(booking.totalAmount)}
                  </span>
                  <Link href={`/dashboard/bookings/${booking.bookingRef}`}>
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
