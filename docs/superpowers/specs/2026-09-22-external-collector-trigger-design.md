# External collector trigger via Cloudflare Workers

## Status

The initial external-trigger design was approved in chat on 2026-09-22. This
revision records the follow-up decision to use an hourly schedule and a GitHub
Actions queue. Implementation is deployed; the first live hourly Cron event is
pending observation. The deployed collector and Worker changes are recorded in
collector commits `e71c4ce` and `2ad7334`.

## Goal

Move the race-data collection trigger from GitHub Actions' `schedule` event to
a free Cloudflare Worker. GitHub Actions remains the execution environment for
the existing collector; Cloudflare becomes the hourly trigger. On each race
day and the following day, the trigger must request collection at every hour
from 00:00 through 23:00 JST (48 hourly slots total). The migration must
preserve manual `workflow_dispatch` and the collector-owned freshness
metadata.

## Scope

- Add a small Cloudflare Worker project under the collector repository at
  `infra/cloudflare-collector-trigger/`.
- Configure one Cloudflare Cron Trigger at `0 * * * *` UTC, which is every
  hour at minute 00 in JST as well.
- On each invocation, fetch the public collector `race_days.json`, validate
  its `YYYY-MM-DD` entries, add each following calendar day, and compare the
  current JST date derived from the scheduled event time.
- Call the existing GitHub Actions `workflow_dispatch` API only on a covered
  date, using `ref: main` and no season override.
- Remove the collection workflow's GitHub `schedule` trigger. Keep its
  `workflow_dispatch` trigger so manual runs remain available.
- Change the collector workflow's concurrency policy to keep up to 100 pending
  runs in order (`queue: max`) instead of replacing an older pending run. This
  preserves hourly collection requests when one collection takes longer than
  an hour while keeping generated-data writes serialized.
- Store the narrowly scoped GitHub Actions token only as a Cloudflare Worker
  secret. Never expose it to the viewer, browser, repository, or logs.
- Stop `updateSchedule.ts` from regenerating the inactive GitHub collection
  schedule. Its monthly GitHub workflow continues to refresh `race_days.json`,
  which is the calendar data source used by the Worker; it no longer controls
  when collection runs start.
- Keep the existing collector commands, generated data contracts, manual
  workflow dispatch, and viewer data-fetching behavior.

## Non-goals

- Do not move scraping, artifact generation, or Git commits into Cloudflare.
- Do not add a public viewer-side update button in this change.
- Do not add a Cloudflare database, queue, Durable Object, or paid feature. The
  selected queue is GitHub Actions' built-in concurrency queue.
- Do not put a GitHub token in client code, Vercel environment variables, or
  committed configuration.
- Do not delete generated race data or change the viewer's data contract.
- Do not move official-calendar HTML scraping into Cloudflare as part of this
  migration. That remains the separate monthly maintenance workflow's job.

## Approaches considered

### Cloudflare Worker Cron — selected

Cloudflare provides an independent scheduler, Cron Events history, and logs.
The Worker only makes a small GitHub API request, so the collector remains on
the existing GitHub runner. An every-hour trigger runs on non-race days too,
but the Worker skips them after checking the calendar. On covered dates, each
hourly request is retained by the GitHub Actions queue. The free plan is
sufficient for the expected request count; the implementation must keep CPU
work small.

### Vercel Cron — not selected

The viewer is already deployed on Vercel, but the current free/Hobby plan
does not support hourly Cron frequency. Vercel also does not automatically
retry a failed Cron invocation, so it would require a paid-plan decision and
additional retry logic.

### Skip while a collector is running — not selected

Skipping a covered hourly slot while another collector is running would avoid
queue growth, but it would lose the exact hourly collection attempt. Because
results can appear later on the source site, preserving the request in the
GitHub queue is more useful for this collector.

### Direct calendar scraping in Cloudflare — not selected

Moving the official-calendar HTML scraping into the Worker would remove the
monthly GitHub calendar-maintenance workflow too, but would duplicate the
collector's parser in a constrained runtime. The current scope moves the
collection trigger; `race_days.json` remains the calendar source of truth.

