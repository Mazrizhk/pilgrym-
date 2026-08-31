"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminDisputeActions({
  disputeId,
  currentStatus,
}: {
  disputeId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const update = async (status: string) => {
    if (status === "RESOLVED" && !resolution.trim()) {
      alert("Please enter a resolution before resolving.");
      return;
    }
    setLoading(status);
    await fetch(`/api/admin/disputes/${disputeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolution: resolution || undefined }),
    });
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <textarea
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        placeholder="Enter resolution notes (required for resolving)…"
        rows={2}
        className="w-full rounded-lg border border-gray-700 bg-[#0F172A] text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none"
      />
      <div className="flex gap-3">
        {currentStatus === "OPEN" && (
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-xs" disabled={loading !== null} onClick={() => update("IN_REVIEW")}>
            {loading === "IN_REVIEW" ? "…" : "Start Review"}
          </Button>
        )}
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs" disabled={loading !== null} onClick={() => update("RESOLVED")}>
          {loading === "RESOLVED" ? "…" : "Mark Resolved"}
        </Button>
        <Button size="sm" variant="outline" className="text-xs" disabled={loading !== null} onClick={() => update("CLOSED")}>
          {loading === "CLOSED" ? "…" : "Close (No Action)"}
        </Button>
      </div>
    </div>
  );
}
