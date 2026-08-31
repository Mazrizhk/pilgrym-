"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AgencyVerifyActions({
  agencyId,
  currentStatus,
  currentNotes,
}: {
  agencyId: string;
  currentStatus: string;
  currentNotes: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(currentNotes);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const update = async (status: string) => {
    if (!confirm(`Set agency to ${status}?`)) return;
    setLoading(status);
    setError("");
    const res = await fetch(`/api/admin/agencies/${agencyId}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    setLoading(null);
    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Admin Notes (shown to agency on rejection)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. License document is expired, please resubmit a valid one."
          className="w-full rounded-lg border border-gray-700 bg-[#0F172A] text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {currentStatus !== "APPROVED" && (
          <Button
            onClick={() => update("APPROVED")}
            disabled={loading !== null}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading === "APPROVED" ? "Approving…" : "✓ Approve"}
          </Button>
        )}
        {currentStatus !== "REJECTED" && (
          <Button
            onClick={() => update("REJECTED")}
            disabled={loading !== null}
            variant="destructive"
          >
            {loading === "REJECTED" ? "Rejecting…" : "✗ Reject"}
          </Button>
        )}
        {currentStatus === "APPROVED" && (
          <Button
            onClick={() => update("SUSPENDED")}
            disabled={loading !== null}
            variant="outline"
          >
            {loading === "SUSPENDED" ? "Suspending…" : "Suspend Agency"}
          </Button>
        )}
        {currentStatus === "SUSPENDED" && (
          <Button
            onClick={() => update("APPROVED")}
            disabled={loading !== null}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Reinstate Agency
          </Button>
        )}
      </div>
    </div>
  );
}
