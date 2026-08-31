"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatLKR, formatDate } from "@/lib/utils";
import { Shield, Lock, CheckCircle } from "lucide-react";

interface BookingWidgetProps {
  package: {
    id: string;
    slug: string;
    title: string;
    pricePerPerson: number;
    originalPrice?: number | null;
    departureDate: Date | string;
    returnDate: Date | string;
    durationNights: number;
    seatsAvailable: number;
  };
  isAuthenticated: boolean;
}

export default function BookingWidget({ package: pkg, isAuthenticated }: BookingWidgetProps) {
  const router = useRouter();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const total = pkg.pricePerPerson * adults;
  const isFull = pkg.seatsAvailable === 0;
  const isAlmostFull = pkg.seatsAvailable > 0 && pkg.seatsAvailable < 10;

  const handleBook = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?callbackUrl=/checkout/${pkg.slug}?adults=${adults}&children=${children}`);
      return;
    }
    router.push(`/checkout/${pkg.slug}?adults=${adults}&children=${children}`);
  };

  return (
    <div className="sticky top-20">
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0891b2] to-[#0e7490] p-5 text-white">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{formatLKR(pkg.pricePerPerson)}</span>
            <span className="text-cyan-200 mb-1">/ person</span>
          </div>
          {pkg.originalPrice && (
            <p className="text-cyan-200 text-sm line-through mt-0.5">
              {formatLKR(pkg.originalPrice)}
            </p>
          )}
        </div>

        <div className="p-5">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#64748B] mb-1">Departure</p>
              <p className="text-sm font-semibold text-[#0F172A]">{formatDate(pkg.departureDate)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#64748B] mb-1">Return</p>
              <p className="text-sm font-semibold text-[#0F172A]">{formatDate(pkg.returnDate)}</p>
            </div>
          </div>

          {/* Duration */}
          <p className="text-xs text-[#64748B] text-center mb-4">
            Duration: {pkg.durationNights} nights
          </p>

          {/* Seat indicator */}
          {isAlmostFull && !isFull && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-4 text-center">
              <p className="text-xs font-medium text-orange-700">
                🔥 Only {pkg.seatsAvailable} seats remaining!
              </p>
            </div>
          )}

          {/* Traveller count */}
          {!isFull && (
            <>
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#0F172A]">Adults</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-[#0F172A] hover:bg-gray-50 disabled:opacity-50"
                      disabled={adults <= 1}
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium text-[#0F172A]">{adults}</span>
                    <button
                      onClick={() => setAdults(Math.min(pkg.seatsAvailable, adults + 1))}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-[#0F172A] hover:bg-gray-50 disabled:opacity-50"
                      disabled={adults >= pkg.seatsAvailable}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#0F172A]">Children</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-[#0F172A] hover:bg-gray-50 disabled:opacity-50"
                      disabled={children <= 0}
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium text-[#0F172A]">{children}</span>
                    <button
                      onClick={() => setChildren(children + 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-[#0F172A] hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">
                    {formatLKR(pkg.pricePerPerson)} × {adults} adult{adults > 1 ? "s" : ""}
                  </span>
                  <span className="text-[#0F172A]">{formatLKR(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Platform fee</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-[#0F172A] pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatLKR(total)}</span>
                </div>
              </div>

              <Button onClick={handleBook} size="lg" className="w-full mb-4 text-base">
                Book Now
              </Button>
            </>
          )}

          {isFull && (
            <div className="text-center py-4">
              <p className="text-red-600 font-semibold mb-2">This package is sold out</p>
              <Button variant="outline" className="w-full" onClick={() => router.push("/packages")}>
                Find Similar Packages
              </Button>
            </div>
          )}

          {/* Trust badges */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Lock className="w-3.5 h-3.5 text-[#0891b2]" />
              Secure payment via Stripe
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Shield className="w-3.5 h-3.5 text-[#0891b2]" />
              Money protected until you travel
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <CheckCircle className="w-3.5 h-3.5 text-[#0891b2]" />
              Verified agency
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
