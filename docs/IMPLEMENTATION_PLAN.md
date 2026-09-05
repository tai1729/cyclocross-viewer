# Implementation Plan

Status: COMPLETE
Active implementation plan: None — Phase 2 Slice 8 is complete

Next planning gate: Phase 3 user-demand evidence; no implementation is
approved until a task-based user test or equivalent usage evidence is
available.

## Phase 2 Slice 8 task graph

### P2S8-1 - Pure metadata helpers and tests

- Status: DONE
- Objective: Add total timestamp formatting and safe collector source URL
  helpers with behavior tests.
- Scope: new `lib/raceMetadata.ts`, new `tests/raceMetadata.test.ts`.
- Dependencies: approved Slice 8 design and completed specification audit.
- Do-not-change: upstream types, fetch boundaries, React components, routes,
  and deployment configuration.
- Acceptance: valid JST formatting, invalid/empty timestamp fallback,
  encoded nonblank race IDs, and empty-ID link omission are tested.
- Verification: focused tests and full validation.

### P2S8-2 - Race header provenance and freshness UI

- Status: DONE
- Objective: Add the compact update/source/non-official metadata row to the
  existing race header.
- Scope: `components/RaceHeader.tsx` only.
- Dependencies: P2S8-1.
- Do-not-change: existing header summary, result table, analysis, loading/error,
  not-found, and chart behavior.
- Acceptance: valid and invalid metadata are understandable, the link is
  keyboard accessible and correctly labeled, and the row wraps at narrow
  widths without horizontal overflow.
- Verification: typecheck, lint, build, and browser smoke.

### P2S8-3 - Canonical documentation and closeout

- Status: DONE
- Objective: Record the shipped provenance boundary and verification evidence.
- Scope: `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/IMPLEMENTATION_PLAN.md`,
  `docs/SPEC_AUDIT.md`, and one dated history document.
- Dependencies: P2S8-1, P2S8-2, and verification.
- Do-not-change: historical documents, upstream contracts, and unrelated files.
- Acceptance: docs state that collector data is not claimed as official and
  `docs/SPEC_AUDIT.md` ends with exactly `STATUS: CLEAR`.
- Verification: documentation review and `git diff --check`.

### P2S8-4 - Full verification, independent review, commit, and push

- Status: DONE
- Objective: Run all required checks and browser smoke, obtain reviewer PASS,
  then commit and push the completed slice.
- Scope: tests, typecheck, lint, build, diff hygiene, browser smoke, reviewer,
  commit, and normal push.
- Dependencies: P2S8-3.
- Do-not-change: credentials, deployment configuration, historical docs, and
  unrelated user changes.
- Acceptance: all checks pass, reviewer returns `PASS`, and the commit reaches
  the configured upstream without force-pushing.

## Phase 2 Slice 8 verification evidence

- `npm.cmd test`: 54 tests passed.
- `npx.cmd tsc --noEmit`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed with Next.js 16.3.3/Turbopack.
- `git diff --check`: passed.
- Browser smoke on the local production-like dev page confirmed the JST
  metadata, exact collector GitHub href, visible non-official disclaimer, and
  unchanged not-found screen. The implementation smoke also covered desktop,
  320px, and 390px wrapping; the independent reviewer recorded that fixed
  viewport screenshots were not captured, leaving only a non-blocking visual
  verification risk.
- Independent reviewer result: `PASS`.

## Slice 8 execution order

```text
two spec auditors -> specification resolution -> P2S8-1 -> P2S8-2
  -> P2S8-3 -> P2S8-4
```

## Slice 8 resolved design decisions

- Use the existing `RaceResult.updatedAt`, displayed as collector data update
  time in JST as zero-padded `YYYY/MM/DD HH:mm JST` (no seconds or weekday).
  Never label it official publication time.
- Trim runtime timestamp input and accept parser-compatible finite dates,
  including the collector's UTC ISO 8601 and offset-based values. Render
  `更新日時不明` for empty/whitespace-only, malformed, non-date, and
  out-of-range values.
- Link only to the matching public collector GitHub JSON file. Do not invent
  organizer result URLs or add a new upstream field.
- Always show a text disclaimer that the viewer displays collected data, not an
  official result. Invalid time is explicit unknown text; empty race IDs have
  no link.
