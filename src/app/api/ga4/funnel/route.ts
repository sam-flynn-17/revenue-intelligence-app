export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getFunnelMetrics } from "@/lib/ga4";

const AOV = 935;

export async function GET() {
  try {
    const metrics = await getFunnelMetrics();
    const dropOffValue = (metrics.addToBasket - metrics.purchases) * AOV;

    return NextResponse.json({
      ...metrics,
      aov: AOV,
      dropOffValue,
    });
  } catch (err) {
    console.error("ga4 funnel route error:", err);
    return NextResponse.json({ error: "Failed to fetch funnel data" }, { status: 500 });
  }
}
