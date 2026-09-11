# AJOCC Lap Time Viewer — Current Design Entry

## Current design - UX3-5 Limited Scope Implementation

Status: ACTIVE — UX3-5 re-audit/remediation; external human field test remains blocked
Active Change: UX3-5 MR-01 / MR-02 / MR-03 only

### Goal

Apply only the three UX3-4 `Fix Now` findings with the smallest safe changes:

- MR-01: make comparison lines, names, and roles traceable when many riders
  are shown;
- MR-02: make `周回差` visibly mean single-lap time difference and distinguish
  it from result-table `-1周` without changing any numeric semantics;
- MR-03: keep the direction and sign meaning of every chart metric visible at
  the point of use.

The change must preserve POS-01 through POS-05: readable results, chart-first
value, the meet/category/result path, metric switching, and comparison value.

### Non-goals

- No MR-04 through MR-12 implementation, no deferred-finding redesign, and no
  new Human Field Test claim.
- No change to URL/deep-link, browser history, category selection, rider
  selection, comparison state, metric state, lap state, disclosure state, or
  chart data/semantics.
- No change to `DNF`, lap-down, `-1周`, cumulative gap, or single-lap delta
  calculations and no upstream data-contract change.
- No mobile redesign. Mobile checks are regression checks for the three direct
  changes only.

### Expected behavior

- In crowded comparison mode (`isAllMode` or more than eight displayed riders),
  the chart is followed by a wrapping, accessible series key containing every
  unique `comparisonRiders` entry, including the primary rider, and its role.
  Context lines receive deterministic categorical colors from the displayed
  rider order while retaining a dashed, lower-emphasis style. For a bounded
  crowded non-`all` view of at most twelve displayed riders, tooltips expose
  individual context rider names and values. `all` mode and larger datasets
  retain the existing aggregate context summary to avoid large-tooltip
  overflow; in those cases the key names primary/fixed riders individually and
  gives an explicit count for the aggregated context. The key remains the
  authoritative name-to-line reference for the entries it lists.
- The visible active-tab chart-reading guide states that `周回差` is
  single-lap time difference and is not the result-table `-1周` status. It
  also states that differences are relative to the selected rider and gives
  positive/negative meaning.
- The guide states that a smaller rank number is better and is drawn higher,
  while a lower lap-time value is faster and is drawn lower. It keeps the
  existing step/linear chart rendering. The lap-detail label uses a
  clarifying single-lap-time name for the pace metric.

### Architecture and data flow

`ChartTabs` remains the composition boundary. `lib/chartSeriesStyles.ts`
assigns deterministic styles from the already displayed rider order. A small
series-key view is rendered by `ChartTabs`; `RoleAwareTooltip` receives an
explicit crowded-mode flag to expose context entries. A pure
`lib/chartReadingGuide.ts` owns the four explanatory strings so unit tests can
assert the evidence-backed terminology and direction guarantees. Existing
`dataTransform`, URL serialization, and `RaceViewer` interaction callbacks
remain unchanged.

```text
displayed riders -> series style map -> chart lines / crowded series key / tooltip
active metric -> reading guide -> visible chart explanation + accessible description
```

### Error and edge behavior

- Empty rider lists, missing lap data, unavailable comparison data, loading,
  error, and not-found states keep their existing branches and copy.
- A series key wraps within its card at 390px and 320px-class widths; it must
  not create page-level horizontal overflow. Long rider names may break. The
  active-tab reading guide remains visually available at both widths and may
  wrap; it is not hidden to make room for the chart.
- Color remains supplemental: every key contains text role/name labels and the
  tooltip contains text names. Keyboard focus, target size, and all existing
  disclosure controls remain unchanged.
- The style helper handles duplicate rider IDs using its existing first-entry
  behavior and cycles deterministically if more context riders exist than the
  palette. Palette assignment is intentionally based on the current displayed
  order: it is stable across rerenders and metric tabs, while changing the
  comparison set may reassign context colors.

### Compatibility constraints

Keep `/`, `/race/[meetId]`, upstream types, chart metric formulas, `stepAfter`
rank rendering, `linear` time rendering, and existing test/runtime dependencies.
Only the relevant chart components, pure style/guide helpers, tests, and the
UX3-5 implementation report/design-plan/audit documents may change. Existing
UX3-4 and review evidence files are preserved byte-for-byte.

### Acceptance criteria

1. MR-01: crowded comparison shows every unique displayed rider name and role
   in a wrapping series key, except that `all` mode and datasets above the
   bounded tooltip threshold may use the explicit aggregate context item;
   context line colors are deterministic and distinct until palette cycling;
   bounded non-`all` crowded tooltip entries include rider names while
   large/`all` views retain the aggregate safety behavior.
2. MR-02: visible guide and lap-detail label identify `周回差` as single-lap
   time difference and explicitly distinguish result-table `-1周`; formulas
   and displayed numeric values are unchanged.
3. MR-03: the active-tab visible guide covers rank, cumulative gap, single-lap
   difference, and lap-time direction/sign semantics relative to the selected
   rider where applicable.
4. POS-01–POS-05 are preserved, and no URL, state, disclosure, or error branch
   regresses.
5. Unit tests cover style assignment, aggregate behavior, and the four guide
   strings. Full test, typecheck, lint, build, `git diff --check`, and browser
   checks pass.

### Validation commands

- `npm test`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `git diff --check`
- Browser verification at 1440×900, 1280×720, optional 1024×768, 390×844,
  and 320px-class width, including reload and back/forward.

### UX3-5 specification audit resolutions

- `isAllMode || comparisonRiders.length > 8` is the crowded condition. The
  series key lists the unique displayed `comparisonRiders` in their supplied
  order exactly once, using the existing role labels `注目選手`, `固定比較`,
  and `参考選手`. Gap/Pace charts still omit the primary plotted line; the
  key includes it because it is the selected reference.
- Context colors use a separate eight-color categorical palette with at least
  the existing chart palette's intended chart-background contrast. Assignment
  follows displayed order, is deterministic across rerenders and metric tabs,
  and cycles only after the palette is exhausted. It is not a persistent rider
  identity color contract across comparison-mode changes.
- Crowded non-`all` tooltips show all valid context payload entries when there
  are at most twelve displayed riders. `all` mode and larger datasets keep the
  existing aggregate context range; no missing-value inference is added. The
  complete static series key is the authoritative name-to-line mapping.
- The four authoritative guide strings are tab-specific and active-tab
  visible: rank says smaller numeric rank is better and visually higher; gap
  says the selected rider is the zero reference and positive is slower/behind,
  negative is faster/ahead; pace says the same and explicitly distinguishes
  chart single-lap difference from result `-1周`; lap says smaller time is
  faster and visually lower. No signed meaning is invented for rank/lap.
- Browser acceptance checks use the existing production fixture when available
  and require: no document-level horizontal overflow; the crowded key exists,
  contains each displayed name and role once, wraps within the viewport, and
  has no clipped item; all four tabs expose their guide; existing results,
  selection, comparison, metric, lap, disclosure, reload, and back/forward
  flows still work. Tooltip name inspection is manual/pointer-based and is
  bounded to the non-`all` twelve-rider case.
- POS-01 through POS-05 are verified through the existing automated behavior
  tests plus the browser flow: result table unchanged; chart-first structure
  and rank/lap value remain; meet/category/result navigation remains; four
  metric tabs remain operable; comparison count/fixed selection remain
  operable. Step/linear types, `connectNulls={false}`, sparse values, and
  missing-lap behavior remain unchanged.

### UX3-5 re-audit resolutions (2026-09-10)

- The implementation attribution baseline is committed UX3-5 change `eee5570`,
  which follows the UX3-4 evidence baseline `79cf29f`. The current HEAD is
  `475485f`; existing dirty UX3-7R files are user-owned, remain uncommitted,
  and are not included in the UX3-5 change set. Verification may observe the
  current tree, but the report separates those pre-existing changes from
  UX3-5 and does not stage or discard them.
- UX3-5 remains the contract for MR-01–03 even where the dirty UX3-7R tree
  overlaps a component. A direct regression of an MR-01–03 criterion may be
  corrected in the overlapping file only at the smallest possible hunk; other
  UX3-7R layout, results, or disclosure behavior is outside this task.
- The static key is complete for the displayed unique riders in ordinary and
  bounded crowded modes. The existing all-mode/large-data aggregate context
  item is explicitly permitted by the UX3-4 safety boundary; tooltip
  completeness is separate and is individual only for non-`all` crowded views
  with at most twelve raw displayed riders.
- Crowded and tooltip thresholds use raw `comparisonRiders.length`, as the
  existing composition contract does. The key deduplicates rider IDs in input
  order; the style helper keeps its first-entry behavior. No synthetic primary
  entry is created for inconsistent stale state, because URL normalization and
  `useComparisonRiders` already supply the selected rider in the comparison
  list; such inconsistent state is not a new UX3-5 behavior.
- The active-tab guide is the required visible guide. Inactive tab content may
  be unmounted by the existing Tabs primitive, but switching to each tab must
  expose its own guide and accessible description. This is not a requirement to
  keep four guides simultaneously visible in the DOM.
- 320px/390px checks are technical regression checks, not human evidence and
  not a claim that Mobile triangulation is complete. If exact viewport control
  is unavailable, the report must mark that evidence unavailable rather than
  claim a mobile PASS. External Human Field Test remains
  `BLOCKED — PARTICIPANTS UNAVAILABLE`.
- POS-01–POS-05 are accepted through observable checks: result table/name/
  status readability; chart-first rank/lap availability; unchanged route
  navigation; four-tab operation; and preserved comparison count, fixed
  selection, and selected-rider emphasis. Numeric semantics, disclosures,
  URL state, and error branches are regression contracts, not redesign targets.

Status: ACTIVE — UX3-1C specification resolved; implementation in progress
Active Change: UX3-1C Feedback Intake

## Current design - UX3-1C Feedback Intake

Status: IMPLEMENTATION COMPLETE — production provider configuration required

### Goal

Add the UX3-1B-approved feedback intake as a secondary action without changing
Human Field Test status or the completed analysis workspace. The feature is an
anonymous, optional-contact feedback form at `/feedback` with a server-owned
validation and provider boundary.

### Non-goals

- No Human Field Test, micro-feedback, NPS, popup survey, screenshot,
  attachment, account, feedback history, dashboard, analytics, database, or
  unrelated UX/layout/chart redesign.
- No change to the existing URL/history, Results, Lap Detail, rider sheet,
  comparison, metric, chart, scroll, or focus contracts.
- No client-side Basin request, provider SDK, secret, tracking identifier,
  cookie, raw user-agent, full URL, referrer, rider name, screenshot, or
  arbitrary local-storage capture.

### Approved architecture and data flow

```text
layout entry / feedback route
  -> client-only allowlisted URL/context snapshot
  -> POST /api/feedback
  -> server schema validation + honeypot boundary
  -> provider-neutral adapter
  -> Basin Starter form endpoint
```

`lib/feedback/feedbackSchema.ts` owns the canonical categories, context enums,
limits, and server validation. `lib/feedback/context.ts` is a pure,
testable client-safe boundary that reads only known URL keys, normalizes the
browser family, bounds viewport values, and emits the approved
`FeedbackContext`. `lib/feedback/provider.ts` exposes a provider-neutral
`submitFeedback` interface and contains the server-only Basin adapter. The
route handler forwards only validated canonical fields and converts all
provider failures to the public canonical error.

The canonical payload is:

```ts
type FeedbackSubmission = {
  schemaVersion: 1;
  category: FeedbackCategory;
  message: string;
  contactEmail?: string;
  context: FeedbackContext;
};
```

`FeedbackContext` contains only `route`, optional app IDs and known analysis
state (`meetId`, `raceId`, `categoryId`, `riderId`, `fixedRiderIds`, `metric`,
`comparisonMode`, `lap`, `season`, `series`), bounded viewport dimensions,
normalized browser family, and public build version. `riderId` is sent without
the rider name. Unknown query parameters, fragments, raw URL, cookies, raw
UA, referrer, and arbitrary storage are discarded. The entry stores the
allowlisted state in a short-lived `sessionStorage` snapshot solely to retain
race context across navigation to `/feedback`; it is cleared after submit or
route departure and is never used as a user identity.

### UI and navigation

- Desktop (`min-width: 1024px`): a compact fixed `ご意見・不具合を送る`
  entry uses `bottom: calc(1rem + env(safe-area-inset-bottom))` and
  `right: 1rem`, remains visually subordinate to analysis, and has a visible
  keyboard focus ring. Its clearance is verified at 1440×900, 1280×720,
  1024×768, and zoom-equivalent narrow layouts.
- Mobile (`<1024px`): no fixed floating control. The same entry is in a
  non-sticky global footer with safe-area padding, after page content, so it
  does not cover the rider sheet, browser controls, chart, Results, or Lap
  Detail. It remains reachable at 390×844 and 320×568 without page overflow.
- `/feedback` is a direct route with a clear return link. When entered from a
  race, the return target preserves the existing race URL query exactly; a
  direct visit returns to `/`. No overlay or history rewrite is introduced.
- The form has category, message, optional email, hidden honeypot, concise
  privacy disclosure, explicit sending text, inline errors, retry without
  clearing fields, and an announced success state. A successful send clears
  the temporary context snapshot and prevents resubmission; a failed send
  retains category, message, contact, and context.

