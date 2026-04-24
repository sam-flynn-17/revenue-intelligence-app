import type { FunnelMetrics } from "@/types/ga4";

const FALLBACK: FunnelMetrics = {
  sessions: 107000,
  addToBasket: 2300,
  checkouts: 1000,
  purchases: 374,
  source: "fallback",
};

function parseEnvInt(val: string | undefined): number | null {
  if (!val) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

export async function getFunnelMetrics(): Promise<FunnelMetrics> {
  // Manual override — set these env vars in Vercel to skip the service account requirement.
  // Update them whenever you pull a fresh GA4 report.
  const manualSessions = parseEnvInt(process.env.GA4_SESSIONS);
  const manualBasket = parseEnvInt(process.env.GA4_ADD_TO_BASKET);
  const manualCheckouts = parseEnvInt(process.env.GA4_CHECKOUTS);
  const manualPurchases = parseEnvInt(process.env.GA4_PURCHASES);

  if (
    manualSessions !== null &&
    manualBasket !== null &&
    manualCheckouts !== null &&
    manualPurchases !== null
  ) {
    return {
      sessions: manualSessions,
      addToBasket: manualBasket,
      checkouts: manualCheckouts,
      purchases: manualPurchases,
      source: "live",
    };
  }

  // Service account path (requires GA4_CREDENTIALS + GA4_PROPERTY_ID)
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
