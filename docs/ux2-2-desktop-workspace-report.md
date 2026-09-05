# UX2-2 Desktop Workspace Implementation Report

Implementation date: 2026-09-06

## Scope

UX2-2 only: the active desktop analysis workspace is chart-first while the
existing URL/state owner, route semantics, chart/data transforms, and mobile
composition remain unchanged. The post-review revision keeps the mobile
results-first structure as a separate presentation branch. UX2-3 sheets, the
compact mobile header, and UX2-4/5 verification work are out of scope.

## Implementation

- Added the presentation-only `AnalysisContextBar` for race, category, rider
  position/status, comparison mode/count, and active metric.
- Kept `RaceViewer` as the sole URL/state owner. The desktop breakpoint is
  `min-width: 1024px`; resize changes presentation only.
- On active Desktop analysis, the DOM order is context/status, `ChartTabs`,
  `LapDetailTable`, control rail, then the optional results disclosure. CSS
  grid places the 280–320px rail on the visual left of the flexible chart
  column.
- Moved the active Desktop results table into a native, closed-by-default
  `details` disclosure labelled `結果表を表示`. Its open state is local and
  survives presentation resize without entering the URL or browser history.
- Browse and sub-1024px rendering retain the full results table placement and
  the existing vertical composition. Below the breakpoint the Desktop
  disclosure/summary is not rendered; the single full results table is placed
  before the analysis workspace in both DOM and visual order. On Desktop the
  same table is placed after the workspace, so only one table is mounted at a
  time.
- The analysis children also use structural breakpoint order: Mobile keeps
  the existing rail → lap detail → chart sequence, while Desktop uses chart
  tabs → lap detail → rail. The Desktop rail is still visually left through
  grid placement; CSS order is not used to define Mobile reading order.
- Updated `RiderSelector` so entering analysis from a browse result closes the
  full list and leaves the existing compact trigger, search, keyboard, and
  focus behavior available.

## Verification

Focused context-label tests cover metric/comparison vocabulary and finished,
lapped, DNF, and unavailable status text. `resultsPresentation` tests cover
browse/mobile full-table routing, Desktop closed-by-default/open preference,
and protection against a forced mobile presentation changing that preference.
The repository test, TypeScript, lint, and production build checks all pass.

## Known non-blocking risk

The initial server/hydration render uses the conservative non-desktop
presentation until the client media query is evaluated. This avoids deriving
durable analysis state from viewport width; the URL, history, and local
disclosure state remain independent of the presentation query. The client
branch is resolved synchronously by `useSyncExternalStore`; a resize does not
write the open preference.

## Baseline evidence

The public production site was tested before source inspection at the same
representative state: `MMJ-256-005 / ME1 / rider=KNS-000-4368`. CUA browser
screenshots were captured at 1440×900 and 1280×720 in the verification session;
no image asset was added to the repository because the browser surface does
not expose a local screenshot path.

| viewport | results table | analysis top | chart top | plot visible in initial viewport | observation |
| --- | ---: | ---: | ---: | ---: | --- |
| 1440×900 | y=366, h=392 | y=791 | y=1289 | 0px | full result table, rider/configuration and lap detail precede chart |
| 1280×720 | y=366, h=392 | y=791 | y=1309 | 0px | chart is entirely below the initial viewport |

The public screenshots showed the result card as the dominant first surface and
only the beginning of the analysis controls at the bottom edge. These values
are evidence, not pixel targets.

## After measurements

The local Next.js development server was tested with the same URL state after
the implementation. The chart role's 416px plotting frame is the existing
component frame; `plot visible` is its intersection with the initial viewport.

| viewport | context | chart tabs top | chart top | plot visible | results disclosure | horizontal overflow |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| 1440×900 | y=275, h=106 | y=445 | y=525 | 375px | closed, h=50 | none |
| 1280×720 | y=275, h=106 | y=445 | y=525 | 195px | closed, h=50 | none |
| 1024×720 | y=275, h=126 | y=465 | y=545 | 175px | closed, h=50 | none |

The active Desktop workspace analysis region starts at y=275, with a 320px
control rail and the chart column beginning at the same grid row. At 1440 the
rail measured 320px wide and 414px high. The results table is mounted exactly
once and is behind the closed disclosure after the workspace. The initial
Desktop result-table height is therefore removed from the chart's preceding
content rather than merely hidden below the fold.