- Trim nonblank race IDs before encoding them as one path segment. Use a
  same-tab link labeled `取得元データ (GitHub)` with visible keyboard focus.
- Keep the existing RaceHeader title/category/count row and add only a
  full-width wrapping metadata row inside the sticky header. Render it only
  for an already successful race; loading/error/not-found/analysis-unavailable
  branches and all table/chart/route/fetch/data-contract behavior remain
  unchanged.

## Phase 2 Slice 7 task graph

### P2S7-1 - Pure URL contract and tests

- Status: DONE
- Objective: Add total parsing, normalization, serialization, and query-update
  helpers for Home filters and race analysis state.
- Scope: new `lib/urlState.ts`, new `tests/urlState.test.ts`.
- Dependencies: specification audit clear.
- Do-not-change: React components, upstream types, route structure, data
  fetching, and comparison semantics.
- Acceptance: defaults, allowlists, repeated fixed IDs, dedupe/caps,
  positive-integer laps, invalid fallback, context parameters, and unknown
  query preservation are behavior-tested.
- Verification: focused tests and full validation.

### P2S7-2 - Home URL synchronization

- Status: DONE
- Objective: Restore and write season/series filters from the URL and carry
  valid list context into meet links.
- Scope: `components/MeetSelector.tsx`, `app/page.tsx` only if required by
  the client search-param boundary.
- Dependencies: P2S7-1.
- Do-not-change: meet data fetching, filtering semantics, list ordering, or
  loading/error UI.
- Acceptance: filter changes push canonical URLs, season changes clear series,
  reload/revisit/back-forward restore state, and invalid values are safe.
- Verification: typecheck, lint, build, and browser smoke.

### P2S7-3 - Race URL synchronization and controlled chart state

- Status: DONE
- Objective: Restore and write category, rider, comparison, fixed IDs, active
  tab, and deliberate pinned lap state while preserving existing UI behavior.
- Scope: `components/RaceViewer.tsx`, `components/ChartTabs.tsx`.
- Dependencies: P2S7-1; P2S7-2 is independent and may be complete first.
- Do-not-change: chart formulas, data transforms, route/error behavior,
  comparison hook contracts, or upstream JSON contracts.
- Acceptance: state is shareable and reloadable, category changes clear the
  specified state, back/forward restores meaningful states, hover is not
  serialized, and all existing limits/reconciliation remain authoritative.
- Verification: typecheck, lint, build, and browser smoke.

### P2S7-4 - Canonical documentation and closeout

- Status: DONE
- Objective: Record the shipped URL contract, compatibility behavior, and
  verification evidence in canonical docs and a dated history document.
- Scope: `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/IMPLEMENTATION_PLAN.md`,
  `docs/SPEC_AUDIT.md`, and one new dated history document.
- Dependencies: P2S7-1 through P2S7-3 and verification.
- Do-not-change: historical documents, deployment settings, or unrelated
  worktree files.
- Acceptance: canonical docs match the implementation and
  `docs/SPEC_AUDIT.md` ends with exactly `STATUS: CLEAR`.
- Verification: documentation review and `git diff --check`.

### P2S7-5 - Full verification and independent review

- Status: DONE
- Objective: Run all required checks, browser smoke, bounded revisions, and
  independent review, then commit and push the completed slice.
- Scope: tests, typecheck, lint, build, diff hygiene, browser smoke, reviewer,
  commit, and push.
- Dependencies: P2S7-4.
- Do-not-change: credentials, deployment configuration, historical docs, and
  unrelated user changes.
- Acceptance: all required checks pass, reviewer returns `PASS`, and the
  completed Slice 7 commit is pushed to the configured upstream.

## Phase 2 Slice 7 verification evidence

- Automated checks passed on 2026-09-05: `npm.cmd test` (48/48),
  `npx.cmd tsc --noEmit`, `npm.cmd run lint`, `npm.cmd run build`, and
  `git diff --check`.
- Local browser smoke passed for Home filter URL restoration and context links,
  shareable rider/tab/lap state, category reset, invalid/stale values with
  repeated unknown parameters, normal race data, a 6-rider DNF category, a
  68-rider category, a DNF rider, a lapped finished rider, and not-found.
