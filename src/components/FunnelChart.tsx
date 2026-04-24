import { formatGbp } from "@/lib/utils";

interface FunnelStage {
  label: string;
  value: number;
  conversionFromPrev: number | null;
  dropOffValue: number | null;
}

interface FunnelChartProps {
  stages: FunnelStage[];
}

const STAGE_COLORS = [
  "bg-neutral-700",
  "bg-neutral-600",
  "bg-green-700",
  "bg-green-600",
];

const WIDTH_PERCENTS = [100, 65, 45, 30];

export default function FunnelChart({ stages }: FunnelChartProps) {
  return (
    <div className="flex flex-col items-center gap-0 w-full">
      {stages.map((stage, i) => (
        <div key={stage.label} className="w-full flex flex-col items-center">
          <div
            className="flex items-center justify-between px-4 py-3 rounded-lg text-white"
            style={{ width: `${WIDTH_PERCENTS[i]}%`, minWidth: "220px" }}
          >
            <div
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${STAGE_COLORS[i]}`}
            >
              <span className="font-semibold text-sm">{stage.label}</span>
              <span className="font-bold text-base">
                {stage.value.toLocaleString("en-GB")}
              </span>
            </div>
          </div>

          {/* Connector with conversion rate */}
          {i < stages.length - 1 && (
            <div className="flex flex-col items-center py-1">
              <div className="h-4 w-px bg-neutral-300" />
              <div className="flex gap-3 text-xs text-neutral-500 py-0.5">
                {stage.conversionFromPrev !== null && (
                  <span>
                    ↓{" "}
                    <span className="font-semibold text-neutral-700">
                      {stage.conversionFromPrev.toFixed(1)}%
                    </span>{" "}
                    converted
                  </span>
                )}
                {stage.dropOffValue !== null && stage.dropOffValue > 0 && (
                  <span className="text-red-500">
                    ~{formatGbp(stage.dropOffValue)} dropped
                  </span>
                )}
              </div>
              <div className="h-4 w-px bg-neutral-300" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
