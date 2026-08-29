"use client";

import { useEffect, useState } from "react";
import type { RaceResult } from "@/lib/types";

interface UseRaceDataResult {
  race: RaceResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * リポジトリA（cyclocross-data-collector）がGitHub Actionsで生成する
 * 正規化済みJSONをraw.githubusercontent.com経由で取得する。
 */
const DEFAULT_DATA_URL =
  "https://raw.githubusercontent.com/tai1729/cyclocross-data-collector/main/data/race-27160.json";

export function useRaceData(
  dataUrl: string = DEFAULT_DATA_URL,
): UseRaceDataResult {
  const [race, setRace] = useState<RaceResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(dataUrl);
        if (!res.ok) {
          throw new Error(
            `レースデータの取得に失敗しました (status: ${res.status})`,
          );
        }
        const data: RaceResult = await res.json();
        if (!cancelled) {
          setRace(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "不明なエラーが発生しました",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dataUrl]);

  return { race, isLoading, error };
}
