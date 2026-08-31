import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PackageCard from "@/components/PackageCard";
import { Button } from "@/components/ui/button";
import HeroSlider from "@/components/HeroSlider";
import { Shield, CreditCard, CheckCircle, Star } from "lucide-react";

export const revalidate = 60;

async function getFeaturedPackages() {
  return prisma.package.findMany({
    where: { status: "ACTIVE", featured: true },
    take: 6,
    include: {
      images: true,
      agency: { select: { name: true, slug: true, verificationStatus: true, rating: true, totalReviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getDepartingSoonPackages() {
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 90);

  return prisma.package.findMany({
    where: {
      status: "ACTIVE",
      departureDate: { lte: sixtyDaysFromNow, gte: new Date() },
    },
    take: 6,
    include: {
      images: true,
      agency: { select: { name: true, slug: true, verificationStatus: true, rating: true, totalReviews: true } },
    },
    orderBy: { departureDate: "asc" },
  });
}

async function getVerifiedAgencies() {
  return prisma.agency.findMany({
    where: { verificationStatus: "APPROVED" },
    take: 6,
    select: { id: true, name: true, slug: true, logo: true, city: true, rating: true, totalReviews: true },
  });
}

async function getStats() {
  const [agencies, packages, bookings] = await Promise.all([
    prisma.agency.count({ where: { verificationStatus: "APPROVED" } }),
    prisma.package.count({ where: { status: "ACTIVE" } }),
    prisma.booking.count({ where: { status: { in: ["CONFIRMED", "COMPLETED"] } } }),
  ]);
  return { agencies, packages, pilgrims: bookings };
}

export default async function HomePage() {
  const [featured, departingSoon, agencies, stats] = await Promise.all([
    getFeaturedPackages(),
    getDepartingSoonPackages(),
    getVerifiedAgencies(),
    getStats(),
  ]);

  return (
    <div>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Search Bar */}
      <div className="bg-white shadow-lg py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <form action="/packages" className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              name="type"
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
            >
              <option value="">All Package Types</option>
              <option value="UMRAH">Umrah</option>
              <option value="HAJJ">Hajj</option>
              <option value="RAMADAN_UMRAH">Ramadan Umrah</option>
              <option value="UMRAH_PLUS_ZIYARAT">Umrah + Ziyarat</option>
            </select>
            <select
              name="duration"
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
            >
              <option value="">Any Duration</option>
              <option value="10">10 Days</option>
              <option value="12">12 Days</option>
              <option value="14">14 Days</option>
              <option value="21">21 Days</option>
            </select>
            <select
              name="maxPrice"
              className="h-11 rounded-lg border border-gray-200 px-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
            >
              <option value="">Any Budget</option>
              <option value="300000">Under LKR 300,000</option>
              <option value="400000">Under LKR 400,000</option>
              <option value="500000">Under LKR 500,000</option>
              <option value="700000">Under LKR 700,000</option>
            </select>
            <Button type="submit" size="lg" className="h-11">
              Search Packages
            </Button>
          </form>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#0891b2] text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">{stats.agencies}+</div>
              <div className="text-sm text-cyan-100 mt-1">Verified Agencies</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.packages}+</div>
              <div className="text-sm text-cyan-100 mt-1">Active Packages</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.pilgrims}+</div>
              <div className="text-sm text-cyan-100 mt-1">Pilgrims Served</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Packages */}
      {featured.length > 0 && (
        <section className="py-16 px-4 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A]">Featured Packages</h2>
                <p className="text-[#64748B] mt-1">Hand-picked packages from our top verified agencies</p>
              </div>
              <Link href="/packages">
                <Button variant="outline">View All →</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Departing Soon */}
      {departingSoon.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0F172A]">Departing Soon</h2>
              <p className="text-[#64748B] mt-1">Limited seats available — book before it&apos;s too late</p>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
              {departingSoon.map((pkg) => (
                <div key={pkg.id} className="shrink-0 w-72 snap-start">
                  <PackageCard package={pkg} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 px-4 bg-[#F8FAFC] islamic-pattern">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#0F172A]">How Pilgrym Works</h2>
            <p className="text-[#64748B] mt-2">Your blessed journey, made simple</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Create Account", desc: "Sign up in 2 minutes. No commitment required.", icon: "👤" },
              { step: "2", title: "Compare Packages", desc: "Browse packages from verified agencies. Read real reviews.", icon: "🔍" },
              { step: "3", title: "Book & Travel", desc: "Pay securely. Your money is protected until you travel.", icon: "✈️" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-[#0891b2] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div className="text-sm font-semibold text-[#0891b2] mb-1">Step {item.step}</div>
                <h3 className="font-bold text-[#0F172A] mb-2">{item.title}</h3>
                <p className="text-sm text-[#64748B]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl border border-gray-100 shadow-sm">
              <Shield className="w-10 h-10 text-[#0891b2] mx-auto mb-4" />
              <h3 className="font-semibold text-[#0F172A] mb-2">Verified Agencies Only</h3>
              <p className="text-sm text-[#64748B]">Every agency is verified with business documents, tourism licenses, and director identity checks.</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-gray-100 shadow-sm">
              <CreditCard className="w-10 h-10 text-[#0891b2] mx-auto mb-4" />
              <h3 className="font-semibold text-[#0F172A] mb-2">Secure Payments</h3>
              <p className="text-sm text-[#64748B]">Powered by Stripe. Your payment is held securely and only released to the agency after you travel.</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-gray-100 shadow-sm">
              <CheckCircle className="w-10 h-10 text-[#0891b2] mx-auto mb-4" />
              <h3 className="font-semibold text-[#0F172A] mb-2">Protected Until You Travel</h3>
              <p className="text-sm text-[#64748B]">If something goes wrong, our dispute resolution team is here to protect your investment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Agencies */}
      {agencies.length > 0 && (
        <section className="py-16 px-4 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#0F172A]">Verified Agencies</h2>
              <p className="text-[#64748B] mt-1">Trusted and verified travel agencies on Pilgrym</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {agencies.map((agency) => (
                <Link
                  key={agency.id}
                  href={`/agencies/${agency.slug}`}
                  className="bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 overflow-hidden">
                    {agency.logo && (
                      <img src={agency.logo} alt={agency.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#0F172A] line-clamp-2 group-hover:text-[#0891b2]">
                    {agency.name}
                  </p>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    <Star className="w-3 h-3 fill-[#D4A017] text-[#D4A017]" />
                    <span className="text-xs text-[#64748B]">{agency.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-medium">✓ Verified</span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/agencies">
                <Button variant="outline">View All Agencies →</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#0F172A]">What Pilgrims Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "M. Farook",
                city: "Colombo",
                rating: 5,
                comment: "SubhanAllah, Pilgrym made our Umrah booking so simple. We compared 3 agencies, read real reviews, and booked with complete confidence. The payment protection gave us peace of mind.",
                package: "Premium Umrah — Al Aman Travels",
              },
              {
                name: "F. Hashim",
                city: "Kandy",
                rating: 5,
                comment: "As a first-timer, I was nervous about booking online. But Pilgrym's verification system and the detailed agency profiles made it easy to trust. Alhamdulillah, a perfect journey.",
                package: "Family Umrah — Noor Pilgrimage",
              },
              {
                name: "I. Siddiq",
                city: "Kurunegala",
                rating: 5,
                comment: "The price comparison alone saved me LKR 45,000. I found the exact same package cheaper on Pilgrym than going directly to the agency. Will always book through Pilgrym.",
                package: "Standard Umrah — Barakah Travel",
              },
            ].map((review, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#D4A017] text-[#D4A017]" />
                  ))}
                </div>
                <p className="text-sm text-[#64748B] mb-4 italic">&ldquo;{review.comment}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{review.name}</p>
                  <p className="text-xs text-[#64748B]">{review.city} · {review.package}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 bg-[#0891b2]">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Sacred Journey?</h2>
          <p className="text-cyan-100 mb-8 text-lg">
            Join thousands of Sri Lankan pilgrims who have trusted Pilgrym for their Umrah and Hajj travel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/packages">
              <Button size="xl" className="bg-white text-[#0891b2] hover:bg-cyan-50 w-full sm:w-auto">
                Browse Packages
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#0F172A]">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Is Pilgrym a travel agency?",
                a: "No. Pilgrym is a marketplace platform. We connect you with verified travel agencies. All travel arrangements, visa processing, and accommodation are handled by the agency you book with.",
              },
              {
                q: "How are agencies verified?",
                a: "Every agency submits their Business Registration Certificate, Tourism Board License, Director NIC, and Bank Details. Our team reviews all documents and grants approval only after verification.",
              },
              {
                q: "Is my payment safe?",
                a: "Yes. Payments are processed by Stripe and held securely. The agency only receives payment after your journey is completed and confirmed — not before.",
              },
              {
                q: "What if I have a problem with my booking?",
                a: "Pilgrym has a built-in dispute resolution system. If anything goes wrong, raise a dispute through your dashboard and our team will mediate between you and the agency.",
              },
              {
                q: "Can I book for my entire family?",
                a: "Yes. During checkout you can specify the number of adults and children and provide details for each traveller.",
              },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm group">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-[#0F172A] list-none">
                  {faq.q}
                  <span className="text-[#0891b2] group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
