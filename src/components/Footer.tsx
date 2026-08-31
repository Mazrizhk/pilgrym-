import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#0891b2] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl text-white">Pilgrym</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Sri Lanka&apos;s trusted marketplace for Umrah and Hajj travel. Connecting pilgrims with verified agencies since 2024.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-white transition-colors text-sm">Facebook</a>
              <a href="#" className="hover:text-white transition-colors text-sm">Instagram</a>
              <a href="#" className="hover:text-white transition-colors text-sm">WhatsApp</a>
            </div>
          </div>

          {/* Pilgrims */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Pilgrims</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/packages" className="hover:text-white transition-colors">Browse Packages</Link></li>
              <li><Link href="/agencies" className="hover:text-white transition-colors">Find Agencies</Link></li>
              <li><Link href="/first-time" className="hover:text-white transition-colors">First Timer Guide</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">My Bookings</Link></li>
            </ul>
          </div>

          {/* Agencies */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Agencies</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Join as Agency</Link></li>
              <li><Link href="/agency" className="hover:text-white transition-colors">Agency Dashboard</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Pilgrym</Link></li>
              <li><a href="mailto:hello@pilgrym.lk" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2026 Pilgrym (Pvt) Ltd. All rights reserved.</p>
          <p className="text-sm">Registered in Sri Lanka · hello@pilgrym.lk</p>
        </div>
      </div>
    </footer>
  );
}
