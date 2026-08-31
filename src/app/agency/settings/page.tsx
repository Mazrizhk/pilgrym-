"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function AgencySettingsPage() {
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handlePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg("Passwords do not match.");
      return;
    }
    setPwLoading(true);
    setPwMsg("");
    const res = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    });
    setPwLoading(false);
    if (res.ok) {
      setPwMsg("Password updated successfully.");
      setPwForm({ current: "", next: "", confirm: "" });
    } else {
      const d = await res.json();
      setPwMsg(d.error ?? "Failed to update password.");
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Settings</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-[#0F172A] mb-4">Change Password</h2>
        <form onSubmit={handlePw} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Current Password</label>
            <input
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
              required
              className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">New Password</label>
            <input
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
              required
              minLength={8}
              className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Confirm New Password</label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              required
              className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
            />
          </div>
          {pwMsg && (
            <p className={`text-sm ${pwMsg.includes("successfully") ? "text-emerald-600" : "text-red-600"}`}>
              {pwMsg}
            </p>
          )}
          <Button type="submit" disabled={pwLoading} className="w-full">
            {pwLoading ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-[#0F172A] mb-2">Notifications</h2>
        <p className="text-sm text-[#64748B] mb-4">Email notification preferences (coming soon — currently all important notifications are sent automatically).</p>
        {[
          "New booking received",
          "Booking status updated by customer",
          "New message from customer",
          "Payout processed",
          "Verification status changed",
        ].map((item) => (
          <div key={item} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-[#0F172A]">{item}</span>
            <span className="text-xs text-emerald-600 font-medium">Always On</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-[#64748B] mb-4">
          Signing out will end your session. To close your agency account, contact <a href="mailto:support@pilgrym.lk" className="underline text-[#0891b2]">support@pilgrym.lk</a>.
        </p>
        <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</Button>
      </div>
    </div>
  );
}
