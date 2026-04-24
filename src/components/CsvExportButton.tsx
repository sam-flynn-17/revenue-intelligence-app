"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import type { HubSpotContact } from "@/types/hubspot";

interface CsvExportButtonProps {
  filters: { search: string; owner: string };
  ownerNameMap: Map<string, string>;
}

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function CsvExportButton({ filters, ownerNameMap }: CsvExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const contacts: HubSpotContact[] = [];
      let afterCursor: string | null = null;

      // Fetch all pages — note: HubSpot CRM Search caps at 10,000 results.
      // For very large exports, advise filtering by owner or search first.
      do {
        const paramObj: Record<string, string> = {
          search: filters.search,
          owner: filters.owner,
        };
        if (afterCursor) paramObj.after = afterCursor;
        const params = new URLSearchParams(paramObj);
        const res = await fetch(`/api/hubspot/contacts?${params}`);
        if (!res.ok) throw new Error("Export fetch failed");
        const data = await res.json();
        contacts.push(...data.contacts);
        afterCursor = data.hasMore ? data.nextAfter : null;
      } while (afterCursor && contacts.length < 10000);

      const header = ["Name", "Company", "Owner", "Last Activity"].map(escapeCsv).join(",");
      const rows = contacts.map((c) => {
        const name = [c.properties.firstname, c.properties.lastname]
          .filter(Boolean)
          .join(" ");
        const company = c.properties.company ?? "";
        const ownerId = c.properties.hubspot_owner_id;
        const owner = ownerId ? (ownerNameMap.get(ownerId) ?? ownerId) : "Unowned";
        const lastActivity = formatDate(
          c.properties.notes_last_updated ?? c.properties.hs_last_sales_activity_timestamp
        );
        return [name, company, owner, lastActivity].map(escapeCsv).join(",");
      });

      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
    >
      {loading ? "Exporting…" : "Export CSV"}
    </button>
  );
}