### Validation, abuse, and environment behavior

The server accepts only `POST` with bounded JSON. It validates schema version,
category enum, non-whitespace message (1–4,000 characters), optional email
(max 254 and basic format), context key allowlist, ID lengths, max four fixed
riders, positive lap bounds, explicit enums, and viewport bounds of 240–10,000.
Unknown payload/context keys are rejected before provider invocation. A filled
honeypot is treated as an internal non-forwarded rejection with a generic
success-shaped response. The client disables submit while sending and never
automatically retries; manual retry is available. Provider/network/timeout /
malformed responses return the same generic retryable error without details.

`FEEDBACK_BASIN_ENDPOINT` is server-only and is configured separately for
Development, Preview, and Production. `NEXT_PUBLIC_APP_VERSION` is optional
public build metadata only; when absent, the package version is used. Missing
provider configuration does not fail build or page rendering; submit returns a
controlled failure. Production release additionally requires Basin Starter,
allowed-domain/basic spam filtering, 90-day form retention, and an operator
procedure for monthly export/deletion checks. Raw exports are temporary and
must be deleted within 90 days; only de-identified issue aggregates may remain.

### Acceptance criteria and validation

All UX3-1C AC1–AC21 in the user brief must pass. Required commands are
`npm.cmd test`, `npx.cmd tsc --noEmit`, `npm.cmd run lint`, `npm.cmd run build`,
and `git diff --check`, plus browser verification at the specified desktop and
mobile sizes, security/privacy/UX review, and production smoke when provider
configuration is available.

### UX3-1C specification audit resolutions

- This UX3-1C section is the active design entry. The older Phase 2 sections
  below remain historical records and are not an implementation gate for this
  task. Human Field Test remains `NOT YET EXECUTED`.
- Basin uses `FEEDBACK_BASIN_ENDPOINT`, a server-only environment variable.
  The adapter sends a `POST` with `application/x-www-form-urlencoded` body
  using the canonical field names `schemaVersion`, `category`, `message`,
  optional `contactEmail`, and `context` as one JSON string. It adds only an
  ephemeral `Idempotency-Key` header. A 2xx response is accepted; a JSON
  response with an explicit false `ok`/`success` flag or invalid JSON when
  JSON content type is declared is malformed. 408/425/429/5xx, timeout, and
  malformed responses are retryable; other 4xx responses are rejected.
- Missing `FEEDBACK_BASIN_ENDPOINT` returns a generic 503 retryable response
  in Development, Preview, and Production. It never fails build or page
  rendering. Preview and Production must use separate configured Basin
  endpoints; no environment silently sends to another environment.
- The canonical user-facing category values remain the slugs and Japanese
  labels fixed in `feedback-provider-decision.md`. No internal triage type or
  severity is inferred or added to the client payload; operators may map it
  later outside this intake contract.
- Validation trims message/email/IDs, rejects empty or control-only messages,
  preserves message text as text (no HTML/Markdown rewriting), and uses
  Unicode code-point counts for limits. Empty optional email is omitted. IDs
  accept only bounded ASCII identifier characters (`A-Z`, `a-z`, `0-9`, `.`,
  `_`, `:`, `-`). The client context builder drops invalid optional URL
  values; the server rejects malformed values. Unknown top-level or context
  keys are rejected with 400 before provider invocation.
- The transport honeypot is a top-level string field named `website`. It is
  visually off-screen, `aria-hidden`, unfocusable, and empty for normal users.
  A nonblank value returns the same generic accepted response without provider
  invocation or internal persistence. A non-string honeypot is invalid.
- No app-level IP/network rate-limit store is added because that would create
  a new tracking/persistence boundary. Abuse baseline is bounded JSON,
  validation, honeypot, client duplicate suppression, and Basin basic spam
  filtering/allowed-domain configuration. Optional deployment WAF/edge limits
  may be enabled separately and are not part of the feedback payload.
- The client creates an ephemeral UUID per form instance and sends it only as
  `Idempotency-Key`; the server/provider do not persist it and no strict
  cross-session dedupe is claimed. The form disables submit while sending and
  never automatically retries.
- Entry navigation stores a `sessionStorage` record under a fixed key with
  only canonical context plus a same-origin relative `returnTo` path carrying
  known URL keys (`season`, `series`, `category`, `rider`, `compare`,
  repeated `fixed`, `tab`, `lap`). Unknown query, fragment, raw UA, cookies,
  and arbitrary storage are not stored or forwarded. The feedback return
  control uses browser back when the snapshot came from the entry, preserving
  the race URL and browser history scroll; direct visits return to `/`.
  Snapshot data is cleared on successful submit or feedback-route departure.
- Validation errors focus the first invalid field in category → message →
  email order and associate each message with `aria-describedby`. Server/
  provider errors focus a route-local alert summary without moving focus to
  the application analysis workspace. Success replaces the form with a
  focusable live status and a return control; the form cannot resubmit.
- The global layout owns one compact desktop fixed entry and one mobile
  non-sticky footer row. The fixed control is visually subordinate and the
  wrapper provides bottom clearance; `/feedback` hides the entry so the form
  remains primary. Browser smoke is manual/agent-browser evidence with
  screenshots and console/DOM checks; no browser test dependency is added.
- Retention is operationally strict: Basin form retention is configured to
  90 days, exported raw copies are private temporary files deleted within 90
  days, and raw data is never kept longer for P0/P1. Only a de-identified
  issue key, minimal reproduction condition, category, severity, occurrence
  count, and decision note may remain until resolution +30 days and at most
  12 months. Production setup must record the Basin setting and monthly
  deletion review before release. Provider configuration remains a separate
  production gate from code completion.

## Closed design - Phase 2 Slice 8: data provenance and freshness metadata

### Goal

Make the origin and freshness of a displayed race result immediately
understandable without claiming that collector data is an official organizer
result. Use only the existing `RaceResult.updatedAt` and the stable public
collector repository path already implied by `DATA_BASE_URL`.

### Non-goals

- No upstream collector contract, `RaceResult` type, or data-fetch endpoint
  change.
- No invented official-result URL, officialness flag, event period, or result
  status. The viewer must not infer those values from race names or IDs.
- No new dependency, authentication, persistence, route, or deployment
  configuration.

### Product behavior

- `RaceHeader` shows a compact full-width metadata row below the existing
  title/category/count row: the collector data update time in JST, a link
  labeled `取得元データ (GitHub)`, and visible text stating that the display
  is not an official result.
- The timestamp is formatted from `race.updatedAt` using the fixed format
  `YYYY/MM/DD HH:mm JST` (zero-padded, no seconds) and an explicit Asia/Tokyo
  timezone. A string is accepted when the JavaScript date parser can produce
  a finite date; empty, whitespace-only, malformed, or otherwise unparseable
  values render `更新日時不明` and never throw.
- The source link targets the public collector file
  `https://github.com/tai1729/cyclocross-data-collector/blob/main/data/race-{raceId}.json`.
  The link is an external reference to collected source data, not an official
  organizer result link.
- The source link uses the same tab and the existing visible focus treatment;
  it is not opened in a new context. The metadata is explanatory text and a
  link, not color-only status. It wraps within the existing sticky header at
  320px/390px, keeps keyboard focus visible, and does not change the result
  table or analysis state.

### Architecture and data flow

`lib/raceMetadata.ts` owns the pure timestamp formatter and source URL builder.
It accepts untrusted runtime values, returns a safe display string or nullable
URL, and has no fetch or React dependency. `RaceHeader` calls these helpers for
the already validated `RaceResult`; `RaceViewer` and the data-source boundary
stay unchanged.

```text
RaceResult.updatedAt + raceId
  -> pure metadata helpers
  -> RaceHeader metadata row
  -> user can identify freshness and inspect collected source data
```

### Error and compatibility behavior

- The existing race name, category, rider count, finish/DNF count, sticky
  header, loading/error/not-found branches, and all chart semantics remain
  unchanged.
- Date parsing is total. The helper trims the input before parsing and uses the
  explicit Asia/Tokyo conversion; dates outside the supported parse range or
  malformed strings use the explicit unknown-time copy rather than a
  browser-local time. The upstream `RaceResult.updatedAt` type remains
  `string`; collector data is expected to use UTC ISO 8601, while offset-based
  and other parser-compatible values are handled safely.
- `raceId` is trimmed, then encoded as one URL path segment. Empty or
  whitespace-only IDs produce no source link; they do not create a malformed
  or guessed URL.
- Metadata is rendered only in the existing successful-race `RaceHeader`.
  Loading, network/http/invalid-data, not-found, and analysis-unavailable
  surfaces keep their existing behavior.
- The UI does not call the source link official and does not expose secrets or
  raw untrusted values as HTML.

### Acceptance criteria

1. A valid `updatedAt` is shown as `YYYY/MM/DD HH:mm JST`, converted from the
   input instant to Asia/Tokyo.
2. Invalid/empty `updatedAt` shows an explicit unknown state without throwing.
3. A valid race ID produces the exact collector GitHub source link with proper
   path-segment encoding; empty IDs do not produce a link.
4. The header visibly distinguishes collected data from an official result.
5. Existing race/result/analysis/error/not-found behavior is unchanged.
6. Metadata wraps and remains keyboard-usable at desktop and 320px/390px
   widths without page-level horizontal overflow. The existing title and
   category/count summary remain the first row, and the metadata occupies the
   next full-width row inside the sticky header.
7. Pure helper tests cover UTC, offset conversion, empty/whitespace,
   malformed/non-date values, and path-segment encoding. Browser smoke covers
   the normal metadata row, source-link target/focus, not-found preservation,
   and narrow-width wrapping; existing automated tests cover the other error
   branches.
8. Full required validation and independent review pass.

### Validation commands

- `npm.cmd test`
- `npx.cmd tsc --noEmit`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`
- Browser smoke for valid/invalid metadata, source-link target, not-found, and
  desktop/320px/390px header wrapping.

### Slice 8 specification audit resolutions

- `updatedAt` is treated as the collector-data update timestamp. The UI uses
  `データ更新` wording and never calls it the official result publication time.
  The exact display is zero-padded `YYYY/MM/DD HH:mm JST`, using `ja-JP`
  numeric parts and `Asia/Tokyo`; seconds and weekday are omitted.
- The helper trims a runtime value and accepts it when `new Date(value)` yields
  a finite instant. This accommodates the collector's UTC ISO 8601 sample and
  offset-based values without silently requiring a stricter upstream contract;
  empty, whitespace-only, malformed, non-date, or out-of-range values use
  `更新日時不明`.
- Because the upstream data has no official result URL or officialness field,
  the only link is the public collector GitHub file and the non-official note
  is always visible with the metadata row.
- Formatting uses `ja-JP` numeric parts with `Asia/Tokyo` and a fixed `JST`
  suffix; malformed values use `更新日時不明`. This avoids user-machine
  timezone drift while keeping the helper deterministic.
- The source URL accepts only a nonblank race ID after trimming and encodes it
  as one path segment. The visible link label is `取得元データ (GitHub)` and it
  uses same-tab navigation with no new-tab `target`; no raw query or arbitrary
  URL is accepted from the data.
- The existing `RaceHeader` first row keeps its two-column title and summary
  layout. The metadata is a full-width second row inside the sticky header and
  may wrap at narrow widths without horizontal overflow. It is rendered only
  after a successful race response, including when the successful race has an
  analysis-unavailable rider.
- The metadata row is owned by `RaceHeader`; no changes are made to fetching,
  route boundaries, table semantics, chart state, or upstream types. Unit
  tests provide invalid-input coverage; browser smoke verifies valid display,
  link href/focus, sticky visibility, not-found preservation, and 320px/390px
  wrapping.

## Current design - Phase 2 Slice 7: URL-synchronized filters and analysis state

### Goal

Make the list filters and race analysis state addressable by URL so browser
back/forward, reload, revisit, and sharing restore the same observable view.
The feature preserves the existing routes, data contracts, comparison limits,
sparse chart semantics, and error/not-found behavior.

### Non-goals

- No path or route migration, upstream collector contract change, export,
  persistence service, authentication, or new production dependency.
- No URL synchronization for transient hover state, rider-picker search text,
  focus, scroll position, or tooltip visibility.
- No change to ranking, lap validity, comparison reconciliation, chart
  formulas, data-fetch endpoints, or loading/error/not-found surfaces.

### URL contract

The URL uses readable query parameters and `URLSearchParams` encoding. Values
are omitted when they represent the default state.

Home (`/`):

- `season=<season>` selects a known season; omission means all seasons.
- `series=<series>` selects a known series within the selected season;
  omission means all series. A series without a matching selected season is
  invalid and falls back to all series.

Race (`/race/<meetId>`):

- `category=<raceId>` selects a category; omission means the first category in
  upstream `order` order.
- `rider=<riderId>` selects an existing rider in the loaded race; omission
  means no primary rider. A real rider with data-quality or no-checkpoint
  problems is retained so the existing unavailable analysis state remains
  visible.
- `compare=0|1|2|3|4|5|pinned|all` selects the existing comparison mode;
  omission means `2` (`+-2`). `all` is accepted only when the existing
  graphable-rider limit allows it; otherwise it falls back to `2`.
- `fixed=<riderId>` may occur repeatedly for pinned mode. IDs are deduplicated
  in first-seen order, limited to the existing four fixed-rider maximum, and
  filtered to graphable riders other than the primary. Fixed IDs are omitted
  from the canonical URL when the mode is not `pinned`.
- `tab=rank|gap|pace|lap` selects the chart tab; omission means `rank`.
- `lap=<positive integer>` pins a lap detail selection only when that number is
  present on the current race lap axis. Omission means the unpinned first-lap
  fallback. A lap is never inferred from a hover event.

Race links retain the current Home `season` and `series` values as optional
return-context query parameters with the same names. `RaceViewer` ignores
them for race state and uses them only for its back-to-list links. Direct race
visits without that context return to `/`. Home validates the context after
navigation.

Unknown query parameters are preserved when a known parameter is changed, so
future links are not destroyed. Known invalid or redundant values are removed
by canonicalization after the relevant data is available.

### State ownership and data flow

`lib/urlState.ts` is the pure parser, normalizer, serializer, and query-update
boundary. It owns allowlists, defaults, fixed-ID limits, positive-integer lap
parsing, and deterministic omission of default values. It does not fetch data
or render UI.

```text
URL query
  -> parse raw state
  -> normalize against meets/categories/riders/lap axis
  -> local UI state in MeetSelector/RaceViewer
  -> explicit interaction pushes a canonical query
  -> browser navigation reparses the query and restores the same state
