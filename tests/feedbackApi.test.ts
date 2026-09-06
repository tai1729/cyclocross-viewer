import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../app/api/feedback/route";
import type { FeedbackContext, FeedbackSubmission } from "../lib/feedback/feedbackSchema";

let fetchBeforeTest: typeof globalThis.fetch;
let endpointBeforeTest: string | undefined;

function context(): FeedbackContext {
  return {
    route: "race",
    meetId: "meet-1",
    raceId: "race-1",
    categoryId: "race-1",
    viewportWidth: 390,
    viewportHeight: 844,
    browserFamily: "safari",
    appVersion: "test-build",
  };
}

function submission(overrides: Partial<FeedbackSubmission> = {}): FeedbackSubmission {
  return {
    schemaVersion: 1,
    category: "usability",
    message: "グラフが分かりにくいです",
    context: context(),
    ...overrides,
  };
}

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

async function responseBody(response: Response): Promise<unknown> {
  return response.json();
}

test.beforeEach(() => {
  fetchBeforeTest = globalThis.fetch;
  endpointBeforeTest = process.env.FEEDBACK_BASIN_ENDPOINT;
});

test.afterEach(() => {
  globalThis.fetch = fetchBeforeTest;
  if (endpointBeforeTest === undefined) delete process.env.FEEDBACK_BASIN_ENDPOINT;
  else process.env.FEEDBACK_BASIN_ENDPOINT = endpointBeforeTest;
});

test("accepts a valid request and forwards canonical form fields", async () => {
  process.env.FEEDBACK_BASIN_ENDPOINT = "https://basin.example.test/forms/feedback";
  let captured: { input: RequestInfo | URL; init?: RequestInit } | undefined;
  globalThis.fetch = async (input, init) => {
    captured = { input, init };
    return new Response("ok", { status: 201 });
  };

  const response = await POST(request({ ...submission(), website: "" }, { "Idempotency-Key": "ephemeral-key" }));

  assert.equal(response.status, 202);
  assert.deepEqual(await responseBody(response), { ok: true });
  assert.equal(captured?.input, "https://basin.example.test/forms/feedback");
  assert.equal(captured?.init?.method, "POST");
  assert.deepEqual(captured?.init?.headers, {
    "Content-Type": "application/x-www-form-urlencoded",
    "Idempotency-Key": "ephemeral-key",
  });

  const form = new URLSearchParams(String(captured?.init?.body));
  assert.equal(form.get("schemaVersion"), "1");
  assert.equal(form.get("category"), "usability");
  assert.equal(form.get("message"), "グラフが分かりにくいです");
  assert.equal(form.get("contactEmail"), null);
  assert.deepEqual(JSON.parse(form.get("context") ?? ""), context());
});

test("invalid payload returns 400 without calling the provider", async () => {
  process.env.FEEDBACK_BASIN_ENDPOINT = "https://basin.example.test/forms/feedback";
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response("ok");
  };

  const response = await POST(request({ ...submission(), context: { ...context(), unknown: true } }));

  assert.equal(response.status, 400);
  assert.deepEqual(await responseBody(response), { ok: false, error: "invalid" });
  assert.equal(fetchCalls, 0);
});

test("honeypot returns generic success without calling the provider", async () => {
  process.env.FEEDBACK_BASIN_ENDPOINT = "https://basin.example.test/forms/feedback";
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response("ok");
  };

  const response = await POST(request({ ...submission(), website: "https://spam.example" }));

  assert.equal(response.status, 202);
  assert.deepEqual(await responseBody(response), { ok: true });
  assert.equal(fetchCalls, 0);
});

test("provider 4xx maps to the generic unavailable response", async () => {
  process.env.FEEDBACK_BASIN_ENDPOINT = "https://basin.example.test/forms/feedback";
  globalThis.fetch = async () => new Response("provider secret", { status: 422 });

  const response = await POST(request(submission()));

  assert.equal(response.status, 503);
  assert.deepEqual(await responseBody(response), { ok: false, error: "unavailable" });
});

test("provider 5xx maps to the generic unavailable response", async () => {
  process.env.FEEDBACK_BASIN_ENDPOINT = "https://basin.example.test/forms/feedback";
  globalThis.fetch = async () => new Response("provider secret", { status: 503 });

  const response = await POST(request(submission()));

  assert.equal(response.status, 503);
  assert.deepEqual(await responseBody(response), { ok: false, error: "unavailable" });
});

test("provider throws or times out as a retryable failure", async () => {
  process.env.FEEDBACK_BASIN_ENDPOINT = "https://basin.example.test/forms/feedback";
  globalThis.fetch = async () => {
    throw new Error("provider secret");
  };

  const response = await POST(request(submission()));

  assert.equal(response.status, 503);
  assert.deepEqual(await responseBody(response), { ok: false, error: "unavailable" });
});

test("missing endpoint does not call fetch and returns unavailable", async () => {
  delete process.env.FEEDBACK_BASIN_ENDPOINT;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response("ok");
  };

  const response = await POST(request(submission()));

  assert.equal(response.status, 503);
  assert.deepEqual(await responseBody(response), { ok: false, error: "unavailable" });
  assert.equal(fetchCalls, 0);
});

test("malformed JSON provider response is unavailable without leaking the body", async () => {
  process.env.FEEDBACK_BASIN_ENDPOINT = "https://basin.example.test/forms/feedback";
  globalThis.fetch = async () => new Response("provider secret", {
    status: 200,
    headers: { "content-type": "application/json" },
  });

  const response = await POST(request(submission()));

  assert.equal(response.status, 503);
  const body = await responseBody(response);
  assert.deepEqual(body, { ok: false, error: "unavailable" });
  assert.doesNotMatch(JSON.stringify(body), /provider secret/);
});

test("explicit JSON provider failure is rejected without exposing provider details", async () => {
  process.env.FEEDBACK_BASIN_ENDPOINT = "https://basin.example.test/forms/feedback";
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, reason: "provider secret" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

  const response = await POST(request(submission()));

  assert.equal(response.status, 503);
  assert.deepEqual(await responseBody(response), { ok: false, error: "unavailable" });
});

test("non-string honeypot and wrong content type are invalid", async () => {
  process.env.FEEDBACK_BASIN_ENDPOINT = "https://basin.example.test/forms/feedback";
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return new Response("ok");
  };

  const invalidHoneypot = await POST(request({ ...submission(), website: 1 }));
  const wrongContentType = await POST(new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: JSON.stringify(submission()),
  }));

  assert.equal(invalidHoneypot.status, 400);
  assert.equal(wrongContentType.status, 400);
  assert.equal(fetchCalls, 0);
});
