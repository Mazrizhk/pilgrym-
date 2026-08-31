import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatLKR, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Payouts" };

const statusColors: Record<string, "warning" | "default" | "success" | "secondary"> = {
  PENDING: "warning", PROCESSING: "default", COMPLETED: "success", FAILED: "secondary",
};

export default async function AgencyPayoutsPage() {
  const session = await auth();
  if (!session) return null;

  const agency = await prisma.agency.findUnique({ where: { userId: session.user.id } });
  if (!agency) return null;

  const payouts = await prisma.payout.findMany({
    where: { agencyId: agency.id },
    include: { booking: { select: { bookingRef: true, package: { select: { title: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const pending = payouts.filter((p) => p.status === "PENDING").reduce((s, p) => s + p.amount, 0);
  const paid = payouts.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Payouts</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-[#64748B]">Pending Payout</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{formatLKR(pending)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-[#64748B]">Total Paid Out</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatLKR(paid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-[#64748B]">Total Payouts</p>
          <p className="text-2xl font-bold text-[#0F172A] mt-1">{payouts.length}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <strong>Payout Schedule:</strong> Payouts are released within 3–5 business days after a booking is marked <strong>COMPLETED</strong>. Bank transfers are made to your registered bank account.
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-[#F8FAFC] border-b border-gray-100">
          <p className="text-sm text-[#64748B]">{payouts.length} payout record{payouts.length !== 1 ? "s" : ""}</p>
        </div>
        {payouts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">💰</div>
            <p className="text-[#64748B]">No payouts yet. Complete bookings to earn payouts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {["Booking", "Package", "Amount", "Status", "Date", "Reference"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 font-mono text-xs text-[#64748B]">{p.booking.bookingRef}</td>
                    <td className="px-5 py-3 text-[#0F172A] max-w-[200px] truncate">{p.booking.package.title}</td>
                    <td className="px-5 py-3 font-semibold text-emerald-600">{formatLKR(p.amount)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusColors[p.status] ?? "secondary"}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">{formatDate(p.createdAt)}</td>
                    <td className="px-5 py-3 text-[#64748B] font-mono text-xs">{p.stripeTransferId ?? "—"}</td>
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
