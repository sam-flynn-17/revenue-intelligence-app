import { NextResponse } from "next/server";

// TODO (Phase 2): Pull order + customer email data from Shopify Admin API.
// Endpoint: GET /admin/api/2024-01/orders.json
// Auth: X-Shopify-Access-Token: SHOPIFY_API_KEY
// Store: SHOPIFY_STORE_URL
// This data will feed into lib/mergeShopifyHubspot.ts to match orders against
// HubSpot contacts and identify rep-owned vs webshop-only customers.
export async function GET() {
  if (process.env.SHOPIFY_INTEGRATION_READY !== "true") {
    return NextResponse.json({ data: [], stub: true });
  }

  // Shopify orders implementation goes here
  return NextResponse.json({ data: [], stub: true });
}
