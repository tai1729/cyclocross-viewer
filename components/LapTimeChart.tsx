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
import { formatSecToClock } from "@/lib/dataTransform";

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

  // レースの周回記録が1周目から始まっていない場合、最初の記録済み周回は
  // 「それ以前の周回の合算」が紛れ込んだ数値になるため、誤解を招かないよう表示から除外する
  const firstLapNumber = riders[0]?.laps[0]?.lapNumber ?? 1;
  const startIndex = firstLapNumber === 1 ? 0 : 1;

  const data = [];
  for (let i = startIndex; i < lapCount; i++) {
    const lapNumber = riders[0]?.laps[i]?.lapNumber ?? i + 1;
    const point: Record<string, number> = { lapNumber };
    for (const rider of riders) {
      const lap = rider.laps[i];
      if (lap) point[rider.riderId] = lap.lapTimeSec;
    }
    data.push(point);
  }

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
            width={40}
            tickFormatter={(v) => formatSecToClock(v)}
          />
          <Tooltip
            formatter={(value) => formatSecToClock(Number(value))}
            labelFormatter={(l) => `${l}周目`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {riders.map((rider) => {
            const isSelf = rider.riderId === selfRiderId;
            return (
              <Line
                key={rider.riderId}
                type="monotone"
                dataKey={rider.riderId}
                name={isSelf ? `${rider.name}（あなた）` : rider.name}
                stroke={colors[rider.riderId] ?? "#71717a"}
                strokeWidth={isSelf ? 3.5 : 1.5}
                dot={isSelf ? { r: 3 } : false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
