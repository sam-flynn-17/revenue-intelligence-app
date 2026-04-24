import type { FunnelMetrics } from "@/types/ga4";

const FALLBACK: FunnelMetrics = {
  sessions: 107000,
  addToBasket: 2300,
  checkouts: 1000,
  purchases: 374,
  source: "fallback",
};

export async function getFunnelMetrics(): Promise<FunnelMetrics> {
  const credentials = process.env.GA4_CREDENTIALS;
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!credentials || !propertyId) {
    return FALLBACK;
  }

  try {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    const parsed = JSON.parse(credentials);
    const client = new BetaAnalyticsDataClient({ credentials: parsed });

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "365daysAgo", endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: {
            values: [
              "session_start",
              "add_to_cart",
              "begin_checkout",
              "purchase",
            ],
          },
        },
      },
    });

    const eventMap: Record<string, number> = {};
    for (const row of response.rows ?? []) {
      const name = row.dimensionValues?.[0]?.value ?? "";
      const count = parseInt(row.metricValues?.[0]?.value ?? "0", 10);
      eventMap[name] = count;
    }

    return {
      sessions: eventMap["session_start"] ?? FALLBACK.sessions,
      addToBasket: eventMap["add_to_cart"] ?? FALLBACK.addToBasket,
      checkouts: eventMap["begin_checkout"] ?? FALLBACK.checkouts,
      purchases: eventMap["purchase"] ?? FALLBACK.purchases,
      source: "live",
    };
  } catch (err) {
    console.error("GA4 fetch failed, using fallback:", err);
    return FALLBACK;
  }
}
