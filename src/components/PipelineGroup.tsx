"use client";

import { useState } from "react";
import type { EnrichedDeal } from "@/types/hubspot";
import { formatGbp } from "@/lib/utils";
import DealCard from "./DealCard";

interface PipelineGroupProps {
  ownerName: string;
  deals: EnrichedDeal[];
}

export default function PipelineGroup({ ownerName, deals }: PipelineGroupProps) {
  const [open, setOpen] = useState(true);

  const totalValue = deals.reduce((sum, d) => {
    const amt = parseFloat(d.properties.amount ?? "0");
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const redCount = deals.filter((d) => d.alertLevel === "red").length;
  const amberCount = deals.filter((d) => d.alertLevel === "amber").length;

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-neutral-900">{ownerName}</span>
          <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
            {deals.length} deal{deals.length !== 1 ? "s" : ""}
          </span>
          {redCount > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {redCount} overdue
            </span>
          )}
          {amberCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {amberCount} stale
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-neutral-900 text-sm">
            {formatGbp(totalValue)}
          </span>
          <span className="text-neutral-400 text-sm">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
