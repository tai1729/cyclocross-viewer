# Phase 2 Slice 7 - URL-synchronized state closeout

Date: 2026-09-05
Status: COMPLETE

## Delivered

- Home season and series filters are restored from the query and written as
  history entries; changing season clears series.
- Meet links carry matching Home context, and race back links restore only
  valid context. Direct race visits continue to return to the unfiltered Home.
- Race category, primary rider, comparison mode, pinned riders, chart tab, and
  deliberate lap selection are shareable and restored on reload/navigation.
- Invalid and stale values are normalized against the available meet/race
  data. Unknown repeated query pairs survive rewrites, defaults are omitted,
  and hover remains transient.
- Category selection is resolved before the race request, while dependent
  rider/fixed/tab/lap state is normalized only after the target response.
  Existing sparse data, DNF, lapped, loading/error, not-found, and comparison
  limit behavior remains in force.
- `ChartTabs` is now controlled by `RaceViewer` for durable tab/lap state and
  keeps its existing chart and detail interactions.

## Verification

- `npm.cmd test` - 48 passed
- `npx.cmd tsc --noEmit` - passed
- `npm.cmd run lint` - passed
- `npm.cmd run build` - passed
- `git diff --check` - passed
- Local browser smoke - PASS for Home filter and return-context URLs,
  shareable rider/tab/lap state, category reset, invalid values and unknown
  repeated parameters, normal data, small (6 riders), large (68 riders), DNF,
  lapped, and not-found routes.
- Responsive regression remains covered by the existing Slice 4/5 320px and
  390px checks; this slice changes URL/state wiring and does not change layout
  boundaries or chart formulas.
- Independent reviewer - PASS

## Closeout

- P2S7-1 Pure URL contract and tests: DONE.
- P2S7-2 Home URL synchronization: DONE.
- P2S7-3 Race URL synchronization and controlled chart state: DONE.
- P2S7-4 Canonical documentation and closeout: DONE.
- P2S7-5 Full verification, review, commit, and push: DONE.

This is a dated implementation record. Earlier Phase 1 and Phase 2 slice
history documents remain unchanged.
