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
import { buildGapSeries, formatGapSec } from "@/lib/dataTransform";

interface GapChartProps {
  race: RaceResult;
  baseRider: Rider;
  otherRiders: Rider[];
  colors: Record<string, string>;
}

export function GapChart({
  race,
  baseRider,
  otherRiders,
  colors,
}: GapChartProps) {
  const data = buildGapSeries(
    race,
    baseRider.riderId,
    otherRiders.map((r) => r.riderId),
  );

  return (
    <div className="h-64 w-full sm:h-80">
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
          <ReferenceLine y={0} stroke="#c3c2b7" />
          <Tooltip
            formatter={(value) => formatGapSec(Number(value))}
            labelFormatter={(l) => `${l}周目`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {otherRiders.map((rider) => (
            <Line
              key={rider.riderId}
              type="monotone"
              dataKey={rider.riderId}
              name={rider.name}
              stroke={colors[rider.riderId] ?? "#71717a"}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-zinc-500">
        基準: {baseRider.name}（±0）
      </p>
    </div>
  );
}
