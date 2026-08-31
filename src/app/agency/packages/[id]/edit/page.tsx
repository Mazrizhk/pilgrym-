"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PackageForm {
  title: string;
  shortDescription: string;
  description: string;
  type: string;
  durationNights: number;
  seatsTotal: number;
  pricePerPerson: number;
  originalPrice: number;
  departureDate: string;
  returnDate: string;
  makkahHotel: string;
  makkahHotelStars: number;
  makkahHotelDistance: string;
  madinahHotel: string;
  madinahHotelStars: number;
  madinahHotelDistance: string;
  includesFlights: boolean;
  includesVisa: boolean;
  includesTransport: boolean;
  includesMeals: boolean;
  status: string;
}

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<PackageForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/agency/packages/${id}`)
      .then((r) => r.json())
      .then(setForm);
  }, [id]);

  const set = (field: keyof PackageForm, value: string | number | boolean) =>
    setForm((f) => f ? { ...f, [field]: value } : f);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/agency/packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/agency/packages");
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save.");
    }
  };

  if (!form) return <div className="animate-pulse h-96 bg-gray-100 rounded-xl" />;

  const discount = form.originalPrice > form.pricePerPerson
    ? Math.round(((form.originalPrice - form.pricePerPerson) / form.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Edit Package</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Basic Information</h2>
          <div className="space-y-4">
            <Field label="Package Title" required>
              <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} required className={inputCls} />
            </Field>
            <Field label="Package Type">
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
                {["UMRAH", "HAJJ", "UMRAH_PLUS", "RAMADAN_UMRAH", "GROUP_UMRAH", "PRIVATE_UMRAH"].map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </Field>
            <Field label="Short Description">
              <input type="text" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={inputCls} maxLength={160} />
            </Field>
            <Field label="Full Description">
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} className={`${inputCls} resize-none`} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Duration (nights)">
                <input type="number" value={form.durationNights} onChange={(e) => set("durationNights", Number(e.target.value))} min={1} className={inputCls} />
              </Field>
              <Field label="Total Seats">
                <input type="number" value={form.seatsTotal} onChange={(e) => set("seatsTotal", Number(e.target.value))} min={1} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Departure Date">
                <input type="date" value={form.departureDate?.slice(0, 10) ?? ""} onChange={(e) => set("departureDate", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Return Date">
                <input type="date" value={form.returnDate?.slice(0, 10) ?? ""} onChange={(e) => set("returnDate", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price per Person (LKR)">
              <input type="number" value={form.pricePerPerson} onChange={(e) => set("pricePerPerson", Number(e.target.value))} min={0} className={inputCls} />
            </Field>
            <Field label="Original Price (LKR)">
              <input type="number" value={form.originalPrice ?? 0} onChange={(e) => set("originalPrice", Number(e.target.value))} min={0} className={inputCls} />
            </Field>
          </div>
          {discount > 0 && (
            <p className="text-sm text-emerald-600 mt-2">
              Showing <strong>{discount}% off</strong> badge to customers
            </p>
          )}
        </section>

        {/* Hotels */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Hotels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Makkah</p>
              <Field label="Hotel Name">
                <input type="text" value={form.makkahHotel ?? ""} onChange={(e) => set("makkahHotel", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Stars">
                <select value={form.makkahHotelStars ?? 4} onChange={(e) => set("makkahHotelStars", Number(e.target.value))} className={inputCls}>
                  {[3, 4, 5].map((s) => <option key={s} value={s}>{s} ★</option>)}
                </select>
              </Field>
              <Field label="Distance to Haram">
                <input type="text" value={form.makkahHotelDistance ?? ""} onChange={(e) => set("makkahHotelDistance", e.target.value)} placeholder="e.g. 200m" className={inputCls} />
              </Field>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Madinah</p>
              <Field label="Hotel Name">
                <input type="text" value={form.madinahHotel ?? ""} onChange={(e) => set("madinahHotel", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Stars">
                <select value={form.madinahHotelStars ?? 4} onChange={(e) => set("madinahHotelStars", Number(e.target.value))} className={inputCls}>
                  {[3, 4, 5].map((s) => <option key={s} value={s}>{s} ★</option>)}
                </select>
              </Field>
              <Field label="Distance to Masjid Nabawi">
                <input type="text" value={form.madinahHotelDistance ?? ""} onChange={(e) => set("madinahHotelDistance", e.target.value)} placeholder="e.g. 300m" className={inputCls} />
              </Field>
            </div>
          </div>
        </section>

        {/* Inclusions */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Inclusions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { field: "includesFlights" as const, label: "✈ Flights" },
              { field: "includesVisa" as const, label: "📄 Visa" },
              { field: "includesTransport" as const, label: "🚌 Ground Transport" },
              { field: "includesMeals" as const, label: "🍽 Meals" },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[field]}
                  onChange={(e) => set(field, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0891b2] focus:ring-[#0891b2]"
                />
                <span className="text-sm text-[#0F172A]">{label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Status */}
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Publication Status</h2>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
            <option value="DRAFT">Draft — not visible to public</option>
            <option value="ACTIVE">Active — published and bookable</option>
            <option value="PAUSED">Paused — visible but not bookable</option>
            <option value="ARCHIVED">Archived — hidden from all listings</option>
          </select>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/agency/packages")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]";

function Field({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