- Narrow-screen behavior remains covered by the existing Slice 4 responsive
  smoke and unchanged layout boundaries; this slice adds only URL state and
  controlled chart wiring.

## Slice 7 execution order

```text
two spec auditors -> specification resolution -> P2S7-1 and P2S7-2
  -> P2S7-3 -> P2S7-4 -> P2S7-5
```

## Slice 7 resolved design decisions

- Use readable `URLSearchParams` state. Home uses `season` and `series`; race
  uses `category`, `rider`, `compare`, repeated `fixed`, `tab`, and `lap`.
  Race links may carry matching Home season/series as return context.
- Parse synchronously with `useSearchParams`. Resolve category against the
  server-loaded meet before the first race fetch. Do not rewrite Home or
  race-dependent values while their data is loading or in error; normalize
  them after successful data is available.
- Use a two-phase pure helper API: raw parsing is total and data-independent;
  normalization validates against the available meet/race snapshot and
  produces the canonical state. No fetch or React state belongs in the helper.
- Default values are omitted. Known query keys serialize as season, series,
  category, rider, compare, fixed (repeated), tab, lap; unknown repeated pairs
  are preserved in relative order after known keys.
- Every deliberate filter, selection, mode, fixed, tab, and lap action uses
  one `push`; canonical cleanup uses `replace`. Hover never writes the URL.
- Category changes clear rider/fixed/tab/lap and restore comparison `2`.
  Primary changes remove the selected ID from fixed IDs in that same entry.
  Tab changes preserve a valid pinned lap. Pinned mode with no fixed IDs stays
  pinned and keeps the existing no-comparison state.
- Primary IDs may refer to any existing rider, preserving unavailable states;
  fixed IDs must be graphable, non-primary, unique, and capped at four. `all`
  over the existing graphable limit falls back to omitted default `2`.
- A valid lap is normalized against the race axis even without a valid primary.
  An invalid lap is removed and falls back to an unpinned first lap; an empty
  axis removes it and leaves active/pinned state null. Back links carry only
  the first present season/series context values matching the current meet;
  a global series context may omit season, while stale context links to `/`.

## Phase 2 Slice 5 task graph

### P2S5-1 — Pure chart-detail transform and tests

- Status: DONE
- Objective: Return exact per-rider detail for one lap using the existing
  checkpoint/timed-lap validity rules and gap/pace signs.
- Scope: `lib/dataTransform.ts`, `tests/dataTransform.test.ts`.
- Dependencies: specification audit clear.
- Do-not-change: upstream types, route/error behavior, comparison selection,
  existing series builders, and unrelated worktree files.
- Acceptance: rank/checkpoint, lap/timed-lap, cumulative-gap, and pace values
  are sparse; missing/duplicate/invalid values are null; primary difference
  baseline is only emitted when its metric is valid; ranks are same-lap.
- Verification: focused tests and full validation.

### P2S5-2 — Shared detail panel and lap navigation

- Status: DONE
- Objective: Add a stable below-chart panel with native selector,
  previous/next controls, clear pin action, readable values, role labels, and
  mobile-safe wrapping.
- Scope: new `components/ChartDetailPanel.tsx`.
- Dependencies: P2S5-1.
- Do-not-change: chart data builders, route states, or upstream contracts.
- Acceptance: the same panel supports keyboard selection and displays explicit
  `未計測` without relying on color; controls are focus-visible and 44px.
- Verification: typecheck, lint, browser smoke at 320px/390px.

### P2S5-3 — Chart interaction integration

- Status: DONE
- Objective: Connect shared active/pinned lap state to all four charts. Hover
  updates, click/tap pins, and an active-lap marker reinforces the selected
  point while existing tooltips remain intact.
- Scope: `components/ChartTabs.tsx`, `components/RankBumpChart.tsx`,
  `components/GapChart.tsx`, `components/PaceChart.tsx`,
  `components/LapTimeChart.tsx`.
- Dependencies: P2S5-1 and P2S5-2.
- Do-not-change: line types, sparse data, role styles, comparison modes, or
  chart formulas.
- Acceptance: switching tabs preserves valid lap selection, chart hover/tap
  reaches the same panel detail, and no chart interaction removes the
  keyboard path.
- Verification: full validation and browser smoke.

