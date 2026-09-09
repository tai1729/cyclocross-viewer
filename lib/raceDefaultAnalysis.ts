import { getValidCheckpoints } from "@/lib/dataTransform";
import type { Rider } from "@/lib/types";

export type DefaultRiderProvenance = "fresh" | "explicit" | "category-reset";

/** Auto-selection is allowed only for a fresh race entry or an intentional category reset. */
export function canAutoSelectDefaultRider(provenance: DefaultRiderProvenance): boolean {
  return provenance !== "explicit";
}

/** Return the first rider that can render analysis, preserving displayed-order ties. */
export function getFirstGraphableRider(riders: readonly Rider[]): Rider | null {
  return riders
    .map((rider, index) => ({ rider, index }))
    .sort((a, b) => a.rider.finalPosition - b.rider.finalPosition || a.index - b.index)
    .find(
      ({ rider }) => rider.dataQuality === "ok" && getValidCheckpoints(rider).length > 0,
    )?.rider ?? null;
}
