"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MeetEntry, SiteMetadata } from "@/lib/types";
import { DataLoadError, fetchMeets, fetchSiteMetadata } from "@/lib/dataSource";

interface UseMeetDataResult {
  meets: MeetEntry[];
  isLoading: boolean;
  error: DataLoadError | null;
  siteMetadata: SiteMetadata | null;
  retry: () => void;
}

export function useMeetData(): UseMeetDataResult {
  const [meets, setMeets] = useState<MeetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<DataLoadError | null>(null);
  const [siteMetadata, setSiteMetadata] = useState<SiteMetadata | null>(null);
  const [attempt, setAttempt] = useState(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    inFlightRef.current = true;

    Promise.allSettled([
      fetchMeets(controller.signal),
      fetchSiteMetadata(controller.signal),
    ])
      .then(([meetsResult, metadataResult]) => {
        if (controller.signal.aborted) return;

        if (meetsResult.status === "fulfilled") {
          setMeets(meetsResult.value);
          setError(null);
        } else {
          const cause = meetsResult.reason as unknown;
          setError(
            cause instanceof DataLoadError
              ? cause
              : new DataLoadError("network", "大会一覧の取得に失敗しました。"),
          );
        }

        setSiteMetadata(
          metadataResult.status === "fulfilled" ? metadataResult.value : null,
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
    setSiteMetadata(null);
    setAttempt((current) => current + 1);
  }, []);

  return { meets, isLoading, error, siteMetadata, retry };
}
