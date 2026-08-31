import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Agencies — Admin" };

const statusVariants: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning", APPROVED: "success", REJECTED: "destructive", SUSPENDED: "secondary",
};

export default async function AdminAgenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;

  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.status) where.verificationStatus = sp.status;
  if (sp.q) where.name = { contains: sp.q, mode: "insensitive" };

  const agencies = await prisma.agency.findMany({
    where,
    include: {
      user: { select: { email: true, createdAt: true } },
      _count: { select: { packages: true, bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statuses = ["", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Agencies</h1>

      <form className="flex gap-3 mb-6 flex-wrap">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search by name…"
          className="h-10 rounded-lg border border-gray-700 bg-[#1E293B] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2] w-64"
        />
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="h-10 rounded-lg border border-gray-700 bg-[#1E293B] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
        >
          {statuses.map((s) => <option key={s} value={s}>{s || "All Statuses"}</option>)}
        </select>
        <Button type="submit" size="sm">Filter</Button>
        <Link href="/admin/agencies"><Button type="button" variant="outline" size="sm">Clear</Button></Link>
      </form>

      <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-700">
          <p className="text-sm text-gray-400">{agencies.length} agenc{agencies.length !== 1 ? "ies" : "y"}</p>
        </div>
        {agencies.length === 0 ? (
          <div className="p-16 text-center"><p className="text-gray-400">No agencies found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr>
                  {["Agency", "City", "Email", "Packages", "Bookings", "Status", "Joined", "Action"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {agencies.map((a) => (
                  <tr key={a.id} className="hover:bg-[#0F172A]">
                    <td className="px-5 py-3 font-medium text-white">{a.name}</td>
                    <td className="px-5 py-3 text-gray-400">{a.city}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{a.user.email}</td>
                    <td className="px-5 py-3 text-gray-300">{a._count.packages}</td>
                    <td className="px-5 py-3 text-gray-300">{a._count.bookings}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariants[a.verificationStatus] ?? "secondary"}>{a.verificationStatus}</Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(a.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/agencies/${a.id}`}>
                        <Button size="sm" variant="outline">Review</Button>
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
