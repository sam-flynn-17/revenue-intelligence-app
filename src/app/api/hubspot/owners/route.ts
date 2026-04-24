export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getOwners } from "@/lib/hubspot";

export async function GET() {
  try {
    const owners = await getOwners();
    return NextResponse.json({ owners });
  } catch (err) {
    console.error("owners route error:", err);
    return NextResponse.json({ error: "Failed to fetch owners" }, { status: 500 });
  }
}
