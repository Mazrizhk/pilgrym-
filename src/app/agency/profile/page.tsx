"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface AgencyProfile {
  name: string;
  slug: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  yearsExperience: number;
  licenseNumber: string;
  bankName: string;
  bankAccount: string;
  bankBranch: string;
}

export default function AgencyProfilePage() {
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/agency/profile")
      .then((r) => r.json())
      .then(setProfile);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const res = await fetch("/api/agency/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, yearsExperience: Number(data.yearsExperience) }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Profile updated successfully.");
    } else {
      setMessage("Failed to save. Please try again.");
    }
  };

  if (!profile) {
    return <div className="animate-pulse h-96 bg-gray-100 rounded-xl" />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Agency Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Agency Name" name="name" defaultValue={profile.name} required />
            <Field label="City" name="city" defaultValue={profile.city} />
            <Field label="Phone" name="phone" defaultValue={profile.phone} type="tel" />
            <Field label="Email" name="email" defaultValue={profile.email} type="email" />
            <Field label="Website" name="website" defaultValue={profile.website ?? ""} />
            <Field label="Years Experience" name="yearsExperience" defaultValue={String(profile.yearsExperience)} type="number" />
            <Field label="License Number" name="licenseNumber" defaultValue={profile.licenseNumber ?? ""} />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Description</label>
            <textarea
              name="description"
              defaultValue={profile.description ?? ""}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none"
              placeholder="Tell pilgrims about your agency, experience, and what makes you special…"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Bank Details (for payouts)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Bank Name" name="bankName" defaultValue={profile.bankName ?? ""} />
            <Field label="Account Number" name="bankAccount" defaultValue={profile.bankAccount ?? ""} />
            <Field label="Branch" name="bankBranch" defaultValue={profile.bankBranch ?? ""} />
          </div>
          <p className="text-xs text-[#64748B] mt-3">Bank details are used by Pilgrym admin to process payouts. They are never shared with customers.</p>
        </div>

        {message && (
          <p className={`text-sm ${message.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving…" : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label, name, defaultValue, type = "text", required = false,
}: {
  label: string; name: string; defaultValue: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
      />
    </div>
  );
}
