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

interface RankBumpChartProps {
  riders: Rider[];
  selfRiderId: string;
  colors: Record<string, string>;
  /** レース全体の周回番号一覧（1位選手基準）。X軸の基準に使う。 */
  raceLapNumbers: number[];
}

export function RankBumpChart({
  riders,
  selfRiderId,
  colors,
  raceLapNumbers,
}: RankBumpChartProps) {
  const data = raceLapNumbers.map((lapNumber) => {
    const point: Record<string, number> = { lapNumber };
    for (const rider of riders) {
      const lap = rider.laps.find((l) => l.lapNumber === lapNumber);
      if (lap) point[rider.riderId] = lap.rankAtLap;
    }
    return point;
  });

  const ranks = riders.map((r) => r.finalPosition);
  const minRank = Math.min(...ranks);
  const maxRank = Math.max(...ranks);
  const isCrowded = riders.length > 8;

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
            reversed
            domain={[minRank, maxRank]}
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            width={30}
            tickFormatter={(v) => `${v}位`}
          />
          <Tooltip
            formatter={(value) => `${value}位`}
            labelFormatter={(l) => `${l}周目`}
          />
          {!isCrowded && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {riders.map((rider) => {
            const isSelf = rider.riderId === selfRiderId;
            return (
              <Line
                key={rider.riderId}
                type="monotone"
                dataKey={rider.riderId}
                name={isSelf ? `${rider.name}（あなた）` : rider.name}
                stroke={colors[rider.riderId] ?? "#71717a"}
                strokeWidth={isSelf ? 3.5 : 1.75}
                dot={isSelf ? { r: 4 } : isCrowded ? false : { r: 2.5 }}
                activeDot={{ r: isSelf ? 6 : 4 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      {isCrowded && (
        <p className="mt-1 text-center text-xs text-ink/40">
          全{riders.length}名を表示中（あなたの線のみ強調表示）
        </p>
      )}
    </div>
  );
}
