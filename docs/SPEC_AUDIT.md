# Specification Audit

Current Change: Phase 2 Slice 3 — time-difference analysis

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

STATUS: CLEAR
