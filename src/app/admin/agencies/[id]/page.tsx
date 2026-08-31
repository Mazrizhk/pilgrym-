import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatLKR, formatDate } from "@/lib/utils";
import AgencyVerifyActions from "./AgencyVerifyActions";

export default async function AdminAgencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  const { id } = await params;

  const agency = await prisma.agency.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, createdAt: true } },
      documents: { orderBy: { createdAt: "desc" } },
      packages: { select: { id: true, title: true, status: true, pricePerPerson: true, departureDate: true } },
      bookings: {
        select: { bookingRef: true, status: true, totalAmount: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: { select: { packages: true, bookings: true } },
    },
  });

  if (!agency) notFound();

  const totalRevenue = await prisma.booking.aggregate({
    where: { package: { agencyId: id }, status: "COMPLETED" },
    _sum: { agencyAmount: true },
  });

  return (
    <div className="max-w-4xl">
      <Link href="/admin/agencies" className="text-sm text-[#0891b2] hover:underline">← Agencies</Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mt-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{agency.name}</h1>
          <p className="text-gray-400 text-sm mt-1">{agency.city} · {agency.user.email} · Joined {formatDate(agency.createdAt)}</p>
        </div>
        <Badge variant={agency.verificationStatus === "APPROVED" ? "success" : agency.verificationStatus === "PENDING" ? "warning" : "destructive"} className="text-sm">
          {agency.verificationStatus}
        </Badge>
      </div>

      {/* Verification actions */}
      <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-5 mb-5">
        <h2 className="font-semibold text-white mb-4">Verification Actions</h2>
        <AgencyVerifyActions agencyId={id} currentStatus={agency.verificationStatus} currentNotes={agency.verificationNotes ?? ""} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Packages", value: agency._count.packages },
          { label: "Bookings", value: agency._count.bookings },
          { label: "Revenue (completed)", value: formatLKR(totalRevenue._sum.agencyAmount ?? 0) },
          { label: "Rating", value: `${agency.avgRating.toFixed(1)} ★ (${agency.reviewCount})` },
        ].map((s) => (
          <div key={s.label} className="bg-[#1E293B] rounded-xl border border-gray-700 p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Documents */}
      <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-5 mb-5">
        <h2 className="font-semibold text-white mb-4">Documents</h2>
        {agency.documents.length === 0 ? (
          <p className="text-gray-400 text-sm">No documents submitted.</p>
        ) : (
          <div className="space-y-2">
            {agency.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-[#0F172A] rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-white">{doc.documentType.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-400">{formatDate(doc.createdAt)}</p>
                </div>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0891b2] hover:underline">
                  View
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent bookings */}
      <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-5">
        <h2 className="font-semibold text-white mb-4">Recent Bookings</h2>
        {agency.bookings.length === 0 ? (
          <p className="text-gray-400 text-sm">No bookings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr>{["Ref", "Status", "Amount", "Date"].map((h) => (
              <th key={h} className="text-left text-xs text-gray-400 pb-2">{h}</th>
            ))}</tr></thead>
            <tbody className="divide-y divide-gray-800">
              {agency.bookings.map((b) => (
                <tr key={b.bookingRef}>
                  <td className="py-2 font-mono text-xs text-gray-300">{b.bookingRef}</td>
                  <td className="py-2"><Badge variant="secondary">{b.status}</Badge></td>
                  <td className="py-2 text-gray-300">{formatLKR(b.totalAmount)}</td>
                  <td className="py-2 text-gray-400 text-xs">{formatDate(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
