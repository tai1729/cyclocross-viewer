# AJOCC Lap Time Viewer — Current Design Entry

Status: ACTIVE
Active Change: Phase 2 Slice 3 — time-difference analysis

## Context and assumption

Phase 2 Slice 1 fixed comparison and Slice 2 role-based chart styling are
released on `main`. This change assumes the previously proposed boundary is
approved: Slice 3 clarifies the existing time-difference analysis only;
the lap table and fastest/average-lap summary remain a later Slice 4.

## Goal

Make the two existing difference charts answer two distinct questions without
requiring the user to infer the sign or read values from a curve:

1. At which lap did a comparison rider's cumulative time gap open or close?
2. On which lap was that rider faster or slower than the selected rider?

The selected rider remains the zero reference, role-aware styling from Slice 2
remains in force, and all existing lap-data semantics are preserved.

## Non-goals

- No lap table, fastest-lap card, average-lap card, or maximum-loss summary;
  those belong to Slice 4.
- No URL state synchronization, official-result metadata, export, or new
  production dependency.
- No change to comparison selection, pinned limits, all-mode eligibility,
  route/error states, or the upstream JSON contract.
- No interpolation across missing laps and no synthetic primary data series.

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
- `docs/PRODUCT.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/SPEC_AUDIT.md`

## Acceptance criteria

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
