export interface HubSpotContact {
  id: string;
  properties: {
    firstname: string | null;
    lastname: string | null;
    email: string | null;
    company: string | null;
    hubspot_owner_id: string | null;
    notes_last_updated: string | null;
    hs_last_sales_activity_timestamp: string | null;
  };
}

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string | null;
    amount: string | null;
    dealstage: string | null;
    pipeline: string | null;
    hubspot_owner_id: string | null;
    notes_last_updated: string | null;
    closedate: string | null;
  };
}

export interface HubSpotOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface SearchResult<T> {
  results: T[];
  paging?: { next?: { after: string } };
  total: number;
}

export type AlertLevel = "green" | "amber" | "red";

export interface EnrichedDeal extends HubSpotDeal {
  ownerName: string | null;
  pipelineName: "ByteStock" | "LA Direct";
  daysSinceActivity: number | null;
  alertLevel: AlertLevel;
}
