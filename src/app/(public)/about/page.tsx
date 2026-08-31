import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Pilgrym — Sri Lanka's Trusted Umrah Marketplace",
  description: "Learn how Pilgrym connects Sri Lankan Muslim pilgrims with verified travel agencies for Umrah and Hajj.",
};

const team = [
  { name: "Amir Hassan", role: "Co-Founder & CEO", bio: "Former Hajj pilgrim who experienced the agency trust gap first-hand. 12 years in fintech." },
  { name: "Fathima Noor", role: "Co-Founder & COO", bio: "Travel industry veteran with 15 years running tour operations across the Middle East." },
  { name: "Rashid Malik", role: "Head of Verification", bio: "Ex-SLTDA auditor. Has personally verified over 200 travel agency applications." },
];

const milestones = [
  { year: "2022", event: "Founded in Colombo, with a vision to fix the Umrah trust problem in Sri Lanka." },
  { year: "2023", event: "Launched beta with 8 pilot agencies and 150 early bookings." },
  { year: "2024", event: "Reached 50 verified agencies and 2,000 successful pilgrimages facilitated." },
  { year: "2025", event: "Launched escrow payment protection and dispute resolution system." },
  { year: "2026", event: "Expanding to Maldives and Malaysia markets." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0891b2] to-[#0e7490] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Making Every Pilgrimage Count</h1>
          <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
            Pilgrym was born from a simple truth: Sri Lankan Muslims deserve to book their Umrah and Hajj with complete trust — knowing their money is safe and the agency is real.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Our Mission</h2>
              <p className="text-[#64748B] leading-relaxed mb-4">
                Every year, thousands of Sri Lankan Muslims dream of performing Umrah or Hajj. But finding a trustworthy agency has been a nightmare — opaque pricing, unverified credentials, and stories of people losing their life savings to fraudulent operators.
              </p>
              <p className="text-[#64748B] leading-relaxed mb-4">
                Pilgrym is not a travel agency. We are a marketplace that enforces trust: we verify every agency, hold payments in escrow until your pilgrimage is confirmed, and resolve disputes so you are never left stranded.
              </p>
              <p className="text-[#64748B] leading-relaxed">
                We exist purely to connect pilgrims with agencies that have earned the right to serve them.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: "🔒", title: "Escrow Payments", desc: "Your money is held safely until your agency confirms your booking." },
                { icon: "✅", title: "Verified Agencies Only", desc: "Every agency submits SLTDA/TAAB license, NIC, and bank statements before listing." },
                { icon: "⚖️", title: "Dispute Resolution", desc: "Our team mediates if anything goes wrong. You are protected." },
                { icon: "🌟", title: "Real Reviews", desc: "Only verified pilgrims who completed a booking can leave a review." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-4 bg-[#F8FAFC] rounded-xl">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-[#0F172A]">{item.title}</p>
                    <p className="text-sm text-[#64748B]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-10">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((m) => (
              <div key={m.year} className="flex gap-4">
                <div className="shrink-0 w-16 h-16 bg-[#0891b2] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {m.year}
                </div>
                <div className="flex-1 pt-4 pb-4 border-b border-gray-200 last:border-0">
                  <p className="text-[#0F172A]">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-10">The Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center p-6 bg-[#F8FAFC] rounded-xl">
                <div className="w-20 h-20 bg-[#0891b2] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-bold text-[#0F172A]">{member.name}</h3>
                <p className="text-sm text-[#0891b2] mb-2">{member.role}</p>
                <p className="text-sm text-[#64748B]">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#0891b2] text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50+", label: "Verified Agencies" },
              { value: "2,000+", label: "Pilgrimages Facilitated" },
              { value: "LKR 0", label: "Fraud Losses on Platform" },
              { value: "4.8 ★", label: "Average Agency Rating" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-bold">{s.value}</p>
                <p className="text-cyan-100 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Get in Touch</h2>
          <p className="text-[#64748B] mb-8">Have questions? Want to list your agency? We are here to help.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-8">
            {[
              { icon: "📧", label: "Email", value: "hello@pilgrym.lk" },
              { icon: "📞", label: "Phone", value: "+94 11 234 5678" },
              { icon: "📍", label: "Office", value: "42 Galle Road, Colombo 03" },
            ].map((c) => (
              <div key={c.label} className="p-4 bg-[#F8FAFC] rounded-xl">
                <p className="text-xl mb-1">{c.icon}</p>
                <p className="text-xs text-[#64748B]">{c.label}</p>
                <p className="text-sm font-medium text-[#0F172A]">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/packages"><Button size="lg">Browse Packages</Button></Link>
            <Link href="/auth/register"><Button size="lg" variant="outline">List Your Agency</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
