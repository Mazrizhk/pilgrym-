"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminPayoutActions({ payoutId }: { payoutId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const mark = async (status: string) => {
    if (!confirm(`Mark payout as ${status}?`)) return;
    setLoading(true);
    await fetch(`/api/admin/payouts/${payoutId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs" disabled={loading} onClick={() => mark("COMPLETED")}>
        Mark Paid
      </Button>
      <Button size="sm" variant="outline" className="text-xs" disabled={loading} onClick={() => mark("PROCESSING")}>
        Processing
      </Button>
    </div>
  );
}
