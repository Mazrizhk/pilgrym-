"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "AGENCY"
      ? "/agency"
      : "/dashboard";

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0891b2] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-xl text-[#0F172A]">Pilgrym</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/packages" className="text-sm text-[#64748B] hover:text-[#0891b2] transition-colors">
              Packages
            </Link>
            <Link href="/agencies" className="text-sm text-[#64748B] hover:text-[#0891b2] transition-colors">
              Agencies
            </Link>
            <Link href="/first-time" className="text-sm text-[#64748B] hover:text-[#0891b2] transition-colors">
              First Timer Guide
            </Link>
            <Link href="/about" className="text-sm text-[#64748B] hover:text-[#0891b2] transition-colors">
              About
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href={dashboardPath}>
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <Button variant="ghost" size="sm" type="submit">
                    Sign Out
                  </Button>
                </form>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
            <Link
              href="/packages"
              className="block px-3 py-2 text-sm text-[#64748B] hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Packages
            </Link>
            <Link
              href="/agencies"
              className="block px-3 py-2 text-sm text-[#64748B] hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Agencies
            </Link>
            <Link
              href="/first-time"
              className="block px-3 py-2 text-sm text-[#64748B] hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              First Timer Guide
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-sm text-[#64748B] hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <Link href={dashboardPath}>
                  <Button className="w-full" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
