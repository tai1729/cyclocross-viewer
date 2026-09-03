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
import { buildLapMap, formatSecToClock } from "@/lib/dataTransform";

interface LapTimeChartProps {
  riders: Rider[];
  selfRiderId: string;
  colors: Record<string, string>;
  /** レース全体の有効チェックポイントにある周回番号の和集合。 */
  raceLapNumbers: number[];
}

export function LapTimeChart({
  riders,
  selfRiderId,
  colors,
  raceLapNumbers,
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
            width={40}
            domain={[
              (min: number) => Math.floor((min - 10) / 10) * 10,
              (max: number) => Math.ceil((max + 10) / 10) * 10,
            ]}
            tickFormatter={(v) => formatSecToClock(v)}
          />
          <Tooltip
            formatter={(value) => formatSecToClock(Number(value))}
            labelFormatter={(l) => `${l}周目`}
          />
          {riders.length <= 8 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {riders.map((rider) => {
            const isSelf = rider.riderId === selfRiderId;
            return (
              <Line
                key={rider.riderId}
                type="linear"
                dataKey={rider.riderId}
                name={isSelf ? `${rider.name}（注目選手）` : rider.name}
                stroke={colors[rider.riderId] ?? "#71717a"}
                strokeWidth={isSelf ? 3.5 : 1.5}
                dot={isSelf ? { r: 3.5 } : riders.length > 8 ? false : { r: 2 }}
                activeDot={{ r: isSelf ? 5.5 : 4 }}
                connectNulls={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      {riders.length > 8 && (
        <p className="mt-1 text-center text-xs text-muted-foreground">
          全{riders.length}名を表示中（注目選手の線のみ強調表示）
        </p>
      )}
    </div>
  );
}
