# Implementation Plan

Status: COMPLETE
Active implementation plan: Phase 2 Slice 4 — lap detail and summary (complete)

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
