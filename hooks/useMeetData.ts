"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MeetEntry } from "@/lib/types";
import { DataLoadError, fetchMeets } from "@/lib/dataSource";

interface UseMeetDataResult {
  meets: MeetEntry[];
  isLoading: boolean;
  error: DataLoadError | null;
  retry: () => void;
}

export function useMeetData(): UseMeetDataResult {
  const [meets, setMeets] = useState<MeetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<DataLoadError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    inFlightRef.current = true;

    fetchMeets(controller.signal)
      .then((data) => {
        setMeets(data);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === "AbortError") return;
        setError(
          cause instanceof DataLoadError
            ? cause
            : new DataLoadError("network", "大会一覧の取得に失敗しました。"),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          inFlightRef.current = false;
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [attempt]);

  const retry = useCallback(() => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);
    setAttempt((current) => current + 1);
  }, []);

  return { meets, isLoading, error, retry };
}
