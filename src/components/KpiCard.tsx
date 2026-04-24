interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  note?: string;
}

export default function KpiCard({ title, value, subtitle, note }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 flex flex-col gap-1">
      <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-semibold text-neutral-900 mt-1">{value}</p>
      {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      {note && <p className="text-xs text-neutral-400 mt-2">{note}</p>}
    </div>
  );
}
