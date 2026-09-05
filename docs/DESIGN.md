# AJOCC Lap Time Viewer — Current Design Entry

Status: ACTIVE
Active Change: Phase 2 Slice 2 — role-based chart styling

## Goal

Make the role of each plotted rider immediately legible when comparing a
primary rider, fixed comparison riders, and a larger context set. Preserve the
existing four chart meanings, data semantics, comparison state model, and
mobile/keyboard behavior.

## Scope

- Classify displayed riders as `primary`, `fixed`, or `context`.
- Give the primary a strong dark solid line, fixed riders up to four distinct
  accessible colors, and context riders a neutral low-emphasis treatment.
- Apply the role styles consistently to rank, gap, pace, and lap charts.
- Keep legends quiet for crowded context sets and provide role-aware tooltip
  content that prioritizes primary/fixed values instead of listing every
  context rider unconditionally.
- Add pure style/classification tests and preserve existing chart line-type
  semantics (`stepAfter` for rank, `linear` for time series).

## Non-goals

- No new chart type, lap table, time-difference calculation, URL state sync,
  summary redesign, or data contract change.
- No change to the graphable-rider gate, pinned selection cap, `all` eligibility
  guard, missing-lap behavior, or route/error states.
- No new dependency. Existing Recharts and Tailwind primitives remain the
  implementation boundary.

## Product behavior

### Role classification

- The selected primary rider is always `primary`.
- A rider is `fixed` only when the active comparison mode is `pinned` and its
  ID is in the active fixed ID list. Fixed IDs that are not displayed are
  ignored.
- Every other displayed rider is `context`, including riders shown by numeric
  rank presets and riders shown by `all`.
- The role model is derived from current display inputs; it does not persist or
  alter comparison state.

### Visual treatment

- `primary`: dark ink color, solid stroke, highest width/opacity, visible dots
  when the chart is not crowded, and an accessible label identifying it as the
  primary rider.
- `fixed`: four-role palette colors, solid medium-width strokes, visible dots
  when practical, and labels using the rider name.
- `context`: neutral gray, lower opacity, thin stroke, and a short dash pattern
  so it is not distinguished by color alone. Context remains visible as race
  shape, but never competes with the primary/fixed series.
- Shared style values are primary `#292722` / width `3.5` / opacity `1`, fixed
  palette / width `2.5` / opacity `0.95`, and context `#77736b` / width `1.5`
  / opacity `0.5` / dash `5 4`. Context dots and legends are hidden when the
  shared crowded predicate is true; primary and fixed dots remain visible when
  their chart supports dots. The role treatment must not make the chart
  unreadable at 320px/390px.

### Tooltip and legend

- Rank and lap tooltips show present primary/fixed values with role labels.
  Gap and pace retain the existing zero `ReferenceLine` as the primary
  baseline; the baseline is labeled as the primary but is not synthesized as a
  tooltip payload entry. In every chart, context is summarized at the hovered
  point rather than listed rider-by-rider: rank reports count plus min–max
  rank, while gap, pace, and lap report count plus min–max formatted value.
- The all-mode legend is always suppressed, even for 2–8 riders. Numeric
  presets use the shared crowded predicate `displayed rider count > 8`; pinned
  mode with five or fewer series may show its role-labeled legend.
- Tooltip entries with missing/null values are omitted. Context summaries use
  only finite values present at the current hovered point; they never infer,
  interpolate, or aggregate across missing laps. Tooltip cards wrap long names
  within a viewport-safe maximum width.
- The chart keeps its visible context lines and an adjacent text note explains
  that context is intentionally de-emphasized when the legend is suppressed.
- No information is conveyed by color alone: line weight, dash pattern,
  textual labels, and the existing chart description carry the distinction.

## Architecture and data flow

`RaceViewer` passes the active fixed IDs to `ChartTabs` only when pinned mode
is active, plus an explicit all-mode flag. `ChartTabs` derives a pure
`RiderSeriesStyle` map for the displayed riders and passes it to each chart. A
shared role-aware tooltip renderer keeps the four chart implementations
consistent. Stored fixed IDs remain unchanged outside pinned mode and receive
fresh palette slots from filtered insertion order when pinned mode resumes.

```text
comparisonRiders + primaryRiderId + active pinned IDs
  -> classifyRiderSeries / buildRiderSeriesStyles
  -> ChartTabs + isAllMode
  -> RankBumpChart / GapChart / PaceChart / LapTimeChart
  -> role-aware lines, legends, tooltips, and text notes
```

The helper is deterministic: fixed colors are assigned in fixed-ID order, and
unlisted riders receive the context style. The existing `colors` map may be
removed from the chart path if the new style map fully replaces it; no other
consumer contract changes.

## Error and edge behavior

- Empty comparison data retains the existing `NoComparisonRiders` display.
- A pinned mode with only the primary keeps the existing behavior: rank/lap
  render the primary series, while gap/pace retain the existing
  `NoComparisonRiders` state because they require a comparison series. The
  picker remains available for adding a comparison rider.
- Missing or invalid rider IDs are ignored by style derivation and cannot
  produce a line or tooltip entry.
- In gap/pace the primary remains a zero reference line; it is not duplicated
  as a synthetic data series.
- An all-mode set remains bounded by the existing eight-rider UI guard, while
  numeric presets keep their current rider count behavior.
- Existing network, HTTP, invalid-data, not-found, loading, DNF, and
  analysis-unavailable states remain unchanged.

## Affected files

- `components/RaceViewer.tsx`
- `components/ChartTabs.tsx`
- `components/RankBumpChart.tsx`
- `components/GapChart.tsx`
- `components/PaceChart.tsx`
- `components/LapTimeChart.tsx`
- `components/RoleAwareTooltip.tsx` (new)
- `lib/chartColors.ts` or a focused chart-style helper module
- `tests/chartSeriesStyles.test.ts` (new)
- `docs/PRODUCT.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/SPEC_AUDIT.md`

## Acceptance criteria

1. Pure role/style derivation returns primary, fixed, and context roles with
   deterministic colors and no duplicate IDs.
2. All four charts use the same role map: primary is strongest, fixed riders
   are distinguishable, and context is visibly de-emphasized without color-
   only meaning. Gap/pace retain the primary zero reference line.
3. Rank remains `stepAfter`; gap, pace, and lap remain `linear`; missing data
   is not connected or inferred.
4. All mode always suppresses its legend; other charts suppress it only when
   displayed rider count exceeds eight. Tooltips show present primary/fixed
   values and the exact per-chart context count/range summary, without listing
   missing or inferred values.
5. Numeric, pinned, and all comparison modes retain their existing selection
   behavior and error/loading/not-found behavior.
6. The role treatment remains usable at 320px/390px with visible focus and no
   page-level horizontal overflow.
7. Tests, typecheck, lint, production build, diff hygiene, browser smoke, and
   independent review pass.

## Validation commands

- `npm.cmd test`
- `npx.cmd tsc --noEmit`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`
- local browser smoke for normal, pinned, all, and narrow layouts

## Baseline

Phase 1 production acceptance is recorded in
`docs/2026-09-05-phase-1-production-acceptance.md`. Phase 2 Slice 1 fixed
comparison is released on remote `main` at `22c38212a4ad49729abdf67bc106ecabb4fec25c`.
