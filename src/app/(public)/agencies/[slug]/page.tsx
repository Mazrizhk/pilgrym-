import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PackageCard from "@/components/PackageCard";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agency = await prisma.agency.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!agency) return {};
  return { title: agency.name, description: agency.description ?? agency.name };
}

export default async function AgencyProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const agency = await prisma.agency.findUnique({
    where: { slug },
    include: {
      packages: {
        where: { status: "ACTIVE" },
        include: {
          images: true,
          agency: { select: { name: true, slug: true, verificationStatus: true, rating: true, totalReviews: true } },
        },
        orderBy: { departureDate: "asc" },
      },
    },
  });

  if (!agency) notFound();

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
              {agency.logo && (
                <img src={agency.logo} alt={agency.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#0F172A]">{agency.name}</h1>
                {agency.verificationStatus === "APPROVED" && (
                  <Badge variant="verified">✓ Verified Agency</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-sm text-[#64748B]">
                  <MapPin className="w-3.5 h-3.5" /> {agency.city}
                </span>
                <span className="flex items-center gap-1 text-sm text-[#64748B]">
                  <Calendar className="w-3.5 h-3.5" /> {agency.yearsInBusiness} years in business
                </span>
                <span className="flex items-center gap-1 text-sm text-[#64748B]">
                  <Star className="w-3.5 h-3.5 fill-[#D4A017] text-[#D4A017]" />
                  {agency.rating.toFixed(1)} ({agency.totalReviews} reviews)
                </span>
              </div>
              {agency.description && (
                <p className="text-sm text-[#64748B] mt-3 max-w-2xl leading-relaxed">{agency.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-[#0F172A] mb-6">
          Active Packages ({agency.packages.length})
        </h2>
        {agency.packages.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">No active packages at this time.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agency.packages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} showAgency={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
