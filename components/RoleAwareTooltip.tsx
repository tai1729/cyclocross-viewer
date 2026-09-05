import type * as React from "react";
import type {
  TooltipContentProps,
  TooltipValueType as ValueType,
} from "recharts";
import type { RiderSeriesStyle } from "@/lib/chartSeriesStyles";

type NameType = string | number;
type TooltipLabel = string | number | null | undefined;
export type TooltipLapMap = ReadonlyMap<number, { rankAtLap: number }>;

export type RoleAwareTooltipProps = TooltipContentProps<ValueType, NameType> & {
  seriesStyles: Record<string, RiderSeriesStyle>;
  riderNames: Record<string, string>;
  formatValue: (value: number) => React.ReactNode;
  formatLabel?: (label: string | number) => React.ReactNode;
  riderLapMaps?: ReadonlyMap<string, TooltipLapMap>;
};

export function formatLapTooltipLabel(label: string | number): string {
  return `${label}周目`;
}

export function getTooltipRankAtLap(
  label: TooltipLabel,
  riderLapMap?: TooltipLapMap,
): number | null {
  const lapNumber =
    typeof label === "number" || typeof label === "string" ? Number(label) : NaN;
  if (!Number.isInteger(lapNumber) || lapNumber <= 0) {
    return null;
  }

  const rankAtLap = riderLapMap?.get(lapNumber)?.rankAtLap;
  return typeof rankAtLap === "number" && Number.isFinite(rankAtLap)
    ? rankAtLap
    : null;
}

type NormalizedTooltipEntry = {
  id: string;
  name: string;
  style: RiderSeriesStyle;
  value: number;
};

function hasOwnProperty<T extends object>(object: T, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function RoleAwareTooltip({
  active,
  label,
  payload,
  seriesStyles,
  riderNames,
  formatValue,
  formatLabel,
  riderLapMaps,
}: RoleAwareTooltipProps): React.ReactNode {
  if (!active || !payload?.length) {
    return null;
  }

  const seenIds = new Set<string>();
  const entries: NormalizedTooltipEntry[] = [];

  for (const item of payload) {
    const id = typeof item.dataKey === "string" ? item.dataKey : null;
    if (
      id === null ||
      seenIds.has(id) ||
      !hasOwnProperty(seriesStyles, id) ||
      !hasOwnProperty(riderNames, id) ||
      typeof item.value !== "number" ||
      !Number.isFinite(item.value)
    ) {
      continue;
    }

    const name = riderNames[id];
    const style = seriesStyles[id];
    if (typeof name !== "string" || !style) {
      continue;
    }

    seenIds.add(id);
    entries.push({ id, name, style, value: item.value });
  }

  const visibleEntries = entries.filter(
    ({ style }) => style.role === "primary" || style.role === "fixed",
  );
  const contextEntries = entries.filter(({ style }) => style.role === "context");
  const contextValues = contextEntries.map(({ value }) => value);

  if (visibleEntries.length === 0 && contextValues.length === 0) {
    return null;
  }

  const hasLabel = label !== undefined && label !== null;
  const displayLabel =
    hasLabel &&
    formatLabel &&
    (typeof label === "string" || typeof label === "number")
      ? formatLabel(label)
      : label;
  const contextStyle = contextEntries[0]?.style;
  const contextMinimum = contextValues.length > 0 ? Math.min(...contextValues) : null;
  const contextMaximum = contextValues.length > 0 ? Math.max(...contextValues) : null;

  return (
    <div
      role="status"
      className="rounded-md border border-border bg-background/95 p-2 text-xs text-foreground shadow-md"
      style={{
        width: "min(18rem, calc(100vw - 2rem))",
        maxWidth: "min(18rem, calc(100vw - 2rem))",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        overflowX: "hidden",
      }}
    >
      {hasLabel && <p className="mb-1 font-medium">{displayLabel}</p>}
      <ul className="m-0 list-none space-y-1 p-0">
        {visibleEntries.map(({ id, name, style, value }) => {
          const rankAtLap =
            style.role === "fixed"
              ? getTooltipRankAtLap(label, riderLapMaps?.get(id))
              : null;

          return (
            <li key={id} className="flex min-w-0 items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-1.5 size-2 shrink-0 rounded-full"
                style={{ backgroundColor: style.color }}
              />
              <span className="min-w-0 break-words">
                <span className="font-medium">{style.roleLabel}</span>
                <span className="text-muted-foreground">・{name}: </span>
                <span>{formatValue(value)}</span>
                {rankAtLap !== null && (
                  <span className="text-muted-foreground">（{rankAtLap}位）</span>
                )}
              </span>
            </li>
          );
        })}
        {contextMinimum !== null && contextMaximum !== null && contextStyle && (
          <li className="flex min-w-0 items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-1.5 size-2 shrink-0 rounded-full"
              style={{ backgroundColor: contextStyle.color }}
            />
            <span className="min-w-0 break-words">
              <span className="font-medium">{contextStyle.roleLabel}</span>
              <span className="text-muted-foreground">
                ・{contextValues.length}名・
              </span>
              <span>
                {formatValue(contextMinimum)}–{formatValue(contextMaximum)}
              </span>
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
