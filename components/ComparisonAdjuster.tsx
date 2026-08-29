"use client";

import type { ComparisonMode } from "@/hooks/useComparisonRiders";

interface ComparisonAdjusterProps {
  mode: ComparisonMode;
  onChange: (mode: ComparisonMode) => void;
}

const OPTIONS: { mode: ComparisonMode; label: string }[] = [
  { mode: 0, label: "±0" },
  { mode: 1, label: "±1" },
  { mode: 2, label: "±2" },
  { mode: 3, label: "±3" },
  { mode: 4, label: "±4" },
  { mode: 5, label: "±5" },
  { mode: "all", label: "全員" },
];

export function ComparisonAdjuster({
  mode,
  onChange,
}: ComparisonAdjusterProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="shrink-0 text-ink/45">比較対象</span>
      <div className="flex gap-1 overflow-x-auto">
        {OPTIONS.map((opt) => (
          <button
            key={opt.mode}
            onClick={() => onChange(opt.mode)}
            className={`shrink-0 rounded-full border px-2.5 py-1 font-medium transition-colors ${
              mode === opt.mode
                ? "border-flag bg-flag-soft text-flag"
                : "border-paper-line bg-white text-ink/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
