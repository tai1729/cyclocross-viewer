"use client";

import { useMemo, useState } from "react";
import { MAX_PINNED_FIXED_RIDERS } from "@/hooks/useComparisonRiders";
import type { Rider } from "@/lib/types";
import { normalizeSearchText } from "@/lib/search";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface ComparisonRiderPickerProps {
  riders: Rider[];
  primaryRiderId: string | null;
  pinnedRiderIds: readonly string[];
  onAdd: (riderId: string) => void;
  onRemove: (riderId: string) => void;
}

const SEARCH_INPUT_ID = "comparison-rider-search";
const SEARCH_DESCRIPTION_ID = "comparison-rider-search-description";

export function ComparisonRiderPicker({
  riders,
  primaryRiderId,
  pinnedRiderIds,
  onAdd,
  onRemove,
}: ComparisonRiderPickerProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearchText(query);
  const pinnedIds = useMemo(() => new Set(pinnedRiderIds), [pinnedRiderIds]);
  const fixedRiders = useMemo(() => {
    const ridersById = new Map(riders.map((rider) => [rider.riderId, rider]));
    const seen = new Set<string>();

    return pinnedRiderIds.flatMap((riderId) => {
      const rider = ridersById.get(riderId);
      if (!rider || seen.has(riderId)) return [];
      seen.add(riderId);
      return [rider];
    });
  }, [pinnedRiderIds, riders]);
  const addableRiders = useMemo(
    () => riders.filter(
      (rider) => rider.riderId !== primaryRiderId && !pinnedIds.has(rider.riderId),
    ),
    [pinnedIds, primaryRiderId, riders],
  );
  const filteredRiders = useMemo(
    () => addableRiders.filter((rider) => {
      if (!normalizedQuery) return true;
      return [rider.name, rider.riderId].some((value) =>
        normalizeSearchText(value).includes(normalizedQuery),
      );
    }),
    [addableRiders, normalizedQuery],
  );
  const atPinnedLimit = pinnedRiderIds.length >= MAX_PINNED_FIXED_RIDERS;

  return (
    <div className="w-full min-w-0 rounded-lg border border-border bg-background p-3">
      <Field className="items-start gap-2">
        <FieldLabel htmlFor={SEARCH_INPUT_ID}>固定する選手を検索</FieldLabel>
        <Input
          id={SEARCH_INPUT_ID}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="選手名または選手ID"
          aria-describedby={SEARCH_DESCRIPTION_ID}
          className="min-h-11 w-full sm:min-h-8"
        />
        <FieldDescription id={SEARCH_DESCRIPTION_ID}>
          グラフに固定する選手を検索して追加できます（最大{MAX_PINNED_FIXED_RIDERS}名）。
        </FieldDescription>
      </Field>

      {fixedRiders.length > 0 && (
        <div className="mt-3 flex min-w-0 flex-col gap-2" aria-label="固定中の選手">
          <p className="text-sm font-medium">固定中</p>
          <div className="flex min-w-0 flex-col gap-1">
            {fixedRiders.map((rider) => (
              <div
                key={rider.riderId}
                className="flex min-h-11 min-w-0 items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5"
              >
                <span className="min-w-0 flex-1 break-words text-sm text-foreground">
                  {rider.name}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(rider.riderId)}
                  aria-label={`${rider.name}を固定から外す`}
                  className="min-h-11 shrink-0 sm:min-h-8"
                >
                  外す
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex min-w-0 flex-col gap-1" role="list" aria-label="固定候補">
        {atPinnedLimit ? (
          <p className="text-sm text-muted-foreground" role="status">
            固定選手は最大{MAX_PINNED_FIXED_RIDERS}名です。追加するには固定中の選手を外してください。
          </p>
        ) : filteredRiders.length === 0 ? (
          <p className="text-sm text-muted-foreground" role="status">
            {normalizedQuery
              ? "検索条件に一致する追加可能な選手はいません。"
              : "追加できる選手はいません。"}
          </p>
        ) : (
          filteredRiders.map((rider) => (
            <div
              key={rider.riderId}
              role="listitem"
              className="flex min-h-11 min-w-0 items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-muted/50"
            >
              <span className="min-w-0 flex-1 break-words text-sm text-foreground">
                {rider.name}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAdd(rider.riderId)}
                disabled={atPinnedLimit}
                aria-label={`${rider.name}を固定する`}
                className="min-h-11 shrink-0 sm:min-h-8"
              >
                追加
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
