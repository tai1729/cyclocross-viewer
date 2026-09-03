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
import { buildPaceDeltaSeries, formatGapSec } from "@/lib/dataTransform";

interface PaceChartProps {
  race: RaceResult;
  baseRider: Rider;
  otherRiders: Rider[];
  colors: Record<string, string>;
}

export function PaceChart({
  race,
  baseRider,
  otherRiders,
  colors,
}: PaceChartProps) {
  const data = buildPaceDeltaSeries(
    race,
    baseRider.riderId,
    otherRiders.map((r) => r.riderId),
  );
  const isCrowded = otherRiders.length > 8;

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
            stroke="#6b685d"
            strokeWidth={2}
            label={{
              value: `${baseRider.name}（注目選手）`,
              position: "insideBottomLeft",
              fontSize: 11,
              fill: "#71717a",
            }}
          />
          <Tooltip
            formatter={(value) => formatGapSec(Number(value))}
            labelFormatter={(l) => `${l}周目`}
          />
          {!isCrowded && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {otherRiders.map((rider) => (
            <Line
              key={rider.riderId}
              type="linear"
              dataKey={rider.riderId}
              name={rider.name}
              stroke={colors[rider.riderId] ?? "#71717a"}
              strokeWidth={2}
              dot={isCrowded ? false : { r: 2.5 }}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
          ))}
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
