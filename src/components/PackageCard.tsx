import Image from "next/image";
import Link from "next/link";
import { Plane, Hotel, FileText, Bus, Star, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLKR, formatDate, getDiscountPercent } from "@/lib/utils";

interface PackageCardProps {
  package: {
    id: string;
    slug: string;
    title: string;
    type: string;
    durationDays: number;
    durationNights: number;
    departureDate: Date | string;
    returnDate: Date | string;
    seatsAvailable: number;
    seatsTotal: number;
    pricePerPerson: number;
    originalPrice?: number | null;
    flightIncluded: boolean;
    visaIncluded: boolean;
    transportIncluded: boolean;
    mealsIncluded: boolean;
    hotelMakkahStars?: number | null;
    images: { url: string; alt?: string | null; isPrimary: boolean }[];
    agency: {
      name: string;
      slug: string;
      verificationStatus: string;
      rating: number;
      totalReviews: number;
    };
  };
  showAgency?: boolean;
  showSeatsLeft?: boolean;
  variant?: "grid" | "list";
}

const packageTypeLabels: Record<string, string> = {
  UMRAH: "Umrah",
  HAJJ: "Hajj",
  UMRAH_PLUS_ZIYARAT: "Umrah + Ziyarat",
  RAMADAN_UMRAH: "Ramadan Umrah",
};

export default function PackageCard({
  package: pkg,
  showAgency = true,
  showSeatsLeft = true,
  variant = "grid",
}: PackageCardProps) {
  const primaryImage = pkg.images.find((i) => i.isPrimary) ?? pkg.images[0];
  const imageUrl =
    primaryImage?.url ??
    "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=450&fit=crop";

  const discount = pkg.originalPrice
    ? getDiscountPercent(pkg.originalPrice, pkg.pricePerPerson)
    : null;

  const isFull = pkg.seatsAvailable === 0;
  const isAlmostFull = pkg.seatsAvailable > 0 && pkg.seatsAvailable < 10;
  const isVerified = pkg.agency.verificationStatus === "APPROVED";

  if (variant === "list") {
    return (
      <Link href={`/packages/${pkg.slug}`}>
        <div className="flex gap-4 bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
          <div className="relative w-48 shrink-0">
            <Image
              src={imageUrl}
              alt={primaryImage?.alt ?? pkg.title}
              fill
              className="object-cover"
            />
            {isFull && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">FULL</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant="default" className="mb-1">
                  {packageTypeLabels[pkg.type] ?? pkg.type}
                </Badge>
                <h3 className="font-semibold text-[#0F172A] group-hover:text-[#0891b2] transition-colors line-clamp-2">
                  {pkg.title}
                </h3>
              </div>
              <div className="text-right shrink-0">
                {pkg.originalPrice && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatLKR(pkg.originalPrice)}
                  </p>
                )}
                <p className="text-lg font-bold text-[#0891b2]">
                  {formatLKR(pkg.pricePerPerson)}
                </p>
                <p className="text-xs text-gray-500">per person</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/packages/${pkg.slug}`}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-200 group overflow-hidden flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={primaryImage?.alt ?? pkg.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Overlay badges */}
          <div className="absolute top-3 left-3">
            <Badge variant="default" className="text-xs shadow-sm">
              {packageTypeLabels[pkg.type] ?? pkg.type}
            </Badge>
          </div>

          {discount && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-red-500 text-white text-xs shadow-sm">
                -{discount}%
              </Badge>
            </div>
          )}

          {isFull && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-2xl tracking-wider">SOLD OUT</span>
            </div>
          )}

          {showSeatsLeft && isAlmostFull && !isFull && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-orange-500 text-white text-xs animate-pulse">
                Only {pkg.seatsAvailable} seats left!
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Agency */}
          {showAgency && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs text-[#64748B]">{pkg.agency.name}</span>
              {isVerified && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                  ✓ Verified
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-[#0F172A] line-clamp-2 group-hover:text-[#0891b2] transition-colors mb-2 flex-1">
            {pkg.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3.5 h-3.5 fill-[#D4A017] text-[#D4A017]" />
            <span className="text-sm font-medium text-[#0F172A]">
              {pkg.agency.rating.toFixed(1)}
            </span>
            <span className="text-xs text-[#64748B]">
              ({pkg.agency.totalReviews} reviews)
            </span>
          </div>

          {/* Inclusions */}
          <div className="flex items-center gap-2 mb-3">
            {pkg.flightIncluded && (
              <span title="Flights included">
                <Plane className="w-4 h-4 text-[#0891b2]" />
              </span>
            )}
            {pkg.hotelMakkahStars && (
              <span title={`${pkg.hotelMakkahStars}★ Hotel`} className="flex items-center gap-0.5">
                <Hotel className="w-4 h-4 text-[#0891b2]" />
                <span className="text-xs text-[#64748B]">{pkg.hotelMakkahStars}★</span>
              </span>
            )}
            {pkg.visaIncluded && (
              <span title="Visa included">
                <FileText className="w-4 h-4 text-[#0891b2]" />
              </span>
            )}
            {pkg.transportIncluded && (
              <span title="Transport included">
                <Bus className="w-4 h-4 text-[#0891b2]" />
              </span>
            )}
          </div>

          {/* Dates & Duration */}
          <div className="flex items-center gap-3 mb-3 text-xs text-[#64748B]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(pkg.departureDate, "d MMM")} → {formatDate(pkg.returnDate, "d MMM yyyy")}
            </span>
            <span>·</span>
            <span>{pkg.durationDays} days</span>
          </div>

          {/* Seats */}
          {showSeatsLeft && !isFull && (
            <div className="flex items-center gap-1 text-xs text-[#64748B] mb-3">
              <Users className="w-3.5 h-3.5" />
              <span className={isAlmostFull ? "text-orange-600 font-medium" : ""}>
                {pkg.seatsAvailable} seats available
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
            <div>
              {pkg.originalPrice && (
                <p className="text-xs text-gray-400 line-through">
                  {formatLKR(pkg.originalPrice)}
                </p>
              )}
              <p className="text-xl font-bold text-[#0891b2]">
                {formatLKR(pkg.pricePerPerson)}
              </p>
              <p className="text-xs text-[#64748B]">per person</p>
            </div>
            <Button size="sm" className="shrink-0">
              View →
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