### P2S5-4 — Product documentation and closeout

- Status: DONE
- Objective: Record the persistent chart-detail contract and close the slice.
- Scope: `docs/PRODUCT.md`, `docs/DESIGN.md`,
  `docs/IMPLEMENTATION_PLAN.md`, `docs/SPEC_AUDIT.md`.
- Dependencies: P2S5-1 through P2S5-3 and reviewer PASS.
- Do-not-change: historical docs, deployment settings, or unrelated changes.
- Acceptance: canonical docs describe shipped behavior and
  `docs/SPEC_AUDIT.md` ends exactly with `STATUS: CLEAR`.
- Verification: documentation review and `git diff --check`.

### P2S5-5 — Verification, browser smoke, and independent review

- Status: DONE
- Objective: Run required checks, verify responsive interaction, obtain
  independent PASS, then commit and push only intended changes.
- Scope: tests, typecheck, lint, build, diff hygiene, browser smoke, review,
  bounded revisions, Git handoff.
- Dependencies: P2S5-1 through P2S5-4.
- Do-not-change: credentials, deployment configuration, historical assets, or
  unrelated user changes.
- Acceptance: every required check passes and reviewer returns `PASS`.

Execution order:

```text
two spec auditors -> specification resolution -> P2S5-1
  -> P2S5-2 -> P2S5-3 -> P2S5-4 -> P2S5-5
```

### Resolved design decisions

- The panel is shared by all chart tabs and is always placed immediately
  below the active chart; it is not a second chart or a mobile-only duplicate.
- Hover changes the unpinned active lap. Chart click/tap and panel keyboard
  actions pin the lap. The clear action unpins without changing the data
  semantics.
- Native select plus previous/next buttons is the keyboard/touch mechanism;
  raw SVG dots are not made independently focusable.
- The panel renders comparison riders in the same reconciled order and uses
  the current role labels. All mode may use a vertically scrollable value list.
- `raceLapNumbers[0]` is the only first-lap fallback. An empty axis has no
  selected lap. Chart-level events use only the Recharts active axis
  index/payload; empty-area events are ignored, but a valid axis lap may be
  pinned even when every rider value is missing.
- Gap/pace always render a display-only primary row first. It is `±0` only
  when the primary metric is valid; otherwise it is `未計測` and is never
  added to the chart payload. With no comparison riders the value area says
  `比較対象なし` while the lap controls remain available.
- `ChartDetailPanel` uses `min-h-[13rem]` and a fixed bounded value-list area
  so its outer height remains stable for the same tab/mode. Existing status
  cards remain authoritative for DNF/lapped wording; the panel uses
  `未計測` for unavailable values.
- No URL synchronization is included in this slice.

## Baseline

Phase 2 Slice 1 fixed comparison, Slice 2 role-based chart styling, and Slice
3 time-difference analysis are complete on remote `main`. Slice 4 adds the
measured lap table and compact lap statistics described in `docs/DESIGN.md`.

## Task graph

### P2S3-1 — Difference semantics and regression tests

- Status: DONE
- Objective: Give cumulative and per-lap difference builders explicit,
  tested semantics and same-lap sparse behavior.
- Scope: `lib/dataTransform.ts`, `tests/dataTransform.test.ts`.
- Dependencies: specification audit clear.
- Do-not-change: upstream types/contracts, comparison selection, route/error
  behavior, and unrelated dirty-worktree files.
- Acceptance: sign meaning, same-lap joins over the retained union lap axis,
  valid-timed-lap gate, missing primary/target values, DNF/lapped edges, and
  compatibility are covered.
- Verification: focused tests and full validation.

### P2S3-2 — Same-lap rank detail in shared tooltip

- Status: DONE
- Objective: Extend the existing role-aware tooltip with measured rank detail
  for primary/fixed riders at the hovered lap.
- Scope: `components/RoleAwareTooltip.tsx`, `components/GapChart.tsx`,
  `components/PaceChart.tsx`.
- Dependencies: valid lap-map contract from P2S3-1.
- Do-not-change: context aggregation rules, sparse payload filtering, line
  interpolation, or chart selection state.
- Acceptance: checkpoint ranks are used for cumulative gap, timed-lap ranks
  for per-lap difference, ranks appear only with emitted metric values,
  context remains a current-point metric summary, and the tooltip wraps safely
  on mobile.
