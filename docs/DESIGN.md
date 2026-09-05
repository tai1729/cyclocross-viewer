# AJOCC Lap Time Viewer — Current Design Entry

Status: CLOSED
Active Change: Phase 2 Slice 4 — lap detail and summary (complete)

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