```

`MeetSelector` initializes and reconciles season/series from the URL and
updates the URL for filter changes. Changing season clears series in both the
UI and query. Meet links carry the current list context.

`RaceViewer` owns durable race state and passes controlled tab/lap state and
callbacks into `ChartTabs`. Category selection is applied before the race
fetch; a category change clears rider, fixed IDs, tab, and lap and restores
comparison mode `2`, matching existing behavior. Rider/mode/fixed changes are
validated against the loaded race and existing comparison-hook rules before
being rendered or serialized. `ChartTabs` renders charts and forwards
hover/select/detail controls; it never writes the URL directly.

The URL is the external source of truth. An explicit user action uses
`router.push`, including deliberate lap selection/navigation, so back/forward
can restore meaningful states. Initial state and invalid-value canonicalization
use `router.replace`. Hover changes the visible detail lap only while
unpinned and never creates history entries or query churn.

### Normalization and compatibility behavior

- Parsing is total: malformed, unknown, duplicate, over-limit, or stale values
  never throw and always resolve to safe existing defaults.
- Category, rider, fixed ID, and lap validation happens after their respective
  data is loaded. Until then, the existing loading state remains authoritative.
- An invalid category uses the first ordered category and removes the invalid
  category value. An invalid rider is cleared. Invalid comparison modes, fixed
  IDs, tab values, and lap values are canonicalized using the defaults above.
- A category change resets analysis selection exactly as the current UI does.
  A primary rider change removes that rider from fixed IDs. Removing the last
  fixed rider keeps `compare=pinned` but renders the existing no-comparison
  state.
- Existing `useComparisonRiders` remains the final reconciliation boundary;
  URL normalization does not weaken graphability, all-mode, or fixed-rider
  limits.
- Existing data-load errors, invalid race data, empty categories, and
  not-found routes remain unchanged. URL state never masks an error or creates
  a second fetch contract.

### Responsive and accessibility behavior

The query controls use the existing Base UI controls and focus styles. No
URL-only state is required to understand the current view: season, series,
category, rider, comparison mode, active tab, and pinned lap remain visible in
their existing controls/panels. Existing 44px mobile targets, wrapping, and
320px/390px no-horizontal-overflow requirements remain acceptance criteria.

### Affected components and files

- New pure URL contract and tests: `lib/urlState.ts`,
  `tests/urlState.test.ts`.
- Home state and contextual links: `app/page.tsx`,
  `components/MeetSelector.tsx`.
- Race state and back links: `components/RaceViewer.tsx`.
- Controlled durable chart state: `components/ChartTabs.tsx`.
- Canonical product documents and closeout history: `docs/PRODUCT.md`,
  `docs/DESIGN.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/SPEC_AUDIT.md`, and a
  new dated history document.

### Acceptance criteria

1. Home season/series changes update the URL, clear series when season
   changes, and survive reload, revisit, and browser back/forward.
2. Meet links retain list context and the race list link restores that context
   without changing direct-visit behavior.
3. Race category, primary rider, comparison mode, repeated pinned IDs, active
   chart tab, and deliberate pinned lap are shareable and restored on reload.
4. Invalid, stale, duplicated, or over-limit query values fall back safely and
   are canonicalized without throwing or bypassing existing limits.
5. Browser back/forward restores meaningful in-page URL states, while hover
   does not create URL churn.
6. Existing normal, DNF, lapped, small, large, not-found, loading, error,
   sparse-data, keyboard-focus, and 320px/390px responsive behavior remains
   intact.
7. Pure URL parser/normalizer/serializer tests and the full required test,
   typecheck, lint, build, diff, browser smoke, and independent review checks
   pass.

### Validation commands

- `npm.cmd test`
- `npx.cmd tsc --noEmit`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`
- Browser smoke for URL changes, reload/share, back/forward, invalid values,
  normal/DNF/lapped/small/large/not-found routes, and 320px/390px widths.

### Slice 7 specification audit resolutions

The two independent auditors reviewed the canonical documents and current
source. The following decisions close the implementation-significant
questions they raised.

#### Hydration and validation timing

- Both client components read the current query synchronously with Next's
  `useSearchParams`; server pages keep their existing route/data boundaries.
  This avoids a hard-coded first render for a shared URL.
- Because `useSearchParams` can trigger a static-route client-render bailout,
  `app/page.tsx` and `app/race/[meetId]/page.tsx` wrap the query-reading client
  subtree in an explicit `Suspense` boundary with the existing loading-style
  fallback. The race page remains a server component and keeps its existing
  `notFound()` check.
- The meet server payload is sufficient to resolve the category before the
  first race fetch. An unknown category therefore selects the first ordered
  category and only that endpoint is fetched. The invalid category is removed
  with a `replace` after mount.
- Home applies raw season/series only after `meets.json` succeeds. It never
  rewrites the URL during loading or a meet-data error. Race-dependent fields
  are never canonicalized while the selected race is loading or in error.
- After a successful race response, rider/fixed/mode/tab/lap are normalized
  against that response and the current lap axis, then invalid known values
  are removed with one `replace` operation.
- During a category transition, old race-dependent analysis is hidden by the
  existing loading branch. The new URL is the target state: category resolves
  first, dependent state is reset while loading, and the loaded target race
  then hydrates only the target URL's valid dependent values. This applies to
  both browser navigation and direct URL changes; it prevents stale data flash
  without defeating back/forward restoration.

#### Exact transition table

Every explicit transition creates one `push` entry and preserves unrelated
known state, unknown query parameters, and valid return context unless the
table says otherwise:

| Action | Writes | Clears/resets |
| --- | --- | --- |
| Home season | `season` | `series` |
| Home series | `series` | nothing else |
| Race category | `category` | `rider`, `fixed`, `tab`, `lap`; `compare` becomes default `2` |
| Race primary rider | `rider` | the selected rider is removed from `fixed` in the same entry |
| Comparison mode | `compare` | `fixed` is removed when mode is not `pinned` |
| Fixed add/remove | repeated `fixed` | only the changed fixed ID |
| Chart tab | `tab` | nothing; a valid pinned `lap` is preserved |
| Deliberate lap select/previous/next | `lap` | nothing; clear removes `lap` |

The `pinned` mode with zero valid fixed IDs remains `compare=pinned` and keeps
the existing no-comparison UI. Automatic fixed-ID removal caused by primary
selection is part of that one primary-rider `push`, not a second entry. The UI
cannot push an invalid `all` transition; a stale URL `all` normalizes to the
omitted default comparison `2` when the graphable count exceeds the existing
limit. Duplicate fixed values are redundant rather than fatal: the first-seen
valid occurrence is retained, and only one canonical occurrence is emitted.

Known query keys are emitted in this order: `season`, `series`, `category`,
`rider`, `compare`, repeated `fixed`, `tab`, `lap`. Unknown key/value pairs are
copied in their original relative order after the known keys for every push or
replace. The pure serializer preserves repeated unknown pairs as well.

#### Rider, fixed, and lap eligibility

- `rider` is valid when its ID exists in the loaded race, regardless of
  `dataQuality` or checkpoint availability. This preserves the existing
  unavailable analysis surface. Fixed IDs are a separate allowlist: they must
  be graphable, non-primary, unique, and within the four fixed-rider maximum.
- `lap` is normalized solely against the loaded race's `getRaceLapNumbers`
  axis, even when no primary is selected or the selected rider is unavailable.
  A valid value is both the active and pinned lap. An invalid value is removed
  and becomes an unpinned first-axis lap; an empty axis removes `lap` and makes
  both active and pinned state `null`. No lap is restored from hover.
- A valid pinned lap can remain in the URL when analysis is unavailable; the
  existing unavailable state is rendered and no chart hydration is attempted.

#### Return context and malformed values

The back-to-list link uses only the first `season` and `series` values when
each present value matches the current meet (`season` may be absent, allowing
a global series filter). If either present value is stale or mismatched, it
links to `/`. It never carries race analysis keys or unknown keys. Home
performs its normal successful-data canonicalization after navigation.
`URLSearchParams` parsing is wrapped by total helpers: malformed/undecodable
query values are treated as absent and removed; malformed or nonexistent path
IDs continue to use the existing server not-found behavior.

#### Controlled chart boundary

`RaceViewer` owns `activeTab`, `activeLapNumber`, and `pinnedLapNumber` for the
URL-controlled view. `ChartTabs` receives them as controlled props plus
callbacks, while retaining its current chart hover/select/detail semantics.
Tab changes preserve a valid pinned lap. Hover updates an unpinned active lap
locally but does not invoke the URL writer. All controlled-state callbacks
accept only values on the current race axis, and race replacement resets the
state before the new race hydrates.

The pure URL API has separate raw parsing and data-aware normalization inputs:
raw parsing never requires loaded data and never throws; normalization accepts
immutable meet/category/rider/lap snapshots and returns a fully canonical
state only when the required snapshot is available. This keeps fetch/UI state
out of `lib/urlState.ts` and makes defaults, malformed values, and stale-data
behavior directly testable.

## Current active design — Phase 2 Slice 5

### Goal

Make the exact value at a selected lap available below the active chart so
mobile users do not have to rely on a transient pointer tooltip. The same
detail must be reachable by chart hover, chart tap, and keyboard controls at
320px/390px widths.

### Non-goals

- No URL state synchronization, export, official-result metadata, upstream
  contract change, chart-library replacement, or new production dependency.
- No interpolation, gap filling, synthetic primary data, or change to the
  existing chart formulas, line types, role styling, or error routes.
- No change to comparison selection, pinned limits, all-mode eligibility, or
  the existing desktop tooltip behavior.

### Product behavior

- `ChartTabs` owns the active lap detail state for all four tabs. The initial
  detail lap is the first race lap; switching tabs preserves the lap number
  when it is on the race axis and otherwise selects the first race lap.
- Hover updates the detail lap while the selection is not pinned. Clicking or
  tapping the chart pins that lap. Keyboard selection in the detail panel also
  pins it. A visible clear action releases the pin and returns to the current
  first race lap.
- A stable detail panel is rendered immediately below the active chart. It
  contains a native lap selector, previous/next lap controls, the selected lap
  label, and the exact measured values for the riders represented in the chart.
  Controls have visible focus and a minimum 44px target.
- The panel uses the existing semantic roles: rank uses valid checkpoints,
  lap uses valid timed laps, cumulative gap uses the existing checkpoint
  difference, and pace uses the existing timed-lap difference. Missing values
  are displayed as `未計測`; no value is estimated.
- Difference panels include the primary rider as the visible `±0` reference
  when its metric is valid and show comparison ranks only beside an emitted
  value. Rank and lap panels show the corresponding exact primary and
  comparison values. Role labels and text remain available even when color is
  unavailable.
- The existing Recharts tooltip remains for pointer inspection. The panel is
  the persistent/readable alternative and uses `min-h-[13rem]` plus a bounded
  internal value list so changing laps does not change its outer height for a
  given tab/mode. Crowded/all mode scrolls only that value list vertically and
  never introduces page-level horizontal overflow.

### Architecture and data flow

```text
race + primary + displayed riders
  -> active lap state in ChartTabs
  -> existing valid checkpoint/timed-lap maps
  -> pure chart-detail transform
  -> persistent ChartDetailPanel below the active chart
```

The four chart components receive the active lap and two callbacks: chart-level
hover/click events resolve only the Recharts active axis index/payload to a
lap in `raceLapNumbers`; events without a valid axis lap are ignored. Hover
updates the active lap only while unpinned, and chart click/tap pins the
currently resolved axis lap even if all rider values are missing. A vertical
active-lap marker is visual reinforcement only; the DOM detail panel and
controls are the accessible source of the value. The pure transform reuses
`getValidCheckpoints`/`getValidTimedLaps` and existing gap/pace signs.