- Verification: typecheck, lint, focused tests, and browser smoke.

### P2S3-3 — Difference chart vocabulary and visible sign guidance

- Status: DONE
- Objective: Make the existing difference tabs and supporting copy explain
  cumulative versus per-lap meaning and positive/negative direction.
- Scope: `components/ChartTabs.tsx`, `components/GapChart.tsx`,
  `components/PaceChart.tsx`.
- Dependencies: tooltip API complete.
- Do-not-change: rank/lap chart meaning, role styles, `linear` lines,
  `connectNulls={false}`, or comparison behavior.
- Acceptance: user-facing labels are distinct, selected rider is explicitly
  the zero reference, and sign explanations are visible without relying on
  color.
- Verification: full validation and browser smoke at desktop/mobile widths.

### P2S3-4 — Product documentation and closeout

- Status: DONE
- Objective: Record the implemented difference semantics and Slice 4 boundary
  in canonical product documentation.
- Scope: `docs/PRODUCT.md` and this plan.
- Dependencies: implementation behavior verified.
- Do-not-change: historical docs, release history, deployment settings, or
  unrelated Autobuild files.
- Acceptance: docs describe formulas, signs, sparse behavior, and deferred
  lap-table scope accurately.
- Verification: documentation review and `git diff --check`.

### P2S3-5 — Verification and independent review

- Status: DONE
- Objective: Run required checks, browser smoke, independent review, and
  commit/push only the approved Slice 3 files.
- Scope: tests, typecheck, lint, build, diff hygiene, browser smoke, reviewer,
  bounded revisions, and Git handoff.
- Dependencies: all implementation tasks complete.
- Do-not-change: unrelated worktree changes, credentials, deployment
  configuration, and historical documents.
- Acceptance: every required check passes and reviewer returns `PASS`.

## Execution order

```text
two spec auditors -> specification resolution -> P2S3-1
  -> P2S3-2 -> P2S3-3 -> P2S3-4 -> P2S3-5
```

No parallel worker may edit the same source file as another worker.

## Resolved design decisions

- Slice 3 uses the existing `gap` and `pace` chart paths; it does not add a
  new chart or a lap table.
- User-facing `gap` becomes `タイム差` for cumulative difference, and
  user-facing `pace` becomes `周回差` for per-lap difference.
- Positive cumulative difference means the comparison rider is behind at that
  lap; positive per-lap difference means the comparison rider was slower on
  that lap. The selected rider is always the zero reference.
- The union lap axis is retained, but missing values are omitted per rider.
  Same-lap `rankAtLap` is shown only when the corresponding finite metric
  record exists: checkpoint records for cumulative gap and timed-lap records
  for per-lap difference. Context ranks are not aggregated or inferred.
- Existing `buildGapSeries`, `buildPaceDeltaSeries`, and `GapSeriesPoint`
  exports retain their signatures and sparse shape; semantic clarification
  does not change an external contract.
- DNF/lapped status remains represented by existing result/summary behavior;
  Slice 3 adds no chart status label. Slice 4 owns lap-table/statistics UI and
  reusable lap-statistics transforms, but may consume this tooltip contract.
- Existing role styling, context summaries, sparse values, line types, and
  comparison modes remain unchanged.
- Slice 4 will separately address lap tables and fastest/average/max-loss
  summaries after this semantic layer is stable.

## Phase 2 Slice 4 task graph

### P2S4-1 — Lap transform contract and regression tests

- Status: DONE
- Objective: Add pure, reusable transforms for measured lap rows, fastest
  lap, arithmetic average, and maximum primary loss to a fixed rider.
- Scope: `lib/dataTransform.ts`, `tests/dataTransform.test.ts`.
- Dependencies: specification audit clear; Slice 3 transform semantics.
- Do-not-change: upstream types, existing result classification, chart series
  signatures, comparison state, and missing-data rules.
- Acceptance: valid-timed-lap filtering, earliest tie rules, sparse matching
  comparison deltas, positive loss selection, DNF/lapped, duplicates, and
  missing values are covered by behavior-focused tests.
- Verification: focused tests, full validation.

### P2S4-2 — Compact lap statistics surface

