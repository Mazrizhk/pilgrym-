import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Subscription" };

const plans = [
  {
    name: "FREE",
    price: "LKR 0",
    period: "forever",
    features: [
      "Up to 5 active packages",
      "Basic listing on search",
      "Customer messaging",
      "Booking management",
    ],
    highlight: false,
  },
  {
    name: "BASIC",
    price: "LKR 4,900",
    period: "per month",
    features: [
      "Up to 20 active packages",
      "Priority in search results",
      "Customer messaging",
      "Analytics dashboard",
      "Featured on homepage (occasionally)",
    ],
    highlight: false,
  },
  {
    name: "PRO",
    price: "LKR 9,900",
    period: "per month",
    features: [
      "Unlimited packages",
      "Top placement in search",
      "Customer messaging",
      "Full analytics dashboard",
      "Featured on homepage (guaranteed)",
      "Banner ad slot (1 per month)",
      "Priority support",
    ],
    highlight: true,
  },
];

export default async function AgencySubscriptionPage() {
  const session = await auth();
  if (!session) return null;

  const agency = await prisma.agency.findUnique({ where: { userId: session.user.id } });
  if (!agency) return null;

  const sub = await prisma.agencySubscription.findFirst({
    where: { agencyId: agency.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  const currentPlan = agency.subscriptionPlan ?? "FREE";

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Subscription</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-[#64748B]">Current Plan</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xl font-bold text-[#0F172A]">{currentPlan}</p>
              <Badge variant={currentPlan === "PRO" ? "gold" : currentPlan === "BASIC" ? "default" : "secondary"}>
                {currentPlan}
              </Badge>
            </div>
          </div>
          {sub && (
            <div className="text-right">
              <p className="text-sm text-[#64748B]">Renews</p>
              <p className="text-sm font-medium text-[#0F172A]">{formatDate(sub.currentPeriodEnd!)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {plans.map((plan) => {
          const isActive = currentPlan === plan.name;
          return (
            <div
              key={plan.name}
              className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col ${
                plan.highlight
                  ? "border-[#0891b2] ring-2 ring-[#0891b2]/20"
                  : "border-gray-100"
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-semibold text-[#0891b2] mb-2">MOST POPULAR</div>
              )}
              <h3 className="font-bold text-[#0F172A] text-lg">{plan.name}</h3>
              <div className="mt-1 mb-4">
                <span className="text-2xl font-bold text-[#0F172A]">{plan.price}</span>
                <span className="text-sm text-[#64748B] ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 text-sm text-[#64748B] flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {isActive ? (
                  <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={() => alert("Stripe subscription flow coming soon. Contact sales@pilgrym.lk to upgrade.")}
                  >
                    {plan.name === "FREE" ? "Downgrade" : "Upgrade to " + plan.name}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Ready to upgrade?</strong> Email <a href="mailto:sales@pilgrym.lk" className="underline">sales@pilgrym.lk</a> or call <strong>+94 11 234 5678</strong> to set up your subscription. Online self-service billing is coming soon.
      </div>
    </div>
  );
}
