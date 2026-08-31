"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => setForm({ name: d.name ?? "", phone: d.phone ?? "", email: d.email ?? "" }));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/user/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, phone: form.phone }),
    });
    setSaving(false);
    setMsg(res.ok ? "Profile updated successfully." : "Failed to update profile.");
  };

  const changePassword = async () => {
    if (passwords.next !== passwords.confirm) { setMsg("Passwords do not match."); return; }
    setSaving(true);
    const res = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: passwords.current, next: passwords.next }),
    });
    setSaving(false);
    setMsg(res.ok ? "Password changed successfully." : "Failed to change password.");
    if (res.ok) setPasswords({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">My Profile</h1>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes("success") ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {msg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="font-semibold text-[#0F172A] mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input value={form.email} disabled className="mt-1.5 bg-gray-50" />
            <p className="text-xs text-[#64748B] mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+94 77 123 4567" className="mt-1.5" />
          </div>
          <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="font-semibold text-[#0F172A] mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>New Password</Label>
            <Input type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="mt-1.5" />
          </div>
          <Button onClick={changePassword} disabled={saving} variant="outline">{saving ? "Changing..." : "Change Password"}</Button>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-[#64748B] mb-3">Deleting your account is permanent and cannot be undone.</p>
        <Button variant="destructive" size="sm">Delete My Account</Button>
      </div>
    </div>
  );
}
