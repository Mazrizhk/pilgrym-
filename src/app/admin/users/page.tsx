import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Users — Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  const sp = await searchParams;

  const where: Record<string, unknown> = {};
  if (sp.role) where.role = sp.role;
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { email: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const roleVariants: Record<string, "default" | "success" | "gold"> = {
    CUSTOMER: "default", AGENCY: "success", ADMIN: "gold",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Users</h1>

      <form className="flex gap-3 mb-6 flex-wrap">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search name or email…"
          className="h-10 rounded-lg border border-gray-700 bg-[#1E293B] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2] w-64"
        />
        <select name="role" defaultValue={sp.role ?? ""} className="h-10 rounded-lg border border-gray-700 bg-[#1E293B] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
          {["", "CUSTOMER", "AGENCY", "ADMIN"].map((r) => <option key={r} value={r}>{r || "All Roles"}</option>)}
        </select>
        <button type="submit" className="h-10 px-4 bg-[#0891b2] text-white rounded-lg text-sm hover:bg-[#0e7490]">Filter</button>
      </form>

      <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-700">
          <p className="text-sm text-gray-400">{users.length} user{users.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                {["Name", "Email", "Role", "Bookings", "Phone", "Joined"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#0F172A]">
                  <td className="px-5 py-3 text-white">{u.name}</td>
                  <td className="px-5 py-3 text-gray-300 text-xs">{u.email}</td>
                  <td className="px-5 py-3">
                    <Badge variant={roleVariants[u.role] ?? "secondary"}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-300">{u._count.bookings}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{u.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
