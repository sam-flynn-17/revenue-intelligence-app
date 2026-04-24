export default function WinBackPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Win-Back Candidates</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Re-engage lapsed customers with targeted campaigns
        </p>
      </div>

      {/* Amber notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-semibold text-base mb-1">Data not yet available</p>
        <p>
          This page requires a <code className="bg-amber-100 px-1 rounded">last_purchase_date</code>{" "}
          property on HubSpot contacts, which is not currently configured. Once Shopify is connected,
          purchase history will be synced to HubSpot automatically and this view will populate.
        </p>
        <p className="mt-2">
          Ask your HubSpot administrator to create a{" "}
          <code className="bg-amber-100 px-1 rounded">last_purchase_date</code> contact property
          (type: Date), then connect Shopify to begin syncing.
        </p>
      </div>

      {/* Shopify CTA */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="font-semibold text-neutral-900">Connect Shopify to unlock this view</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Set <code className="bg-neutral-100 px-1 rounded text-xs">SHOPIFY_INTEGRATION_READY=true</code>{" "}
            and configure your Shopify credentials to activate customer-level win-back analysis.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium bg-neutral-100 text-neutral-600 whitespace-nowrap">
          Coming Soon
        </span>
      </div>

      {/* Wireframe preview */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
          What this page will show
        </h3>
        <div className="border border-dashed border-neutral-300 rounded-xl overflow-hidden bg-neutral-50">
          <div className="bg-neutral-100 px-4 py-3 flex gap-8 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            <span className="w-48">Name</span>
            <span className="w-36">Company</span>
            <span className="w-32">Last Purchase</span>
            <span className="w-24">Days Lapsed</span>
            <span>Owner</span>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="px-4 py-3 flex gap-8 border-t border-neutral-200"
            >
              <div className="w-48 h-3 bg-neutral-200 rounded animate-pulse" />
              <div className="w-36 h-3 bg-neutral-200 rounded animate-pulse" />
              <div className="w-32 h-3 bg-neutral-200 rounded animate-pulse" />
              <div className="w-24 h-3 bg-neutral-200 rounded animate-pulse" />
              <div className="w-28 h-3 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
