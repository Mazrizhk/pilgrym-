import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  LayoutDashboard, Package, BookOpen, MessageSquare,
  DollarSign, BarChart3, User, Shield, Settings,
  CreditCard, LogOut
} from "lucide-react";

const navItems = [
  { href: "/agency", label: "Overview", icon: LayoutDashboard },
  { href: "/agency/packages", label: "Packages", icon: Package },
  { href: "/agency/bookings", label: "Bookings", icon: BookOpen },
  { href: "/agency/messages", label: "Messages", icon: MessageSquare },
  { href: "/agency/payouts", label: "Payouts", icon: DollarSign },
  { href: "/agency/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/agency/profile", label: "Agency Profile", icon: User },
  { href: "/agency/verification", label: "Verification", icon: Shield },
  { href: "/agency/subscription", label: "Subscription", icon: CreditCard },
  { href: "/agency/settings", label: "Settings", icon: Settings },
];

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/auth/login");
  if (session.user.role !== "AGENCY") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0891b2] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-[#0F172A]">Pilgrym</span>
          </Link>
          <span className="text-xs text-[#64748B] mt-1 block">Agency Dashboard</span>
        </div>
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0891b2] transition-colors"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <form action="/api/auth/signout" method="POST">
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#64748B] hover:text-red-600 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
