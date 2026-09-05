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
import type { MouseHandlerDataParam } from "recharts";
import type { Rider } from "@/lib/types";
import { buildLapMap } from "@/lib/dataTransform";
import type { RiderSeriesStyle } from "@/lib/chartSeriesStyles";
import {
  formatLapTooltipLabel,
  RoleAwareTooltip,
} from "@/components/RoleAwareTooltip";
import { resolveChartLapNumber } from "@/components/chartInteraction";

interface RankBumpChartProps {
  riders: Rider[];
  seriesStyles: Record<string, RiderSeriesStyle>;
  riderNames: Record<string, string>;
  isCrowded: boolean;
  /** レース全体の有効チェックポイントにある周回番号の和集合。 */
  raceLapNumbers: readonly number[];
  activeLapNumber?: number | null;
  onLapHover?: (lapNumber: number) => void;
  onLapSelect?: (lapNumber: number) => void;
}

export function RankBumpChart({
  riders,
  seriesStyles,
  riderNames,
  isCrowded,
  raceLapNumbers,
  activeLapNumber = null,
  onLapHover,
  onLapSelect,
}: RankBumpChartProps) {
  const riderLapMaps = new Map(
    riders.map((rider) => [rider.riderId, buildLapMap(rider)]),
  );
  const data = raceLapNumbers.map((lapNumber) => {
    const point: Record<string, number> = { lapNumber };
    for (const rider of riders) {
      const lap = riderLapMaps.get(rider.riderId)?.get(lapNumber);
      if (lap) point[rider.riderId] = lap.rankAtLap;
    }
    return point;
  });

  const ranks = data.flatMap((point) =>
    Object.entries(point)
      .filter(([key]) => key !== "lapNumber")
      .map(([, value]) => value),
  );
  const minRank = ranks.length > 0 ? Math.min(...ranks) : 1;
  const maxRank = ranks.length > 0 ? Math.max(...ranks) : 1;
  const rankPadding = minRank === maxRank ? 1 : 0;
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
    <div className="h-64 w-full sm:h-80 lg:h-[26rem]">
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
            reversed
            domain={[Math.max(1, minRank - rankPadding), maxRank + rankPadding]}
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            width={30}
            tickFormatter={(v) => `${v}位`}
          />
          <Tooltip
            content={(props) => (
              <RoleAwareTooltip
                {...props}
                seriesStyles={seriesStyles}
                riderNames={riderNames}
                formatLabel={formatLapTooltipLabel}
                formatValue={(value) => `${value}位`}
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
          {!isCrowded && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {riders.map((rider) => {
            const style = seriesStyles[rider.riderId];
            return (
              <Line
                key={rider.riderId}
                type="stepAfter"
                dataKey={rider.riderId}
                name={`${style.roleLabel}・${rider.name}`}
                stroke={style.color}
                strokeOpacity={style.opacity}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
                dot={
                  style.role === "context" && isCrowded
                    ? false
                    : {
                        r:
                          style.role === "primary"
                            ? 4
                            : style.role === "fixed"
                              ? 3
                              : 2.5,
                      }
                }
                activeDot={
                  style.role === "context" && isCrowded
                    ? false
                    : { r: style.role === "primary" ? 6 : 4 }
                }
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
