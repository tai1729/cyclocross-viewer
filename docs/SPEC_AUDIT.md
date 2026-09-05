# Specification Audit

Current Change: Phase 2 Slice 8 — data provenance and freshness metadata

## Current audit - Phase 2 Slice 8

This audit governs the provenance and freshness metadata slice. Auditors must
inspect the current `PRODUCT.md`, `DESIGN.md`, `IMPLEMENTATION_PLAN.md`,
`lib/types.ts`, `lib/dataSource.ts`, `components/RaceHeader.tsx`, the current
race route, and relevant tests.

The two independent auditors must identify implementation-significant
ambiguity about:

1. whether `updatedAt` is an event time, collector update time, or official
   publication time;
2. whether an official result URL or officialness can be inferred from the
   current upstream shape;
3. exact timestamp timezone/format and malformed-value behavior;
4. exact source URL construction, encoding, external-link accessibility, and
   empty-ID behavior;
5. metadata placement, copy, narrow-width wrapping, keyboard focus, and
   interactions with existing sticky header/error/not-found surfaces;
6. test and browser acceptance coverage without changing upstream contracts.

## Audit status

AUDIT COMPLETE

## Current audit - Phase 2 Slice 7

This audit governs the URL synchronization slice. Auditors must inspect the
current `PRODUCT.md`, `DESIGN.md`, `IMPLEMENTATION_PLAN.md`,
`components/MeetSelector.tsx`, `components/RaceViewer.tsx`,
`components/ChartTabs.tsx`, `hooks/useComparisonRiders.ts`, the race page, and
the relevant tests.

The two independent auditors must identify any implementation-significant
ambiguity about:

1. exact query keys, defaults, encoding, repeated fixed IDs, and return
   context;
2. validation timing and safe fallback for stale category/rider/fixed/lap
   values, including data-quality and no-checkpoint riders;
3. which interactions create browser history entries versus transient state;
4. how external URL navigation reconciles local React state without loops or
   an incorrect race-data fetch;
5. how ChartTabs exposes controlled durable tab/lap state while preserving
   hover, pin, clear, keyboard, sparse-data, and mobile behavior;
6. category/season reset semantics, existing comparison limits, and unknown
   query parameter compatibility;
7. test and browser acceptance coverage for normal, DNF, lapped, invalid,
   loading/error, not-found, and narrow responsive routes.

## Audit status

AUDIT COMPLETE

## Sources inspected

- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/DESIGN.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/2026-09-03-integrated-product-improvement-roadmap.md`
- `lib/dataTransform.ts`
- `lib/types.ts`
- `components/ChartTabs.tsx`
- `components/GapChart.tsx`
- `components/PaceChart.tsx`
- `components/RoleAwareTooltip.tsx`
- `components/RaceViewer.tsx`
- `components/SummaryCard.tsx`
- `lib/dataTransform.ts` (lap semantics and reusable transforms)
- `tests/dataTransform.test.ts`

## Audit scope

Auditors must identify any implementation-significant ambiguity about:

1. cumulative versus per-lap formula and sign wording;
2. whether `gap`/`pace` internal paths or public contracts may be renamed;
3. same-lap rank availability and tooltip behavior for missing values;
4. DNF, lapped, first-lap, and missing-primary behavior;
5. context summaries, all/numeric/pinned modes, and mobile wrapping;
6. boundaries with the deferred lap table and URL synchronization work.

## Commander assumptions pending audit

- The previous user instruction to proceed is treated as approval of the
  proposed Slice 3 boundary: time-difference clarification now, lap table in
  Slice 4.
- Existing transforms already join by `lapNumber` and use the established
  valid-checkpoint/valid-timed-lap rules; Slice 3 must preserve those rules.
- The existing chart paths remain internal implementation details, so
  user-facing labels may change without changing the upstream contract.

## Auditor findings

### Auditor A

- Asked whether the lap axis should be an intersection or the existing union
  and whether missing values should remove a whole point.
- Asked whether primary should be synthesized as `±0`, which rank source is
  valid for per-lap difference, and whether rank may appear without a metric.
- Asked whether rank validity should become stricter than the existing finite
  checkpoint rule, how duplicates affect other riders, whether exports may be
  renamed, how lapped status should appear, and how much tooltip work belongs
  to Slice 4.

### Auditor B

- Independently raised the same union/intersection and primary-tooltip
  questions, plus the need for exact positive/negative copy.
- Asked whether pace rank should use checkpoints or timed laps, how sparse
  DNF/lapped values should be presented, whether numeric context ranks should
  be listed, and whether Slice 4 owns statistics transforms or only table UI.

## Resolutions

1. Retain the existing union lap axis from `getRaceLapNumbers`; omit only the
   affected rider value. A missing primary suppresses all comparison values at
   that lap because a difference cannot be calculated.
2. Preserve the Slice 2 decision that the primary is a zero `ReferenceLine`,
   not a synthesized difference payload or Tooltip row. Comparison rows show
   their metric and same-lap rank when a metric value exists; the rank chart
   remains the source for the primary's rank.
3. Use `getValidCheckpoints` for cumulative-gap rank maps and
   `getValidTimedLaps` for per-lap-difference rank maps. Never render rank-only
   rows. Preserve the existing finite `rankAtLap` validation rule.
4. Duplicate lap numbers invalidate only that rider's record at that lap;
   other riders and the union axis remain available.
5. Preserve `buildGapSeries`, `buildPaceDeltaSeries`, and `GapSeriesPoint`
   signatures/shapes because they are repository-consumed interfaces even
   though they are not upstream contracts.
6. Lapped/DNF chart behavior remains sparse measured data with existing
   result-card status; no new chart status label is added in Slice 3.
7. Slice 4 owns the lap table, fastest/average/max-loss statistics, and their
   transforms. Slice 3's tooltip rank API may be reused but is not expanded
   with lap statistics.
8. Visible copy distinguishes cumulative `タイム差` from per-lap `周回差` and
   explains that positive is behind/slower relative to the selected rider.
9. Numeric/all context riders keep the existing finite current-point metric
   count/min/max summary; their individual ranks are not listed.
10. Keyboard focus remains required for surrounding controls; the existing
    Recharts pointer tooltip is not rearchitected into a keyboard chart
    navigator in this Slice.

## Current Slice 4 audit

The preceding section records the completed Slice 3 audit. The active audit
below governs the lap-detail and summary implementation.

### Audit questions for spec auditors

1. Does the selected-rider row definition exactly match the existing
   `getValidTimedLaps` and duplicate/invalid-data semantics?
2. Are fastest, average, tie-breaking, display rounding, and DNF/lapped
   boundaries explicit enough to implement without guessing?
3. Is the maximum-loss formula and fixed-rider scope consistent with the
   Slice 3 sign convention and comparison modes?
4. Are sparse missing comparison values, no-loss cases, and unavailable/empty
   states specified without inventing zeroes or inferred laps?
5. Can the proposed desktop/mobile table expose the same information at
   320px/390px without conflicting with existing table and focus rules?
6. Are the component boundaries and documentation scope sufficiently bounded
   so URL sync, chart rearchitecture, and upstream contract changes stay out?

### Commander assumptions pending audit

- The user instruction to proceed approves the Slice 4 scope; the detailed
  formulas and responsive presentation are recorded in `docs/DESIGN.md`.
- Lap rows use the selected rider's valid timed laps only. The summary may be
  shown for DNF/lapped riders when measured rows exist, while existing status
  classification remains authoritative.
- Only fixed pinned riders receive table comparison columns. Numeric/all
  comparison detail remains in the existing charts and tooltip.
- Positive displayed lap delta means the fixed rider is slower; positive
  maximum-loss means the selected rider lost time to that fixed rider.

### Auditor findings

- Both auditors identified the same missing definition for a DNF tail. The
  current `Rider` contract has no separate DNF-event lap, so “post-DNF” must
  be grounded in the existing valid checkpoint set.
- Both auditors requested deterministic display precision and a distinction
  between raw-second calculations and rounded UI text.
- Both auditors identified the zero-valid-timed-laps state as distinct from
  zero checkpoints/data-quality failure and requested an explicit UI outcome.
- The UI audit requested one semantic representation across desktop/mobile,
  explicit placement in the existing two-column analysis region, and a rule
  for fully sparse fixed-rider columns.
- The data audit requested rider-local duplicate invalidation, fixed-rider
  tie order, use of the same valid-timed-lap gate for loss calculations, and
  reconciliation of stale pinned IDs.

### Resolutions

1. A DNF lap-detail boundary is the greatest `lapNumber` in
   `getValidCheckpoints(rider)`. `getValidTimedLaps` already derives from that
   set, so malformed records outside the valid checkpoint set are excluded;
   no new status field or collector contract is introduced.
2. All calculations and tie-breaking use original finite seconds. Lap time,
   cumulative time, and average are displayed with `formatSecToClock`; signed
   deltas and maximum loss use `formatGapSec`. Both existing formatters round
   only for display, so raw values decide fastest/loss candidates.
3. When valid checkpoints exist but valid timed laps do not, keep the existing
   status summary and chart analysis. The new summary omits fastest/average,
   and the new table renders a clear “no valid measured laps” empty state.
4. The selected primary row remains whenever its own timed lap is valid. A
   duplicate or invalid fixed-rider lap invalidates only that rider's cell;
   the primary row and other fixed columns remain. Both riders must pass
   `getValidTimedLaps` for a delta or maximum-loss candidate.
5. Fixed columns are rendered for every currently reconciled fixed rider in
   the order supplied to the table, even when all cells are blank. Maximum
   loss ties prefer the earliest `lapNumber`; if tied on the same lap, they
   prefer the fixed-rider order supplied to the table. Stale pinned IDs are
   excluded by existing comparison reconciliation.
6. The table uses one accessible `role="table"` representation and CSS
   responsive grid rows, not duplicated desktop/mobile content. The summary
   follows `SummaryCard` in the left analysis column; the table precedes
   `ChartTabs` in the right column and becomes the corresponding mobile order.
7. Numeric and all modes retain selected-rider fastest/average values but no
   comparison columns; their comparison detail remains in existing charts and
   tooltips. No URL, chart architecture, upstream contract, or dependency
   changes are part of Slice 4.

STATUS: CLEAR

## Current audit — Phase 2 Slice 5: accessible mobile chart detail

This audit supersedes the completed Slice 4 audit while the new slice is
active. Auditors must check the current `PRODUCT.md`, `DESIGN.md`,
`IMPLEMENTATION_PLAN.md`, the four chart components, `ChartTabs`,
`RoleAwareTooltip`, and the validity helpers in `lib/dataTransform.ts`.

The two independent auditors identified the following implementation-significant
questions. The Commander resolved them as follows:

1. First-lap fallback: use exactly `raceLapNumbers[0]`; an empty axis has no
   selected lap and the panel is unavailable. This applies to initialization,
   tab changes, and clear-pin.
2. Primary gap/pace detail: always render a display-only primary row first.
   Its value is `±0` only when the required metric is valid; otherwise it is
   `未計測`. It is never added to the Recharts series or tooltip payload.
3. No comparison riders: retain the existing empty chart state and render the
   shared panel with `比較対象なし`; keep lap navigation when an axis exists,
   without implying a zero comparison.
4. Sparse chart click: resolve only a valid Recharts active axis
   index/payload. A valid axis lap pins exactly even if values are missing;
   missing values remain `未計測`. Empty-area events do not change state.
5. Hover/pin: while unpinned, hover updates the active lap and pointer leave
   retains the last active lap. While pinned, hover has no state effect. Clear
   unpins and resets to `raceLapNumbers[0]` when available.
6. Keyboard path: the native lap selector and previous/next buttons are the
   complete keyboard mechanism. They expose labels, edge-disabled states,
   focus-visible styling, and a readable selected-lap/value region; SVG dots
   are not independently focusable.
7. Rider membership: rank/lap use the same displayed rider list as the
   existing chart. Gap/pace use the display-only primary row followed by the
   existing comparison series riders, in reconciled order.
8. DNF/lapped wording: the existing summary card remains authoritative. The
   detail panel uses `未計測` for unavailable values and does not create a
   second status model or infer a post-boundary value.
9. Layout stability: `ChartDetailPanel` uses `min-h-[13rem]` and a bounded
   internally scrolling value list so its outer height is stable per tab/mode;
   the page never gains horizontal overflow.
10. Verification: pure-transform tests cover valid, sparse, duplicate,
    invalid, DNF, lapped, and sign cases. Browser smoke verifies initial,
    hover, chart click/tap, selector, previous/next, pin/clear, tab changes,
    missing values, and 320px/390px overflow/focus behavior. No component-test
    harness is added because this repository has no such dependency; browser
    smoke is the interaction evidence.

STATUS: CLEAR

## Phase 2 Slice 7 audit findings and resolutions

The two independent auditors found no product contradiction, but identified
implementation-significant details that needed explicit resolution in
`docs/DESIGN.md` before coding:

- They requested a per-action retention/reset table. The resolved table now
  defines Home season/series, race category/rider/mode/fixed, chart tab, and
  deliberate lap transitions. Category clears rider/fixed/tab/lap and resets
  comparison `2`; primary selection removes itself from fixed IDs in the same
  history entry; tab preserves a valid pinned lap.
- They requested hydration and fetch timing. The resolved design uses
  synchronous client `useSearchParams`, resolves category against the server
  meet before the first race fetch, and canonicalizes only after mount. Home
  and race-dependent values are not rewritten while their data is loading or
  in error; dependent values hydrate only after the target race succeeds.
- They requested an atomic external-navigation rule. The resolved design
  hides the old race analysis through the existing loading branch, resets
  dependent state during category replacement, and applies only the new URL's
  valid values after the new race response arrives.
- They requested separate rider and fixed eligibility. Existing riders remain
  valid primary selections even with data-quality/no-checkpoint problems;
  fixed IDs must be graphable, non-primary, unique, and within the existing
  four-ID limit. A valid race-axis lap remains canonical even when analysis is
  unavailable; an invalid lap is removed and falls back to an unpinned first
  axis lap, while an empty axis yields null active/pinned state.
- They requested deterministic fixed/query serialization. Duplicate fixed
  values retain the first valid occurrence; the normalized list is capped at
  four. Known keys use the documented order, and unknown repeated pairs remain
  in relative order after them on every URL rewrite.
- They requested explicit mode fallback and return-link behavior. Stale
  `all` becomes omitted default comparison `2` when over the graphable limit;
  `pinned` with no fixed IDs remains pinned and shows the existing empty state.
  The back link carries only first context values present and matching the
  current meet (including a global series without season), otherwise `/`;
  race analysis and unknown keys are not carried to Home.
- They requested malformed-input behavior and a pure API boundary. Query
  helpers are total and treat malformed values as absent; path parsing keeps
  existing not-found semantics. Raw parsing is separate from data-aware
  normalization so helpers do not fetch or own UI state.

The resolved design also makes explicit that every deliberate durable action
uses one `push`, canonical cleanup uses `replace`, and hover never writes the
URL. No new dependency, route, upstream contract, or chart formula is
introduced.

## Phase 2 Slice 8 audit findings and resolutions

The two independent auditors raised the following implementation-significant
questions. The Commander resolved them before implementation:

1. `updatedAt` is collector-data freshness, not event publication time. The
   fixed display format is zero-padded `YYYY/MM/DD HH:mm JST`, with no seconds
   or weekday, produced from `ja-JP` numeric parts in `Asia/Tokyo`.
2. The viewer trims the runtime timestamp value and accepts any value that
   `new Date(value)` parses to a finite instant. This covers the collector's
   UTC ISO 8601 sample and offset-based values. Empty, whitespace-only,
   malformed, non-date, or out-of-range values display `更新日時不明`.
3. A race ID is valid for the source link only when its trimmed value is
   nonblank. The trimmed ID is encoded as one path segment; blank IDs omit the
   link. The upstream `RaceResult.updatedAt: string` contract is unchanged.
4. The source link is same-tab navigation with the visible label
   `取得元データ (GitHub)` and the existing keyboard focus treatment. No
   new-tab attributes or arbitrary data-provided URL are introduced.
5. The existing title/category/count layout remains the first row. The
   metadata is a full-width wrapping second row inside the sticky
   `RaceHeader`; at 320px/390px it must remain readable and avoid page-level
   horizontal overflow.
6. Metadata is rendered only in the successful-race branch where
   `RaceHeader` already renders, including an analysis-unavailable rider.
   Loading, network/http/invalid-data, and not-found surfaces are unchanged.
7. Unit tests cover valid UTC and offset conversion, empty/whitespace and
   malformed values, non-string runtime input, and path-segment encoding.
   Browser smoke covers normal display, exact source href, keyboard focus,
   sticky visibility, not-found preservation, and narrow-width wrapping.

STATUS: CLEAR
