"use client";

interface LastRefreshedProps {
  isoTimestamp: string;
}

export default function LastRefreshed({ isoTimestamp }: LastRefreshedProps) {
  const d = new Date(isoTimestamp);
  const formatted = d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <p className="text-xs text-neutral-400">
      Last refreshed: {formatted}
    </p>
  );
}
