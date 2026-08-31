import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatLKR } from "@/lib/utils";

export const metadata = { title: "Analytics" };

export default async function AgencyAnalyticsPage() {
  const session = await auth();
  if (!session) return null;

  const agency = await prisma.agency.findUnique({ where: { userId: session.user.id } });
  if (!agency) return null;

  const bookings = await prisma.booking.findMany({
    where: { package: { agencyId: agency.id } },
    include: { package: { select: { title: true, type: true } } },
    orderBy: { createdAt: "asc" },
  });

  const totalRevenue = bookings.reduce((s, b) => s + b.agencyAmount, 0);
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
  const conversionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  const byPackage: Record<string, { title: string; count: number; revenue: number }> = {};
  for (const b of bookings) {
    const key = b.package.title;
    if (!byPackage[key]) byPackage[key] = { title: key, count: 0, revenue: 0 };
    byPackage[key].count++;
    byPackage[key].revenue += b.agencyAmount;
  }
  const packageStats = Object.values(byPackage).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const byMonth: Record<string, { month: string; bookings: number; revenue: number }> = {};
  for (const b of bookings) {
    const key = b.createdAt.toISOString().slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { month: key, bookings: 0, revenue: 0 };
    byMonth[key].bookings++;
    byMonth[key].revenue += b.agencyAmount;
  }
  const monthlyStats = Object.values(byMonth).slice(-6);

  const byType: Record<string, number> = {};
  for (const b of bookings) {
    byType[b.package.type] = (byType[b.package.type] ?? 0) + 1;
  }

  const packages = await prisma.package.findMany({
    where: { agencyId: agency.id },
    select: { id: true, title: true, status: true, seatsTotal: true, seatsLeft: true, avgRating: true, reviewCount: true },
  });

  const avgRating = packages.filter((p) => p.reviewCount > 0).reduce((s, p) => s + p.avgRating, 0) / (packages.filter((p) => p.reviewCount > 0).length || 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Analytics</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: formatLKR(totalRevenue), color: "text-emerald-600" },
          { label: "Total Bookings", value: totalBookings, color: "text-[#0891b2]" },
          { label: "Completion Rate", value: `${conversionRate}%`, color: "text-purple-600" },
          { label: "Avg Rating", value: avgRating.toFixed(1) + " ★", color: "text-amber-500" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-[#64748B] mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Monthly bookings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Monthly Performance (Last 6 months)</h2>
          {monthlyStats.length === 0 ? (
            <p className="text-sm text-[#64748B]">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {monthlyStats.map((m) => {
                const maxRev = Math.max(...monthlyStats.map((x) => x.revenue), 1);
                const pct = Math.round((m.revenue / maxRev) * 100);
                return (
                  <div key={m.month}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#64748B]">{m.month}</span>
                      <span className="font-medium text-[#0F172A]">{formatLKR(m.revenue)} · {m.bookings} booking{m.bookings !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-[#0891b2] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top packages */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Top Packages by Revenue</h2>
          {packageStats.length === 0 ? (
            <p className="text-sm text-[#64748B]">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {packageStats.map((p, i) => (
                <div key={p.title} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0891b2] text-white text-xs flex items-center justify-center shrink-0 font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">{p.title}</p>
                    <p className="text-xs text-[#64748B]">{p.count} booking{p.count !== 1 ? "s" : ""}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 shrink-0">{formatLKR(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Package type split + seat utilisation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Booking Type Split</h2>
          {Object.keys(byType).length === 0 ? (
            <p className="text-sm text-[#64748B]">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(byType).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-[#64748B]">{type}</span>
                  <span className="font-medium text-[#0F172A]">{count} ({Math.round((count / totalBookings) * 100)}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Seat Utilisation</h2>
          {packages.length === 0 ? (
            <p className="text-sm text-[#64748B]">No packages yet.</p>
          ) : (
            <div className="space-y-3">
              {packages.slice(0, 5).map((p) => {
                const sold = p.seatsTotal - p.seatsLeft;
                const pct = p.seatsTotal > 0 ? Math.round((sold / p.seatsTotal) * 100) : 0;
                return (
                  <div key={p.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#64748B] truncate max-w-[60%]">{p.title}</span>
                      <span className="text-[#0F172A] font-medium">{sold}/{p.seatsTotal} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className={`h-2 rounded-full ${pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
