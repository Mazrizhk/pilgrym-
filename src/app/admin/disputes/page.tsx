import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import AdminDisputeActions from "./AdminDisputeActions";

export const metadata = { title: "Disputes — Admin" };

export default async function AdminDisputesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;

  const disputes = await prisma.dispute.findMany({
    include: {
      booking: {
        include: {
          customer: { select: { name: true } },
          package: { select: { title: true, agency: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const open = disputes.filter((d) => d.status === "OPEN").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Disputes</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Open Disputes", value: open, color: "text-red-400" },
          { label: "In Review", value: disputes.filter((d) => d.status === "IN_REVIEW").length, color: "text-amber-400" },
          { label: "Resolved", value: disputes.filter((d) => d.status === "RESOLVED").length, color: "text-emerald-400" },
        ].map((k) => (
          <div key={k.label} className="bg-[#1E293B] rounded-xl border border-gray-700 p-4">
            <p className="text-xs text-gray-400">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {disputes.length === 0 && (
          <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-16 text-center">
            <p className="text-gray-400">No disputes — great news!</p>
          </div>
        )}
        {disputes.map((d) => (
          <div key={d.id} className="bg-[#1E293B] rounded-xl border border-gray-700 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{d.booking.customer.name}</p>
                  <span className="text-gray-500 text-sm">vs</span>
                  <p className="font-semibold text-gray-300">{d.booking.package.agency.name}</p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {d.booking.bookingRef} · {d.booking.package.title} · {formatDate(d.createdAt)}
                </p>
              </div>
              <Badge variant={d.status === "OPEN" ? "destructive" : d.status === "IN_REVIEW" ? "warning" : "success"}>
                {d.status.replace("_", " ")}
              </Badge>
            </div>

            <div className="bg-[#0F172A] rounded-lg p-3 mb-3">
              <p className="text-xs font-medium text-gray-400 mb-1">Customer&apos;s Reason</p>
              <p className="text-sm text-gray-200">{d.reason}</p>
            </div>

            {d.resolution && (
              <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-emerald-400 mb-1">Resolution</p>
                <p className="text-sm text-gray-200">{d.resolution}</p>
              </div>
            )}

            {d.status !== "RESOLVED" && d.status !== "CLOSED" && (
              <AdminDisputeActions disputeId={d.id} currentStatus={d.status} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
