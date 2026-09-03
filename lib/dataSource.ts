import type { MeetEntry, RaceResult } from "@/lib/types";

export const DATA_BASE_URL =
  "https://raw.githubusercontent.com/tai1729/cyclocross-data-collector/main";

export type DataLoadErrorKind =
  | "not-found"
  | "network"
  | "http"
  | "invalid-data";

export class DataLoadError extends Error {
  readonly kind: DataLoadErrorKind;
  readonly status?: number;

  constructor(kind: DataLoadErrorKind, message: string, status?: number) {
    super(message);
    this.name = "DataLoadError";
    this.kind = kind;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMeetEntry(value: unknown): value is MeetEntry {
  return (
    isRecord(value) &&
    typeof value.meetId === "string" &&
    typeof value.season === "string" &&
    typeof value.meetDate === "string" &&
    typeof value.series === "string" &&
    typeof value.meetName === "string" &&
    Array.isArray(value.categories) &&
    value.categories.every(
      (category) =>
        isRecord(category) &&
        typeof category.raceId === "string" &&
        typeof category.name === "string" &&
        typeof category.order === "number",
    )
  );
}

function isRaceResult(value: unknown): value is RaceResult {
  return (
    isRecord(value) &&
    typeof value.raceId === "string" &&
    typeof value.raceName === "string" &&
    typeof value.category === "string" &&
    typeof value.updatedAt === "string" &&
    Array.isArray(value.riders) &&
    value.riders.every(
      (rider) =>
        isRecord(rider) &&
        typeof rider.riderId === "string" &&
        typeof rider.name === "string" &&
        typeof rider.finalPosition === "number" &&
        (rider.status === "finished" || rider.status === "dnf") &&
        (rider.dataQuality === "ok" || rider.dataQuality === "error") &&
        Array.isArray(rider.laps) &&
        rider.laps.every(isRecord),
    )
  );
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (cause) {
    if (cause instanceof Error && cause.name === "AbortError") throw cause;
    throw new DataLoadError("network", "データ取得の通信に失敗しました。");
  }

  if (!response.ok) {
    const kind = response.status === 404 ? "not-found" : "http";
    throw new DataLoadError(
      kind,
      `データを取得できませんでした (status: ${response.status})`,
      response.status,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new DataLoadError("invalid-data", "JSONを読み取れませんでした。");
  }
}

export async function fetchMeets(signal?: AbortSignal): Promise<MeetEntry[]> {
  const data = await fetchJson(`${DATA_BASE_URL}/meets.json`, signal);
  if (!Array.isArray(data) || !data.every(isMeetEntry)) {
    throw new DataLoadError(
      "invalid-data",
      "大会一覧データの形式が正しくありません。",
    );
  }
  return data;
}

export async function fetchMeetById(meetId: string): Promise<MeetEntry | null> {
  const meets = await fetchMeets();
  return meets.find((meet) => meet.meetId === meetId) ?? null;
}

export async function fetchRaceResult(
  dataUrl: string,
  signal?: AbortSignal,
): Promise<RaceResult> {
  const data = await fetchJson(dataUrl, signal);
  if (!isRaceResult(data)) {
    throw new DataLoadError(
      "invalid-data",
      "レースデータの形式が正しくありません。",
    );
  }
  return data;
}

export function describeDataLoadError(
  error: DataLoadError,
  resourceName: string,
): string {
  switch (error.kind) {
    case "not-found":
      return `${resourceName}が見つかりませんでした。`;
    case "network":
      return `${resourceName}の取得中に通信できませんでした。接続を確認して再試行してください。`;
    case "http":
      return `${resourceName}を取得できませんでした${error.status ? ` (status: ${error.status})` : ""}。`;
    case "invalid-data":
      return `${resourceName}の形式が正しくないため表示できません。`;
  }
}
