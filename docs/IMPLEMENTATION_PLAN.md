# Implementation Plan

Status: READY_FOR_IMPLEMENTATION
Active implementation plan: Phase 2 Slice 2 — role-based chart styling
Phase 2 Slice 1 baseline: released on remote `main` at
`22c38212a4ad49729abdf67bc106ecabb4fec25c`

## Task graph

### P2S2-1 — Role model and style helper

- Status: DONE
- Objective: Add deterministic pure role classification and style derivation.
- Scope: focused chart-style helper and `tests/chartSeriesStyles.test.ts`.
- Dependencies: specification audit clear.
- Do-not-change: chart components, data transforms, comparison selection,
  external contracts, and unrelated dirty-worktree files.
- Acceptance: primary/fixed/context roles, four fixed colors, context fallback,
  invalid/duplicate filtering, and stable output are covered by tests.
- Verification: focused tests and full validation.

### P2S2-2 — Shared role-aware tooltip

- Status: DONE
- Objective: Provide one typed tooltip/role-summary renderer for all charts.
- Scope: new `components/RoleAwareTooltip.tsx`.
- Dependencies: style helper contract.
- Do-not-change: chart line semantics or data transforms.
- Acceptance: primary/fixed values remain readable; crowded/all context is
  summarized rather than listed unconditionally; empty/inactive states are
  safe and accessible.
- Verification: typecheck, lint, and build.

### P2S2-3 — Chart styling integration

- Status: DONE
- Objective: Apply the shared role map and tooltip to every chart.
- Scope: `ChartTabs.tsx`, `RankBumpChart.tsx`, `GapChart.tsx`,
  `PaceChart.tsx`, `LapTimeChart.tsx`.
- Dependencies: helper and tooltip APIs.
- Do-not-change: `stepAfter`/`linear`, missing-data semantics, chart tabs, or
  route/error states.
- Acceptance: all four charts have consistent primary/fixed/context treatment,
  crowded legend behavior, textual role cues, and no page overflow.
- Verification: full validation and browser smoke.

### P2S2-4 — RaceViewer and documentation integration

- Status: DONE
- Objective: Pass active pinned IDs only for pinned mode and update canonical
  product documentation.
- Scope: `components/RaceViewer.tsx`, `docs/PRODUCT.md`.
- Dependencies: chart API complete.
- Do-not-change: comparison selection semantics, category reset, data fetching,
  and existing Phase 1 behavior.
- Acceptance: numeric/all modes classify non-primary riders as context; pinned
  mode highlights only active fixed IDs; docs match implementation.
- Verification: full validation and browser smoke.

### P2S2-5 — Verification and independent review

- Status: READY
- Objective: Run required checks, inspect scope, obtain reviewer PASS, and
  commit/push the approved implementation.
- Scope: tests, typecheck, lint, build, diff hygiene, browser smoke, reviewer,
  bounded revisions, and Git handoff.
- Dependencies: all implementation tasks complete.
- Do-not-change: unrelated user changes, Phase 1 history, credentials, and
  deployment configuration.
- Acceptance: every required check passes and reviewer returns `PASS`.

## Execution order

```text
two spec auditors -> specification resolution -> P2S2-1
  -> P2S2-2 -> P2S2-3 -> P2S2-4 -> P2S2-5
```

No parallel worker may edit the same source file as another worker.

## Resolved design decisions

- `primary` is always the selected rider; `fixed` is active only in pinned
  mode; all other displayed riders are `context`.
- In gap/pace the primary remains the existing zero `ReferenceLine`; it is
  labeled as primary but is not synthesized into the data or tooltip payload.
- Fixed colors are assigned by the filtered state-array insertion order, not by
  final rank. Stored IDs are inactive outside pinned mode and are recolored by
  that order when pinned mode resumes.
- Context uses neutral gray, lower opacity, thin width, and a dash pattern so
  role is not communicated by color alone.
- Shared style values are primary `#292722` / 3.5 / 1, fixed 2.5 / 0.95, and
  context `#77736b` / 1.5 / 0.5 / dash `5 4`.
- All mode always hides its legend; numeric modes use `displayedCount > 8` as
  the crowd predicate; pinned mode with five or fewer can show its legend.
- Tooltips show present primary/fixed values and summarize present context as
  count plus min–max for the chart's units. Missing values are omitted and no
  cross-lap aggregation is performed.
- Pinned primary-only state renders rank/lap primary charts and retains the
  existing gap/pace comparison-empty state.
- Existing line interpolation, graphable gate, numeric/all limits, and route
  contracts remain unchanged.
