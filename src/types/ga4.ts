export interface FunnelMetrics {
  sessions: number;
  addToBasket: number;
  checkouts: number;
  purchases: number;
  source: "live" | "fallback";
}

export interface FunnelResponse extends FunnelMetrics {
  aov: number;
  dropOffValue: number;
}
