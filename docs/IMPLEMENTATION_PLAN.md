# Implementation Plan

Status: READY_FOR_VERIFICATION
Active implementation plan: Phase 2 Slice 3 — time-difference analysis

## Baseline

Phase 2 Slice 1 fixed comparison and Slice 2 role-based chart styling are
complete on remote `main`. Slice 3 is deliberately limited to clarifying the
existing difference charts; lap tables and lap summaries are Slice 4.

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

- Status: READY
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
