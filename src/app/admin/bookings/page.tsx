import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLKR, formatDate } from "@/lib/utils";

export const metadata = { title: "Bookings — Admin" };

const statusVariants: Record<string, "warning" | "default" | "success" | "secondary" | "destructive"> = {
  PAID: "warning", PROCESSING: "default", CONFIRMED: "success",
  COMPLETED: "secondary", DISPUTED: "destructive", CANCELLED: "destructive",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  const sp = await searchParams;

  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status;
  if (sp.q) {
    where.OR = [
      { bookingRef: { contains: sp.q, mode: "insensitive" } },
      { customer: { name: { contains: sp.q, mode: "insensitive" } } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      customer: { select: { name: true, email: true } },
      package: { select: { title: true, agency: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalAmount = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const totalCommission = bookings.reduce((s, b) => s + b.commissionAmount, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">All Bookings</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Value", value: formatLKR(totalAmount), color: "text-[#0891b2]" },
          { label: "Platform Commission", value: formatLKR(totalCommission), color: "text-emerald-400" },
          { label: "Bookings Shown", value: bookings.length, color: "text-white" },
        ].map((k) => (
          <div key={k.label} className="bg-[#1E293B] rounded-xl border border-gray-700 p-4">
            <p className="text-xs text-gray-400">{k.label}</p>
            <p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <form className="flex gap-3 mb-6 flex-wrap">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search by ref or customer…"
          className="h-10 rounded-lg border border-gray-700 bg-[#1E293B] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2] w-64"
        />
        <select name="status" defaultValue={sp.status ?? ""} className="h-10 rounded-lg border border-gray-700 bg-[#1E293B] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
          {["", "PAID", "PROCESSING", "CONFIRMED", "COMPLETED", "DISPUTED", "CANCELLED"].map((s) => (
            <option key={s} value={s}>{s || "All Statuses"}</option>
          ))}
        </select>
        <Button type="submit" size="sm">Filter</Button>
        <Link href="/admin/bookings"><Button type="button" variant="outline" size="sm">Clear</Button></Link>
      </form>

      <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                {["Ref", "Customer", "Agency", "Package", "Amount", "Commission", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#0F172A]">
                  <td className="px-5 py-3 font-mono text-xs text-gray-300">{b.bookingRef}</td>
                  <td className="px-5 py-3 text-white">{b.customer.name}</td>
                  <td className="px-5 py-3 text-gray-300">{b.package.agency.name}</td>
                  <td className="px-5 py-3 text-gray-400 max-w-[180px] truncate">{b.package.title}</td>
                  <td className="px-5 py-3 font-medium text-[#0891b2]">{formatLKR(b.totalAmount)}</td>
                  <td className="px-5 py-3 text-emerald-400">{formatLKR(b.commissionAmount)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariants[b.status] ?? "secondary"}>{b.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
