import type {
  HubSpotContact,
  HubSpotDeal,
  HubSpotOwner,
  SearchResult,
  EnrichedDeal,
  AlertLevel,
} from "@/types/hubspot";
import { daysSince } from "./utils";

const BASE_URL = "https://api.hubspot.com";

// ByteStock pipeline closed stage IDs
const BYTESTOCK_CLOSED = ["158807033", "158807226"];
// LA Direct pipeline closed stage IDs
const LA_DIRECT_CLOSED = ["158814700", "158814701"];

type FilterGroup = {
  filters: Array<{
    propertyName: string;
    operator: string;
    value?: string;
    values?: string[];
  }>;
};

async function hubspotFetch<T>(
  path: string,
  options: { method?: string; body?: object } = {}
): Promise<T> {
  const apiKey = process.env.HUBSPOT_API_KEY;
  if (!apiKey) throw new Error("HUBSPOT_API_KEY is not set");

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function searchContacts(
  filterGroups: FilterGroup[],
  properties: string[],
  after?: string,
  limit = 100
): Promise<SearchResult<HubSpotContact>> {
  return hubspotFetch<SearchResult<HubSpotContact>>(
    "/crm/v3/objects/contacts/search",
    {
      body: {
        filterGroups,
        properties: [
          "firstname",
          "lastname",
          "email",
          "company",
          "hubspot_owner_id",
          "notes_last_updated",
          "hs_last_sales_activity_timestamp",
          ...properties,
        ],
        limit,
        after,
        sorts: [{ propertyName: "notes_last_updated", direction: "DESCENDING" }],
      },
    }
  );
}

async function fetchAllOpenDealsForPipeline(
  pipelineId: string,
  closedStageIds: string[]
): Promise<HubSpotDeal[]> {
  const deals: HubSpotDeal[] = [];
  let after: string | undefined;

  do {
    const result = await hubspotFetch<SearchResult<HubSpotDeal>>(
      "/crm/v3/objects/deals/search",
      {
        body: {
          filterGroups: [
            {
              filters: [
                { propertyName: "pipeline", operator: "EQ", value: pipelineId },
                {
                  propertyName: "dealstage",
                  operator: "NOT_IN",
                  values: closedStageIds,
                },
              ],
            },
          ],
          properties: [
            "dealname",
            "amount",
            "dealstage",
            "pipeline",
            "hubspot_owner_id",
            "notes_last_updated",
            "closedate",
          ],
          limit: 100,
          after,
        },
      }
    );

    deals.push(...result.results);
    after = result.paging?.next?.after;
  } while (after);

  return deals;
}

export async function getOwners(): Promise<HubSpotOwner[]> {
  const owners: HubSpotOwner[] = [];
  let after: string | undefined;

  do {
    const params = new URLSearchParams({ limit: "100" });
    if (after) params.set("after", after);

    const result = await hubspotFetch<{
      results: HubSpotOwner[];
      paging?: { next?: { after: string } };
    }>(`/crm/v3/owners/?${params}`);

    owners.push(...result.results);
    after = result.paging?.next?.after;
  } while (after);

  return owners;
}

function computeAlertLevel(notesLastUpdated: string | null): AlertLevel {
  const days = daysSince(notesLastUpdated);
  if (days === null) return "red";
  if (days >= 30) return "red";
  if (days >= 14) return "amber";
  return "green";
}

export async function getEnrichedOpenDeals(): Promise<{
  deals: EnrichedDeal[];
  fetchedAt: string;
}> {
  const [bytestockDeals, laDirectDeals, owners] = await Promise.all([
    fetchAllOpenDealsForPipeline("66675659", BYTESTOCK_CLOSED),
    fetchAllOpenDealsForPipeline("66698684", LA_DIRECT_CLOSED),
    getOwners(),
  ]);

  const ownerMap = new Map(
    owners.map((o) => [o.id, `${o.firstName} ${o.lastName}`.trim()])
  );

  const enrich = (
    deal: HubSpotDeal,
    pipelineName: "ByteStock" | "LA Direct"
  ): EnrichedDeal => {
    const ownerId = deal.properties.hubspot_owner_id;
    return {
      ...deal,
      ownerName: ownerId ? (ownerMap.get(ownerId) ?? null) : null,
      pipelineName,
      daysSinceActivity: daysSince(deal.properties.notes_last_updated),
      alertLevel: computeAlertLevel(deal.properties.notes_last_updated),
    };
  };

  return {
    deals: [
      ...bytestockDeals.map((d) => enrich(d, "ByteStock")),
      ...laDirectDeals.map((d) => enrich(d, "LA Direct")),
    ],
    fetchedAt: new Date().toISOString(),
  };
}

export async function getUnownedContactCount(): Promise<number> {
  const result = await searchContacts(
    [{ filters: [{ propertyName: "hubspot_owner_id", operator: "NOT_HAS_PROPERTY" }] }],
    [],
    undefined,
    1
  );
  return result.total;
}

export async function getTotalOpenDealValue(): Promise<number> {
  const { deals } = await getEnrichedOpenDeals();
  return deals.reduce((sum, d) => {
    const amt = parseFloat(d.properties.amount ?? "0");
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);
}