- Status: DONE
- Objective: Render fastest-lap, average-lap, and pinned maximum-loss
  summaries using the transform contract.
- Scope: new `components/LapSummaryCard.tsx`, `components/RaceViewer.tsx`.
- Dependencies: P2S4-1.
- Do-not-change: existing `SummaryCard` status meanings, comparison controls,
  chart selection, or route/error states.
- Acceptance: selected rider statistics appear only with valid measured laps;
  fixed-mode loss identifies rider/lap; numeric/all modes omit the loss item;
  empty and unavailable states remain understandable.
- Verification: typecheck, lint, browser smoke at desktop/mobile widths.

### P2S4-3 — Responsive measured lap table

- Status: DONE
- Objective: Add an accessible numeric table that exposes selected-lap
  metrics and optional fixed-rider per-lap differences.
- Scope: new `components/LapDetailTable.tsx`, `components/RaceViewer.tsx`.
- Dependencies: P2S4-1; P2S4-2 may share the same integration edit.
- Do-not-change: existing chart data, tooltip behavior, or result table
  layout outside the analysis region.
- Acceptance: desktop columns and mobile labeled rows show identical measured
  values; pinned columns are sparse; long labels wrap; no page overflow; no
  color-only meaning.
- Verification: typecheck, lint, production build, browser smoke at 320px,
  390px, and desktop widths.

### P2S4-4 — Canonical documentation and closeout

- Status: DONE
- Objective: Record the Slice 4 behavior and closeout evidence in the
  canonical product documents without rewriting historical records.
- Scope: `docs/DESIGN.md`, `docs/PRODUCT.md`,
  `docs/IMPLEMENTATION_PLAN.md`, `docs/SPEC_AUDIT.md`.
- Dependencies: P2S4-1 through P2S4-3 verified.
- Do-not-change: historical docs, release/deployment settings, and unrelated
  worktree files.
- Acceptance: formulas, sparse behavior, responsive presentation, and
  validation evidence match the implementation; `SPEC_AUDIT.md` ends with
  exactly `STATUS: CLEAR`.
- Verification: documentation review and `git diff --check`.

### P2S4-5 — Verification and independent review

- Status: DONE
- Objective: Run required checks, browser smoke, independent review, and the
  normal commit/push handoff for Slice 4.
- Scope: tests, typecheck, lint, build, diff hygiene, browser smoke, bounded
  revisions, reviewer, commit, and push.
- Dependencies: P2S4-4.
- Do-not-change: credentials, deployment configuration, historical documents,
  and unrelated user changes.
- Acceptance: all required checks pass, reviewer returns `PASS`, and the
  completed Slice 4 commit is pushed to the configured upstream.

## Slice 4 execution order

```text
two spec auditors -> specification resolution -> P2S4-1
  -> P2S4-2 -> P2S4-3 -> P2S4-4 -> P2S4-5
```

## Slice 4 resolved design decisions

- The lap table is selected-rider-first and uses `getValidTimedLaps`; it does
  not synthesize missing laps or convert checkpoint-only records to timed
  rows.
- Fastest is the minimum measured lap with earliest-lap tie breaking. Average
  is the arithmetic mean of all measured timed laps.
- Only pinned fixed riders receive comparison columns. Their displayed delta
  keeps the existing `fixed - primary` sign convention; maximum loss uses
  `primary - fixed` and requires a positive result.
- A DNF or lapped rider can show the valid measured rows before the boundary,
  while the existing result summary remains the status authority.
- Mobile uses stacked labeled rows rather than requiring horizontal scrolling.
- The DNF boundary is the greatest lap number in the rider's valid checkpoint
  set; malformed records outside that set are ignored rather than treated as
  a new status event.
- Lap/cumulative/average values use `formatSecToClock`, and signed deltas and
  losses use `formatGapSec`; all calculations and tie-breaking use raw finite
  seconds before display rounding.
- When checkpoints exist but no valid timed laps exist, charts and the
  existing status card remain available and the new table shows an explicit
  empty state with no fastest/average values.
- Every reconciled fixed rider receives a sparse table column in rendered
  comparison order, including an all-blank column when no matching lap exists;
  stale IDs are excluded by the existing comparison reconciliation. Maximum
  loss ties prefer the earliest `lapNumber`; if tied on the same lap, they
  prefer the fixed-rider order supplied to the table.
