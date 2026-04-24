import { clsx } from "clsx";

type Status = "unowned" | "green" | "amber" | "red" | "stub" | "live" | "fallback";

const styles: Record<Status, string> = {
  unowned: "bg-amber-100 text-amber-800",
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  stub: "bg-neutral-100 text-neutral-600",
  live: "bg-green-100 text-green-800",
  fallback: "bg-amber-100 text-amber-800",
};

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const defaultLabels: Record<Status, string> = {
    unowned: "Unowned",
    green: "Active",
    amber: "Stale",
    red: "Overdue",
    stub: "Coming Soon",
    live: "Live GA4 data",
    fallback: "Estimated data",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {label ?? defaultLabels[status]}
    </span>
  );
}