The panel always renders the primary entry first. On gap/pace its value is a
display-only `±0` only when the primary metric is valid; otherwise it is
`未計測` and is never synthesized into the Recharts payload. Rank/lap show the
active chart's displayed riders in reconciled order; gap/pace show the primary
entry followed by the existing comparison series riders. Native select and
previous/next buttons are the complete keyboard path, with visible labels,
disabled edge states, and focus-visible styling; SVG points do not become
independent focus targets.

### Error and edge behavior

- The first race lap is exactly `raceLapNumbers[0]`. With no race lap axis,
  there is no selected lap; the panel shows an explicit unavailable state and
  disables lap navigation.
- With no comparison rider, gap and pace retain the existing empty chart
  state. The shared panel still exposes lap navigation when an axis exists,
  but its value area says `比較対象なし` and does not imply a zero comparison.
- DNF, lapped, duplicate, invalid, and post-end records follow the existing
  validity rules. A missing value is rendered as `未計測`; the existing status
  card remains authoritative for DNF/lapped interpretation and the panel does
  not invent a second status model.
- Long rider names and labels wrap within the panel. The panel remains
  readable at 320px and 390px and does not depend on hover or color alone.

### Affected components and acceptance criteria

- `lib/dataTransform.ts` and `tests/dataTransform.test.ts`: pure detail
  extraction with rank/metric validity and sparse semantics.
- `components/ChartTabs.tsx` and new `components/ChartDetailPanel.tsx`:
  shared active/pinned lap state, keyboard/touch controls, and stable panel.
- `components/RankBumpChart.tsx`, `GapChart.tsx`, `PaceChart.tsx`, and
  `LapTimeChart.tsx`: hover/click callbacks and active-lap marker only.
- `docs/PRODUCT.md`, `docs/IMPLEMENTATION_PLAN.md`, and
  `docs/SPEC_AUDIT.md`: current contract and closeout.

Acceptance requires: persistent exact detail for all four tabs; hover, tap,
and keyboard reach the same lap detail; missing values remain explicit;
keyboard focus and 44px controls are visible; 320px/390px layouts have no
page-level horizontal overflow; existing chart semantics and routes regress
not; tests, typecheck, lint, build, diff hygiene, browser smoke, and
independent review pass.

## Context and assumption

Phase 2 Slice 1 fixed comparison, Slice 2 role-based chart styling, and Slice
3 time-difference semantics are released on `main`. This change adds the
numeric lap-detail surface that Slice 3 intentionally deferred. The existing
chart, comparison, data-quality, and upstream JSON contracts remain the
baseline.

## Goal

Give the selected rider a precise numeric lap surface so the user can answer
which lap was fastest, what the typical measured lap time was, and where time
was lost to a selected comparison rider without estimating values from a chart.
The existing charts remain available and keep their Slice 3 semantics.

## Non-goals

- No URL state synchronization, official-result metadata, export, or new
  production dependency.
- No change to comparison selection, pinned limits, all-mode eligibility,
  route/error states, or the upstream JSON contract.
- No interpolation across missing laps, synthetic primary data, new ranking
  rules, or new source-data fields.

## Slice 4 product behavior

### Measured lap rows

- The table is built from the selected rider's `getValidTimedLaps` output.
  Each row represents one measured `lapNumber` and includes lap time,
  cumulative time, and `rankAtLap`.
- Rows are not created for missing, duplicated, non-finite, non-positive, or
  post-DNF lap times. The table is explicitly labeled as measured laps so a
  user is not led to believe that missing laps were reconstructed.
- For a DNF rider, the boundary is the greatest `lapNumber` in
  `getValidCheckpoints`; records that do not pass the existing checkpoint
  validation are outside the boundary and are ignored. There is no separate
  source field for a later DNF event, so Slice 4 does not invent one.
- The selected rider's status card remains authoritative for finished,
  lapped, DNF, and unavailable states. A DNF or lapped rider may still show
  the valid rows recorded before the status boundary.

### Compact statistics

- **Fastest lap** is the minimum valid timed lap. If tied, the earliest
  `lapNumber` is shown.
- **Average lap** is the arithmetic mean of all valid timed laps in the table;
  it is rounded only for display.
- In pinned mode, **maximum loss** is calculated per fixed rider at matching
  valid timed laps as `primary.lapTimeSec - fixed.lapTimeSec`. Only positive
  losses are eligible. The display identifies the fixed rider, lap, and
  elapsed loss. If no positive matching loss exists, the item is omitted.
  Ties prefer the earliest `lapNumber`; if tied on the same lap, prefer the
  fixed-rider order supplied to the table.
- Numeric rank presets and all mode show the selected rider's fastest/average
  values but do not add a wide per-rider comparison column. Comparison detail
  for those modes remains in the existing charts and tooltip.
- If the selected rider has valid checkpoints but no valid timed laps, the
  existing result/status card and charts remain available, while the new
  summary omits fastest/average values and the table shows an explicit
  "no valid measured laps" empty state.

### Comparison columns and signs

- Pinned mode adds one per-lap difference column per fixed rider, using the
  existing per-lap formula `fixed.lapTimeSec - primary.lapTimeSec`.
- A positive value means the fixed rider was slower on that lap; a negative
  value means the fixed rider was faster. A value is shown only when both
  riders have a valid timed record for that `lapNumber`.
- Columns are created for every currently reconciled fixed rider in the
  rendered comparison order, even when all cells are blank. Missing
  comparison values are left blank and never treated as zero. A short
  no-matching-laps note may accompany an entirely blank column.
- The maximum-loss summary uses the inverse perspective so positive loss means
  the selected primary actually lost time. Ties prefer the earliest
  `lapNumber`; if tied on the same lap, prefer the fixed-rider order supplied
  to the table.

### Numeric display contract

- Calculations and tie-breaking use the original finite seconds. Lap time,
  cumulative time, and average display use the existing `formatSecToClock`
  (`m:ss`, rounded to whole seconds only at render time).
- Per-lap deltas and maximum loss use the existing `formatGapSec` signed
  display (`+m:ss`, `-m:ss`, or `±ss`), also rounded only at render time.
  A displayed zero does not change candidate eligibility or the underlying
  raw calculation.

### Responsive and accessible presentation

- Desktop uses one accessible `role="table"` representation with lap,
  primary metrics, and optional fixed comparison columns. CSS changes the
  same rows into labeled compact grid rows at narrow widths: lap/time first,
  cumulative/rank second, and comparison deltas below. It is not duplicated
  into separate desktop/mobile content.
- No page-level horizontal overflow is introduced. Long rider names and
  comparison labels wrap. Numeric values use tabular figures and signs are
  accompanied by text labels, not color alone.
- The table and statistics are ordinary readable DOM content and do not rely
  on pointer-only chart tooltips. Existing focus-visible treatment and 44px
  major controls remain unchanged.

### Placement and integration

- `LapSummaryCard` appears in the left analysis column immediately after the
  existing `SummaryCard` and before comparison controls.
- `LapDetailTable` appears in the right analysis column above `ChartTabs`.
  On mobile the source order is controls/status, lap summary, comparison
  controls, lap table, then charts.
- The integration passes the currently reconciled selected rider and fixed
  rider objects. Stale or non-graphable pinned IDs are ignored by the
  existing comparison reconciliation and do not invalidate the primary
  table.

## Product behavior

### Chart vocabulary

- The existing `gap` tab is labeled **タイム差** and describes cumulative time
  difference at the end of each measured lap.
- The existing `pace` tab is labeled **周回差** and describes the difference
  in that lap's measured lap time. The implementation may retain internal
  identifiers for compatibility, but user-facing copy must use these meanings.
- Every difference chart states the reference and sign in visible supporting
  text: the selected rider is `±0`; positive means the comparison rider is
  behind/slower for the displayed metric, and negative means ahead/faster.

### Cumulative time difference

For a comparison rider and the selected primary rider at the same valid
`lapNumber`:

`comparison.cumulativeTimeSec - primary.cumulativeTimeSec`

The series uses valid checkpoints over the union of race lap numbers. A point
with only `lapNumber` is retained when the primary or comparison record is
missing; only the affected rider value is omitted. If the primary record is
missing, no comparison difference can be emitted for that lap. A zero
`ReferenceLine` remains the primary baseline. Positive values mean the
comparison rider has spent more cumulative time; negative values mean less.

### Per-lap difference

For the same `lapNumber`:

`comparison.lapTimeSec - primary.lapTimeSec`

Both records must pass the existing valid-timed-lap rule, including the
requirement for a valid preceding checkpoint except for lap 1. The union lap
axis is retained, but a rider value is emitted only when both the primary and
that rider have a valid timed record at that lap. Positive values mean the
comparison rider was slower on that lap; negative values mean faster. No value
is inferred when either lap is absent or invalid.

### Detail and tooltip

- Difference tooltips show the current metric value for each comparison rider
  represented in the chart payload and that rider's measured `rankAtLap` at the
  same lap. The primary is not synthesized into the difference payload or
  tooltip; its `±0` reference remains the visible baseline, while the rank
  chart remains the source for the primary's rank at that lap.
- Cumulative-gap rank maps use valid checkpoints. Per-lap-difference rank maps
  use valid timed laps. A rank is shown only alongside an emitted metric value,
  never as a rank-only or unavailable row.
- Context riders remain summarized at the hovered lap using the current
  role-aware count plus finite metric min/max; context ranks are not invented
  or aggregated across laps.
- Missing values are omitted. The selected primary remains represented by the
  zero reference line and is not synthesized into a difference payload.
- Rank chart behavior and lap chart values remain unchanged except for the
  shared, readable lap label and role treatment already delivered in Slice 2.

## Architecture and data flow

The existing pure transform boundary remains the source of numerical meaning.
The gap and pace builders receive the same race, primary ID, and displayed
comparison IDs, join by `lapNumber`, and return sparse chart points. The chart
components provide the shared tooltip with read-only maps of valid lap records
so it can show `rankAtLap` without recomputing or inventing data. The
cumulative chart uses checkpoint maps and the per-lap chart uses timed-lap
maps; the primary is not added to either difference payload.

```text
race + primary + displayed riders
  -> valid checkpoint/timed-lap maps keyed by lapNumber
  -> cumulative time-difference / per-lap-difference series
  -> GapChart / PaceChart with explicit sign copy
  -> role-aware metric + same-lap rank tooltip
```

The implementation may introduce semantic helper names such as
`buildCumulativeGapSeries` and `buildLapDeltaSeries`, but must preserve any
existing internal test/API compatibility needed by current consumers. No
external collector contract changes.

## Error and edge behavior

- A primary-only pinned selection keeps the existing no-comparison state for
  both difference charts.
- A primary with no valid checkpoints continues to use the existing analysis
  unavailable state.
- DNF riders use only measured same-lap points before their last checkpoint;
  their internal `finalPosition` is never presented as an official rank.
- Finished riders with fewer laps remain distinguishable as lapped; the
  difference charts do not turn missing later laps into a time gap.
- A missing primary checkpoint creates a sparse point, not a connected line or
  an inferred zero.
- Tooltip labels, long rider names, and sign explanations must wrap within the
  existing viewport-safe card at 320px/390px widths.

## Affected files

- `lib/dataTransform.ts`
- `tests/dataTransform.test.ts`
- `components/ChartTabs.tsx`
- `components/GapChart.tsx`
- `components/PaceChart.tsx`
- `components/RoleAwareTooltip.tsx`
- `components/LapDetailTable.tsx`
- `components/LapSummaryCard.tsx`
- `components/RaceViewer.tsx`
- `docs/PRODUCT.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/SPEC_AUDIT.md`

## Slice 3 baseline acceptance criteria

1. The two difference tabs have distinct Japanese labels and visible sign
   explanations tied to the selected rider.
2. Cumulative difference and per-lap difference use the exact same-lap,
   sparse-valid-data semantics above; existing `linear` lines and
   `connectNulls={false}` remain unchanged.
3. Difference tooltips show current metric values and same-lap ranks for
   comparison riders with emitted values, while the primary remains the zero
   reference and context remains a finite current-point summary.
4. Primary zero baselines remain visible and are not duplicated as synthetic
   chart payloads.
5. Numeric, pinned, all, DNF, lapped, missing-data, loading, error, and
   not-found behavior remains unchanged.
6. The explanations and tooltip remain usable at 320px/390px with visible
   focus and no page-level horizontal overflow.
7. Tests, typecheck, lint, production build, diff hygiene, browser smoke, and
   independent review pass.

## Validation commands

