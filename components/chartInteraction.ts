interface ChartInteractionPayload {
  lapNumber?: unknown;
  payload?: {
    lapNumber?: unknown;
  };
}

interface ChartInteractionEvent {
  activeLabel?: unknown;
  activePayload?: readonly ChartInteractionPayload[];
  activeTooltipIndex?: unknown;
  activeIndex?: unknown;
}

function normalizeFiniteInteger(value: unknown): number | null {
  if (typeof value === "string" && value.trim() === "") return null;

  const numberValue = typeof value === "number" || typeof value === "string"
    ? Number(value)
    : NaN;

  return Number.isFinite(numberValue) && Number.isInteger(numberValue)
    ? numberValue
    : null;
}

function findAxisLap(
  value: unknown,
  raceLapNumbers: readonly number[],
): number | null {
  const lapNumber = normalizeFiniteInteger(value);
  return lapNumber !== null && raceLapNumbers.includes(lapNumber)
    ? lapNumber
    : null;
}

function findAxisLapByIndex(
  value: unknown,
  raceLapNumbers: readonly number[],
): number | null {
  const index = normalizeFiniteInteger(value);
  return index !== null && index >= 0 && index < raceLapNumbers.length
    ? raceLapNumbers[index]
    : null;
}

export function resolveChartLapNumber(
  event: ChartInteractionEvent | null | undefined,
  raceLapNumbers: readonly number[],
): number | null {
  if (!event || raceLapNumbers.length === 0) return null;

  const activeLabelLap = findAxisLap(event.activeLabel, raceLapNumbers);
  if (activeLabelLap !== null) return activeLabelLap;

  for (const payloadEntry of event.activePayload ?? []) {
    const payloadLap = findAxisLap(payloadEntry.payload?.lapNumber, raceLapNumbers);
    if (payloadLap !== null) return payloadLap;

    const entryLap = findAxisLap(payloadEntry.lapNumber, raceLapNumbers);
    if (entryLap !== null) return entryLap;
  }

  return (
    findAxisLapByIndex(event.activeTooltipIndex, raceLapNumbers) ??
    findAxisLapByIndex(event.activeIndex, raceLapNumbers)
  );
}
