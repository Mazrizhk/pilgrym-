import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatLKR, formatDate, getDiscountPercent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plane, Hotel, FileText, Bus, Star, Users, Calendar,
  MapPin, CheckCircle, XCircle, Shield, Lock, Award
} from "lucide-react";
import BookingWidget from "@/components/BookingWidget";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await prisma.package.findUnique({
    where: { slug },
    select: { title: true, shortDescription: true },
  });
  if (!pkg) return {};
  return {
    title: pkg.title,
    description: pkg.shortDescription ?? pkg.title,
  };
}

async function getPackage(slug: string) {
  return prisma.package.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      inclusions: true,
      itinerary: { orderBy: { dayNumber: "asc" } },
      agency: {
        include: {
          packages: {
            where: { status: "ACTIVE" },
            select: { id: true, title: true, slug: true },
            take: 5,
          },
        },
      },
      reviews: {
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

const packageTypeLabels: Record<string, string> = {
  UMRAH: "Umrah",
  HAJJ: "Hajj",
  UMRAH_PLUS_ZIYARAT: "Umrah + Ziyarat",
  RAMADAN_UMRAH: "Ramadan Umrah",
};

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [pkg, session] = await Promise.all([getPackage(slug), auth()]);

  if (!pkg) notFound();

  const primaryImage = pkg.images.find((i) => i.isPrimary) ?? pkg.images[0];
  const discount = pkg.originalPrice
    ? getDiscountPercent(pkg.originalPrice, pkg.pricePerPerson)
    : null;

  const includedItems = pkg.inclusions.filter((i) => i.included);
  const excludedItems = pkg.inclusions.filter((i) => !i.included);

  const avgRating =
    pkg.reviews.length > 0
      ? pkg.reviews.reduce((sum, r) => sum + r.rating, 0) / pkg.reviews.length
      : 0;

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-[#64748B]">
            <Link href="/" className="hover:text-[#0891b2]">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/packages" className="hover:text-[#0891b2]">Packages</Link>
            <span className="mx-2">›</span>
            <span className="text-[#0F172A] font-medium">{pkg.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column */}
          <div className="flex-1 min-w-0">
            {/* Image Gallery */}
            <div className="grid grid-cols-4 gap-2 mb-6 rounded-xl overflow-hidden">
              <div className="col-span-4 md:col-span-3 relative aspect-video">
                <Image
                  src={primaryImage?.url ?? "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=450&fit=crop"}
                  alt={primaryImage?.alt ?? pkg.title}
                  fill
                  className="object-cover"
                  priority
                />
                <Badge variant="default" className="absolute top-4 left-4">
                  {packageTypeLabels[pkg.type]}
                </Badge>
                {discount && (
                  <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>
              <div className="hidden md:flex flex-col gap-2">
                {pkg.images.slice(1, 4).map((img, i) => (
                  <div key={img.id} className="relative flex-1">
                    <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Header */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-[#0F172A] mb-2">{pkg.title}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link
                      href={`/agencies/${pkg.agency.slug}`}
                      className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#0891b2]"
                    >
                      {pkg.agency.name}
                      {pkg.agency.verificationStatus === "APPROVED" && (
                        <Badge variant="verified" className="text-xs">✓ Verified</Badge>
                      )}
                    </Link>
                    {pkg.reviews.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#D4A017] text-[#D4A017]" />
                        <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                        <span className="text-sm text-[#64748B]">({pkg.reviews.length} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Key stats bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-sm text-[#64748B] mb-1">Duration</div>
                  <div className="font-semibold text-[#0F172A]">{pkg.durationDays} Days</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-[#64748B] mb-1">Departure</div>
                  <div className="font-semibold text-[#0F172A]">{formatDate(pkg.departureDate)}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-[#64748B] mb-1">Hotel Rating</div>
                  <div className="font-semibold text-[#0F172A]">
                    {pkg.hotelMakkahStars ? `${pkg.hotelMakkahStars}★` : "—"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-[#64748B] mb-1">Seats Left</div>
                  <div className={`font-semibold ${pkg.seatsAvailable < 10 ? "text-orange-600" : "text-[#0F172A]"}`}>
                    {pkg.seatsAvailable} seats
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="font-semibold text-[#0F172A]">Package Overview</h2>
              </div>
              <div className="p-6">
                <p className="text-[#64748B] leading-relaxed mb-6">{pkg.description}</p>

                {/* Hotels */}
                {(pkg.hotelMakkah || pkg.hotelMadinah) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                    {pkg.hotelMakkah && (
                      <div className="bg-[#F8FAFC] rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Hotel className="w-4 h-4 text-[#0891b2]" />
                          <span className="font-medium text-[#0F172A] text-sm">Makkah</span>
                          {pkg.hotelMakkahStars && (
                            <span className="text-xs text-[#D4A017]">{"★".repeat(pkg.hotelMakkahStars)}</span>
                          )}
                        </div>
                        <p className="text-sm text-[#0F172A] font-medium">{pkg.hotelMakkah}</p>
                        {pkg.hotelDistanceMakkah && (
                          <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {pkg.hotelDistanceMakkah}
                          </p>
                        )}
                      </div>
                    )}
                    {pkg.hotelMadinah && (
                      <div className="bg-[#F8FAFC] rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Hotel className="w-4 h-4 text-[#0891b2]" />
                          <span className="font-medium text-[#0F172A] text-sm">Madinah</span>
                          {pkg.hotelMadinahStars && (
                            <span className="text-xs text-[#D4A017]">{"★".repeat(pkg.hotelMadinahStars)}</span>
                          )}
                        </div>
                        <p className="text-sm text-[#0F172A] font-medium">{pkg.hotelMadinah}</p>
                        {pkg.hotelDistanceMadinah && (
                          <p className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {pkg.hotelDistanceMadinah}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Inclusions */}
            {pkg.inclusions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="font-semibold text-[#0F172A]">What&apos;s Included</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-emerald-700 mb-3">Included ✓</h3>
                    <ul className="space-y-2">
                      {includedItems.map((item) => (
                        <li key={item.id} className="flex items-center gap-2 text-sm text-[#0F172A]">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {excludedItems.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-red-600 mb-3">Not Included ✗</h3>
                      <ul className="space-y-2">
                        {excludedItems.map((item) => (
                          <li key={item.id} className="flex items-center gap-2 text-sm text-[#64748B]">
                            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            {item.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {pkg.itinerary.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="font-semibold text-[#0F172A]">Itinerary</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {pkg.itinerary.map((day) => (
                    <details key={day.id} className="group px-6 py-4">
                      <summary className="flex items-center justify-between cursor-pointer list-none">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#0891b2] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {day.dayNumber}
                          </div>
                          <div>
                            <p className="font-medium text-[#0F172A]">{day.title}</p>
                            {day.location && (
                              <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {day.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-[#0891b2] group-open:rotate-180 transition-transform">▾</span>
                      </summary>
                      <div className="mt-3 ml-11 text-sm text-[#64748B] leading-relaxed">
                        {day.description}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Agency Tab */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-6">
              <h2 className="font-semibold text-[#0F172A] mb-4">About {pkg.agency.name}</h2>
              <div className="flex items-start gap-4">
                <div>
                  {pkg.agency.verificationStatus === "APPROVED" && (
                    <Badge variant="verified" className="mb-3">✓ Verified Agency</Badge>
                  )}
                  <p className="text-sm text-[#64748B] leading-relaxed mb-4">
                    {pkg.agency.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-[#D4A017] text-[#D4A017]" />
                      {pkg.agency.rating.toFixed(1)} rating
                    </span>
                    <span>{pkg.agency.totalReviews} reviews</span>
                    <span>{pkg.agency.yearsInBusiness} years in business</span>
                    <span>{pkg.agency.city}</span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    🔒 Agency contact details are shared only after your booking is confirmed.
                  </p>
                  <Link href={`/agencies/${pkg.agency.slug}`} className="mt-4 inline-block">
                    <Button variant="outline" size="sm">
                      View All Packages by {pkg.agency.name} →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {pkg.reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <h2 className="font-semibold text-[#0F172A]">Reviews</h2>
                  <Badge variant="secondary" className="text-xs">
                    Verified bookings only
                  </Badge>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl font-bold text-[#0F172A]">{avgRating.toFixed(1)}</div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-5 h-5 ${s <= Math.round(avgRating) ? "fill-[#D4A017] text-[#D4A017]" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-[#64748B]">{pkg.reviews.length} reviews</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {pkg.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-[#0891b2] rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {review.customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0F172A]">
                              {review.customer.name.split(" ")[0]} {review.customer.name.split(" ").slice(-1)[0]?.[0]}.
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${s <= review.rating ? "fill-[#D4A017] text-[#D4A017]" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-[#64748B] ml-auto">{formatDate(review.createdAt)}</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-[#64748B] leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column — booking widget */}
          <div className="lg:w-80 shrink-0">
            <BookingWidget
              package={{
                id: pkg.id,
                slug: pkg.slug,
                title: pkg.title,
                pricePerPerson: pkg.pricePerPerson,
                originalPrice: pkg.originalPrice,
                departureDate: pkg.departureDate,
                returnDate: pkg.returnDate,
                durationNights: pkg.durationNights,
                seatsAvailable: pkg.seatsAvailable,
              }}
              isAuthenticated={!!session}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
