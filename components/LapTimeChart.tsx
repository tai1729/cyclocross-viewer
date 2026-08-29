"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Rider } from "@/lib/types";

interface LapTimeChartProps {
  riders: Rider[];
  selfRiderId: string;
  colors: Record<string, string>;
}

export function LapTimeChart({
  riders,
  selfRiderId,
  colors,
}: LapTimeChartProps) {
  const lapCount = riders[0]?.laps.length ?? 0;
  const data = Array.from({ length: lapCount }, (_, i) => {
    const lapNumber = riders[0]?.laps[i]?.lapNumber ?? i + 1;
    const point: Record<string, number> = { lapNumber };
    for (const rider of riders) {
      const lap = rider.laps[i];
      if (lap) point[rider.riderId] = lap.lapTimeSec;
    }
    return point;
  });

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
            width={36}
            label={{
              value: "秒",
              angle: -90,
              position: "insideLeft",
              fontSize: 11,
            }}
          />
          <Tooltip
            formatter={(value) => `${value}秒`}
            labelFormatter={(l) => `${l}周目`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {riders.map((rider) => (
            <Line
              key={rider.riderId}
              type="monotone"
              dataKey={rider.riderId}
              name={rider.name}
              stroke={colors[rider.riderId] ?? "#71717a"}
              strokeWidth={rider.riderId === selfRiderId ? 3 : 1.5}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
