"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RaceResult, Rider } from "@/lib/types";
import { buildGapSeries, buildLapMap, formatGapSec } from "@/lib/dataTransform";
import type { RiderSeriesStyle } from "@/lib/chartSeriesStyles";
import {
  formatLapTooltipLabel,
  RoleAwareTooltip,
} from "@/components/RoleAwareTooltip";

interface GapChartProps {
  race: RaceResult;
  baseRider: Rider;
  otherRiders: Rider[];
  seriesStyles: Record<string, RiderSeriesStyle>;
  riderNames: Record<string, string>;
  isCrowded: boolean;
}

export function GapChart({
  race,
  baseRider,
  otherRiders,
  seriesStyles,
  riderNames,
  isCrowded,
}: GapChartProps) {
  const data = buildGapSeries(
    race,
    baseRider.riderId,
    otherRiders.map((r) => r.riderId),
  );
  const riderLapMaps = new Map(
    otherRiders.map((rider) => [rider.riderId, buildLapMap(rider)]),
  );
  const primaryStyle = seriesStyles[baseRider.riderId];

  return (
    <div className="h-64 w-full sm:h-80 lg:h-[26rem]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="lapNumber"
            tick={{ fontSize: 11 }}
            label={{
              value: "周回",
              position: "insideBottom",
              offset: -2,
              fontSize: 11,
            }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            width={44}
            tickFormatter={(v) => formatGapSec(v)}
          />
          <ReferenceLine
            y={0}
            stroke={primaryStyle.color}
            strokeOpacity={primaryStyle.opacity}
            strokeWidth={primaryStyle.strokeWidth}
            label={{
              value: `${primaryStyle.roleLabel}・${baseRider.name}（±0基準）`,
              position: "insideBottomLeft",
              fontSize: 11,
              fill: primaryStyle.color,
            }}
          />
          <Tooltip
            content={(props) => (
              <RoleAwareTooltip
                {...props}
                seriesStyles={seriesStyles}
                riderNames={riderNames}
                riderLapMaps={riderLapMaps}
                formatLabel={formatLapTooltipLabel}
                formatValue={formatGapSec}
              />
            )}
            labelFormatter={(l) => `${l}周目`}
          />
          {!isCrowded && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {otherRiders.map((rider) => {
            const style = seriesStyles[rider.riderId];
            return (
              <Line
                key={rider.riderId}
                type="linear"
                dataKey={rider.riderId}
                name={`${style.roleLabel}・${rider.name}`}
                stroke={style.color}
                strokeOpacity={style.opacity}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
                dot={
                  style.role === "context" && isCrowded
                    ? false
                    : { r: style.role === "fixed" ? 3 : 2.5 }
                }
                activeDot={
                  style.role === "context" && isCrowded ? false : { r: 4 }
                }
                connectNulls={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      {isCrowded && (
        <p className="mt-1 text-center text-xs text-muted-foreground">
          全{otherRiders.length}名を表示中
        </p>
      )}
    </div>
  );
}
