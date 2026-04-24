export const dynamic = "force-dynamic";

import {
  getEnrichedOpenDeals,
  getUnownedContactCount,
} from "@/lib/hubspot";
import { getFunnelMetrics } from "@/lib/ga4";
import { formatGbp } from "@/lib/utils";
import KpiCard from "@/components/KpiCard";
import LastRefreshed from "@/components/LastRefreshed";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

export default async function OverviewPage() {
  const fetchedAt = new Date().toISOString();

  const [{ deals }, unownedCount, funnel] = await Promise.all([
    getEnrichedOpenDeals(),
    getUnownedContactCount(),
    getFunnelMetrics(),
  ]);

  const totalOpenValue = deals.reduce((sum, d) => {
    const amt = parseFloat(d.properties.amount ?? "0");
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const conversionRate =
    funnel.sessions > 0
      ? ((funnel.purchases / funnel.sessions) * 100).toFixed(2)
      : "0.00";

  const abandonedFunnelValue = (funnel.addToBasket - funnel.purchases) * 935;

  const redDeals = deals.filter((d) => d.alertLevel === "red").length;
  const amberDeals = deals.filter((d) => d.alertLevel === "amber").length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Overview</h1>
          <p className="text-sm text-neutral-500 mt-1">
            CRM health and webshop performance at a glance
          </p>
        </div>
        <LastRefreshed isoTimestamp={fetchedAt} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Open Pipeline"
          value={formatGbp(totalOpenValue)}
          subtitle={`${deals.length} open deals (ByteStock + LA Direct)`}
          note={
            redDeals + amberDeals > 0
              ? `${redDeals} overdue · ${amberDeals} stale`
              : undefined
          }
        />
        <KpiCard
          title="Unowned Contacts"
          value={unownedCount.toLocaleString("en-GB")}
          subtitle="Safe for marketing to contact"
          note="Contacts with no assigned rep"
        />
        <KpiCard
          title="Webshop Conversion"
          value={`${conversionRate}%`}
          subtitle={`${funnel.purchases.toLocaleString("en-GB")} purchases / ${funnel.sessions.toLocaleString("en-GB")} sessions`}
          note={`Source: ${funnel.source === "live" ? "Live GA4 data" : "Estimated (GA4 unavailable)"}`}
        />
        <KpiCard
          title="Abandoned Funnel Est."
          value={formatGbp(abandonedFunnelValue)}
          subtitle={`${(funnel.addToBasket - funnel.purchases).toLocaleString("en-GB")} carts not converted`}
          note="Based on £935 AOV"
        />
      </div>

      {/* Data source badge */}
      <div className="flex items-center gap-2">
        <StatusBadge status={funnel.source} />
        {funnel.source === "fallback" && (
          <span className="text-xs text-neutral-400">
            Webshop figures are estimates. Connect GA4 to see live data.
          </span>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            href: "/ownership",
            title: "Contact Ownership",
            desc: "Audit which contacts are rep-owned vs available for marketing",
          },
          {
            href: "/pipeline",
            title: "Deal Pipeline",
            desc: "Open deals by rep with staleness alerts",
          },
          {
            href: "/funnel",
            title: "Webshop Funnel",
            desc: "Session → purchase funnel with drop-off analysis",
          },
          {
            href: "/winback",
            title: "Win-Back",
            desc: "Re-engage lapsed customers (Shopify required)",
          },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white border border-neutral-100 rounded-xl p-5 hover:border-neutral-300 hover:shadow-md transition-all group"
          >
            <h3 className="font-semibold text-neutral-900 group-hover:text-neutral-700">
              {link.title}
            </h3>
            <p className="text-sm text-neutral-500 mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
