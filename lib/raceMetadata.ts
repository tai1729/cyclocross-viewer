const UNKNOWN_UPDATED_AT = "更新日時不明";

export function formatRaceUpdatedAt(updatedAt: unknown): string {
  if (typeof updatedAt !== "string") {
    return UNKNOWN_UPDATED_AT;
  }

  const trimmedUpdatedAt = updatedAt.trim();
  if (trimmedUpdatedAt === "") {
    return UNKNOWN_UPDATED_AT;
  }

  try {
    const date = new Date(trimmedUpdatedAt);
    if (!Number.isFinite(date.getTime())) {
      return UNKNOWN_UPDATED_AT;
    }

    const parts = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Tokyo",
    }).formatToParts(date);
    const values = new Map(parts.map((part) => [part.type, part.value]));
    const year = values.get("year");
    const month = values.get("month");
    const day = values.get("day");
    const hour = values.get("hour");
    const minute = values.get("minute");

    if (
      !year ||
      !month ||
      !day ||
      !hour ||
      !minute ||
      !/^\d{4}$/.test(year) ||
      !/^\d{2}$/.test(month) ||
      !/^\d{2}$/.test(day) ||
      !/^\d{2}$/.test(hour) ||
      !/^\d{2}$/.test(minute)
    ) {
      return UNKNOWN_UPDATED_AT;
    }

    return `${year}/${month}/${day} ${hour}:${minute} JST`;
  } catch {
    return UNKNOWN_UPDATED_AT;
  }
}

export function getRaceSourceUrl(raceId: unknown): string | null {
  if (typeof raceId !== "string") {
    return null;
  }

  const trimmedRaceId = raceId.trim();
  if (trimmedRaceId === "") {
    return null;
  }

  try {
    const encodedRaceId = encodeURIComponent(trimmedRaceId);
    return `https://github.com/tai1729/cyclocross-data-collector/blob/main/data/race-${encodedRaceId}.json`;
  } catch {
    return null;
  }
}
