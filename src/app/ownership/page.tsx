export const dynamic = "force-dynamic";

import { getOwners } from "@/lib/hubspot";
import ContactsTable from "@/components/ContactsTable";
import LastRefreshed from "@/components/LastRefreshed";

export default async function OwnershipPage() {
  const owners = await getOwners();
  const fetchedAt = new Date().toISOString();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Contact Ownership</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Unowned contacts are safe for marketing to engage.{" "}
            <span className="font-medium text-amber-600">
              Rep-owned contacts must not be contacted directly by marketing.
            </span>
          </p>
        </div>
        <LastRefreshed isoTimestamp={fetchedAt} />
      </div>

      <ContactsTable owners={owners} />
    </div>
  );
}
