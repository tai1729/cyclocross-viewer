# AJOCC Lap Time Viewer — Current Design Entry

Status: CLOSED
Active Change: None — Phase 2 is complete; Phase 3 is gated on evidence

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
