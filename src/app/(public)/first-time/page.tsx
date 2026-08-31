import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "First Time Umrah Guide — Pilgrym",
  description: "Everything Sri Lankan first-time pilgrims need to know before booking Umrah. Visa, costs, what to expect, and how to choose a trustworthy agency.",
};

const steps = [
  {
    number: "01",
    title: "Understand the Commitment",
    content: "Umrah is a non-mandatory pilgrimage that can be performed at any time of year (except during Hajj season). It involves Tawaf (circling the Kaaba 7 times), Sa&apos;i (walking between Safa and Marwa 7 times), and shaving/cutting hair. Plan for 7–14 days minimum.",
  },
  {
    number: "02",
    title: "Choose the Right Time",
    content: "Avoid peak seasons (Ramadan, school holidays, Dhul Hijjah) if you want lower prices and fewer crowds. January–April and September–November offer better value. Ramadan Umrah carries extra spiritual reward but prices can be 2–3× higher.",
  },
  {
    number: "03",
    title: "Set a Budget",
    content: "From Sri Lanka, expect to budget LKR 250,000–600,000+ per person depending on hotel category, airline, and package inclusions. Economy packages use 3-star hotels 500m+ from the Haram. Premium packages place you within 200m. Don't compromise on the hotel — proximity matters enormously.",
  },
  {
    number: "04",
    title: "Choose a Verified Agency",
    content: "ONLY book through agencies verified by Pilgrym. Verified agencies hold valid SLTDA and TAAB licenses, have submitted financial documents, and have been reviewed by our team. Never transfer money to a personal account or book through WhatsApp groups with unknown agencies.",
  },
  {
    number: "05",
    title: "Understand the Visa Process",
    content: "Saudi Arabia issues Umrah visas only through licensed Umrah operators. Your agency handles this — you cannot apply directly. You need a valid passport (minimum 6 months validity), vaccination certificates (meningitis ACYW135 is mandatory), and passport photos.",
  },
  {
    number: "06",
    title: "Book with Escrow Protection",
    content: "When you book through Pilgrym, your payment is held in escrow. The agency only receives funds after your booking is confirmed and visa is issued. If anything goes wrong, raise a dispute and our team investigates within 48 hours.",
  },
];

const faqs = [
  { q: "How early should I book?", a: "3–6 months in advance for peak periods (Ramadan, school holidays). 4–6 weeks is usually sufficient for off-peak travel." },
  { q: "Can women travel without a Mahram?", a: "Saudi Arabia allows women over 45 to travel for Umrah without a Mahram as part of an official group. Women under 45 must travel with a Mahram. Requirements change — confirm with your chosen agency." },
  { q: "What vaccinations are required?", a: "Meningococcal ACYW135 vaccine is mandatory. COVID-19 vaccination may be required depending on current Saudi regulations. Check with your agency for the latest requirements." },
  { q: "What is the difference between Umrah and Hajj?", a: "Hajj is the mandatory fifth pillar of Islam, performed in Dhul Hijjah with specific dates. Umrah is voluntary, can be performed any time, takes 2–3 hours of rituals vs Hajj's 5+ days, and is generally less expensive." },
  { q: "What should I pack?", a: "Ihram clothing (2 white seamless cloths for men), modest loose clothing (abaya recommended for women), comfortable walking shoes, prayer mat, small backpack for daily movement, and any medications you need. Leave valuables at home." },
  { q: "Is it safe?", a: "Makkah and Madinah are among the safest cities in the world. The main risks are heat (temperatures can exceed 45°C in summer) and crowds during peak times. Stay hydrated, take rest, and avoid rush hours at the Haram." },
];

export default function FirstTimePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🕌</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Your First Umrah</h1>
          <p className="text-xl text-gray-300 max-w-xl mx-auto">
            A complete guide for Sri Lankan pilgrims planning their first Umrah — from setting a budget to returning home safely.
          </p>
        </div>
      </section>

      {/* Step-by-step guide */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-10">Step-by-Step Guide</h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="shrink-0 w-14 h-14 bg-[#0891b2] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div className="flex-1 pb-6 border-b border-gray-100 last:border-0">
                  <h3 className="text-lg font-bold text-[#0F172A] mb-2">{step.title}</h3>
                  <p className="text-[#64748B] leading-relaxed" dangerouslySetInnerHTML={{ __html: step.content }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Budget breakdown */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-10">Typical Cost Breakdown</h2>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-gray-100">
                <tr>
                  {["Item", "Economy", "Standard", "Premium"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#64748B]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Return Flights (CMB–JED)", "LKR 85,000", "LKR 95,000", "LKR 120,000"],
                  ["Makkah Hotel (7 nights)", "LKR 50,000", "LKR 75,000", "LKR 150,000"],
                  ["Madinah Hotel (4 nights)", "LKR 30,000", "LKR 45,000", "LKR 90,000"],
                  ["Visa & Documentation", "LKR 15,000", "LKR 15,000", "LKR 15,000"],
                  ["Transport & Ziyarath", "LKR 20,000", "LKR 25,000", "LKR 40,000"],
                  ["Meals (where not included)", "LKR 30,000", "LKR 20,000", "LKR 0"],
                  ["Agency Service Fee", "LKR 15,000", "LKR 25,000", "LKR 40,000"],
                ].map(([item, ...costs]) => (
                  <tr key={item} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 text-[#0F172A]">{item}</td>
                    {costs.map((c, i) => (
                      <td key={i} className="px-5 py-3 text-[#64748B]">{c}</td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-[#0891b2]/10 font-bold border-t-2 border-[#0891b2]/20">
                  <td className="px-5 py-3 text-[#0F172A]">TOTAL (per person)</td>
                  <td className="px-5 py-3 text-[#0891b2]">~LKR 245,000</td>
                  <td className="px-5 py-3 text-[#0891b2]">~LKR 300,000</td>
                  <td className="px-5 py-3 text-[#0891b2]">~LKR 455,000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#64748B] mt-3 text-center">Prices are indicative for 2026. Actual prices vary by season and availability. Ramadan packages cost 2–3× more.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-[#F8FAFC] rounded-xl border border-gray-100">
                <summary className="cursor-pointer px-5 py-4 font-semibold text-[#0F172A] flex items-center justify-between">
                  {faq.q}
                  <span className="text-[#0891b2] group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-5 pb-4 text-[#64748B] text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0891b2] text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-cyan-100 mb-8 text-lg">Browse packages from Sri Lanka&apos;s verified Umrah agencies — compare prices, check inclusions, and book safely with escrow protection.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/packages"><Button size="lg" variant="gold">Browse Umrah Packages</Button></Link>
            <Link href="/about"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">How Pilgrym Works</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
