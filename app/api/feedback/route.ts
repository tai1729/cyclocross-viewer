import { randomUUID } from "node:crypto";
import { submitFeedback } from "../../../lib/feedback/provider";
import { validateFeedbackSubmission } from "../../../lib/feedback/feedbackSchema";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 64 * 1024;
const ALLOWED_TOP_LEVEL_KEYS = new Set([
  "schemaVersion",
  "category",
  "message",
  "contactEmail",
  "context",
  "website",
]);

function invalidResponse(): Response {
  return Response.json({ ok: false, error: "invalid" }, { status: 400 });
}

function unavailableResponse(): Response {
  return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
}

function acceptedResponse(): Response {
  return Response.json({ ok: true }, { status: 202 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyAllowedTopLevelKeys(value: Record<string, unknown>): boolean {
  return Object.keys(value).every((key) => ALLOWED_TOP_LEVEL_KEYS.has(key));
}

async function readJsonBody(request: Request): Promise<unknown | null> {
  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const parsedLength = Number(contentLength);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_BODY_BYTES) return null;
  }

  try {
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength > MAX_BODY_BYTES) return null;

    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return invalidResponse();

  const body = await readJsonBody(request);
  if (!isRecord(body) || !hasOnlyAllowedTopLevelKeys(body)) return invalidResponse();

  if ("website" in body && typeof body.website !== "string") return invalidResponse();
  if (typeof body.website === "string" && body.website.trim() !== "") return acceptedResponse();

  const canonicalPayload = { ...body };
  delete canonicalPayload.website;
  const submission = validateFeedbackSubmission(canonicalPayload);
  if (submission === null) return invalidResponse();

  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim() || randomUUID();

  try {
    const result = await submitFeedback(submission, idempotencyKey);
    return result === "accepted" ? acceptedResponse() : unavailableResponse();
  } catch {
    return unavailableResponse();
  }
}
