"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const steps = ["Basic Info", "Pricing", "Hotel & Location", "Inclusions", "Itinerary", "Review & Publish"];

export default function NewPackagePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    type: "UMRAH",
    shortDescription: "",
    description: "",
    durationNights: 11,
    departureCity: "Colombo",
    departureDate: "",
    returnDate: "",
    seatsTotal: 40,
    pricePerPerson: 350000,
    originalPrice: "",
    hotelMakkah: "",
    hotelMakkahStars: 4,
    hotelMadinah: "",
    hotelMadinahStars: 4,
    hotelDistanceMakkah: "",
    hotelDistanceMadinah: "",
    visaIncluded: true,
    flightIncluded: true,
    transportIncluded: true,
    mealsIncluded: false,
    status: "DRAFT",
  });

  const update = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (publish = false) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/agency/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          status: publish ? "ACTIVE" : "DRAFT",
          originalPrice: form.originalPrice ? parseFloat(form.originalPrice.toString()) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create package.");
        setLoading(false);
        return;
      }

      router.push("/agency/packages");
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Create New Package</h1>
          <p className="text-[#64748B] mt-1">Step {step + 1} of {steps.length}: {steps[step]}</p>
        </div>
        <Link href="/agency/packages">
          <Button variant="outline" size="sm">Cancel</Button>
        </Link>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => i < step && setStep(i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                i === step
                  ? "bg-[#0891b2] text-white"
                  : i < step
                  ? "bg-emerald-500 text-white cursor-pointer"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </button>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${i < step ? "bg-emerald-500" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Package Title <span className="text-red-500">*</span></Label>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Standard Umrah — July 2026"
                maxLength={80}
                className="mt-1.5"
              />
              <p className="text-xs text-[#64748B] mt-1">{form.title.length}/80 characters</p>
            </div>

            <div>
              <Label>Package Type <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                {[
                  { value: "UMRAH", label: "Umrah", icon: "🕌" },
                  { value: "HAJJ", label: "Hajj", icon: "🕋" },
                  { value: "RAMADAN_UMRAH", label: "Ramadan Umrah", icon: "🌙" },
                  { value: "UMRAH_PLUS_ZIYARAT", label: "Umrah + Ziyarat", icon: "🗺️" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("type", opt.value)}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      form.type === opt.value
                        ? "border-[#0891b2] bg-cyan-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-xl mb-1">{opt.icon}</div>
                    <div className="text-sm font-medium text-[#0F172A]">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Short Description (shown on cards)</Label>
              <Input
                value={form.shortDescription}
                onChange={(e) => update("shortDescription", e.target.value)}
                placeholder="e.g. 12-day Umrah with 4-star hotels, flights & visa included"
                maxLength={160}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Full Description <span className="text-red-500">*</span></Label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe your package in detail — hotel quality, group size, what makes it special..."
                rows={6}
                className="w-full mt-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (nights) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={form.durationNights}
                  onChange={(e) => update("durationNights", parseInt(e.target.value))}
                  min={1}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Total Seats <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={form.seatsTotal}
                  onChange={(e) => update("seatsTotal", parseInt(e.target.value))}
                  min={1}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Departure Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.departureDate}
                  onChange={(e) => update("departureDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Return Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.returnDate}
                  onChange={(e) => update("returnDate", e.target.value)}
                  min={form.departureDate}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Pricing */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Price Per Person (LKR) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={form.pricePerPerson}
                onChange={(e) => update("pricePerPerson", parseFloat(e.target.value))}
                min={0}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Original Price (LKR) — for strikethrough discount display</Label>
              <Input
                type="number"
                value={form.originalPrice}
                onChange={(e) => update("originalPrice", e.target.value)}
                min={0}
                placeholder="Leave blank if no discount"
                className="mt-1.5"
              />
              {form.originalPrice && parseFloat(form.originalPrice.toString()) > form.pricePerPerson && (
                <p className="text-sm text-emerald-600 mt-1">
                  This shows a {Math.round(((parseFloat(form.originalPrice.toString()) - form.pricePerPerson) / parseFloat(form.originalPrice.toString())) * 100)}% discount badge on your package card.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Hotel & Location */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Makkah Hotel Name</Label>
                <Input
                  value={form.hotelMakkah}
                  onChange={(e) => update("hotelMakkah", e.target.value)}
                  placeholder="e.g. Dar Al Tawhid Intercontinental"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Makkah Hotel Stars</Label>
                <select
                  value={form.hotelMakkahStars}
                  onChange={(e) => update("hotelMakkahStars", parseInt(e.target.value))}
                  className="w-full h-10 mt-1.5 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                >
                  {[3, 4, 5].map((s) => <option key={s} value={s}>{s}★</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Distance from Masjid al-Haram</Label>
              <Input
                value={form.hotelDistanceMakkah}
                onChange={(e) => update("hotelDistanceMakkah", e.target.value)}
                placeholder="e.g. 200m from Masjid al-Haram"
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Madinah Hotel Name</Label>
                <Input
                  value={form.hotelMadinah}
                  onChange={(e) => update("hotelMadinah", e.target.value)}
                  placeholder="e.g. Anwar Al Madinah Mövenpick"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Madinah Hotel Stars</Label>
                <select
                  value={form.hotelMadinahStars}
                  onChange={(e) => update("hotelMadinahStars", parseInt(e.target.value))}
                  className="w-full h-10 mt-1.5 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                >
                  {[3, 4, 5].map((s) => <option key={s} value={s}>{s}★</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Distance from Masjid al-Nabawi</Label>
              <Input
                value={form.hotelDistanceMadinah}
                onChange={(e) => update("hotelDistanceMadinah", e.target.value)}
                placeholder="e.g. 350m from Masjid al-Nabawi"
                className="mt-1.5"
              />
            </div>
          </div>
        )}

        {/* Step 3: Inclusions */}
        {step === 3 && (
          <div className="space-y-3">
            <h3 className="font-medium text-[#0F172A] mb-4">What&apos;s included in this package?</h3>
            {[
              { key: "flightIncluded", label: "✈️ Return Flights from Colombo (CMB)" },
              { key: "visaIncluded", label: "📋 Umrah Visa Processing" },
              { key: "transportIncluded", label: "🚌 Airport Transfers & Inter-city Transport" },
              { key: "mealsIncluded", label: "🍽️ Meals" },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={form[item.key as keyof typeof form] as boolean}
                  onChange={(e) => update(item.key, e.target.checked)}
                  className="w-4 h-4 text-[#0891b2] rounded"
                />
                <span className="text-sm text-[#0F172A]">{item.label}</span>
              </label>
            ))}
            <p className="text-sm text-[#64748B] mt-4">
              Hotel accommodation (Makkah & Madinah), Ziyarat tours, and group guide are always included by default.
            </p>
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-medium text-[#0F172A] mb-4">Review your package before publishing</h3>
            <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Title</span>
                <span className="text-sm font-medium text-[#0F172A]">{form.title || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Type</span>
                <span className="text-sm font-medium text-[#0F172A]">{form.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Duration</span>
                <span className="text-sm font-medium text-[#0F172A]">{form.durationNights + 1} days / {form.durationNights} nights</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Departure</span>
                <span className="text-sm font-medium text-[#0F172A]">{form.departureDate || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Price per person</span>
                <span className="text-sm font-bold text-[#0891b2]">LKR {form.pricePerPerson.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Total seats</span>
                <span className="text-sm font-medium text-[#0F172A]">{form.seatsTotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Makkah Hotel</span>
                <span className="text-sm font-medium text-[#0F172A]">{form.hotelMakkah || "—"} {form.hotelMakkahStars ? `(${form.hotelMakkahStars}★)` : ""}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Final publish */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-medium text-[#0F172A] mb-2">Ready to publish?</h3>
            <p className="text-sm text-[#64748B]">
              Once published, your package will be visible to all pilgrims on Pilgrym. You can edit or archive it at any time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-left transition-all"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium text-[#0F172A]">Save as Draft</div>
                <div className="text-xs text-[#64748B] mt-1">Not visible to pilgrims until you publish</div>
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="p-4 rounded-xl border-2 border-[#0891b2] bg-cyan-50 text-left transition-all"
              >
                <div className="text-2xl mb-2">🚀</div>
                <div className="font-medium text-[#0891b2]">Publish Now</div>
                <div className="text-xs text-[#64748B] mt-1">Immediately visible to pilgrims searching for packages</div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          ← Back
        </Button>
        {step < steps.length - 1 && (
          <Button onClick={() => setStep(step + 1)}>
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}
