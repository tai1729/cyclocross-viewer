# AJOCC Lap Time Viewer — Current Design Entry

Status: ACTIVE
Active Change: Phase 2 Slice 1 — arbitrary comparison riders

## Goal

Allow a rider to compare against individually selected graphable riders in
addition to the existing rank-neighbor presets. Preserve the Phase 1 result
table, chart semantics, category behavior, loading/error states, and mobile
accessibility guarantees.

## Scope

- Add a `pinned` comparison mode containing the primary rider and up to four
  fixed comparison riders, for a maximum of five chart series.
- Let users search, add, and remove fixed comparison riders within the active
  category.
- Keep numeric rank-neighbor modes (`±0` through `±5`) and the guarded `all`
  mode unchanged.
- Keep fixed selections in local category state while switching comparison
  modes; clear them when the category changes.

## Non-goals

- No URL synchronization or persistence across page reloads.
- No role-based chart styling, lap table, time-difference redesign, summary
  expansion, or mobile chart-detail redesign; those remain later Phase 2
  slices.
- No collector contract, route, data-source, dependency, or deployment
  configuration changes.

## Product behavior

### Comparison modes

- Numeric modes `0`–`5` select graphable riders near the primary rider's final
  position, using the existing rank-based semantics.
- `pinned` selects the primary rider plus the fixed rider IDs, sorted by final
  position. The primary rider is always first. Invalid, non-graphable,
  duplicate, or primary IDs are ignored. At most four fixed riders are used.
  The five-series limit applies to `pinned` only; numeric presets retain their
  existing possible range of up to eleven riders.
- `all` selects every graphable rider only when the existing graphable count is
  at most eight. The UI remains disabled for larger fields.
- If there is no primary rider, the existing selector behavior remains and
  chart comparison remains empty. With a graphable primary and zero fixed
  riders, pinned mode displays the primary series and an add-comparison prompt.
  A non-graphable primary cannot produce pinned chart data, matching the
  existing analysis-unavailable state.

### Fixed comparison picker

- The comparison controls list `固定` after `±5` and before `全員`; selecting
  it activates pinned mode and shows the inline picker. The picker is not
  opened as a modal.
- Search uses the existing normalized text matching behavior and searches
  graphable riders only. The primary rider and already fixed riders are not
  addable candidates.
- Each fixed rider has a visible remove control. The add control is unavailable
  at the four-rider fixed limit and communicates the limit without relying on
  color alone. If no candidates match the query, the picker says there are no
  matches; if the query is empty and every graphable rider is excluded, it says
  there are no addable riders; at the cap it states that the four-rider limit
  has been reached.
- Controls remain keyboard reachable, have visible focus, and provide a
  roughly 44px touch target at narrow widths. The picker may use an inline
  list; no new dialog or dependency is introduced.
- Fixed selections persist while changing between numeric, pinned, and all
  modes in the same category. They are not applied by numeric or all modes.
- RaceViewer owns primary/fixed reconciliation. Selecting a new primary removes
  that new primary ID from the fixed set to avoid duplicate series; other fixed
  IDs remain. Clearing the primary leaves the fixed IDs in local state, but
  pinned derivation is empty until a graphable primary is selected again.
  Changing category clears the fixed set, clears the primary rider, and
  restores numeric `±2`, matching existing category reset behavior.

## Architecture and data flow

`RaceViewer` owns `pinnedRiderIds` alongside the existing primary rider and
comparison mode state. `useComparisonRiders` exposes a pure
`getComparisonRiders` helper and applies the mode-specific selection. The new
picker receives graphable candidates and controlled fixed IDs, while
`ComparisonAdjuster` remains the mode control.

```text
race.riders
  -> RaceViewer graphableRiders (dataQuality ok + valid checkpoints)
  -> primary rider + pinned IDs + comparison mode
  -> getComparisonRiders / useComparisonRiders
  -> ChartTabs and existing chart transforms
```

The upstream `Rider` and `RaceResult` contracts remain unchanged. DNF riders
with valid checkpoints remain graphable and selectable; DNF riders without
valid checkpoints are excluded. The picker does not fetch data and does not
bypass `dataSource.ts` or `dataTransform.ts`. Riders with equal final
positions are ordered by `finalPosition` then `riderId` for deterministic
selection.

## Error and edge behavior

- Invalid external rider values are filtered by the existing graphable gate;
  the picker never offers them.
- An empty search result is rendered as an explicit empty state.
- The picker interface is controlled: `RaceViewer` owns the fixed ID list and
  exposes graphable candidates, while the picker emits only add/remove and
  activate callbacks.
- Removing the primary rider from the result selector clears it as before; any
  stale ID in the fixed set is ignored by the pure selection helper.
- A fixed set containing fewer than four valid IDs remains valid; no automatic
  filling or inferred riders occur.
- Existing network, HTTP, invalid-data, not-found, loading, and analysis-
  unavailable states are unchanged.

## Affected files

- `hooks/useComparisonRiders.ts`
- `components/ComparisonAdjuster.tsx`
- `components/ComparisonRiderPicker.tsx` (new)
- `components/RaceViewer.tsx`
- `tests/useComparisonRiders.test.ts` (new)
- `docs/PRODUCT.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/SPEC_AUDIT.md`

## Acceptance criteria

1. Numeric modes preserve the current rank-neighbor behavior.
2. `pinned` mode renders the primary plus at most four selected graphable
   riders, in stable final-position order, with no duplicate series.
3. Users can search, add, and remove fixed riders; the cap and empty states
   are explicit and usable at 320px/390px widths.
4. Fixed selections persist across comparison-mode changes and reset on
   category changes; changing the primary removes that ID from fixed state.
   Clearing and reselecting a primary preserves the local fixed IDs but keeps
   derivation empty while no graphable primary is selected.
5. Existing `all` eligibility and all Phase 1 error/loading/not-found behavior
   remain intact.
6. Tests, typecheck, lint, production build, and diff hygiene pass.
7. An independent reviewer returns `PASS` against this design and the project
   acceptance rules.

## Validation commands

- `npm.cmd test`
- `npx.cmd tsc --noEmit`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`

## Baseline

Phase 1 production acceptance remains recorded in
`docs/2026-09-05-phase-1-production-acceptance.md`. The remote release SHA is
`bab760bea87c2dfc126b70559e375a721b68dd5a`; this Slice 1 design does not alter
that baseline evidence.
