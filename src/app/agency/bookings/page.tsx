import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatLKR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, "warning" | "default" | "success" | "secondary" | "destructive"> = {
  PAID: "warning", PROCESSING: "default", CONFIRMED: "success",
  COMPLETED: "secondary", DISPUTED: "destructive",
};

export default async function AgencyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session) return null;
  const sp = await searchParams;

  const agency = await prisma.agency.findUnique({ where: { userId: session.user.id } });
  if (!agency) return null;

  const where: Record<string, unknown> = { package: { agencyId: agency.id } };
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
      customer: { select: { name: true, email: true, phone: true } },
      package: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statuses = ["", "PAID", "PROCESSING", "CONFIRMED", "COMPLETED", "DISPUTED"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Bookings</h1>

      {/* Filters */}
      <form className="flex gap-3 mb-6 flex-wrap">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search by ref or customer name…"
          className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2] w-64"
        />
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s || "All Statuses"}</option>
          ))}
        </select>
        <Button type="submit" size="sm">Filter</Button>
        <Link href="/agency/bookings"><Button type="button" variant="outline" size="sm">Clear</Button></Link>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-[#F8FAFC] border-b border-gray-100">
          <p className="text-sm text-[#64748B]">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
        </div>
        {bookings.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-[#64748B]">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {["Ref", "Customer", "Package", "Date", "Adults", "Amount", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 font-mono text-xs text-[#64748B]">{b.bookingRef}</td>
                    <td className="px-5 py-3 text-[#0F172A]">{b.customer.name}</td>
                    <td className="px-5 py-3 text-[#64748B] max-w-[180px] truncate">{b.package.title}</td>
                    <td className="px-5 py-3 text-[#64748B]">{formatDate(b.travelDate)}</td>
                    <td className="px-5 py-3 text-[#64748B]">{b.adults}</td>
                    <td className="px-5 py-3 font-medium text-[#0F172A]">{formatLKR(b.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusColors[b.status] ?? "secondary"}>{b.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/agency/bookings/${b.bookingRef}`}>
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
