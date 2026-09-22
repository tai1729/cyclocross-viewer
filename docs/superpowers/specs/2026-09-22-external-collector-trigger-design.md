# External collector trigger via Cloudflare Workers

## Status

Design approved in chat on 2026-09-22. Implementation is pending review of
this document. No Cloudflare or GitHub settings are changed by this design
document.

## Goal

Reduce dependence on GitHub Actions' `schedule` event for race-data
collection. GitHub Actions remains the execution environment for the existing
collector; a free Cloudflare Worker becomes the independent hourly trigger.
The new trigger must preserve the existing collection window, race-day plus
following-day coverage, manual `workflow_dispatch`, and the collector-owned
freshness metadata.

## Scope

- Add a small Cloudflare Worker project under the collector repository at
  `infra/cloudflare-collector-trigger/`.
- Configure one Cloudflare Cron Trigger at `7 0-14 * * *` UTC, equivalent to
  09:07–23:07 JST.
- On each invocation, fetch the public collector `race_days.json`, validate
  its `YYYY-MM-DD` entries, add each following calendar day, and compare the
  current JST date derived from the scheduled event time.
- Call the existing GitHub Actions `workflow_dispatch` API only on a covered
  date, using `ref: main` and no season override.
- Store the narrowly scoped GitHub Actions token only as a Cloudflare Worker
  secret. Never expose it to the viewer, browser, repository, or logs.
- Remove the active GitHub `schedule` trigger after the external trigger has
  been verified, and stop `updateSchedule.ts` from regenerating an inactive
  GitHub schedule.
- Keep the existing collector commands, generated data contracts, manual
  workflow dispatch, and viewer data-fetching behavior.

## Non-goals

- Do not move scraping, artifact generation, or Git commits into Cloudflare.
- Do not add a public viewer-side update button in this change.
- Do not add a database, queue, Durable Object, or paid Cloudflare feature.
- Do not put a GitHub token in client code, Vercel environment variables, or
  committed configuration.
- Do not delete generated race data or change the viewer's data contract.

## Approaches considered

### Cloudflare Worker Cron — selected

Cloudflare provides an independent scheduler, Cron Events history, and logs.
The Worker only makes a small GitHub API request, so the collector remains on
the existing GitHub runner. The free plan is sufficient for the expected
request count; the implementation must keep CPU work small.

### Vercel Cron — not selected

The viewer is already deployed on Vercel, but the current free/Hobby plan
does not support hourly Cron frequency. Vercel also does not automatically
retry a failed Cron invocation, so it would require a paid-plan decision and
additional retry logic.

### Multiple GitHub schedules — not selected

Adding more GitHub `schedule` entries could reduce the chance of a missed
slot, but it keeps the same failure domain and does not make a missing trigger
observable. Concurrent duplicate collector runs could also cause unnecessary
commits or push conflicts.

## Data flow

```text
Cloudflare Cron (07, 08, ... 14 UTC)
  -> Worker derives JST date from scheduled event time
  -> Worker fetches collector/main/race_days.json
  -> Worker adds each following calendar day
  -> non-covered date: log skip and finish
  -> covered date: GitHub workflow_dispatch(ref=main)
  -> existing collector workflow
  -> discovery / collection / artifact validation
  -> site-metadata.json and generated data pushed to collector/main
  -> viewer reads the existing public raw-data URLs
```

The Worker must add a cache-busting query value when reading the public
calendar artifact so a recently updated calendar is not held longer than the
normal raw-file cache window.

## Worker behavior

1. Read `controller.scheduledTime` and format it as `YYYY-MM-DD` in
   `Asia/Tokyo`; do not use the Worker machine's local timezone.
2. Fetch the public `race_days.json` from the collector's `main` branch.
3. Reject non-2xx responses, non-array payloads, invalid dates, and duplicate
   malformed entries. A calendar failure must not dispatch a collection.
4. Build the covered-date set from every official race date and its next UTC
   calendar day, matching the collector's existing date arithmetic.
