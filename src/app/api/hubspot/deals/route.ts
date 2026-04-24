export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getEnrichedOpenDeals } from "@/lib/hubspot";

export async function GET() {
  try {
    const data = await getEnrichedOpenDeals();
    return NextResponse.json(data);
  } catch (err) {
    console.error("deals route error:", err);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}
