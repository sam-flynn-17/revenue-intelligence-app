# Shopify Integration — Phase 2 Guide

This document describes exactly what needs to be built to activate the Shopify data layer.

## Prerequisites

1. Create a Shopify private app with the **read_orders** and **read_checkouts** scopes
2. Set environment variables in Vercel:
   - `SHOPIFY_API_KEY` — your Shopify Admin API access token
   - `SHOPIFY_STORE_URL` — your store domain, e.g. `yourstore.myshopify.com`
   - `SHOPIFY_INTEGRATION_READY=true` — this flag activates all Shopify routes and UI

## Files to Implement

### `src/app/api/shopify/orders/route.ts`

Fetch all orders from the Shopify Admin REST API and return a normalised list.

**Endpoint:** `GET https://{SHOPIFY_STORE_URL}/admin/api/2024-01/orders.json`  
**Auth:** `X-Shopify-Access-Token: {SHOPIFY_API_KEY}`  
**Pagination:** Use `page_info` cursor-based pagination (Link header)  

Return shape:
```ts
{
  orders: Array<{
    id: string
    email: string           // customer email — used for HubSpot matching
    total_price: string
    created_at: string
    line_items: Array<{ title: string; quantity: number; price: string }>
  }>
}
```

### `src/app/api/shopify/abandoned-carts/route.ts`

Fetch abandoned checkouts.

**Endpoint:** `GET https://{SHOPIFY_STORE_URL}/admin/api/2024-01/checkouts.json`  
**Auth:** `X-Shopify-Access-Token: {SHOPIFY_API_KEY}`  

Return shape:
```ts
{
  abandonedCarts: Array<{
    id: string
    email: string
    total_price: string
    abandoned_checkout_url: string
    created_at: string
  }>
}
```

### `src/lib/mergeShopifyHubspot.ts`

Match Shopify customer emails against HubSpot contacts to build the segmentation layer.

**Logic:**
1. Fetch all Shopify orders (via `/api/shopify/orders`)
2. For each unique customer email, search HubSpot contacts (`/crm/v3/objects/contacts/search` by email)
3. If a HubSpot match is found:
   - Check `hubspot_owner_id` — if set, the customer is **rep-owned** (do not market to directly)
   - Attach last purchase date and order count to the contact record
4. If no HubSpot match exists, the customer is **webshop-only** (safe for marketing)
5. Write last purchase date back to HubSpot via PATCH `/crm/v3/objects/contacts/{id}` if the `last_purchase_date` property exists

Return shape:
```ts
Array<{
  hubspotContactId: string | null
  email: string
  ownerName: string | null
  isRepOwned: boolean
  lastPurchaseDate: string
  orderCount: number
  totalSpend: number
}>
```

## Win-Back Page (`/winback`)

Once `mergeShopifyHubspot` is implemented, update `src/app/winback/page.tsx` to:

1. Call `mergeShopifyHubspot()` to get the merged dataset
2. Filter to contacts where `lastPurchaseDate` > 90 days ago
3. Sort by `totalSpend` descending (highest value lapsed customers first)
4. Render a table with columns: Name, Company, Owner (or Unowned), Last Purchase, Days Lapsed, Total Spend
5. Only show **unowned** customers by default (safe for marketing to contact)
6. Allow toggle to show rep-owned customers (for sales team use — not marketing)

## Segmentation Rule (Critical)

The core business rule that must be preserved:

> **Marketing must never contact rep-owned HubSpot contacts directly.**

This means:
- If a Shopify customer email matches a HubSpot contact with `hubspot_owner_id` set → **rep-owned**, exclude from marketing campaigns
- If no HubSpot match, or HubSpot match has no owner → **safe for marketing**

This rule is enforced in `lib/mergeShopifyHubspot.ts` and surfaced in the `/ownership` and `/winback` pages.
