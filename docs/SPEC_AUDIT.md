# Specification Audit

Current Change: Phase 2 Slice 4 — lap detail and summary

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

STATUS: CLEAR

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