- `npm.cmd test`
- `npx.cmd tsc --noEmit`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`
- local browser smoke for numeric, pinned, all, DNF/lapped, and narrow layouts

## Baseline

Phase 1 production acceptance is recorded in
`docs/2026-09-05-phase-1-production-acceptance.md`. Phase 2 Slice 2 is
released on remote `main` before this change.

## Slice 4 acceptance criteria

1. A selected rider with valid timed laps receives a measured lap table with
   lap number, lap time, cumulative time, and same-lap rank.
2. Fastest lap and arithmetic average are derived only from valid timed laps;
   fastest-lap ties use the earliest lap and display rounding does not affect
   selection.
3. Pinned fixed riders receive sparse same-lap per-lap deltas with the Slice 3
   sign convention, and the maximum-loss summary identifies the fixed rider
   and lap using the inverse loss formula.
4. Missing, duplicate, invalid, DNF-tail, and unavailable data are omitted or
   represented by the existing status/error surfaces; no values are inferred.
5. Numeric/all modes avoid wide comparison columns while retaining selected
   rider statistics and existing chart behavior.
6. A selected rider with checkpoints but no valid timed laps receives an
   explicit empty lap-detail state and no misleading fastest/average values.
7. Desktop and 320px/390px layouts expose the same numeric information without
   page-level horizontal overflow; labels, signs, focus, and status are not
   conveyed by color alone.
8. Tests, typecheck, lint, production build, diff hygiene, browser smoke, and
   independent review pass.

## UX redesign audit v2 — preparatory design (2026-09-05)

This section records the design decision from the task-based UX audit. It is
documentation-only and does not authorize product-code changes in this
session. Detailed evidence, alternatives, implementation behavior, and the
specification audit are in:

- `docs/ux-task-test-v2.md`
- `docs/ux-redesign-options-v2.md`
- `docs/ux-redesign-spec-v2.md`
- `docs/ux-spec-audit-v2.md`

### Goal

Re-evaluate the information architecture from the perspective of a first-time
analysis user. After a rider is selected, the race/category/rider/comparison
context must become compact, the chart must become the primary analysis
surface, and repeated rider/comparison/metric changes must not move the user
to the page top.

### Non-goals

- No product-code, dependency, upstream JSON, route, data-transform, chart
  formula, or deployment change is part of this audit.
- No new analytics, user tracking, export, search, save, authentication, or
  official-result inference is proposed.
- Existing loading, error, not-found, DNF, lapped, sparse-data, and
  unavailable-analysis semantics remain authoritative.

### Resolved design

The recommended direction is an analysis workspace with two derived states:

- `browse`: category and full results are primary; no rider is selected.
- `analyze`: the existing `rider` URL state is present; a compact context bar,
  chart-first main area, and on-demand results/detail surfaces are primary.

The workspace has one page-level scroll container. On desktop (`>=1024px`), a
280–320px control rail sits beside the main area. On mobile, the current rider,
comparison mode, and metric remain in a sticky compact toolbar; rider and fixed
comparison lists open in bounded, focus-managed sheets/dialogs. The DOM order is
`context/status -> ChartTabs -> LapDetailTable -> optional full results` inside
the active workspace. The default chart remains the existing rank view.

Same-race rider, comparison, metric/tab, and lap actions preserve the workspace
anchor and the activating control focus. Category changes and new-route
navigation clear dependent state and may start at the page top. The existing
URL keys remain unchanged; the user-facing word “metric” maps to the existing
`tab` key.

### Architecture and data flow

```text
existing URL + race data
  -> derived browse/analyze workspace mode
  -> compact context + control surface
  -> existing comparison/dataTransform contracts
  -> ChartTabs (primary) -> LapDetailTable (supporting)
```

`RaceViewer` remains the owner of URL state, route intent, and loading
boundaries. `RiderSelector`, comparison controls, and `ChartTabs` remain
focused component boundaries. A future implementation must distinguish
same-analysis scroll-preserving navigation from category/new-route navigation;
CSS-only changes are insufficient to address the observed `router.push()` page
reset.

### Acceptance and validation boundary

The future implementation must satisfy the UX acceptance criteria in
`docs/ux-redesign-spec-v2.md`: no forced page-top reset for same-analysis
changes, chart/tab visibility in the target desktop viewport, compact active
configuration, repeated-analysis stability, visible context, 320px/390px
accessibility, and preservation of all existing data/error semantics. Required
validation remains tests, typecheck, lint, build, diff hygiene, browser smoke
at all four viewports, and independent review. At least three first-time users
should then repeat Tasks 1–5 before a broader rewrite is considered.

## UX2-1 implementation design — workspace state and scroll/focus contract

The active implementation slice is limited to the URL/state and interaction
foundation described in `docs/ux-redesign-spec-v2.md`. It does not begin the
chart-first, desktop, mobile, or disclosure redesign slices.

- `RaceViewer` remains the single owner of durable race state and classifies
  category changes as new-race navigation, while rider changes within analysis
  and comparison/metric/lap changes are same-workspace updates.
- Same-workspace URL changes use `router.push(href, { scroll: false })`;
  category/new-race changes use explicit normal navigation scroll; loaded
  canonicalization uses `router.replace(href, { scroll: false })`.
- No scroll position is added to the URL. Existing query keys, history entries,
  deep links, unknown query parameters, and data semantics remain unchanged.
- Popstate reconciliation preserves a valid native focus target without forcing
  page scroll. If the target is stale, the current visible tab/control receives
  focus with `preventScroll`; category transitions wait for the new race before
  focusing the category control.
- `RiderSelector` keeps its existing bounded-list selected-row positioning but
  returns focus to the stable compact trigger after an in-analysis selection.

This slice was verified by pure navigation/URL contract tests and a browser
matrix at 1440×900, 1280×720, 390×844, and 320×568 before the UX2-2 layout
work. The resolved UX2-2 design below preserves these contracts.

## UX2-2 implementation design — Desktop analysis workspace (resolved 2026-09-06)

UX2-1 is complete at `d467b08`. This bounded slice changes only the Desktop
active-analysis composition and keeps `RaceViewer` as the owner of URL state,
loading boundaries, and transition semantics.

### Goal and non-goals

- Goal: make context, metric controls, and the existing primary chart visible
  in the initial Desktop viewport while reducing active configuration density.
- In scope: active Desktop result disclosure, context bar, Desktop two-column
  workspace, compact selected-rider presentation, chart-before-lap-detail
  Desktop ordering, and bounded Desktop layout styles.
- Out of scope: UX2-3 Mobile workspace/sheets/compact header, UX2-4 disclosure
  redesign, UX2-5 final regression phase, chart/data formulas, URL keys,
  history semantics, upstream types, or status rules.

### Resolved structure

At `min-width: 1024px`, a valid selected rider derives `analyze` mode. The
existing full results table is wrapped once in a native disclosure and closed
by default; browse mode still shows the existing full table. The active
workspace then renders a compact text context bar followed by a grid with a
280–320px control rail and a flexible primary column. `ChartTabs` is first in
the primary column and `LapDetailTable` follows it. The current mobile DOM
ordering and full-results visibility remain unchanged below `1024px`.

The context bar is intentionally non-sticky in UX2-2 because `RaceHeader` is
already sticky and the initial collapsed-results layout meets chart visibility
without a second overlapping sticky layer. This avoids a new offset contract;
UX2-3 may introduce a measured mobile toolbar later.

### Component/data boundaries

- `RaceViewer`: derives active mode, controls the Desktop-only results
  disclosure and workspace ordering, and passes existing state/callbacks.
- `AnalysisContextBar`: presentation-only text context; it does not own URL or
  data state.
- `RiderSelector`: retains search, bounded list, keyboard labels, compact
  trigger, and UX2-1 focus behavior; entering analysis closes its browse list.
- `ChartTabs` and `LapDetailTable`: retain all data transforms and value
  semantics; only their Desktop visual placement changes.
- No new dependency, route, query key, scroll container, or data field.

### Acceptance and verification

- 1440×900: context + metric tabs + at least a readable chart plot frame are
  visible at initial analysis position with no additional scroll.
- 1280×720: full results and lap detail do not precede the visible chart;
  configuration is not the largest visual region.
- Same-workspace rider/comparison/metric actions preserve UX2-1 scroll/focus/
  URL behavior, including direct links and browser traversal.
- 390×844 and 320×568 keep the pre-UX2-3 mobile composition usable with no
  Desktop sidebar/disclosure leak or horizontal overflow.
- Run `npm.cmd test`, `npx.cmd tsc --noEmit`, `npm.cmd run lint`,
  `npm.cmd run build`, `git diff --check`, and CUA browser smoke.

### UX2-2 specification audit resolutions

The two independent auditors' questions are resolved as follows before code:

- `lg`/`min-width: 1024px` is the sole Desktop boundary. A responsive resize
  retains URL-derived analysis state and the local Desktop results-open
  preference; viewport detection is presentation-only and is not serialized.
- In active Desktop analysis, the results disclosure is placed after the
  workspace, with a native summary trigger and the existing results table
  rendered once inside it. Browse remains full-result-first; below 1024px the
  current full-result placement remains, so UX2-3 is not started.
- The Desktop reading order is context/status, `ChartTabs`,
  `LapDetailTable`, then the visually-left control rail, then optional
  results. CSS grid places the rail left without making configuration the
  first keyboard/screen-reader surface. The context bar carries the primary
  rider/status summary.
- The context always shows race/category/rider position-or-status/
  comparison mode-and-count/metric label. Long values wrap to two lines or,
  only when unavoidable in a compact trigger, use visible ellipsis plus a full
  accessible name.
- Existing results-table internal bounded scrolling is retained. No new page
  or workspace scroll container and no scroll restoration code is added.
- Browser acceptance measures at least 100px of chart plot frame plus the tab
  list at both 1440×900 and 1280×720 without sticky-header obstruction.
- Analysis-unavailable keeps its existing alert/context and omits chart/lap
  detail; only valid active analysis receives chart-first ordering.
- Native disclosure focus remains on its summary; keyboard result-row entry
  retains the UX2-1 heading focus path, and pointer entry does not add a new
  focus steal. Resize does not reset focus, URL, history, or local preference.
- The responsive results surface is structural, not a forced-open `<details>`:
  below `1024px` the Desktop disclosure/summary is not rendered at all and the
  existing full results table is rendered before the analysis workspace in the
  mobile reading order. At or above `1024px`, the same single table is rendered
  after the workspace inside the closed-by-default disclosure. Unmounting the
  mobile branch does not write the Desktop open preference, so a default-closed
  disclosure remains closed after a mobile round trip while an explicitly open
  one reopens on return to Desktop.
- The active analysis children also have an explicit responsive reading order:
  below `1024px` the control rail precedes `LapDetailTable`, which precedes
  `ChartTabs`; at or above `1024px`, `ChartTabs` precedes `LapDetailTable`,
  followed by the control rail. CSS grid only changes Desktop placement of the
  rail and does not rely on CSS order to define the Mobile reading order.
## UX2-3 implementation design — Mobile analysis workspace (resolved 2026-09-06)

UX2-1 and UX2-2 remain the state, URL/history, scroll, focus, and Desktop
presentation boundaries. This slice changes only the active presentation below
`1024px`; browse and Desktop behavior remain separate branches.

### Resolved Mobile structure

Browse keeps the full results table before the analysis entry and the existing
inline rider list. Active Mobile analysis uses this normative DOM and visual
order:

```text
compact context
  → compact rider trigger + comparison disclosure
  → ChartTabs (metric tabs and chart)
  → existing SummaryCard / LapSummaryCard
  → existing LapDetailTable
  → closed results details disclosure