The before-to-after chart-top change is approximately -764px at 1440 and
-784px at 1280. The initial plot visibility changes from 0px to a usable frame
at both target sizes.

## Browser verification

The `agent-browser` CLI was unavailable in this environment, so the persistent
Chrome CUA browser surface was used for the required interaction and
screenshot checks. Browser console errors were empty.

### Desktop 1440×900

- Initial deep link: context, selected rider, comparison, metric, tabs, and
  chart frame were visible; results summary was closed.
- The summary is an actual Desktop disclosure. Opening and closing it keeps
  the single result table mounted and returns focus to the native summary
  without changing the URL.
- `ChartTabs` was verified before `LapDetailTable` in the primary DOM and
  visually above it; the rail was visually left of the chart.
- Keyboard result-row entry focused `#race-analysis` and produced the compact
  selected-rider trigger without leaving the full rider list open.
- Metric, comparison, and rider changes retained the chart in view and kept
  the expected URL/state. Accessibility-index activation retained `scrollY`
  (a locator's own auto-centering was not used as app evidence).
- The explicit `結果表を表示` summary opened and closed the single existing
  result table; native summary focus remained active and no URL changed.
- Back/forward restored the selected metric and URL; category back/forward
  restored the category and correctly cleared/restored the dependent rider
  state according to the UX2-1 contract.

### Desktop 1280×720

- The same initial chart-first structure was present with 195px of plot frame
  visible and no sticky overlap or horizontal overflow.
- The 280–320px rail remained intact and the chart column retained usable
  width (825px at 1280px).

### 1024px boundary and large data

- At exactly 1024px, the Desktop grid had no horizontal overflow; the chart
  remained visible with 175px of plot frame.
- `CXK-256-004 / ME1` with 60 riders was checked at 1440×900. Context wrapped
  long race text without overflow, the chart remained at y=545 with 355px of
  visible frame, and the result table remained a single bounded surface.

### Mobile regression-only checks

- 390×844: the exact-width Mobile smoke showed the existing full results
  surface first (table y=492, analysis y=925) with no Desktop sidebar or
  disclosure trigger; the revision preserves that placement and removes the
  Desktop disclosure from the DOM below the breakpoint.
- 320×568: the revised CUA smoke showed the full result table first, analysis
  below it, no `details`/summary in the accessibility tree, wrapped race
  metadata, and no page horizontal overflow.
- UX2-3 sheets and compact mobile toolbar were not introduced.

## Accessibility findings

- `AnalysisContextBar` exposes all state as text in labeled definition-list
  items; it does not rely on color.
- The workspace retains the unique focusable `h2`, existing tab semantics,
  existing rider/comparison labels, and native disclosure keyboard behavior.
- Result-row keyboard entry and same-workspace control focus were verified;
  chart SVG remains non-essential to the keyboard path.
- Desktop disclosure open/close was verified with native summary focus. The
  mobile accessibility tree contains no Desktop disclosure and keeps the
  results-first reading order; presentation classification and preference
  behavior are covered by unit tests.
- The implementation uses a presentation media query only. The known first
  server render is conservative before client media-query evaluation; no
  durable URL state depends on that query.

## UX2-1 regression verification

The existing suite (63 tests) includes the UX2-1 navigation/URL tests and
passed.
Browser checks confirmed:

- rider, comparison, metric changes keep the expected URL and do not navigate
  to document top when activated through the accessible control surface;
- rider picker closes to the stable trigger and returns focus after selection;
- category change is still a new navigation that clears dependent analysis;
- browser back/forward restores the URL-derived state and category focus;
- deep link starts in the active workspace without changing URL semantics.

## Known limitations and UX2-3 handoff

- The context bar is intentionally non-sticky in UX2-2 because `RaceHeader` is
  already sticky. UX2-3 may introduce a measured mobile toolbar, but it must
  not add a second `top: 0` sticky layer.
- The mobile surface remains long and the rider/comparison lists remain in the
  existing vertical composition. UX2-3 owns bottom-sheet/dialog disclosure,
  mobile compact context, and mobile repeated-analysis round trips.
- Full lap-detail disclosure was not redesigned. UX2-4 owns the broader
  loading/error/empty/accessibility state matrix and UX2-5 owns final user
  testing and closeout.

## Implementation status

Production code, focused tests, TypeScript, lint, build, diff check, Desktop
browser verification, Mobile regression verification, and the post-review
independent review all passed. This slice is ready for UX2-3 handoff; the
Mobile surface remains intentionally out of scope.
