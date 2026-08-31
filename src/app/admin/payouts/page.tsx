import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatLKR, formatDate } from "@/lib/utils";
import AdminPayoutActions from "./AdminPayoutActions";

export const metadata = { title: "Payouts — Admin" };

export default async function AdminPayoutsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;

  const payouts = await prisma.payout.findMany({
    include: {
      agency: { select: { name: true, bankName: true, bankAccount: true } },
      booking: { select: { bookingRef: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = payouts.filter((p) => p.status === "PENDING");
  const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);
  const paidTotal = payouts.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Payouts</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending Payout", value: formatLKR(pendingTotal), color: "text-amber-400" },
          { label: "Total Paid Out", value: formatLKR(paidTotal), color: "text-emerald-400" },
          { label: "Pending Items", value: pending.length, color: "text-white" },
        ].map((k) => (
          <div key={k.label} className="bg-[#1E293B] rounded-xl border border-gray-700 p-4">
            <p className="text-xs text-gray-400">{k.label}</p>
            <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                {["Booking", "Agency", "Bank", "Amount", "Status", "Date", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-[#0F172A]">
                  <td className="px-5 py-3 font-mono text-xs text-gray-300">{p.booking.bookingRef}</td>
                  <td className="px-5 py-3 text-white">{p.agency.name}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{p.agency.bankName ?? "—"} · {p.agency.bankAccount ?? "—"}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-400">{formatLKR(p.amount)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={p.status === "COMPLETED" ? "success" : p.status === "PENDING" ? "warning" : "secondary"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3">
                    {p.status === "PENDING" && <AdminPayoutActions payoutId={p.id} />}
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
