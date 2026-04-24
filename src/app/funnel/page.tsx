export const dynamic = "force-dynamic";

import { getFunnelMetrics } from "@/lib/ga4";
import { formatGbp } from "@/lib/utils";
import FunnelChart from "@/components/FunnelChart";
import StatusBadge from "@/components/StatusBadge";
import LastRefreshed from "@/components/LastRefreshed";

const AOV = 935;

export default async function FunnelPage() {
  const funnel = await getFunnelMetrics();
  const fetchedAt = new Date().toISOString();

  const stages = [
    {
      label: "Sessions",
      value: funnel.sessions,
      conversionFromPrev: null,
      dropOffValue: null,
    },
    {
      label: "Add to Basket",
      value: funnel.addToBasket,
      conversionFromPrev: funnel.sessions > 0
        ? (funnel.addToBasket / funnel.sessions) * 100
        : null,
      dropOffValue: (funnel.sessions - funnel.addToBasket) * AOV,
    },
    {
      label: "Checkout",
      value: funnel.checkouts,
      conversionFromPrev: funnel.addToBasket > 0
        ? (funnel.checkouts / funnel.addToBasket) * 100
        : null,
      dropOffValue: (funnel.addToBasket - funnel.checkouts) * AOV,
    },
    {
      label: "Purchase",
      value: funnel.purchases,
      conversionFromPrev: funnel.checkouts > 0
        ? (funnel.purchases / funnel.checkouts) * 100
        : null,
      dropOffValue: (funnel.checkouts - funnel.purchases) * AOV,
    },
  ];

  const overallConversion =
    funnel.sessions > 0
      ? ((funnel.purchases / funnel.sessions) * 100).toFixed(2)
      : "0.00";

  const totalAbandoned = (funnel.addToBasket - funnel.purchases) * AOV;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Webshop Funnel</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Session-to-purchase conversion — last 12 months
          </p>
        </div>
        <LastRefreshed isoTimestamp={fetchedAt} />
      </div>

      {/* Data source badge */}
      <div className="flex items-center gap-2">
        <StatusBadge status={funnel.source} />
        {funnel.source === "fallback" && (
          <span className="text-sm text-neutral-500">
            GA4 not connected — showing estimated figures. Set{" "}
            <code className="text-xs bg-neutral-100 px-1 rounded">GA4_CREDENTIALS</code> and{" "}
            <code className="text-xs bg-neutral-100 px-1 rounded">GA4_PROPERTY_ID</code> to see live data.
          </span>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Overall Conversion</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{overallConversion}%</p>
          <p className="text-xs text-neutral-400 mt-1">Sessions → Purchase</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Est. Revenue Lost</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatGbp(totalAbandoned)}</p>
          <p className="text-xs text-neutral-400 mt-1">Basket adds that didn&apos;t purchase</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">AOV Used</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{formatGbp(AOV)}</p>
          <p className="text-xs text-neutral-400 mt-1">Average order value</p>
        </div>
      </div>

      {/* Funnel chart */}
      <div className="bg-white border border-neutral-100 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-900 mb-6">Conversion Funnel</h2>
        <FunnelChart stages={stages} />
      </div>

      {/* Drop-off detail table */}
      <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-neutral-100 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              {["Stage", "Count", "Conversion from prev.", "Drop-off est. value"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {stages.map((s) => (
              <tr key={s.label} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium text-neutral-900">{s.label}</td>
                <td className="px-4 py-3 text-neutral-700">
                  {s.value.toLocaleString("en-GB")}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {s.conversionFromPrev !== null
                    ? `${s.conversionFromPrev.toFixed(1)}%`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-red-600">
                  {s.dropOffValue !== null && s.dropOffValue > 0
                    ? `~${formatGbp(s.dropOffValue)}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shopify note */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Coming in Phase 2:</strong> Shopify integration will enrich this view with
        customer-level data — including which customers are rep-owned vs webshop-only, enabling
        targeted win-back campaigns without crossing sales boundaries.
      </div>
    </div>
  );
}
