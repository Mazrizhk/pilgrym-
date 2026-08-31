"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Registration failed. Please try again.");
      return;
    }

    router.push("/auth/login?registered=1");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0891b2] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-2xl font-bold text-[#0F172A]">Pilgrym</span>
          </Link>
          <h1 className="text-xl font-semibold text-[#0F172A] mt-4">Create your account</h1>
          <p className="text-[#64748B] text-sm mt-1">Join thousands of Sri Lankan pilgrims</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "CUSTOMER" })}
              className={`rounded-xl border-2 p-4 text-center transition-all ${
                form.role === "CUSTOMER"
                  ? "border-[#0891b2] bg-cyan-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">🕌</div>
              <div className="text-sm font-medium text-[#0F172A]">Pilgrim</div>
              <div className="text-xs text-[#64748B]">I want to book Umrah</div>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "AGENCY" })}
              className={`rounded-xl border-2 p-4 text-center transition-all ${
                form.role === "AGENCY"
                  ? "border-[#0891b2] bg-cyan-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-1">🏢</div>
              <div className="text-sm font-medium text-[#0F172A]">Travel Agency</div>
              <div className="text-xs text-[#64748B]">I offer Umrah packages</div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ahmed Mohamed"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ahmed@example.com"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+94 77 123 4567"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
                required
                className="mt-1.5"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-xs text-center text-[#64748B]">
              By creating an account, you agree to Pilgrym&apos;s{" "}
              <Link href="/terms" className="text-[#0891b2] hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-[#0891b2] hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#64748B]">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#0891b2] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
