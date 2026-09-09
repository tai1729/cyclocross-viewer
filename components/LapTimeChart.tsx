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
import type { Rider } from "@/lib/types";
import { buildLapMap, formatSecToClock } from "@/lib/dataTransform";
import type { RiderSeriesStyle } from "@/lib/chartSeriesStyles";
import { SeriesMarkerDot } from "@/components/SeriesMarkerDot";
import {
  formatLapTooltipLabel,
  RoleAwareTooltip,
} from "@/components/RoleAwareTooltip";
import { resolveChartLapNumber } from "@/components/chartInteraction";

interface LapTimeChartProps {
  riders: Rider[];
  seriesStyles: Record<string, RiderSeriesStyle>;
  riderNames: Record<string, string>;
  isCrowded: boolean;
  showContextDetails?: boolean;
  /** レース全体の有効チェックポイントにある周回番号の和集合。 */
  raceLapNumbers: readonly number[];
  activeLapNumber?: number | null;
  onLapHover?: (lapNumber: number) => void;
  onLapSelect?: (lapNumber: number) => void;
}

export function LapTimeChart({
  riders,
  seriesStyles,
  riderNames,
  isCrowded,
  showContextDetails = false,
  raceLapNumbers,
  activeLapNumber = null,
  onLapHover,
  onLapSelect,
}: LapTimeChartProps) {
  const riderLapMaps = new Map(
    riders.map((rider) => [rider.riderId, buildLapMap(rider, true)]),
  );

  const data = [];
  for (const lapNumber of raceLapNumbers) {
    const point: Record<string, number> = { lapNumber };
    for (const rider of riders) {
      const lap = riderLapMaps.get(rider.riderId)?.get(lapNumber);
      if (lap) point[rider.riderId] = lap.lapTimeSec;
    }
    data.push(point);
  }
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
            width={40}
            domain={[
              (min: number) => Math.floor((min - 10) / 10) * 10,
              (max: number) => Math.ceil((max + 10) / 10) * 10,
            ]}
            tickFormatter={(v) => formatSecToClock(v)}
          />
          <Tooltip
            content={(props) => (
              <RoleAwareTooltip
                {...props}
                seriesStyles={seriesStyles}
                riderNames={riderNames}
                showContextDetails={showContextDetails}
                formatLabel={formatLapTooltipLabel}
                formatValue={formatSecToClock}
              />
            )}
            labelFormatter={(l) => `${l}周目`}
          />
          {activeRaceLapNumber !== null && (
            <ReferenceLine
              x={activeRaceLapNumber}
              stroke="#71717a"
              strokeDasharray="4 4"
              strokeOpacity={0.75}
            />
          )}
          {riders.map((rider) => {
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
                    size={
                      style.role === "primary"
                        ? 3.5
                        : style.role === "fixed"
                          ? 3
                          : isCrowded
                            ? 1.75
                            : 2
                    }
                  />
                )}
                activeDot={(props) => (
                  <SeriesMarkerDot
                    {...props}
                    marker={style.marker}
                    size={
                      style.role === "primary"
                        ? 5.5
                        : style.role === "context" && isCrowded
                          ? 3
                          : 4
                    }
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
          全{riders.length}名を表示中（注目選手の線のみ強調表示）
        </p>
      )}
    </div>
  );
}
