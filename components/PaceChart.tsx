"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MouseHandlerDataParam } from "recharts";
import type { RaceResult, Rider } from "@/lib/types";
import {
  buildLapMap,
  buildPaceDeltaSeries,
  formatGapSec,
} from "@/lib/dataTransform";
import type { RiderSeriesStyle } from "@/lib/chartSeriesStyles";
import { SeriesMarkerDot } from "@/components/SeriesMarkerDot";
import {
  formatLapTooltipLabel,
  RoleAwareTooltip,
} from "@/components/RoleAwareTooltip";
import { resolveChartLapNumber } from "@/components/chartInteraction";

interface PaceChartProps {
  race: RaceResult;
  baseRider: Rider;
  otherRiders: Rider[];
  seriesStyles: Record<string, RiderSeriesStyle>;
  riderNames: Record<string, string>;
  isCrowded: boolean;
  showContextDetails?: boolean;
  raceLapNumbers: readonly number[];
  activeLapNumber?: number | null;
  onLapHover?: (lapNumber: number) => void;
  onLapSelect?: (lapNumber: number) => void;
}

export function PaceChart({
  race,
  baseRider,
  otherRiders,
  seriesStyles,
  riderNames,
  isCrowded,
  showContextDetails = false,
  raceLapNumbers,
  activeLapNumber = null,
  onLapHover,
  onLapSelect,
}: PaceChartProps) {
  const data = buildPaceDeltaSeries(
    race,
    baseRider.riderId,
    otherRiders.map((r) => r.riderId),
  );
  const riderLapMaps = new Map(
    otherRiders.map((rider) => [rider.riderId, buildLapMap(rider, true)]),
  );
  const primaryStyle = seriesStyles[baseRider.riderId];
  const activeRaceLapNumber =
    activeLapNumber !== null && raceLapNumbers.includes(activeLapNumber)
      ? activeLapNumber
      : null;
  const handleMouseMove = (event: MouseHandlerDataParam) => {
    const lapNumber = resolveChartLapNumber(event, raceLapNumbers);
    if (lapNumber !== null) onLapHover?.(lapNumber);
  };
  const handleClick = (event: MouseHandlerDataParam) => {
    const lapNumber = resolveChartLapNumber(event, raceLapNumbers);
    if (lapNumber !== null) onLapSelect?.(lapNumber);
  };

  return (
    <div className="h-72 w-full sm:h-[22rem] lg:h-[30rem]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
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
          {activeRaceLapNumber !== null && (
            <ReferenceLine
              x={activeRaceLapNumber}
              stroke="#71717a"
              strokeDasharray="4 4"
              strokeOpacity={0.75}
            />
          )}
          <Tooltip
            content={(props) => (
              <RoleAwareTooltip
                {...props}
                seriesStyles={seriesStyles}
                riderNames={riderNames}
                riderLapMaps={riderLapMaps}
                showContextDetails={showContextDetails}
                formatLabel={formatLapTooltipLabel}
                formatValue={formatGapSec}
              />
            )}
            labelFormatter={(l) => `${l}周目`}
          />
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
                dot={(props) => (
                  <SeriesMarkerDot
                    {...props}
                    marker={style.marker}
                    size={style.role === "fixed" ? 3 : isCrowded ? 2 : 2.5}
                  />
                )}
                activeDot={(props) => (
                  <SeriesMarkerDot
                    {...props}
                    marker={style.marker}
                    size={style.role === "context" && isCrowded ? 3 : 4}
                  />
                )}
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