```

The existing results table is rendered once. It is full and before analysis in
browse, and is inside a closed native `details` after the workspace in active
Mobile. Results and lap-detail content are not otherwise redesigned in UX2-3;
UX2-4 owns the later disclosure/content review.

### Rider and comparison controls

The selected rider is always shown in the compact context and a 44px trigger.
The trigger opens a native modal `<dialog>` styled as a bottom sheet. The
dialog uses `showModal()` and therefore makes the page inert and prevents body
scroll while open. Only its bounded rider list scrolls with
`overscroll-behavior: contain`; the sheet is capped at
`min(70dvh, 32rem)` and includes bottom safe-area padding. Search receives
focus on open, Escape/explicit close/backdrop click close the sheet, and the
opener regains focus with `preventScroll` after close. Selecting one rider
updates the existing URL once and closes the sheet. Search text resets on
close; reopening reveals the selected row within the internal list.

Comparison remains an inline native `details`, not a second modal. Its summary
always shows the current mode and count; all mode choices retain the existing
44px targets and URL writer. The disclosure stays open after a mode change so
the user can continue to the pinned-rider picker. Existing fixed IDs, all-mode
limits, and pinned semantics are unchanged. Removing a pinned row returns
focus to the comparison summary only if the removed control disappears.

### Metric, transient state, and navigation

The existing `ChartTabs` remains immediately after the Mobile action row. Its
tab semantics and four metric keys remain unchanged; at narrow widths the tab
strip may scroll internally, but the page never gains horizontal overflow.
Short visual labels may be used only when each tab retains its full accessible
name. Mobile sheet/disclosure open state is local only and never enters the
URL or browser history. Browser Back/Forward traverses the existing URL state;
any open Mobile sheet is closed when the URL key changes, then focus returns to
the current visible trigger when available.

Existing UX2-1 navigation options are retained: first result-row selection
enters the analysis region using its existing navigation behavior; in-analysis
rider, comparison, metric, and lap changes use `scroll: false`. Category/route
changes close transient Mobile UI through unmount/loading and preserve the
existing loading, error, not-found, DNF, lapped, missing-lap, and unavailable
branches. An unavailable rider keeps context and the existing alert but does
not render a chart or lap detail.

### Responsive and accessibility boundary

No additional sticky Mobile toolbar is introduced in UX2-3. The existing
`RaceHeader` remains the only sticky layer, avoiding an unmeasured offset and
preserving usable content at 320px. Resize/hydration changes presentation only;
durable URL state and Desktop disclosure preference are not changed. The
dialog has a labeled title, native modal semantics, visible close control,
Escape and backdrop handling, internal list scroll, and focus return. The
implementation must verify 390px/320px, long names, large lists, virtual
keyboard visibility, safe area, and no page-level overflow.

## UX2-4 implementation design — Results / Lap Detail / supporting information (resolved 2026-09-06)

UX2-4 is a bounded information-hierarchy slice after the UX2-1 state contract,
UX2-2 Desktop workspace, and UX2-3 Mobile workspace. It changes only the
presentation and disclosure state of supporting information. Results, lap
rows, chart calculations, URL keys, comparison eligibility, and AJOCC status
semantics remain unchanged.

### Information hierarchy

The active workspace classifies information as follows:

- **Primary**: race/category/rider/comparison/metric context, the active chart,
  and the existing chart detail panel.
- **Secondary**: selected-rider summary cards, Lap Detail, and the full Results
  table when a user is checking the field or choosing another rider.
- **Tertiary**: explanatory copy and secondary metadata already contained in the
  existing cards/tables. No tertiary data is removed; it remains inside the
  same supporting surfaces when opened.

Results serves both browse and analysis. Browse keeps the existing full table.
In active analysis, Results is an explicit, closed-by-default native `details`
surface with a visible count (`結果表を表示・N名`). The one existing table
remains bounded by its existing `max-h-[32rem] overflow-y-auto` region. The
selected rider remains findable through the existing row highlight,
`aria-pressed` action state, and `分析中` text. Selecting a different rider
from an open active Results surface is explicit navigation back to the
analysis workspace: the disclosure closes, the rider URL is updated through
the existing rider writer, and the workspace is focused/revealed without a
router top reset.

Lap Detail is secondary measured evidence for validating chart trends and
checking individual lap, rank, cumulative, delta, missing, DNF, and lapped
values. It is a native closed-by-default disclosure immediately after the
chart (and after the existing summary cards in the Mobile branch). Its
summary is specific (`ラップ詳細を表示・N周・選手名`, or an explicit no-valid-
measured-laps label). The existing `LapDetailTable` is rendered unchanged
inside the disclosure, so opening it does not remove information or alter
calculation semantics.

### Disclosure state and transitions

Results keeps its existing Desktop/Mobile local preferences. Lap Detail uses a
single local preference shared by the responsive presentation because it is
the same supporting surface; both preferences are initialized closed and are
not serialized. They remain stable across rider, comparison, metric, and lap
changes, and across a responsive resize. Leaving analysis (browse or category
transition) clears both preferences. Browser Back/Forward changes only the
URL-derived analysis state; it does not create, remove, or serialize a
disclosure preference unless the resulting state leaves analysis and the
existing component lifecycle resets it.

Native `summary` semantics provide `aria-expanded`, keyboard open/close, and
summary focus retention. No custom scroll restoration, timeout, `scrollTo`,
or new scroll container is introduced. Opening or closing either supporting
surface does not move the page to the top. Because both surfaces are after the
chart, their height change cannot move the primary chart; only content below
the active disclosure changes. A row selection from active Results is the
explicit navigation exception and may reveal the existing analysis region via
`scrollIntoView`, then focus a visible analysis control.

### Responsive and data boundaries

Desktop retains the UX2-2 chart top target and visual rail. Mobile retains the
UX2-3 rider modal, comparison disclosure, compact context, and chart-first
order. Both widths use the same semantic table content: the existing Results
bounded list and existing Lap Detail responsive labeled rows. No new page-level
horizontal overflow, pagination, virtualization, sticky layer, or production
dependency is introduced. DNF, lap-down, missing/duplicate lap, unavailable,
and no-valid-measured-lap states continue to be rendered by existing data and
status components; a compact summary never converts them into zeroes or new
status categories.

### UX2-4 implementation tasks

1. Add a presentation-only Lap Detail disclosure with an information-scented
   summary and controlled local open state; keep `LapDetailTable` as the sole
   data/table renderer.
2. Add count-bearing Results disclosure summaries and explicit active-result
   rider-selection return behavior without changing the centralized URL writer.
3. Reset/preserve local disclosure state according to the transition contract,
   and retain native focus/scroll semantics.
4. Add pure label/presentation tests and browser smoke for open/close, result-row
   selection, 320px/390px overflow, Desktop chart placement, and UX2-1/2/3
   regressions.

### UX2-4 acceptance additions

- Active initial analysis shows chart/context without the Lap Detail table or
  full Results table occupying the initial supporting area.
- Results and Lap Detail have discoverable labels, preserve all existing data,
  and work in both closed and open states at Desktop and Mobile widths.
- Disclosure open/close and same-workspace state changes do not force page top;
  explicit active-result rider selection returns to the chart workspace.
- Existing table semantics, DNF/lapped/missing values, URL/history, focus,
  44px controls, and horizontal-overflow protections remain intact.

## UX2-5 final validation contract (resolved 2026-09-06)

UX2-5 is a bounded release-readiness verification slice, not a new product
design phase. The public alias `https://ajocc-laptime-viewer.vercel.app/` is
the production acceptance target. A release-ready verdict requires the alias
to serve the tested commit or an artifact-equivalent deployment, all AC1–AC21
to pass, zero P0/P1 findings, required automated validation to pass, and
independent usability and technical review to pass.

The UX2-5 Task 1–7 definitions and AC1–AC21 in the task brief are the current
acceptance source. Fresh use means a clean browser session with no prior app
state. Existing UX2-4 disclosure resolution is authoritative: native
`details` open/close retains focus on its summary and does not programmatically
scroll to a heading. Durable URL state is restored by reload and history;
transient disclosure, focus, scroll, hover, and tooltip state are local.

Only P0/P1 regressions, accessibility/responsive/interaction failures, and
small low-risk blocking fixes may be implemented in this slice. Larger
improvements are backlog items for UX3. Exact viewport measurements that the
connected browser cannot provide must be reported as limitations and must not
be represented as invented evidence.

### UX2-5 human-authorized recovery resolution (2026-09-06)

The recovery is one bounded continuation of the existing UX2-5 task. The
previous `revision_cycles=4` and `max_revision_cycles=3` remain unchanged and
are preserved as failure history; an additive recovery-cycle record is used
instead of resetting either value. The recovery may complete documentation,
validation, one fresh technical review, commit/push, and the final production
smoke only. The technical review happens before commit/push; the public
post-push smoke is the separate AC21 artifact check. It may not start a new
redesign or speculative P2 polish.

The existing usability-first PASS may be reused because the product code is
unchanged and the final public smoke revalidates the integrated behavior. A
new technical reviewer PASS is still mandatory. AC8 remains PASS for the
established keyboard/focus contract; the observed first-entry pointer focus
handoff is explicitly a non-blocking P2 limitation and remains in the UX3
backlog.

AC21 requires all of the following to be recorded after the final commit:
the commit SHA and matching `origin/main` SHA, the production deployment ID,
URL, READY/production state, alias, deployment timestamp, and the required
post-push public smoke covering home/race/category/rider/chart, metric and
comparison changes, Results rider selection, Lap Detail open/close, a mobile
smoke, and a representative deep link.

Closeout is authorized on the current `main` branch by committing the
intended UX2-5 documentation files and pushing `main` to `origin/main` using
normal non-force Git operations.

## UX3-7 consolidated pre-release remediation design (resolved 2026-09-09)

UX3-7 is an implementation and release phase. It consolidates the Owner
Human first-use record `docs/user-testing/ux3-2-participant-post-test-qa-P-A-01.md`,
the Astra/Sol/Terra synthetic records, and the UX3-4/5/6 reports. External
Human pre-release participation remains an evidence limitation and is not a
release gate. Post-release real-user feedback remains required and is not
claimed complete by this phase.

### Goal and non-goals

The goal is to make the existing race-to-analysis flow self-explanatory on a
fresh visit: race context → result/rider → primary chart → comparison →
detailed investigation. The implementation is limited to evidence-backed,
low-risk presentation and discoverability changes.

The phase does not change upstream types, data transforms, chart metric
semantics, step/linear rendering, URL key names, comparison limits, browser
history rules, error boundaries, or production dependencies. It does not add
an event-code search, change DNF/lap-down definitions, delete the selected-lap
detail surface, or add a second sticky toolbar.

### Consolidated decisions

- **IMPLEMENT NOW:** P-A-01 initial-analysis discovery; MR-04 terminology
  scent; MR-05 rider/comparison affordance; the bounded MR-06 chart-visibility
  portion; the bounded MR-07 selected-lap explanation; and the MR-10
  explanatory portion already represented by MR-02.
- **MERGED:** MR-01 remains the shared comparison-identity root cause for
  line/name/legend confusion; MR-02/MR-03 remain the shared metric semantics
  root cause. MR-10 does not authorize a new status definition.
- **ALREADY RESOLVED:** MR-01, MR-02, and MR-03's original UX3-5 changes are
  retained and extended only where the P-A-01 evidence identifies a local
  discoverability gap. POS-01–POS-05 remain regression protections.
- **DEFER WITH SPECIFIC REASON:** MR-08 because changing history semantics
  would conflict with the established URL contract and evidence is divided;
  MR-09 because a search/route feature is not supported by corroborated task
  evidence; MR-11 because it is an evidence gap, not a product defect; and
  MR-12 because a new sticky layer or broad navigation rewrite has higher
  regression risk than the evidence justifies.

### Product behavior

After race data and the normalized category state load, and only when the raw
URL has no `rider` query parameter, the viewer selects the first graphable
rider by the existing displayed result order: ascending numeric
`finalPosition` with stable source order for ties, then the first rider with
`dataQuality === "ok"` and at least one valid checkpoint. A graphable DNF or
lapped rider is eligible because existing status semantics remain authoritative.
The update uses `updateRaceUrlQuery` plus `router.replace(..., { scroll: false
})`, preserves all existing and unknown query parameters, and does not create a
history entry or transfer focus. An explicit valid, stale, or non-graphable
`rider` query remains authoritative under the existing normalization and
unavailable behavior; it is never overwritten by the fresh-entry default. If
no graphable rider exists, the existing unavailable/browse-safe state remains.

The active workspace makes the selected rider a named “注目選手” control and
the comparison control a named “比較する選手” surface. The context summary
includes the selected rider, comparison mode/count, and a compact comparison
name summary: every pinned name, or up to four names followed by `ほかN名` for
a larger numeric set. The chart uses exactly one accessible static line key for
every active metric, with role/name text and deterministic per-rider
line-style/weight markers that do not rely on color; the same dash pattern and
marker shape are rendered by each chart series and its key entry. Fixed riders
support the maximum four pinned riders and numeric context riders support the
maximum ten context riders exposed by `±5` without pattern/marker collisions;
duplicated Recharts legends are removed. For a large “全員”
set, the key may use a bounded aggregate line-count summary while retaining
the existing graph data. The selected-lap panel explains that clicking a chart
point or choosing a lap fixes the per-rider values, while hover remains a
temporary preview. Existing tooltip, detail, sparse-data, and status semantics
remain authoritative.

For this marker contract, “distinct” means that dash patterns and marker shapes
are each independently unique within the supported role cardinality (four fixed
and ten numeric-context riders), not merely unique as combined pairs. Fixed
styles follow the first-seen active fixed-rider ID order; context styles follow
the displayed rider order after primary/fixed classification. The existing
`全員` mode remains limited by the current graphable-rider rule, so the ten-style
contract covers every supported numeric context set and no supported series
cycles an assignment. All normal and active chart dots render the assigned
marker, including crowded mode; crowded context markers use the smaller dot
size already reserved for context rather than being suppressed. The key uses
the same marker mapping and dash values, with an SVG glyph for the marker so
the non-color identity is visually consistent.
The primary rider keeps its dedicated solid `circle` style and does not consume
fixed or context assignment capacity.

The four chart frames and the no-comparison frame use `h-72` on narrow
screens, `sm:h-[22rem]`, and `lg:h-[30rem]`. This is a bounded increase for
P-A-01 chart visibility, not a full-screen chart rewrite; controls and
supporting details remain in the existing flow. No fixed-width element,
page-level horizontal overflow, or additional sticky layer is introduced. All
existing 44px mobile targets, native tabs, disclosures, dialog behavior, and
visible focus styles remain required.

### Affected components and data flow

`RaceViewer` owns the default-rider selection and passes derived rider names
to `AnalysisContextBar`. `RiderSelector`, `ComparisonAdjuster`, and
`ComparisonRiderPicker` own only presentation labels and affordances.
`ChartTabs` owns the static key and selected-lap explanatory copy; the four
chart components keep their existing data and tooltip inputs while dropping
the duplicated built-in legend. `lib/urlState`, `lib/dataTransform`, and
`lib/types` are not changed.

### Edge cases and error behavior

Malformed, stale, unavailable, DNF, lapped, duplicate, missing, and no-lap
records retain existing handling. Auto-selection is skipped when loading,
error, empty, or no graphable riders apply, and it never overwrites an
explicit valid URL rider. Category changes continue to clear rider,
comparison, tab, and lap state before the next category loads.

### Acceptance criteria

1. Fresh race entry reaches a visible, labeled primary analysis chart for the
   first graphable result rider without adding browser history.
