import { NextResponse } from "next/server";

// TODO (Phase 2): Pull abandoned checkout data from Shopify Admin API.
// Endpoint: GET /admin/api/2024-01/checkouts.json
// Auth: X-Shopify-Access-Token: SHOPIFY_API_KEY
// Store: SHOPIFY_STORE_URL
// This will power the abandoned cart recovery view once Shopify is connected,
// showing cart value, customer email, and time abandoned per session.
export async function GET() {
  if (process.env.SHOPIFY_INTEGRATION_READY !== "true") {
    return NextResponse.json({ data: [], stub: true });
  }

  // Shopify abandoned carts implementation goes here
  return NextResponse.json({ data: [], stub: true });
}
