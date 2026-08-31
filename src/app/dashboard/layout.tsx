import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Package, MessageSquare, User, HelpCircle, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "My Bookings", icon: Package },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
  { href: "/dashboard/support", label: "Help & Support", icon: HelpCircle },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/auth/login");
  if (session.user.role === "AGENCY") redirect("/agency");
  if (session.user.role === "ADMIN") redirect("/admin");

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
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0891b2] transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 bg-[#0891b2] rounded-full flex items-center justify-center text-white text-sm font-bold">
              {session.user.name?.[0] ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F172A] truncate">{session.user.name}</p>
              <p className="text-xs text-[#64748B] truncate">{session.user.email}</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#64748B] hover:text-red-600 transition-colors mt-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex z-50">
        {navItems.slice(0, 4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center py-3 text-[#64748B] hover:text-[#0891b2]"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1">{item.label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
