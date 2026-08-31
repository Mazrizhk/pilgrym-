import { prisma } from "@/lib/prisma";
import { formatLKR } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Package, BookOpen, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

export default async function AdminOverviewPage() {
  const [
    totalAgencies,
    pendingVerifications,
    totalPackages,
    totalBookings,
    openDisputes,
    revenueData,
    pendingPayouts,
    recentBookings,
  ] = await Promise.all([
    prisma.agency.count({ where: { verificationStatus: "APPROVED" } }),
    prisma.agency.count({ where: { verificationStatus: { in: ["PENDING", "UNDER_REVIEW"] } } }),
    prisma.package.count({ where: { status: "ACTIVE" } }),
    prisma.booking.count(),
    prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.booking.aggregate({
      where: { status: { in: ["CONFIRMED", "COMPLETED", "PAID", "PROCESSING"] } },
      _sum: { totalAmount: true, commissionAmount: true },
    }),
    prisma.booking.aggregate({
      where: { status: "COMPLETED" },
      _sum: { agencyAmount: true },
    }),
    prisma.booking.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        package: { select: { title: true, agency: { select: { name: true } } } },
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Admin Overview</h1>
        <p className="text-[#64748B] mt-1">Platform health and key metrics</p>
      </div>

      {/* Alert center */}
      {(pendingVerifications > 0 || openDisputes > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Action Required
          </h3>
          <div className="flex flex-wrap gap-3">
            {pendingVerifications > 0 && (
              <Link href="/admin/agencies?status=PENDING">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                  {pendingVerifications} Pending Verification{pendingVerifications > 1 ? "s" : ""}
                </Button>
              </Link>
            )}
            {openDisputes > 0 && (
              <Link href="/admin/disputes">
                <Button size="sm" variant="destructive">
                  {openDisputes} Open Dispute{openDisputes > 1 ? "s" : ""}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Active Agencies", value: totalAgencies, icon: Building2, color: "text-[#0891b2]", bg: "bg-cyan-50", href: "/admin/agencies" },
          { label: "Active Packages", value: totalPackages, icon: Package, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/packages" },
          { label: "Total Bookings", value: totalBookings, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/bookings" },
          { label: "Open Disputes", value: openDisputes, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", href: "/admin/disputes" },
          { label: "Commission Earned", value: formatLKR(revenueData._sum.commissionAmount ?? 0), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/payouts" },
          { label: "Pending Payouts", value: formatLKR(pendingPayouts._sum.agencyAmount ?? 0), icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/payouts" },
        ].map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className={`w-8 h-8 ${kpi.bg} rounded-lg flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="text-lg font-bold text-[#0F172A] leading-tight">{kpi.value}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{kpi.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-[#0F172A]">Recent Bookings</h2>
          <Link href="/admin/bookings">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-gray-100">
              <tr>
                {["Ref", "Customer", "Agency", "Package", "Amount", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3 font-mono text-xs text-[#64748B]">{b.bookingRef}</td>
                  <td className="px-5 py-3 text-[#0F172A]">{b.customer.name}</td>
                  <td className="px-5 py-3 text-[#64748B]">{b.package.agency.name}</td>
                  <td className="px-5 py-3 text-[#64748B] max-w-[160px] truncate">{b.package.title}</td>
                  <td className="px-5 py-3 font-medium text-[#0F172A]">{formatLKR(b.totalAmount)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={b.status === "CONFIRMED" ? "success" : b.status === "COMPLETED" ? "secondary" : b.status === "DISPUTED" ? "destructive" : "warning"}>
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
