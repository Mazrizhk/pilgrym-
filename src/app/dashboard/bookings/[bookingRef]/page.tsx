import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatLKR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Package, Plane } from "lucide-react";
import MessageThread from "@/components/MessageThread";

const statusColors: Record<string, "warning" | "default" | "success" | "secondary" | "destructive"> = {
  PAID: "warning", PROCESSING: "default", CONFIRMED: "success",
  COMPLETED: "secondary", DISPUTED: "destructive",
};

const steps = ["PAID", "PROCESSING", "CONFIRMED", "COMPLETED"];

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingRef: string }>;
}) {
  const session = await auth();
  if (!session) return null;
  const { bookingRef } = await params;

  const booking = await prisma.booking.findFirst({
    where: { bookingRef, customerId: session.user.id },
    include: {
      package: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          inclusions: { where: { included: true } },
          agency: true,
        },
      },
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      dispute: true,
    },
  });

  if (!booking) notFound();

  const currentStepIndex = steps.indexOf(booking.status);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/bookings" className="text-sm text-[#0891b2] hover:underline">
          ← My Bookings
        </Link>
        <span className="text-[#64748B]">/</span>
        <span className="text-sm font-mono text-[#64748B]">{booking.bookingRef}</span>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{booking.package.title}</h1>
          <p className="text-[#64748B] mt-1">{booking.package.agency.name}</p>
        </div>
        <Badge variant={statusColors[booking.status] ?? "secondary"} className="text-sm px-3 py-1">
          {booking.status}
        </Badge>
      </div>

      {/* Status stepper */}
      {!["DISPUTED", "CANCELLED", "REFUNDED"].includes(booking.status) && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-[#0F172A] mb-5">Booking Progress</h2>
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      i < currentStepIndex
                        ? "bg-emerald-500 text-white"
                        : i === currentStepIndex
                        ? "bg-[#0891b2] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i < currentStepIndex ? "✓" : i + 1}
                  </div>
                  <span className="text-xs text-[#64748B] mt-1 text-center max-w-[60px]">{step}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIndex ? "bg-emerald-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Booking summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" /> Booking Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Booking Ref</span>
              <span className="font-mono font-medium text-[#0F172A]">{booking.bookingRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Travel Date</span>
              <span className="text-[#0F172A]">{formatDate(booking.travelDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Departure</span>
              <span className="text-[#0F172A]">{formatDate(booking.package.departureDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Adults</span>
              <span className="text-[#0F172A]">{booking.adults}</span>
            </div>
            {booking.children > 0 && (
              <div className="flex justify-between">
                <span className="text-[#64748B]">Children</span>
                <span className="text-[#0F172A]">{booking.children}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Payment Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Package Price</span>
              <span className="text-[#0F172A]">{formatLKR(booking.package.pricePerPerson)} × {booking.adults}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Platform Fee</span>
              <span className="text-emerald-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
              <span className="text-[#0F172A]">Total Paid</span>
              <span className="text-[#0891b2] text-lg">{formatLKR(booking.totalAmount)}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-xs text-emerald-700">
              🔒 Your payment is held securely by Pilgrym and will only be released to the agency after your journey is completed.
            </p>
          </div>
        </div>
      </div>

      {/* Agency contact — only visible for CONFIRMED+ */}
      {["CONFIRMED", "COMPLETED"].includes(booking.status) && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-[#0F172A] mb-4">Agency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[#64748B]">Agency</p>
              <p className="font-medium text-[#0F172A]">{booking.package.agency.name}</p>
            </div>
            <div>
              <p className="text-[#64748B]">Phone</p>
              <p className="font-medium text-[#0F172A]">{booking.package.agency.phone}</p>
            </div>
            <div>
              <p className="text-[#64748B]">Email</p>
              <p className="font-medium text-[#0F172A]">{booking.package.agency.email}</p>
            </div>
          </div>
        </div>
      )}

      {!["CONFIRMED", "COMPLETED"].includes(booking.status) && booking.status !== "CANCELLED" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <p className="text-sm text-amber-700">
            🔒 Agency contact details will be shared once your booking is confirmed.
          </p>
        </div>
      )}

      {/* Message thread */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-5">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-[#0F172A]">Messages with Agency</h2>
        </div>
        <MessageThread
          bookingId={booking.id}
          currentUserId={session.user.id}
          initialMessages={booking.messages.map((m) => ({
            id: m.id,
            content: m.content,
            createdAt: m.createdAt.toISOString(),
            read: m.read,
            sender: { id: m.sender.id, name: m.sender.name, role: m.sender.role },
          }))}
        />
      </div>

      {/* Raise dispute */}
      {["PAID", "PROCESSING", "CONFIRMED"].includes(booking.status) && !booking.dispute && (
        <div id="dispute" className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
          <h2 className="font-semibold text-red-700 mb-2">Raise a Dispute</h2>
          <p className="text-sm text-[#64748B] mb-4">
            If you have a serious issue with this booking, you can raise a dispute. Our team will investigate and mediate.
          </p>
          <Link href={`/api/disputes/new?bookingRef=${booking.bookingRef}`}>
            <Button variant="destructive" size="sm">Raise Dispute</Button>
          </Link>
        </div>
      )}

      {booking.dispute && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h2 className="font-semibold text-red-700 mb-2">Dispute #{booking.dispute.id.slice(-6)}</h2>
          <p className="text-sm text-[#64748B]">Status: <strong>{booking.dispute.status}</strong></p>
          <p className="text-sm text-[#64748B] mt-1">{booking.dispute.reason}</p>
        </div>
      )}
    </div>
  );
}
