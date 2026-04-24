export const dynamic = "force-dynamic";

import { getEnrichedOpenDeals } from "@/lib/hubspot";
import { formatGbp } from "@/lib/utils";
import PipelineGroup from "@/components/PipelineGroup";
import LastRefreshed from "@/components/LastRefreshed";
import type { EnrichedDeal } from "@/types/hubspot";

export default async function PipelinePage() {
  const { deals, fetchedAt } = await getEnrichedOpenDeals();

  // Group by owner name
  const grouped = new Map<string, EnrichedDeal[]>();
  for (const deal of deals) {
    const key = deal.ownerName ?? "Unassigned";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(deal);
  }

  // Sort groups: highest total value first
  const sortedGroups = Array.from(grouped.entries()).sort(([, a], [, b]) => {
    const sumA = a.reduce((s, d) => s + parseFloat(d.properties.amount ?? "0") || 0, 0);
    const sumB = b.reduce((s, d) => s + parseFloat(d.properties.amount ?? "0") || 0, 0);
    return sumB - sumA;
  });

  const totalValue = deals.reduce((sum, d) => {
    const amt = parseFloat(d.properties.amount ?? "0");
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const redCount = deals.filter((d) => d.alertLevel === "red").length;
  const amberCount = deals.filter((d) => d.alertLevel === "amber").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Deal Pipeline</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Open deals across ByteStock and LA Direct pipelines
          </p>
        </div>
        <LastRefreshed isoTimestamp={fetchedAt} />
      </div>

      {/* Summary row */}
      <div className="flex flex-wrap gap-4 bg-white border border-neutral-100 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Total Pipeline</span>
          <span className="text-2xl font-bold text-neutral-900">{formatGbp(totalValue)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Open Deals</span>
          <span className="text-2xl font-bold text-neutral-900">{deals.length}</span>
        </div>
        {redCount > 0 && (
          <div className="flex flex-col">
            <span className="text-xs text-red-500 uppercase tracking-wide font-medium">30+ Days Inactive</span>
            <span className="text-2xl font-bold text-red-600">{redCount}</span>
          </div>
        )}
        {amberCount > 0 && (
          <div className="flex flex-col">
            <span className="text-xs text-amber-500 uppercase tracking-wide font-medium">14–29 Days Inactive</span>
            <span className="text-2xl font-bold text-amber-600">{amberCount}</span>
          </div>
        )}
      </div>

      {/* Alert legend */}
      <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-500" /> Active (&lt;14 days)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-500" /> Stale (14–29 days)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500" /> Overdue (30+ days or never active)
        </span>
      </div>

      {/* Pipeline groups */}
      <div className="flex flex-col gap-4">
        {sortedGroups.map(([ownerName, ownerDeals]) => (
          <PipelineGroup key={ownerName} ownerName={ownerName} deals={ownerDeals} />
        ))}
      </div>
    </div>
  );
}
