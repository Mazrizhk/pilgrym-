import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard, Building2, Package, BookOpen,
  DollarSign, AlertTriangle, Megaphone, Users, Settings, LogOut
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/agencies", label: "Agencies", icon: Building2 },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/payouts", label: "Payouts", icon: DollarSign },
  { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
  { href: "/admin/banner-ads", label: "Banner Ads", icon: Megaphone },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <aside className="hidden md:flex flex-col w-64 bg-[#0F172A] min-h-screen">
        <div className="p-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0891b2] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <span className="font-bold text-white">Pilgrym</span>
              <span className="block text-xs text-gray-400">Admin Panel</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <form action="/api/auth/signout" method="POST">
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