## Data flow

```text
Cloudflare Cron (every hour, every day)
  -> Worker derives JST date from scheduled event time
  -> Worker fetches collector/main/race_days.json
  -> Worker adds each following calendar day
  -> non-covered date: log skip and finish
  -> covered date: GitHub workflow_dispatch(ref=main), one request per hour
  -> GitHub Actions concurrency queue serializes pending collection runs
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
8. Do not treat a different covered hourly slot as a duplicate merely because
   another collector is running. The recent-run preflight is only a
   best-effort guard against a repeated delivery of the same slot; the GitHub
   queue is responsible for preserving later hourly requests.
9. Log only non-secret identifiers, the JST slot, the decision, response
   status, and a redacted error summary.

The GitHub workflow concurrency group remains the final protection against
overlapping collectors, but it must use `queue: max` with
`cancel-in-progress: false`. GitHub's queue can hold the 48 covered-day
requests without replacing older pending runs. The collector's generated data
remains idempotent and a failed push remains visible in GitHub Actions.

## Collector and freshness metadata

The Worker does not write repository files directly. The existing collector
workflow remains responsible for `site-metadata.json`. Every successful
collector workflow, including a run where no race data changed, calls
`writeSiteMetadata()` and commits the new `updatedAt` value. Therefore the
viewer-visible update time represents the collector workflow completion time,
not the earlier Cloudflare trigger time. A Worker-only skip or a failed
workflow does not advance the viewer's update time.

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
3. Deploy the hourly `0 * * * *` Worker configuration and confirm its Cron
   event. The Worker must be enabled before the old GitHub schedule is
   removed.
4. Remove the active GitHub `schedule` trigger in a collector commit while
   retaining `workflow_dispatch`, and stop `updateSchedule.ts` from writing
   that schedule.
5. Confirm each covered hourly slot appears as a `workflow_dispatch` run and
   that queued runs remain ordered when a prior run is still active.
6. Confirm `site-metadata.json` advances after each successful collector run,
   including runs where no race data changed.
7. If the Worker or token fails, disable Worker dispatch and manually run the
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
  successful collector run and is not advanced by a Worker-only event. Its
  `updatedAt` is the collector workflow completion time; a successful no-op
  collection still writes a new timestamp.
- A failed Worker invocation must not produce a success log or update site
  data.

## Acceptance criteria

1. A covered JST slot produces a Cloudflare Cron Event and a corresponding
   GitHub `workflow_dispatch` run without relying on GitHub `schedule`; on a
   covered date there are 24 hourly dispatch slots.
2. A non-covered date logs a skip and does not create a GitHub run.
3. The Worker accepts the current public `race_days.json` shape and includes
   the following calendar day for every official race day.
4. Invalid calendar data, GitHub non-2xx responses, and exhausted retries are
   visible as failures and never reported as successful collection.
5. The GitHub Actions token is absent from source, browser responses, and
   logs.
6. Manual `Run workflow` still works with the optional `season` input.
7. When a collector run overlaps the next hourly slot, the later run remains
   pending rather than replacing an older pending run, up to the GitHub queue
   limit of 100.
8. After cutover, existing collector tests, type checks, generated artifacts,
   freshness metadata, and viewer behavior remain valid.
9. The free Cloudflare plan is sufficient for the deployed Worker without a
   payment method or paid-only binding.

## Verification plan

- Worker unit tests for JST slot conversion, next-day expansion, valid and
  invalid calendar payloads, skip/dispatch decisions, retry behavior, and
  secret redaction.
- Collector tests and typecheck after removing the inactive generated GitHub
  schedule and enabling the GitHub concurrency queue.
- A local scheduled-handler test with `wrangler dev --test-scheduled`.
- A live test with one deliberate dispatch and one observed Cron Event.
- An overlap test that proves a later dispatch remains pending instead of
  replacing the previous pending run.
- A post-cutover check of the GitHub run event, completion, pushed metadata,
  and viewer-visible update time for a no-data-change run.
