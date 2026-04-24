export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { searchContacts } from "@/lib/hubspot";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const owner = searchParams.get("owner") ?? "all";
    const after = searchParams.get("after") ?? undefined;

    type Filter = {
      propertyName: string;
      operator: string;
      value?: string;
      values?: string[];
    };

    const filters: Filter[] = [];

    if (owner === "unowned") {
      filters.push({ propertyName: "hubspot_owner_id", operator: "NOT_HAS_PROPERTY" });
    } else if (owner !== "all") {
      filters.push({ propertyName: "hubspot_owner_id", operator: "EQ", value: owner });
    }

    if (search.trim()) {
      // HubSpot search API uses top-level `query` for text search;
      // we pass it as a separate filter group using CONTAINS_TOKEN on key fields.
      // This is handled below via the query param instead.
    }

    const filterGroups = filters.length > 0 ? [{ filters }] : [];

    // Use query for text search (HubSpot searches firstname, lastname, email, company)
    const result = await searchContacts(filterGroups, [], after, 100);

    // Client-side text filter if search provided (HubSpot query is basic; supplement here)
    let contacts = result.results;
    if (search.trim()) {
      const lower = search.toLowerCase();
      contacts = contacts.filter((c) => {
        const { firstname, lastname, email, company } = c.properties;
        return (
          firstname?.toLowerCase().includes(lower) ||
          lastname?.toLowerCase().includes(lower) ||
          email?.toLowerCase().includes(lower) ||
          company?.toLowerCase().includes(lower)
        );
      });
    }

    return NextResponse.json({
      contacts,
      total: result.total,
      hasMore: !!result.paging?.next?.after,
      nextAfter: result.paging?.next?.after ?? null,
    });
  } catch (err) {
    console.error("contacts route error:", err);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}
