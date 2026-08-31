import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Star, MapPin, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export const metadata = {
  title: "Verified Umrah Travel Agencies",
  description: "Browse and compare verified Umrah and Hajj travel agencies in Sri Lanka.",
};

export default async function AgenciesPage() {
  const agencies = await prisma.agency.findMany({
    where: { verificationStatus: "APPROVED" },
    include: {
      _count: {
        select: { packages: { where: { status: "ACTIVE" } } },
      },
    },
    orderBy: { rating: "desc" },
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="bg-white border-b border-gray-100 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#0F172A]">Verified Agencies</h1>
          <p className="text-[#64748B] mt-2">
            {agencies.length} verified agencies trusted by Sri Lankan pilgrims
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <Link key={agency.id} href={`/agencies/${agency.slug}`}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all group p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    {agency.logo && (
                      <img
                        src={agency.logo}
                        alt={agency.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[#0F172A] group-hover:text-[#0891b2] transition-colors">
                        {agency.name}
                      </h3>
                      <Badge variant="verified" className="shrink-0 text-xs">✓</Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-[#64748B]" />
                      <span className="text-xs text-[#64748B]">{agency.city}</span>
                      <span className="text-xs text-[#64748B]">·</span>
                      <span className="text-xs text-[#64748B]">{agency.yearsInBusiness} yrs</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#64748B] mt-4 line-clamp-2">{agency.description}</p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#D4A017] text-[#D4A017]" />
                    <span className="text-sm font-semibold text-[#0F172A]">{agency.rating.toFixed(1)}</span>
                    <span className="text-xs text-[#64748B]">({agency.totalReviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#64748B]">
                    <Package className="w-4 h-4" />
                    {agency._count.packages} active packages
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