- The table uses one `role="table"` DOM representation that switches to a
  labeled grid layout on narrow screens. The summary is placed after
  `SummaryCard` on the left; the table is above charts on the right.

## UX redesign audit v2 — future implementation plan (not started)

This plan is the bounded follow-up to the documentation-only audit in
`docs/ux-redesign-spec-v2.md`. No task below was implemented in the current
session; product code remains unchanged.

### UX2-1 — Workspace state and scroll intent

- Status: READY (future phase)
- Objective: Derive `browse`/`analyze` from the existing rider URL state and
  separate same-analysis scroll-preserving actions from category/new-route
  navigation.
- Scope: `components/RaceViewer.tsx`, workspace wrapper, focus/scroll intent;
  preserve `lib/urlState.ts` contract.
- Dependencies: UX redesign spec v2; no new dependency.
- Do not change: upstream types, data semantics, chart formulas, error/not-found
  boundaries, or public routes.
- Acceptance: rider/comparison/tab/lap actions do not force page top; category
  change clears dependents and may start at top; direct/deep-link and
  back/forward behavior follows the state table.
- Verification: focused tests, typecheck, browser scroll/focus smoke.

### UX2-2 — Chart-first workspace composition

- Status: BLOCKED by UX2-1
- Objective: Make the active workspace render context/status, `ChartTabs`, then
  `LapDetailTable`, with full results collapsed to an explicit on-demand surface.
- Scope: `RaceViewer.tsx`, `ChartTabs.tsx`, `LapDetailTable.tsx`, result summary
  disclosure, stable chart panel sizing.
- Dependencies: UX2-1.
- Do not change: chart data, chart tabs, sparse values, DNF/lapped meaning, or
  detail-table value contracts.
- Acceptance: valid active rider shows chart tab and plot frame in the target
  viewport; results and detail remain keyboard-reachable and readable.
- Verification: existing tests, build, browser smoke at 1440×900/1280×720.

### UX2-3 — Responsive compact controls

- Status: BLOCKED by UX2-1
- Objective: Keep current context/metric/comparison visible on Mobile and move
  low-frequency rider/fixed-rider lists into accessible bounded sheets/dialogs.
- Scope: `RiderSelector.tsx`, `ComparisonAdjuster.tsx`,
  `ComparisonRiderPicker.tsx`, responsive workspace styles, existing Base UI or
  native dialog primitives.
- Dependencies: UX2-1; coordinate with UX2-2 without parallel edits to the
  same integration file.
- Do not change: 44px target policy, graphable/all limit, four fixed-rider
  limit, or page-level overflow boundary.
- Acceptance: 390px/320px primary controls and chart are reachable without
  large vertical roundtrips; sheet focus return and long-name wrapping pass.
- Verification: keyboard smoke, overflow assertions, screenshots at both
  mobile sizes.

### UX2-4 — State/error/accessibility regression coverage

- Status: BLOCKED by UX2-2 and UX2-3
- Objective: Cover loading, error, empty, unavailable, DNF, lapped, missing,
  duplicate, pinned, all-limit, direct URL, and browser navigation states.
- Scope: behavior-focused tests and browser matrix; no data-model change.
- Dependencies: UX2-2, UX2-3.
- Do not change: existing error kinds or collector boundary.
- Acceptance: no stale race/chart flash, no hidden essential content, visible
  focus, screen-reader labels, and stable same-analysis scroll.
- Verification: `npm test`, `npx tsc --noEmit`, `npm run lint`, browser matrix.

### UX2-5 — Full verification, user test, review, and closeout

- Status: BLOCKED by UX2-4
- Objective: Run required checks, independent review, and a three-person
  first-use comparison against the baseline audit.
- Scope: tests/typecheck/lint/build, `git diff --check`, browser smoke, task
  metrics, reviewer, documentation closeout.
- Dependencies: UX2-4.
- Acceptance: all required checks pass, reviewer returns PASS, and Task 1–5
  show improved Time to Insight without regression of existing semantics.
- Verification: project required commands plus the v2 user-test protocol.

### Future execution order

```text
UX2-1 -> (UX2-2 || UX2-3) -> UX2-4 -> UX2-5
```
