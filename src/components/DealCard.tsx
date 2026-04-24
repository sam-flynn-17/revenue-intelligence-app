import { clsx } from "clsx";
import type { EnrichedDeal } from "@/types/hubspot";
import { formatGbp, formatDate } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

const borderColors = {
  green: "border-l-green-500",
  amber: "border-l-amber-500",
  red: "border-l-red-500",
};

interface DealCardProps {
  deal: EnrichedDeal;
}

export default function DealCard({ deal: d }: DealCardProps) {
  const amount = parseFloat(d.properties.amount ?? "0");
  const hasAmount = !isNaN(amount) && amount > 0;

  return (
    <div
      className={clsx(
        "bg-white border border-neutral-100 border-l-4 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm",
        borderColors[d.alertLevel]
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-neutral-900 text-sm truncate">
            {d.properties.dealname ?? "Unnamed Deal"}
          </span>
          <span
            className={clsx(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              d.pipelineName === "ByteStock"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            )}
          >
            {d.pipelineName}
          </span>
        </div>
        <div className="mt-1 flex gap-3 text-xs text-neutral-500 flex-wrap">
          <span>Close: {formatDate(d.properties.closedate)}</span>
          <span>
            Last activity:{" "}
            {d.daysSinceActivity !== null
              ? `${d.daysSinceActivity}d ago`
              : "Never"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
        {hasAmount && (
          <span className="text-sm font-semibold text-neutral-900">
            {formatGbp(amount)}
          </span>
        )}
        <StatusBadge status={d.alertLevel} />
      </div>
    </div>
  );
}
