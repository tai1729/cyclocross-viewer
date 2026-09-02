"use client";

import type { ComparisonMode } from "@/hooks/useComparisonRiders";
import { Field, FieldTitle } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
    <Field orientation="responsive" className="items-center">
      <FieldTitle>比較対象</FieldTitle>
      <div className="overflow-x-auto">
        <ToggleGroup
          value={[String(mode)]}
          onValueChange={(values) => {
            const value = values[0];
            onChange(value === "all" ? "all" : Number(value) as ComparisonMode);
          }}
          spacing={1}
        >
        {OPTIONS.map((opt) => (
          <ToggleGroupItem
            key={opt.mode}
            value={String(opt.mode)}
            variant="outline"
            size="sm"
          >
            {opt.label}
          </ToggleGroupItem>
        ))}
        </ToggleGroup>
      </div>
    </Field>
  );
}
