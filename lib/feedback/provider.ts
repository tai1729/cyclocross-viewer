import type { FeedbackSubmission } from "./feedbackSchema";

export type FeedbackProviderResult = "accepted" | "retryable" | "rejected";

const BASIN_TIMEOUT_MS = 8_000;

function isJsonContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  const mediaType = contentType.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  return mediaType === "application/json" || mediaType.endsWith("+json");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function submitToBasin(
  submission: FeedbackSubmission,
  idempotencyKey: string,
): Promise<FeedbackProviderResult> {
  const endpoint = process.env.FEEDBACK_BASIN_ENDPOINT?.trim();
  if (!endpoint) return "retryable";

  const form = new URLSearchParams();
  form.set("schemaVersion", String(submission.schemaVersion));
  form.set("category", submission.category);
  form.set("message", submission.message);
  if (submission.contactEmail) form.set("contactEmail", submission.contactEmail);
  form.set("context", JSON.stringify(submission.context));

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    let providerResponse: Response | null;
    try {
      const request = fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": idempotencyKey,
        },
        body: form.toString(),
        signal: controller.signal,
      }).catch(() => null);

      const timeout = new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          resolve(null);
        }, BASIN_TIMEOUT_MS);
      });

      providerResponse = await Promise.race([request, timeout]);
    } catch {
      return "retryable";
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    }

    if (providerResponse === null) return "retryable";

    if (!providerResponse.ok) {
      if (
        providerResponse.status === 408 ||
        providerResponse.status === 425 ||
        providerResponse.status === 429 ||
        providerResponse.status >= 500
      ) {
        return "retryable";
      }
      if (providerResponse.status >= 400 && providerResponse.status < 500) return "rejected";
      return "rejected";
    }

    if (!isJsonContentType(providerResponse.headers.get("content-type"))) return "accepted";

    try {
      const responseBody: unknown = await providerResponse.json();
      if (
        isRecord(responseBody) &&
        (responseBody.ok === false || responseBody.success === false)
      ) {
        return "rejected";
      }
      return "accepted";
    } catch {
      return "retryable";
    }
  } catch {
    return "retryable";
  }
}

export async function submitFeedback(
  submission: FeedbackSubmission,
  idempotencyKey: string,
): Promise<FeedbackProviderResult> {
  return submitToBasin(submission, idempotencyKey);
}
