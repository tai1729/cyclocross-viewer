"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RaceResult } from "@/lib/types";
import { DataLoadError, fetchRaceResult } from "@/lib/dataSource";

interface UseRaceDataResult {
  race: RaceResult | null;
  isLoading: boolean;
  error: DataLoadError | null;
  retry: () => void;
}

interface RaceDataState {
  dataUrl: string | null;
  race: RaceResult | null;
  error: DataLoadError | null;
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
  const [result, setResult] = useState<RaceDataState>({
    dataUrl: null,
    race: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const requestUrl = dataUrl;
    inFlightRef.current = true;

    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchRaceResult(requestUrl, controller.signal);
        if (controller.signal.aborted) return;
        setResult({ dataUrl: requestUrl, race: data, error: null });
      } catch (cause) {
        if (
          controller.signal.aborted ||
          (cause instanceof Error && cause.name === "AbortError")
        ) {
          return;
        }
        setResult({
          dataUrl: requestUrl,
          race: null,
          error:
            cause instanceof DataLoadError
              ? cause
              : new DataLoadError(
                  "network",
                  "レースデータの取得に失敗しました。",
                ),
        });
      } finally {
        if (!controller.signal.aborted) {
          inFlightRef.current = false;
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      controller.abort();
    };
  }, [attempt, dataUrl]);

  const retry = useCallback(() => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);
    setAttempt((current) => current + 1);
  }, []);

  const isCurrentResult = result.dataUrl === dataUrl;

  return {
    race: isCurrentResult ? result.race : null,
    isLoading: !isCurrentResult || isLoading,
    error: isCurrentResult ? result.error : null,
    retry,
  };
}