2. The selected rider, comparison mode/count, and comparison identity are
   readable without relying on color alone; changing rider, comparison mode,
   fixed riders, metrics, and laps still works.
3. Every chart tab exposes one non-duplicated accessible line key; role/name
   mapping remains available for crowded and non-crowded views.
4. Selected-lap detail explains its action/result relationship and retains
   measured-only semantics.
5. Chart visibility improves at 1440×900, 1280×720, 1024×768 where available,
   and at 390×844/320px class without clipping or horizontal overflow.
6. POS-01–POS-05 and MR-01–MR-03 semantics do not regress; deep link, reload,
   back/forward, disclosure, keyboard, and error/retry behavior remain valid.
7. `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, and
   `git diff --check` pass before review.

## UX3-7R Owner Review Remediation REDO

Status: DESIGN — Owner Human remediation effectiveness is the acceptance gate

### Goal

Rework the analysis page around the original P-A-01 Owner Human evidence so
that the released screen visibly communicates the sequence `race context ->
result/rider -> primary chart -> comparison -> detail`. The remediation is
successful only when same-state Before/After screenshots and an independent
fresh visual review show that the original complaints no longer materially
apply.

The prior UX3-7 implementation is historical evidence, not an acceptance
shortcut. It changed labels, chart keys, markers, chart height, and initial
rider selection, but retained the macro page structure that placed a large
header/context stack and a desktop side rail before/alongside the chart. The
redo therefore targets information architecture and visual priority rather
than adding another explanatory label.

### Non-goals

- No data contract, collector, metric formula, URL key, browser history,
  DNF/lap-down semantics, or result status meaning changes.
- No unrelated feature, event-search product expansion, dependency addition,
  or full application rewrite.
- No deletion or modification of the prior UX3-7 report or its historical
  verdict.
- No claim that External Human validation is complete.

### Approved redesign

1. Keep the race/category context compact and visually distinct at the top.
2. When analysis is active, place a compact analysis identity/control deck
   before the chart. It must show the current rider, an explicit change
   action, comparison mode, and visible `X vs Y` identity when comparisons
   exist. Existing rider selection and comparison mechanics remain the
   source of truth.
3. Make the chart the primary full-width surface on desktop and mobile. Put
   metric tabs and the role/name series key adjacent to the chart surface;
   keep the chart's measured plot area large enough to be the dominant visual
   element at 1440x900 and 1280x720.
4. Move summary/supporting information below the primary chart on desktop as
   well as mobile. Keep lap detail and results disclosures reachable below the
   chart, but expose a prominent, plain-language Results action in the race
   context/analysis flow so the result table is discoverable without scanning
   to the page bottom.
5. Keep the existing result table as the authoritative selection surface and
   preserve the existing disclosure, URL, focus, and back/forward behavior.
6. Reduce decorative/container whitespace and repeated labels, but retain
   enough grouping, focus rings, and 44px-class mobile targets for access.

### Visual direction

Use the existing timing-board palette and type system. The distinctive visual
device is a compact race-analysis header with an explicit `MAIN RIDER` /
`COMPARISON` relationship, followed by one large chart stage. Supporting cards
are quieter and lower on the page. This is intentionally a hierarchy change,
not a cosmetic theme change.

### Affected components

- `components/RaceViewer.tsx`: restructure active-analysis order and results
  placement without changing state transitions.
- `components/AnalysisContextBar.tsx`: make the current rider/comparison
  relationship a concise analysis identity surface.
- `components/RiderSelector.tsx`, `components/ComparisonAdjuster.tsx`, and
  `components/ComparisonRiderPicker.tsx`: preserve mechanics while fitting
  them into the new control deck and improving action/result grouping.
- `components/ChartTabs.tsx`: ensure chart stage, tabs, key, and interaction
  guidance are visually adjacent and not pushed below the viewport.
- `components/RaceHeader.tsx` and results disclosure markup: compact race
  context and make Results discoverable in the primary flow.
- Focused tests and the UX3-7R report/evidence only.

### Acceptance criteria

1. On a fresh race entry, the primary chart is visible without an opaque
   empty-analysis step; deep links with an explicit rider remain authoritative.
2. At the top of active analysis, a first-use reviewer can answer without
   exploration: which race, which rider, where to change rider, who is being
   compared, which metric, and which surface is the main chart.
3. The chart is a full-width primary surface with visibly reduced preceding
   whitespace and supporting content below it. The chart key/line identity is
   adjacent and readable, not separated below the viewport.
4. Results are discoverable from the primary flow; selecting a result still
   changes the analysis rider and retains the existing URL/history contract.
5. Comparison add/change/remove controls visibly connect to the `who vs who`
   state. The line key remains text-based and marker/dash-compatible with all
   chart series.
6. P-A-01 negative/improvement records are assessed individually as
   `CLEARLY CHANGED`, `PARTIALLY CHANGED`, or `NO MATERIAL CHANGE`; only the
   first category can pass.
7. Same-state screenshots exist and are visually inspected at 1440x900,
   1280x720, 390x844, and 320x568. No horizontal overflow, clipping, hidden
   fixed content, or broken focus semantics is accepted.
8. MR-01–MR-03, POS-01–POS-05, all functional flows, and current automated
   behavior remain green.

### Validation commands

- `npm test`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `git diff --check`
- Exact viewport browser capture/review using Playwright or an equivalent
  Chromium context plus Production smoke after deployment.

### UX3-7R resolved layout and evidence decisions

- Active desktop DOM order is: compact race context (back/category/race
  metadata plus a visible `リザルトを表示` action) → analysis identity/control
  deck → full-width chart stage → lap detail/summary support → Results
  disclosure/table. There is no persistent desktop control rail beside the
  chart. The existing rider and comparison controls move into the deck; their
  callbacks and state ownership do not move out of `RaceViewer`.
- Active mobile DOM order is the same conceptual order. The primary rider
  summary and comparison summary remain visible; detailed rider picker,
  comparison mode options, and pinned-rider search may remain disclosures or
  dialogs. Metric tabs stay attached to the chart. The chart is the first
  large content surface after the deck. No fixed control layer may cover it.
- The Results action is visible in the initial active-analysis flow and opens
  the existing closed disclosure/table. It is not a second results table and
  does not add a URL key. Results selection remains authoritative; selecting a
  row closes the disclosure as today, preserves the existing navigation method,
  and focuses/scrolls the analysis region according to the current
  `RaceViewer` behavior.
- `X vs Y` is implemented as a mode-aware identity sentence: the primary
  rider is always named first; one comparison is named directly; multiple
  comparisons use the first two names plus a bounded count; `全員` and no
  comparison use explicit mode wording. The full role/name series key remains
  the authoritative mapping for every line.
- The series key is adjacent to the chart inside the chart stage, immediately
  after the plot and before interaction/detail content. It may wrap, but must
  not be clipped or create page overflow. The key is included in the visual
  inspection boundary; it is not counted as plot height.
- For Before/After evidence, all four viewports use the same Production URL,
  race/category/rider/metric/comparison/lap state. Before is the released
  UX3-7 alias/deployment and After is the resulting implementation. The
  required state is an explicit rider deep link with default `±2` comparison,
  rank tab, and no pinned lap; a second crowded comparison capture may be
  added for line identity.
- Exact screenshot evidence is a hard UX3-7R acceptance gate. Each viewport
  is reviewed for chart bounds/prominence, preceding whitespace, Results
  action, rider/comparison identity, key wrapping, overflow/clipping, and
  visible focus where interacted. DOM/test evidence alone cannot mark an
  Owner finding CLEARLY CHANGED.
- P-A-01 `NR`, `N/A`, and positive-only answers are documented for traceability
  but are not negative-finding pass/fail records. Negative/improvement answers
  with a concrete complaint are individually tracked; grouped root causes
  may share one implementation only when every source QA remains listed.
- `PARTIALLY CHANGED` and `NO MATERIAL CHANGE` are unresolved Owner findings.
  If either remains for a major complaint, the final verdict is NEEDS
  REVISION even when automated tests and synthetic reviewers pass.

## UX3-7R2 Final Owner Acceptance Closure (active, 2026-09-10)

This section is the current design entry for closing the remaining UX3-7R
Owner findings. The historical UX3-7R report remains immutable. The primary
source is `docs/user-testing/ux3-2-participant-post-test-qa-P-A-01.md`; the
starting classification and prior evidence are recorded in
`docs/user-testing/ux3-7r-owner-review-remediation-redo.md`.

### Goal and non-goals

Close the eight individually tracked remaining complaint units: Q12, Q69,
Q22, Q45, Q68, the two distinct Q27 complaints, and the residual Q03
`stepAfter` meaning complaint. Preserve the UX3-7R macro layout and MR/POS
contracts. Do not rewrite the collector, add a database/account system, add a
production dependency, change URL meanings, or replace measured step charts
with linear interpolation.

### Series option order (UX3-7R2 revision 1)

The Home `MeetSelector` keeps season filtering and the raw series values used
by URL state, but renders the unique series options in a deterministic
north-to-south order. `全日本` is first; the known order is `東北`, `関東`,
`宇都宮`, `前橋`, `野田`, `千葉`, `東京`, `湘南`, `富山`, `信州`, `東海`,
`関西`, `中国`, `もみじ`, `山口`, `四国`, `九州`. `もみじ` is grouped with
the 中国 region. Any future or otherwise unknown series remains selectable and
is placed after the known values using deterministic code-point ordering.
Changing the season still rebuilds the options from that season's meets, and
URL values are not renamed or rewritten.

### Navigation closure

`RaceHeader` remains the only sticky layer. The existing return-to-list action
and category selector move into that header's compact context rows. The link
keeps the existing season/series return query and the selector keeps the
existing category URL/history reset behavior. Race title, category, results
action, and provenance remain visible with the existing narrow-screen
omission/wrapping rules. No second fixed toolbar is introduced.

### Rider-first discovery closure

The home page gains a labeled `選手から探す` surface. A new
`/api/riders/search?q=...` Route Handler uses only the existing `meets.json`
and `data/race-{raceId}.json` source. The server builds a bounded in-memory
TTL index per warm runtime, fetching unique category files with bounded
concurrency and the existing race validation boundary. Search is opt-in after
at least two normalized characters and matches name or rider ID. Matches are
grouped by rider and expose direct meet/category/rider links, limited to a
readable result count. An incomplete scan or source failure is returned as an
explicit warning; an empty result never claims that the rider does not exist.
No new upstream contract or persistent search infrastructure is required.

### Feedback and chart meaning closure

The feedback action remains anonymous and context-preserving, but its entry is
made a visible, labeled page-level utility action at the start of the current
page rather than relying on a desktop corner control or mobile footer alone.
It is not sticky and does not cover analysis content. The rank reading guide
adds one concise sentence explaining that `stepAfter` shows measured rank at
each completed lap as a step, without estimating values between checkpoints.
All existing chart data semantics stay unchanged.

### Acceptance and validation

The final report is `docs/user-testing/ux3-7r2-final-owner-acceptance-closure.md`
and new evidence is stored under `docs/user-testing/evidence/ux3-7r2/`.
Acceptance requires all 38 P-A-01 finding units to be `CLEARLY CHANGED` or a
genuinely architecture-erased `NOT APPLICABLE`, with no `NO MATERIAL CHANGE`,
no release-blocking S2, MR-01–03/POS-01–05 PASS, four exact viewports PASS,
automated checks PASS, the full functional flow PASS, and independent fresh
Astra/Sol/Terra PASS before commit, push, Production deployment, and smoke.

### Audit resolutions and concrete contracts

The eight remaining units are tracked individually even where one design
closes several of them: (1) Q12 list/category context while scrolling, (2) Q69
return-to-list visibility while scrolling, (3) Q22 unknown-meet rider
discovery, (4) Q45 result-table search burden, (5) Q68 unknown-category rider
discovery, (6) Q27-A category control affordance, (7) Q27-B feedback entry
discoverability, and (8) Q03 residual rank-step meaning. Q03's initial-chart
sub-complaint and Q27-A may be recorded as already clearly changed only when
the final matrix and screenshots show the source dissatisfaction is gone.

The sticky context is the existing `RaceHeader` only. It contains one compact
navigation row with the normal link to `listHref` and one category selector row.
The race title/count/results/provenance content remains in the normal flow
immediately below that compact sticky bar so Mobile is not dominated by a
large sticky header. `listHref` is
`/` with only valid `season` and `series` return filters; a direct race link
without context returns to `/`. It does not use browser-back semantics and does
not preserve transient race analysis parameters. The category selector keeps
the current `router.push` reset of rider/comparison/tab/lap. At 320px and
390px, long text wraps, metadata already hidden by the current breakpoint stays
hidden, all actions keep a 44px target, and the header remains the only sticky
layer. Evidence must show the header does not cover the chart or focused
controls after scrolling.

The rider discovery response is a JSON contract:

```ts
type RiderDiscoveryResponse = {
  status: "complete" | "partial";
  query: string;
  results: RiderDiscoveryMatch[];
  scannedSources: number;
  failedSources: number;
  totalSources: number;
  warning?: "source-scan-incomplete";
};

