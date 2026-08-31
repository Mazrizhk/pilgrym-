import { prisma } from "@/lib/prisma";
import PackageCard from "@/components/PackageCard";
import { PackageStatus, PackageType } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export const metadata = {
  title: "Browse Umrah & Hajj Packages",
  description: "Find and compare Umrah and Hajj travel packages from verified Sri Lankan agencies.",
};

interface SearchParams {
  type?: string;
  month?: string;
  duration?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  agency?: string;
}

async function getPackages(params: SearchParams) {
  const where: Record<string, unknown> = { status: PackageStatus.ACTIVE };

  if (params.type && Object.values(PackageType).includes(params.type as PackageType)) {
    where.type = params.type as PackageType;
  }

  if (params.duration) {
    where.durationDays = parseInt(params.duration);
  }

  if (params.minPrice || params.maxPrice) {
    where.pricePerPerson = {};
    if (params.minPrice) (where.pricePerPerson as Record<string, number>).gte = parseFloat(params.minPrice);
    if (params.maxPrice) (where.pricePerPerson as Record<string, number>).lte = parseFloat(params.maxPrice);
  }

  if (params.month) {
    const [year, month] = params.month.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    where.departureDate = { gte: start, lte: end };
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (params.sort === "price_asc") orderBy = { pricePerPerson: "asc" };
  if (params.sort === "price_desc") orderBy = { pricePerPerson: "desc" };
  if (params.sort === "departure") orderBy = { departureDate: "asc" };

  return prisma.package.findMany({
    where,
    orderBy,
    include: {
      images: true,
      agency: {
        select: { name: true, slug: true, verificationStatus: true, rating: true, totalReviews: true },
      },
    },
  });
}

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const packages = await getPackages(params);

  const months = [
    { value: "2026-07", label: "July 2026" },
    { value: "2026-08", label: "August 2026" },
    { value: "2026-09", label: "September 2026" },
    { value: "2026-10", label: "October 2026" },
    { value: "2026-11", label: "November 2026" },
    { value: "2026-12", label: "December 2026" },
    { value: "2027-02", label: "February 2027" },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#0F172A]">Umrah & Hajj Packages</h1>
          <p className="text-[#64748B] mt-1">
            Showing {packages.length} package{packages.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0">
            <form className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-[#0F172A]">Filters</h2>
                <Link href="/packages" className="text-xs text-[#0891b2] hover:underline">
                  Clear All
                </Link>
              </div>

              {/* Package Type */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-[#0F172A] mb-3">Package Type</h3>
                <div className="space-y-2">
                  {[
                    { value: "UMRAH", label: "Umrah" },
                    { value: "HAJJ", label: "Hajj" },
                    { value: "RAMADAN_UMRAH", label: "Ramadan Umrah" },
                    { value: "UMRAH_PLUS_ZIYARAT", label: "Umrah + Ziyarat" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="type"
                        value={opt.value}
                        defaultChecked={params.type === opt.value}
                        className="rounded border-gray-300 text-[#0891b2] focus:ring-[#0891b2]"
                      />
                      <span className="text-sm text-[#64748B]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Departure Month */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-[#0F172A] mb-3">Departure Month</h3>
                <div className="space-y-2">
                  {months.map((m) => (
                    <label key={m.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="month"
                        value={m.value}
                        defaultChecked={params.month === m.value}
                        className="rounded border-gray-300 text-[#0891b2] focus:ring-[#0891b2]"
                      />
                      <span className="text-sm text-[#64748B]">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-[#0F172A] mb-3">Duration</h3>
                <div className="space-y-2">
                  {["10", "12", "14", "21"].map((d) => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="duration"
                        value={d}
                        defaultChecked={params.duration === d}
                        className="rounded border-gray-300 text-[#0891b2] focus:ring-[#0891b2]"
                      />
                      <span className="text-sm text-[#64748B]">{d} days</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-[#0F172A] mb-3">Max Budget</h3>
                <select
                  name="maxPrice"
                  defaultValue={params.maxPrice ?? ""}
                  className="w-full h-9 rounded-lg border border-gray-200 px-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                >
                  <option value="">Any budget</option>
                  <option value="300000">Under LKR 300,000</option>
                  <option value="400000">Under LKR 400,000</option>
                  <option value="500000">Under LKR 500,000</option>
                  <option value="700000">Under LKR 700,000</option>
                </select>
              </div>

              <Button type="submit" className="w-full">Apply Filters</Button>
            </form>
          </aside>

          {/* Package Grid */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#64748B]">
                {packages.length} package{packages.length !== 1 ? "s" : ""} found
              </p>
              <select
                className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                defaultValue={params.sort ?? ""}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("sort", e.target.value);
                  window.location.href = url.toString();
                }}
              >
                <option value="">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="departure">Departure Date</option>
              </select>
            </div>

            {packages.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🕌</div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">No packages found</h3>
                <p className="text-[#64748B] mb-6">Try adjusting your filters to see more results.</p>
                <Link href="/packages">
                  <Button variant="outline">Clear Filters</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} package={pkg} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
