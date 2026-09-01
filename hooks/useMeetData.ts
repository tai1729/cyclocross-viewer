"use client";

import { useEffect, useState } from "react";
import type { MeetEntry } from "@/lib/types";

export const DATA_BASE_URL =
  "https://raw.githubusercontent.com/tai1729/cyclocross-data-collector/main";

interface UseMeetDataResult {
  meets: MeetEntry[];
  isLoading: boolean;
  error: string | null;
}

export function useMeetData(): UseMeetDataResult {
  const [meets, setMeets] = useState<MeetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${DATA_BASE_URL}/meets.json`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`大会一覧を取得できませんでした (status: ${res.status})`);
        return (await res.json()) as MeetEntry[];
      })
      .then((data) => {
        if (!cancelled) setMeets(data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "大会一覧の取得に失敗しました");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { meets, isLoading, error };
}