type RiderDiscoveryMatch = {
  riderId: string;
  name: string;
  dataQuality: "ok" | "error";
  totalAppearances: number;
  appearances: Array<{
    meetId: string;
    meetName: string;
    meetDate: string;
    season: string;
    series: string;
    raceId: string;
    categoryId: string;
    categoryName: string;
  }>;
};

The response never embeds a prebuilt URL. The client builds a link from these
validated fields using the existing URL encoding/serialization rules, including
`category`, `rider`, and the season/series return context.
```

`GET /api/riders/search?q=...` returns 400 with
`{ error: "query-too-short", retryable: false }` when the normalized query
has fewer than two Unicode code points, 200 with `status: "complete"` for a
full scan, 200 with `status: "partial"` and a visible warning for mixed source
success/failure or the 20-second scan budget, and 503 with
`{ error: "source-unavailable", retryable: true }` only when no source can be
loaded. Responses send `Cache-Control: no-store`; successful race data is
reused only by the warm-runtime index cache. The index TTL is 10 minutes, the
race loader concurrency is 24, the scan budget is 20 seconds, the result limit
is 20 riders, and each rider returns at most six newest appearances. Partial
indexes are not retained as complete cache entries. A retry starts a new scan.

The index deduplicates source files by `raceId`, orders source metadata by
`meetDate` descending then category order, groups strictly by `riderId`, and
keeps different IDs separate even when normalized names match. It indexes both
`dataQuality: "ok"` and `"error"` riders because the existing race route is
authoritative and already explains analysis-unavailable data. A direct result
link is allowed only for a source whose `raceId` and category match the
corresponding `meets.json` entry and whose race payload passes the existing
shape validation. The destination uses `/race/{meetId}?category={raceId}&rider={riderId}`
plus the existing season/series return context. The race route revalidates
everything; stale links use its existing not-found/error states.

The search UI is idle until submit, requires at least two normalized characters,
uses one labeled input and one 44px button, shows loading/complete/partial/
empty/error states, wraps names and locations without horizontal overflow, and
does not fetch discovery data on initial home load. The user can retry a
partial or 503 response. The feedback action has exactly one rendered entry per
page: a non-sticky labeled utility action at the beginning of the page content;
the old fixed desktop corner and mobile-only footer variants are removed. It
uses the existing snapshot/context and returns to the current path/query after
cancel or successful submission; search text is not added to the feedback
payload. The rank reading guide uses this canonical wording: `各周回終了時点の実測
順位を階段状で示します。線の途中の順位を推定していません。` It is visible
on the rank tab and included in its figure description; no loading/empty chart
is required to show it.

For the dirty worktree, the baseline is the status captured before UX3-7R2
implementation. Existing UX3-7 files that this task must extend may be staged
only as their intended hunks, together with new UX3-7R2 code/tests/report/
evidence. `docs/feedback/feedback-production-activation-report.md`,
`test-results/`, and unrelated UX3-2 input records remain unstaged unless a
new diff proves they are required by this task. No existing user change is
 discarded or reverted.

## UX3-7R3 mandatory owner remediation (active change)

### Goal and source of truth

UX3-7R3 fixes all 16 issues reported by Owner Human after Production
inspection. The Owner issue list is the primary acceptance source for this
change; earlier synthetic reviews cannot downgrade an Owner finding. UX3-8 is
not part of this change and must remain `NOT STARTED`.

The initial design audit confirmed that `docs/inputs/` contains no eligible
`.md`/`.txt` input documents. The active specification is therefore this
section, the user-provided UX3-7R3 issue list, the existing product contract,
and the source files named in `docs/IMPLEMENTATION_PLAN.md`.

### Non-goals and compatibility

- Do not redesign the application outside the 16 tracked issues.
- Keep `/`, `/race/[meetId]`, query-state keys, upstream rider/race contracts,
  existing error states, DNF/lap-down semantics, and keyboard/focus behavior.
- Do not add a production dependency, scrape from the viewer, or add a race-ID
  exception for B-02/B-03.
- Preserve unrelated dirty worktree changes; only intended UX3-7R3 hunks may
  be staged.

### Interaction and layout design

The four relevant disclosures (selected lap, lap detail, results, and
comparison riders) use one shared `Disclosure` component. It is a native
`details`/`summary` control with a 44px-class summary target, a visible
ChevronDown/ChevronUp state, synchronized `aria-expanded` and `aria-controls`,
keyboard activation, visible focus, and one continuous bordered container.
When open, the summary receives the separator border and the content remains
inside the same container; closed and open states do not create nested or
double boxes. Mobile comparison uses the same component and interaction
language. Selected fixed comparison riders use a stronger background, border,
and an explicit selected/check label; hover and focus remain distinct.

The home rider search uses a flex row at desktop breakpoints with equal-height
controls, `items-end` alignment, and no negative or compensating margins.
The analysis rider selector puts the up/down controls in the same row as the
selected rider control and aligns their control bottoms/centers without
shrinking the arrow hit areas. The obsolete results-skip action and chart
identity title are removed while accessible chart labels remain. Lap detail
and results tables have no internal max-height/vertical scrolling; the page
document flow owns scrolling.

### URL state and mobile scroll design

Season and series are independent query filters. A season update preserves the
current series patch and lets canonicalization remove it only when it is not a
valid option for the new season. A series update never clears season. All home
query `push` and canonicalization `replace` calls use the App Router
`scroll: false` contract, preserving the current scroll position while keeping
browser history, reload, and back/forward URL state intact. This is one shared
route behavior, not a mobile-only branch.

### Race lap source of truth

The collector (`C:\Users\tai\projects\02_ajocc-data-collector`) adds the
optional `raceLapNumbers` field from the official race's `距離・周回数` metadata
and numbered lap-table header. The viewer validates and prefers this official
complete sequence; old payloads without the field retain a safe fallback that
unions valid measured checkpoint numbers.
The viewer never appends a synthetic rider checkpoint and never maps a race by
ID. This preserves a race's full official lap sequence when a DNF or lap-down
rider has fewer records, including sequences that start at lap 2. The specific
official cross-checks are `data.cyclocross.jp/race/27834` (11 laps),
`data.cyclocross.jp/race/27770` (11 laps), and
`data.cyclocross.jp/race/27160` (8 laps).

Gap-series construction treats a finite zero gap as a measured value and only
omits absent/invalid checkpoints. A zero-baseline series receives enough
visual emphasis to remain inspectable when it overlaps the reference line;
this does not alter the underlying gap value or sign. For B-04, the
source-backed KNS-256-011 P2 values at measured laps are the nonzero sequence
`+0.9, +16, +20.6, +24.1, +27.5, +23.9, +4.9`; this target sequence is
distinct from the generalized exact finite-gap `0` retention requirement.

### Error behavior and edge cases

Malformed optional lap metadata is ignored in favor of the existing measured
checkpoint fallback. Duplicate/invalid rider checkpoints remain excluded by
the existing transform rules. Missing leader checkpoints do not create values
for other riders. A finished rider with fewer laps than the leader remains
lap-down, and DNF time-gap rules remain unchanged. Filter canonicalization
removes only invalid combinations, never a valid independent filter. Disclosure
content remains mounted while collapsed so comparison selections persist.

### Acceptance and validation

All D-01 through D-10, M-01 through M-02, and B-01 through B-04 must be
individually `VERIFIED` and `PASS`. The release gate requires the complete
functional flow, MR-01--03, POS-01--05, S0/S1/S2/S3/S4 checks, exact viewports
1440x900, 1280x720, 390x844, and 320x568, and the following commands:

`npm test`; `npx tsc --noEmit`; `npm run lint`; `npm run build`;
`git diff --check`.

Before/after and Production evidence is saved under
`docs/user-testing/evidence/ux3-7r3/`, and the required report is
`docs/user-testing/ux3-7r3-mandatory-layout-and-data-bug-remediation.md`.

### UX3-7R3 audit resolutions and traceability

The Owner-provided issue list in the task request is authoritative even though
the repository did not previously contain a copy. The following matrix is the
active traceability contract; grouped implementation is allowed, but every row
still requires its own observable check and final report row.

| ID | Observable acceptance | Owning area | Evidence/check |
|---|---|---|---|
| D-01 | Home rider search input and submit control share one aligned desktop row and equal height at 1440x900/1280x720. | RiderDiscovery | desktop-1440-search-alignment.png + source test |
| D-02 | Analysis rider selector and ▲/▼ controls share one aligned horizontal group with 44px-class arrow targets. | RiderSelector | desktop-1440-rider-controls.png + source test |
| D-03 | The `注目選手 ... vs ...` chart heading text is absent; accessible chart/card labels remain. | ChartTabs | source test + desktop chart evidence |
| D-04 | Selected-lap ranking detail and results table have no internal max-height/vertical scroll or clipping; all rows use page flow. | ChartDetailPanel/RaceResultsTable | desktop-1440-lap-detail.png + DOM/source check |
| D-05 | Selected-lap disclosure has a clickable header, changing chevron, synchronized aria-expanded, keyboard toggle, and clear open/closed styling. | Disclosure/ChartDetailPanel | desktop-1440-lap-detail.png + accessibility test |
| D-06 | Lap-detail trigger and content form one continuous bordered disclosure with no double border. | Disclosure/LapDetailDisclosure | desktop-1440-lap-detail.png + accessibility test |
| D-07 | Results trigger and content use the exact D-06 disclosure pattern. | Disclosure/RaceViewer | desktop-1440-results-disclosure.png + accessibility test |
| D-08 | Obsolete result-skip UI, handler, and anchor are absent without leaving a gap or breaking navigation. | RaceResultsTable/RaceViewer | source test + functional flow |
| D-09 | Desktop comparison rider picker opens and collapses from an obvious header, keeps selected riders, and reduces chart return distance. | AnalysisControlDeck | desktop-1440-comparison-collapsed.png and -expanded.png |
| D-10 | Fixed comparison riders have stronger selected background/border and explicit check/selected label, distinct from hover/focus. | ComparisonRiderPicker | source test + expanded evidence |
| M-01 | Season/series changes preserve nonzero scroll position, keep URL state/history, and work at 390x844 and 320x568. | MeetSelector | mobile-390-filter-scroll-before-after.png + measured browser test |
| M-02 | Mobile comparison disclosure has clear chevron, visual state, aria-expanded, keyboard/tap target of at least 44px. | Disclosure/MobileComparisonDisclosure | mobile-390-comparison-closed.png and -open.png |
| B-01 | Season-only, series-only, combined intersection, clear, reload, back, and forward all preserve intended independent query state. | MeetSelector/urlState | regression test + Production flow |
| B-02 | Official sequence for race 27834 is 1..11; selected rider data contains the final valid lap after parser fix; no race-ID branch. | collector/parser + viewer transform | bug-b02-lap-count.png + official URL |
| B-03 | Official sequence for race 27770 is 1..11 (the table's measured columns begin at 2); selected rider data contains the final valid lap after parser fix; no race-ID branch. | collector/parser + viewer transform | bug-b03-lap-count.png + official URL |
| B-04 | Race 27160 / KNS-256-011 gap series contains P2's source-backed nonzero measured values `+0.9, +16, +20.6, +24.1, +27.5, +23.9, +4.9` at matching laps and renders the series inspectably; the generalized exact finite-gap `0` retention contract remains separately covered. | dataTransform/GapChart | bug-b04-gap-chart.png + regression test |

For `raceLapNumbers`, a valid value is a non-empty array of finite,
safe, positive integers in strictly increasing source order. Non-contiguous
sequences and sequences beginning at 2 are valid for backward-compatible
upstream payloads, but the current collector emits the complete official
sequence beginning at 1 from `距離・周回数` (for example 1..11). `StartLoop` is
a parser control column, not an additional numbered lap. If the optional field
is absent or fails any validation, the viewer falls back to the sorted union of
valid measured checkpoints. It never sorts, deduplicates, or partially accepts
a malformed metadata array, and it never creates a rider checkpoint for an
official lap with no measured value. Such a lap remains on the chart axis and
is shown as missing in detail/tooltip surfaces.

The collector parser and three cross-check payloads (`data/race-27834.json`,
`data/race-27770.json`, and `data/race-27160.json`) are owned by the separate
collector repository and are regenerated only for this shared parser/data
contract. The 27834 and 27770 payloads must gain valid lap 11 records after
the `H:MM:SS` clock-parser correction. Their official axis is 1..11 even when
the table begins its measured columns at 2; 27160 remains an 8-lap axis and is
used to guard against a universal `+1` patch. Unmeasured axis positions remain
null/missing; no rider lap is fabricated. A collector commit is reported
separately from the viewer commit when both repositories are changed.

S-level reporting follows the existing UX3-2 definitions: S0 blocker, S1
serious, S2 moderate, S3 minor, S4 preference. UX3-7R3 is a deterministic
Owner acceptance/release gate, not a new participant study; the report records
S0 through S4 counts for newly observed regressions and requires S0=S1=0.
MR-01--03 and POS-01--05 are protected by observable regression checks, not
reclassified by the 16 Owner rows.

Evidence is accepted per matrix row: UI rows use the named local exact-viewport
screenshots plus browser assertions; data rows use the named regression test,
live official URL cross-check (when network is available), and final
Production screenshot/value. “Before” means the current released alias and is
only contextual; all final After evidence and smoke checks must use the new
Production deployment for the pushed UX3-7R3 commit.
