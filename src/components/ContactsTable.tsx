"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { HubSpotContact, HubSpotOwner } from "@/types/hubspot";
import { formatDate } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import CsvExportButton from "./CsvExportButton";

interface ContactsTableProps {
  owners: HubSpotOwner[];
}

export default function ContactsTable({ owners }: ContactsTableProps) {
  const ownerNameMap = new Map(
    owners.map((o) => [o.id, `${o.firstName} ${o.lastName}`.trim()])
  );

  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [contacts, setContacts] = useState<HubSpotContact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [after, setAfter] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchContacts = useCallback(
    async (afterCursor?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search,
          owner: ownerFilter,
          ...(afterCursor ? { after: afterCursor } : {}),
        });
        const res = await fetch(`/api/hubspot/contacts?${params}`);
        const data = await res.json();
        setContacts(data.contacts ?? []);
        setTotal(data.total ?? 0);
        setHasMore(data.hasMore ?? false);
        setAfter(data.nextAfter ?? null);
      } catch (err) {
        console.error("contacts fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [search, ownerFilter]
  );

  // Reset pagination and fetch on filter changes (with debounce on search)
  useEffect(() => {
    setHistory([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchContacts(undefined);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, ownerFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    if (!after) return;
    setHistory((h) => [...h, after]);
    fetchContacts(after);
  };

  const handlePrev = () => {
    const prev = history[history.length - 2];
    setHistory((h) => h.slice(0, -1));
    fetchContacts(prev);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search name, email, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 bg-white"
          >
            <option value="all">All Owners</option>
            <option value="unowned">Unowned</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {`${o.firstName} ${o.lastName}`.trim() || o.email}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">
            {total.toLocaleString("en-GB")} contacts
          </span>
          <CsvExportButton
            filters={{ search, owner: ownerFilter }}
            ownerNameMap={ownerNameMap}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-neutral-100 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              {["Name", "Company", "Owner", "Last Activity"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                  Loading…
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                  No contacts found
                </td>
              </tr>
            ) : (
              contacts.map((c) => {
                const name =
                  [c.properties.firstname, c.properties.lastname]
                    .filter(Boolean)
                    .join(" ") || c.properties.email || "—";
                const ownerId = c.properties.hubspot_owner_id;
                const ownerName = ownerId
                  ? (ownerNameMap.get(ownerId) ?? `ID: ${ownerId}`)
                  : null;
                const lastActivity = formatDate(
                  c.properties.notes_last_updated ??
                    c.properties.hs_last_sales_activity_timestamp
                );

                return (
                  <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-900">{name}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {c.properties.company ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {ownerName ? (
                        <span className="text-neutral-700">{ownerName}</span>
                      ) : (
                        <StatusBadge status="unowned" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{lastActivity}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={history.length === 0 || loading}
          className="px-3 py-1.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg disabled:opacity-40 hover:bg-neutral-50 transition-colors"
        >
          ← Previous
        </button>
        <span className="text-xs text-neutral-400">
          Page {history.length + 1}
        </span>
        <button
          onClick={handleNext}
          disabled={!hasMore || loading}
          className="px-3 py-1.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg disabled:opacity-40 hover:bg-neutral-50 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
