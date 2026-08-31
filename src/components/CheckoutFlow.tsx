"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatLKR, formatDate } from "@/lib/utils";
import { Shield, Lock, CheckCircle } from "lucide-react";

interface CheckoutFlowProps {
  package: {
    id: string;
    slug: string;
    title: string;
    pricePerPerson: number;
    departureDate: Date | string;
    returnDate: Date | string;
    durationDays: number;
    seatsAvailable: number;
    images: { url: string }[];
    agency: { name: string; verificationStatus: string };
    inclusions: { label: string }[];
  };
  adults: number;
  children: number;
  userId: string;
  userEmail: string;
  userName: string;
}

export default function CheckoutFlow({
  package: pkg,
  adults: initialAdults,
  children: initialChildren,
  userId,
  userEmail,
  userName,
}: CheckoutFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [travellers, setTravellers] = useState(
    Array.from({ length: initialAdults }, (_, i) => ({
      name: i === 0 ? userName : "",
      dob: "",
      passportNumber: "",
      passportExpiry: "",
      phone: "",
    }))
  );

  const [notes, setNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const totalAmount = pkg.pricePerPerson * initialAdults;
  const imageUrl = pkg.images[0]?.url ?? "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&h=225&fit=crop";

  const updateTraveller = (index: number, field: string, value: string) => {
    const updated = [...travellers];
    updated[index] = { ...updated[index], [field]: value };
    setTravellers(updated);
  };

  const handleBooking = async () => {
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          adults: initialAdults,
          children: initialChildren,
          totalAmount,
          travellers,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Booking failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/bookings/${data.bookingRef}?success=1`);
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-gray-100 py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href={`/packages/${pkg.slug}`} className="text-sm text-[#0891b2] hover:underline">
            ← Back to package
          </Link>
          <span className="text-[#64748B]">|</span>
          <div className="flex items-center gap-2">
            {[
              { n: 1, label: "Traveller Details" },
              { n: 2, label: "Review Order" },
              { n: 3, label: "Payment" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${step >= s.n ? "bg-[#0891b2] text-white" : "bg-gray-200 text-gray-500"}`}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <span className={`text-sm hidden sm:block ${step === s.n ? "text-[#0F172A] font-medium" : "text-[#64748B]"}`}>
                  {s.label}
                </span>
                {s.n < 3 && <span className="text-gray-300 mx-1">›</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2">
            {/* Step 1 */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] mb-6">Traveller Details</h2>
                {travellers.map((traveller, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
                    <h3 className="font-medium text-[#0F172A] mb-4">
                      {i === 0 ? "Lead Traveller (You)" : `Traveller ${i + 1}`}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name (as on passport)</Label>
                        <Input
                          value={traveller.name}
                          onChange={(e) => updateTraveller(i, "name", e.target.value)}
                          placeholder="Mohamed Ahmed"
                          required
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={traveller.dob}
                          onChange={(e) => updateTraveller(i, "dob", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Passport Number</Label>
                        <Input
                          value={traveller.passportNumber}
                          onChange={(e) => updateTraveller(i, "passportNumber", e.target.value)}
                          placeholder="N1234567"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Passport Expiry Date</Label>
                        <Input
                          type="date"
                          value={traveller.passportExpiry}
                          onChange={(e) => updateTraveller(i, "passportExpiry", e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      {i === 0 && (
                        <div className="sm:col-span-2">
                          <Label>Phone Number</Label>
                          <Input
                            type="tel"
                            value={traveller.phone}
                            onChange={(e) => updateTraveller(i, "phone", e.target.value)}
                            placeholder="+94 77 123 4567"
                            className="mt-1.5"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
                  <Label>Special Requests (optional)</Label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements, dietary needs, accessibility needs..."
                    rows={3}
                    className="w-full mt-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none"
                  />
                </div>

                <Button onClick={() => setStep(2)} size="lg" className="w-full">
                  Continue to Review →
                </Button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] mb-6">Review Your Order</h2>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
                  <h3 className="font-medium text-[#0F172A] mb-3">Travellers</h3>
                  {travellers.map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-[#0F172A]">{t.name || `Traveller ${i + 1}`}</span>
                      <span className="text-xs text-[#64748B]">{t.passportNumber || "Passport TBC"}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
                  <h3 className="font-medium text-[#0F172A] mb-3">Inclusions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {pkg.inclusions.map((inc) => (
                      <div key={inc.label} className="flex items-center gap-2 text-sm text-[#64748B]">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {inc.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#0891b2] rounded"
                    />
                    <span className="text-sm text-[#64748B]">
                      I agree to Pilgrym&apos;s{" "}
                      <Link href="/terms" className="text-[#0891b2] hover:underline">Terms of Service</Link>
                      {" "}and the{" "}
                      <Link href="/cancellation-policy" className="text-[#0891b2] hover:underline">Cancellation Policy</Link>.
                      I understand payments are protected by Pilgrym until my journey is completed.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} size="lg">
                    ← Back
                  </Button>
                  <Button onClick={handleBooking} size="lg" className="flex-1" disabled={loading}>
                    {loading ? "Processing..." : `Confirm & Pay ${formatLKR(totalAmount)}`}
                  </Button>
                </div>

                <p className="text-xs text-center text-[#64748B] mt-3">
                  🔒 Your payment is secured by Stripe and protected by Pilgrym
                </p>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                <Image src={imageUrl} alt={pkg.title} fill className="object-cover" />
              </div>
              <h3 className="font-semibold text-[#0F172A] text-sm mb-1">{pkg.title}</h3>
              <p className="text-xs text-[#64748B] mb-4">{pkg.agency.name}</p>

              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-[#64748B]">
                  <span>Departure</span>
                  <span>{formatDate(pkg.departureDate)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Return</span>
                  <span>{formatDate(pkg.returnDate)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Duration</span>
                  <span>{pkg.durationDays} days</span>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-[#64748B]">
                  <span>{formatLKR(pkg.pricePerPerson)} × {initialAdults} adults</span>
                  <span>{formatLKR(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Platform fee</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-[#0F172A]">
                <span>Total</span>
                <span className="text-[#0891b2] text-lg">{formatLKR(totalAmount)}</span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <Lock className="w-3.5 h-3.5 text-[#0891b2]" />
                  Secured by Stripe
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <Shield className="w-3.5 h-3.5 text-[#0891b2]" />
                  Money held safely until you travel
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
