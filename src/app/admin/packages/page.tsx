import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLKR, formatDate } from "@/lib/utils";

export const metadata = { title: "Packages — Admin" };

const statusVariants: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  ACTIVE: "success", DRAFT: "warning", PAUSED: "secondary", ARCHIVED: "destructive",
};

export default async function AdminPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; type?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  const sp = await searchParams;

  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status;
  if (sp.type) where.type = sp.type;
  if (sp.q) where.title = { contains: sp.q, mode: "insensitive" };

  const packages = await prisma.package.findMany({
    where,
    include: {
      agency: { select: { name: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">All Packages</h1>

      <form className="flex gap-3 mb-6 flex-wrap">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search by title…"
          className="h-10 rounded-lg border border-gray-700 bg-[#1E293B] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2] w-64"
        />
        <select name="status" defaultValue={sp.status ?? ""} className="h-10 rounded-lg border border-gray-700 bg-[#1E293B] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
          {["", "ACTIVE", "DRAFT", "PAUSED", "ARCHIVED"].map((s) => <option key={s} value={s}>{s || "All Statuses"}</option>)}
        </select>
        <select name="type" defaultValue={sp.type ?? ""} className="h-10 rounded-lg border border-gray-700 bg-[#1E293B] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
          {["", "UMRAH", "HAJJ", "UMRAH_PLUS", "RAMADAN_UMRAH", "GROUP_UMRAH", "PRIVATE_UMRAH"].map((t) => (
            <option key={t} value={t}>{t ? t.replace(/_/g, " ") : "All Types"}</option>
          ))}
        </select>
        <Button type="submit" size="sm">Filter</Button>
        <Link href="/admin/packages"><Button type="button" variant="outline" size="sm">Clear</Button></Link>
      </form>

      <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-700">
          <p className="text-sm text-gray-400">{packages.length} package{packages.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                {["Title", "Agency", "Type", "Price", "Seats", "Bookings", "Departure", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {packages.map((p) => (
                <tr key={p.id} className="hover:bg-[#0F172A]">
                  <td className="px-5 py-3 text-white max-w-[200px] truncate">{p.title}</td>
                  <td className="px-5 py-3 text-gray-300">{p.agency.name}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{p.type.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3 text-gray-300">{formatLKR(p.pricePerPerson)}</td>
                  <td className="px-5 py-3 text-gray-300">{p.seatsLeft}/{p.seatsTotal}</td>
                  <td className="px-5 py-3 text-gray-300">{p._count.bookings}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{p.departureDate ? formatDate(p.departureDate) : "—"}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariants[p.status] ?? "secondary"}>{p.status}</Badge>
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
