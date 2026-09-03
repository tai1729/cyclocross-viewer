"use client";

import {
  MAX_ALL_COMPARISON_RIDERS,
  type ComparisonMode,
} from "@/hooks/useComparisonRiders";
import { Field, FieldDescription, FieldTitle } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ComparisonAdjusterProps {
  mode: ComparisonMode;
  displayedCount: number;
  totalRiderCount: number;
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
  displayedCount,
  totalRiderCount,
  onChange,
}: ComparisonAdjusterProps) {
  const allDisabled = totalRiderCount > MAX_ALL_COMPARISON_RIDERS;

  return (
    <Field className="items-start">
      <FieldTitle>比較対象</FieldTitle>
      <div className="w-full">
        <ToggleGroup
          value={[String(mode)]}
          onValueChange={(values) => {
            const value = values[0];
            if (!value) return;
            const nextMode = value === "all" ? "all" : Number(value) as ComparisonMode;
            if (nextMode === "all" && allDisabled) return;
            onChange(nextMode);
          }}
          spacing={1}
          className="flex flex-wrap justify-start"
          aria-describedby="comparison-description"
        >
        {OPTIONS.map((opt) => (
          <ToggleGroupItem
            key={opt.mode}
            value={String(opt.mode)}
            variant="outline"
            size="sm"
            disabled={opt.mode === "all" && allDisabled}
            aria-label={
              opt.mode === "all"
                ? allDisabled
                  ? `全員比較は${MAX_ALL_COMPARISON_RIDERS}名以下のカテゴリーで利用できます`
                  : "カテゴリー内の全員を比較"
                : `最終順位の前後${opt.mode}位以内を比較`
            }
            className="min-h-11 min-w-11 aria-pressed:font-bold aria-pressed:ring-2 aria-pressed:ring-foreground/70 sm:min-h-7 sm:min-w-7"
          >
            {opt.label}
          </ToggleGroupItem>
        ))}
        </ToggleGroup>
      </div>
      <FieldDescription id="comparison-description">
        {allDisabled
          ? `比較可能な選手が${totalRiderCount}名いるため、全員比較は利用できません。±5までで比較してください（現在${displayedCount}名）。`
          : mode === "all"
          ? `カテゴリー内の全員・現在${displayedCount}名`
          : `注目選手の最終順位から前後${mode}位以内・現在${displayedCount}名`}
      </FieldDescription>
    </Field>
  );
}
