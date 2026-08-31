"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const transitions: Record<string, { label: string; next: string; color: "default" | "success" | "secondary" }> = {
  PAID: { label: "Start Processing", next: "PROCESSING", color: "default" },
  PROCESSING: { label: "Confirm Booking", next: "CONFIRMED", color: "success" },
  CONFIRMED: { label: "Mark as Completed", next: "COMPLETED", color: "secondary" },
};

export default function BookingStatusUpdater({
  bookingId,
  currentStatus,
  bookingRef,
}: {
  bookingId: string;
  currentStatus: string;
  bookingRef: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const transition = transitions[currentStatus];

  if (!transition) {
    return (
      <p className="text-sm text-[#64748B]">
        This booking is <strong>{currentStatus}</strong> — no further status updates available.
      </p>
    );
  }

  const handleUpdate = async () => {
    if (!confirm(`Update booking ${bookingRef} to ${transition.next}?`)) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/agency/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: transition.next }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Update failed");
    }
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div>
        <p className="text-sm text-[#64748B] mb-1">Current Status</p>
        <Badge variant={currentStatus === "CONFIRMED" ? "success" : currentStatus === "COMPLETED" ? "secondary" : "warning"}>
          {currentStatus}
        </Badge>
      </div>
      <div className="text-[#64748B]">→</div>
      <div>
        <p className="text-sm text-[#64748B] mb-1">Next Step</p>
        <Button
          onClick={handleUpdate}
          disabled={loading}
          variant={transition.color === "success" ? "default" : "outline"}
          size="sm"
        >
          {loading ? "Updating…" : transition.label}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
