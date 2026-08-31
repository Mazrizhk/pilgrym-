"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Settings {
  id?: string;
  commissionRate: number;
  maintenanceMode: boolean;
  bannerText: string | null;
  freePackageLimit: number;
}

export default function AdminSettingsForm({ settings }: { settings: Settings | null }) {
  const [form, setForm] = useState<Settings>({
    commissionRate: settings?.commissionRate ?? 5,
    maintenanceMode: settings?.maintenanceMode ?? false,
    bannerText: settings?.bannerText ?? "",
    freePackageLimit: settings?.freePackageLimit ?? 5,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setMessage(res.ok ? "Settings saved." : "Failed to save settings.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-5">
        <h2 className="font-semibold text-white mb-4">Commission & Limits</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Commission Rate (%)</label>
            <input
              type="number"
              min={0}
              max={30}
              step={0.5}
              value={form.commissionRate}
              onChange={(e) => setForm((f) => ({ ...f, commissionRate: Number(e.target.value) }))}
              className="w-full h-10 rounded-lg border border-gray-700 bg-[#0F172A] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Free Plan Package Limit</label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.freePackageLimit}
              onChange={(e) => setForm((f) => ({ ...f, freePackageLimit: Number(e.target.value) }))}
              className="w-full h-10 rounded-lg border border-gray-700 bg-[#0F172A] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-5">
        <h2 className="font-semibold text-white mb-4">Site Banner</h2>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Banner Text (shown at top of site, leave empty to hide)</label>
          <input
            type="text"
            value={form.bannerText ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, bannerText: e.target.value }))}
            placeholder="e.g. 🌙 Ramadan Umrah packages now available — limited seats!"
            className="w-full h-10 rounded-lg border border-gray-700 bg-[#0F172A] text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
          />
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-gray-700 p-5">
        <h2 className="font-semibold text-white mb-4">Maintenance Mode</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.maintenanceMode}
            onChange={(e) => setForm((f) => ({ ...f, maintenanceMode: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-700"
          />
          <div>
            <p className="text-sm font-medium text-white">Enable Maintenance Mode</p>
            <p className="text-xs text-gray-400">When enabled, the public site shows a maintenance page. Admin and agency dashboards remain accessible.</p>
          </div>
        </label>
      </div>

      {message && (
        <p className={`text-sm ${message.includes("saved") ? "text-emerald-400" : "text-red-400"}`}>{message}</p>
      )}

      <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Settings"}</Button>
    </form>
  );
}
