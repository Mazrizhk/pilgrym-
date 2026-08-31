import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatLKR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign, Users, Star, TrendingUp, AlertCircle } from "lucide-react";

export default async function AgencyOverviewPage() {
  const session = await auth();
  if (!session) return null;

  const agency = await prisma.agency.findUnique({
    where: { userId: session.user.id },
    include: {
      subscription: true,
      packages: { select: { id: true, status: true } },
    },
  });

  if (!agency) {
    redirect("/agency/onboarding");
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [bookings, pendingPayout, unreadMessages] = await Promise.all([
    prisma.booking.findMany({
      where: {
        package: { agencyId: agency.id },
        createdAt: { gte: monthStart },
      },
      include: {
        package: { select: { title: true } },
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.booking.aggregate({
      where: {
        package: { agencyId: agency.id },
        status: "COMPLETED",
      },
      _sum: { agencyAmount: true },
    }),
    prisma.message.count({
      where: {
        booking: { package: { agencyId: agency.id } },
        read: false,
        senderId: { not: session.user.id },
      },
    }),
  ]);

  const thisMonthRevenue = bookings.reduce((sum, b) => sum + b.agencyAmount, 0);
  const thisMonthBookings = bookings.length;
  const activePackages = agency.packages.filter((p) => p.status === "ACTIVE").length;

  const statusLabels: Record<string, string> = {
    PAID: "Paid", PROCESSING: "Processing", CONFIRMED: "Confirmed",
    COMPLETED: "Completed", DISPUTED: "Disputed",
  };
  const statusColors: Record<string, "warning" | "default" | "success" | "secondary" | "destructive"> = {
    PAID: "warning", PROCESSING: "default", CONFIRMED: "success",
    COMPLETED: "secondary", DISPUTED: "destructive",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Assalamu Alaikum, {agency.name} 🤲
        </h1>
        <p className="text-[#64748B] mt-1">Here&apos;s your agency overview for this month</p>
      </div>

      {/* Verification banner */}
      {agency.verificationStatus !== "APPROVED" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">
              {agency.verificationStatus === "PENDING"
                ? "Verification Pending"
                : agency.verificationStatus === "UNDER_REVIEW"
                ? "Under Review"
                : "Verification Rejected"}
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              {agency.verificationStatus === "PENDING"
                ? "Complete your verification to publish packages and receive bookings."
                : agency.verificationStatus === "UNDER_REVIEW"
                ? "Our team is reviewing your documents. You'll hear back within 48 hours."
                : "Your verification was rejected. Please resubmit the required documents."}
            </p>
            <Link href="/agency/verification" className="mt-2 inline-block">
              <Button size="sm" variant="outline" className="border-amber-400 text-amber-700">
                View Verification →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Bookings This Month", value: thisMonthBookings, icon: Package, color: "text-[#0891b2]", bg: "bg-cyan-50" },
          { label: "Revenue (Net)", value: formatLKR(thisMonthRevenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Packages", value: activePackages, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Pending Payout", value: formatLKR(pendingPayout._sum.agencyAmount ?? 0), icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Rating", value: agency.rating.toFixed(1) + "★", icon: Star, color: "text-[#D4A017]", bg: "bg-yellow-50" },
          { label: "Unread Messages", value: unreadMessages, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={`w-8 h-8 ${kpi.bg} rounded-lg flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-xl font-bold text-[#0F172A]">{kpi.value}</div>
            <div className="text-xs text-[#64748B] mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-[#0F172A]">Recent Bookings</h2>
          <Link href="/agency/bookings">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-medium text-[#0F172A] mb-2">No bookings yet</h3>
            <p className="text-sm text-[#64748B] mb-4">Create and publish packages to start receiving bookings</p>
            <Link href="/agency/packages/new">
              <Button>Create Package</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Booking Ref</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Package</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 font-mono text-xs text-[#64748B]">{booking.bookingRef}</td>
                    <td className="px-5 py-3 text-[#0F172A]">{booking.customer.name}</td>
                    <td className="px-5 py-3 text-[#64748B] max-w-[200px] truncate">{booking.package.title}</td>
                    <td className="px-5 py-3 font-medium text-[#0F172A]">{formatLKR(booking.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusColors[booking.status] ?? "secondary"}>
                        {statusLabels[booking.status] ?? booking.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/agency/bookings/${booking.bookingRef}`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
