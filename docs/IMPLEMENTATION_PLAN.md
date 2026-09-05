# Implementation Plan

Status: READY_FOR_IMPLEMENTATION
Active implementation plan: Phase 2 Slice 1 — arbitrary comparison riders
Phase 1 baseline: COMPLETE and released at `bab760bea87c2dfc126b70559e375a721b68dd5a`

## Task graph

### P2S1-1 — Comparison selection model

- Status: DONE
- Objective: Add pure and hook-backed support for numeric, pinned, and all
  comparison modes while preserving existing rank-neighbor semantics.
- Scope: `hooks/useComparisonRiders.ts`, focused unit tests.
- Dependencies: specification audit clear.
- Do-not-change: chart components, external data contracts, route behavior,
  dependency versions, and unrelated worktree edits.
- Acceptance: pinned selection filters invalid/duplicate/primary IDs, sorts by
  final position, and caps fixed riders at four; all mode remains guarded.
- Verification: focused test plus full project validation.

### P2S1-2 — Fixed comparison picker

- Status: DONE
- Objective: Provide an accessible inline search/add/remove UI for fixed riders.
- Scope: `components/ComparisonAdjuster.tsx`, new
  `components/ComparisonRiderPicker.tsx`.
- Dependencies: P2S1-1 API and resolved audit.
- Do-not-change: `RaceViewer.tsx`, chart rendering, result-table semantics,
  and external contracts.
- Acceptance: graphable-only candidates, normalized search, explicit no-match,
  no-candidate, and four-rider-cap states, visible focus, and narrow-screen
  touch targets. The controlled interface is `primaryRiderId`,
  `pinnedRiderIds`, `graphableRiders`, `onActivate`, `onAdd`, and `onRemove`;
  RaceViewer remains the only state owner.
- Verification: typecheck, lint, focused component behavior through tests or
  build, and browser smoke after integration.

### P2S1-3 — Race viewer integration

- Status: DONE
- Objective: Own fixed IDs in category-local state and connect the picker and
  mode control to existing chart comparison.
- Scope: `components/RaceViewer.tsx` and any necessary product documentation.
- Dependencies: picker and hook interfaces complete.
- Do-not-change: data fetching, category ordering, error boundaries, chart
  transform semantics, and Phase 1 behavior outside comparison selection.
- Acceptance: fixed IDs persist across modes, reset on category changes, and
  the new primary cannot remain pinned; numeric/all modes remain unchanged.
- Verification: full validation and local browser acceptance at desktop and
  320px/390px widths.

### P2S1-4 — Verification and independent review

- Status: READY
- Objective: Run all required commands, inspect the diff, and obtain reviewer
  PASS.
- Scope: tests, typecheck, lint, build, diff hygiene, reviewer report, and
  bounded revisions if needed.
- Dependencies: all implementation tasks complete.
- Do-not-change: release history and unrelated user changes.
- Acceptance: all required checks pass and reviewer returns `PASS`.

## Execution order

```text
two spec auditors -> specification resolution -> P2S1-1
  -> P2S1-2 -> P2S1-3 -> P2S1-4
```

Tasks have disjoint write ownership. No parallel worker may edit the same
source file as another worker.

## Resolved design decisions

- `pinned` is a separate mode, not a union with numeric presets. This keeps
  the five-series cap deterministic and makes mode switching reversible.
- The cap is five total series: one primary plus four fixed riders.
- Fixed IDs are local to the active category and are not URL-synced in this
  slice.
- Only graphable riders (valid checkpoints and non-error data quality) can be
  added. The primary and fixed IDs are excluded from candidate results.
- Existing `all` remains available only at eight or fewer graphable riders.
- A valid-checkpoint DNF is graphable and may be pinned; a DNF without valid
  checkpoints is not a candidate.
- Pinned mode with zero fixed riders displays the graphable primary alone plus
  an add prompt. No primary or a non-graphable primary yields no comparison
  series.
- The visible control label is `固定`, placed after `±5` and before `全員`.
- Sorting is by `finalPosition`, then `riderId`; fixed IDs survive primary
  clearing/reselection in local state but are ignored until a graphable primary
  exists.
