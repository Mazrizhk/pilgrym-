import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatLKR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const statusColors: Record<string, "success" | "warning" | "secondary" | "destructive" | "default"> = {
  ACTIVE: "success",
  DRAFT: "warning",
  FULL: "default",
  EXPIRED: "secondary",
  ARCHIVED: "secondary",
};

export default async function AgencyPackagesPage() {
  const session = await auth();
  if (!session) return null;

  const agency = await prisma.agency.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  });

  if (!agency) return null;

  const packages = await prisma.package.findMany({
    where: { agencyId: agency.id },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeCount = packages.filter((p) => ["ACTIVE", "DRAFT"].includes(p.status)).length;
  const plan = agency.subscription?.plan ?? "FREE";
  const planLimit = plan === "FREE" ? 5 : Infinity;
  const canCreate = plan !== "FREE" || activeCount < planLimit;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Packages</h1>
          {plan === "FREE" && (
            <p className="text-sm text-[#64748B] mt-1">
              {activeCount} of {planLimit} free packages used ·{" "}
              <Link href="/agency/subscription" className="text-[#0891b2] hover:underline">
                Upgrade to publish more
              </Link>
            </p>
          )}
        </div>
        {canCreate ? (
          <Link href="/agency/packages/new">
            <Button>
              <Plus className="w-4 h-4 mr-1" /> Create Package
            </Button>
          </Link>
        ) : (
          <Link href="/agency/subscription">
            <Button variant="gold">Upgrade to Add More</Button>
          </Link>
        )}
      </div>

      {packages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-2">No packages yet</h3>
          <p className="text-[#64748B] mb-6">Create your first Umrah package to start receiving bookings.</p>
          <Link href="/agency/packages/new">
            <Button>
              <Plus className="w-4 h-4 mr-1" /> Create Your First Package
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Package</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Type</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Departure</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Price</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Seats</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Bookings</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-[#64748B]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 bg-gray-100 rounded overflow-hidden shrink-0 relative">
                        {pkg.images[0] && (
                          <Image src={pkg.images[0].url} alt={pkg.title} fill className="object-cover" />
                        )}
                      </div>
                      <span className="font-medium text-[#0F172A] max-w-[200px] truncate">{pkg.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#64748B]">{pkg.type}</td>
                  <td className="px-5 py-3 text-[#64748B]">{formatDate(pkg.departureDate)}</td>
                  <td className="px-5 py-3 font-medium text-[#0F172A]">{formatLKR(pkg.pricePerPerson)}</td>
                  <td className="px-5 py-3 text-[#64748B]">{pkg.seatsAvailable}/{pkg.seatsTotal}</td>
                  <td className="px-5 py-3 text-[#64748B]">{pkg._count.bookings}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusColors[pkg.status] ?? "secondary"}>{pkg.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/agency/packages/${pkg.id}/edit`}>
                        <Button size="sm" variant="outline">Edit</Button>
                      </Link>
                      <Link href={`/packages/${pkg.slug}`}>
                        <Button size="sm" variant="ghost">Preview</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