5. For a non-covered date, write a structured skip log and return successfully.
6. For a covered date, call the GitHub REST endpoint for
   `collect.yml`'s `workflow_dispatch` event with `ref: main`.
7. Retry transient GitHub request failures a bounded number of times with
   short backoff. After the final failure, log the response status without
   claiming that collection ran.
8. Log only non-secret identifiers, the JST slot, the decision, response
   status, and a redacted error summary.

The existing GitHub workflow concurrency group remains the final protection
against overlapping collectors. The Worker should perform a recent-run
preflight before dispatching so a repeated Cron delivery does not normally
create a second dispatch for the same slot. This preflight is best-effort;
the collector's generated data remains idempotent and a failed push remains
visible in GitHub Actions.

## Authentication and external settings

- Create a fine-grained GitHub token limited to the
  `tai1729/cyclocross-data-collector` repository with only repository
  `Actions: write` permission, as required by the workflow-dispatch API.
- Add it to the Worker as a secret named `GITHUB_ACTIONS_TOKEN`.
- Keep the Worker Cron schedule and secret in Cloudflare. Do not commit either
  secret value.
- Use Cloudflare's free plan only. Do not attach a payment method or enable a
  paid usage model as part of this change.

## Cutover and rollback

1. Test the Worker code locally and deploy it with the Cron Trigger registered
   while `DISPATCH_ENABLED=false`. This permits live Cron Event verification
   without duplicating the still-active GitHub schedule.
2. Add the GitHub token, confirm a covered-date Cron Event logs a disabled
   dispatch decision, then enable dispatch in the Worker.
3. Remove the active GitHub `schedule` trigger in a collector commit while
   retaining `workflow_dispatch`.
4. Confirm the next covered slot appears as a `workflow_dispatch` run and that
   `site-metadata.json` advances after success.
5. If the Worker or token fails, disable Worker dispatch and manually run the
   existing workflow. If necessary, restore the GitHub schedule from the
   previous collector commit. Disable the Worker Cron before restoring the old
   schedule to prevent duplicate runs.

During the cutover, a manual workflow run is an accepted fallback for a slot
that would otherwise be missed. No generated race data is deleted during
rollback.

## Observability and failure semantics

- Cloudflare Cron Events prove whether the external scheduler invoked the
  Worker.
- Worker logs distinguish `skip`, `dispatch accepted`, `retry`, and `dispatch
  failed`.
- GitHub Actions remains authoritative for whether the collector actually
  ran, completed, or failed.
- The viewer's `site-metadata.json` remains authoritative for the last
  successful collector run and is not advanced by a Worker-only event.
- A failed Worker invocation must not produce a success log or update site
  data.

## Acceptance criteria

1. A covered JST slot produces a Cloudflare Cron Event and a corresponding
   GitHub `workflow_dispatch` run without relying on GitHub `schedule`.
2. A non-covered date logs a skip and does not create a GitHub run.
3. The Worker accepts the current public `race_days.json` shape and includes
   the following calendar day for every official race day.
4. Invalid calendar data, GitHub non-2xx responses, and exhausted retries are
   visible as failures and never reported as successful collection.
5. The GitHub Actions token is absent from source, browser responses, and
   logs.
6. Manual `Run workflow` still works with the optional `season` input.
7. After cutover, existing collector tests, type checks, generated artifacts,
   freshness metadata, and viewer behavior remain valid.
8. The free Cloudflare plan is sufficient for the deployed Worker without a
   payment method or paid-only binding.

## Verification plan

- Worker unit tests for JST slot conversion, next-day expansion, valid and
  invalid calendar payloads, skip/dispatch decisions, retry behavior, and
  secret redaction.
- Collector tests and typecheck after removing the inactive generated GitHub
  schedule.
- A live test with one deliberate dispatch and one observed Cron Event.
- A post-cutover check of the GitHub run event, completion, pushed metadata,
  and viewer-visible update time.
