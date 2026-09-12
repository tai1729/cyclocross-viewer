# UX3-7R3 Mandatory Layout & Data Bug Remediation

## 1. Executive Summary

UX3-7R3 addresses the 16 issues reported by Owner Human from Production. The
implementation covers the shared disclosure interaction, desktop alignment,
full-flow result tables, independent home filters, and the common race-lap
data contract. UX3-8 was not started.

The release gate is intentionally per issue: D-01--D-10, M-01--M-02, and
B-01--B-04 each require an individual PASS.

## 2. Baseline

- Viewer baseline from the preceding UX3-7R2 validation: 145 tests.
- Viewer UX3-7R3 validation: 156 tests, 156 passed.
- Collector baseline: 3 parser tests.
- Collector UX3-7R3 validation: 12 tests, 12 passed.
- Existing source-of-truth documents: `docs/PRODUCT.md`, `docs/DESIGN.md`,
  `docs/IMPLEMENTATION_PLAN.md`, and `docs/SPEC_AUDIT.md`.
- Official cross-check pages: [race 27834](https://data.cyclocross.jp/race/27834),
  [race 27770](https://data.cyclocross.jp/race/27770), and
  [race 27160](https://data.cyclocross.jp/race/27160).

## 3. Owner Issue Matrix

| ID | Problem | Implementation | Verification | Final |
|---|---|---|---|---|
| D-01 | Rider search controls misaligned | Responsive input/button row with shared control height | 1440x900, 1280x720 screenshot and browser check | PASS |
| D-02 | Focus rider selector and arrows misaligned | Single aligned control group with 44px arrow targets | 1440x900, 1280x720 screenshot and browser check | PASS |
| D-03 | Redundant comparison title | Visible chart title removed; accessible chart identity retained | Chart DOM/screenshot check | PASS |
| D-04 | Ranking lap detail clipped by internal scroll | Internal max-height/overflow removed; document flow retained | Full table browser snapshot | PASS |
| D-05 | Selected-lap disclosure state unclear | Shared native details/summary with chevrons and synchronized ARIA | Open/closed screenshot and keyboard-native semantics | PASS |
| D-06 | Lap detail border split | Shared continuous disclosure container | Open/closed screenshot | PASS |
| D-07 | Results disclosure border split | Same shared disclosure container and styling | Open results screenshot and full-row snapshot | PASS |
| D-08 | Obsolete results skip action | Action, anchor, and handler removed | Source/test check and flow verification | PASS |
| D-09 | Comparison rider panel cannot collapse | Desktop and mobile comparison panels are collapsible | Closed/open screenshots and interaction check | PASS |
| D-10 | Selected comparison background too weak | Stronger selected background plus check and selected label | Picker state screenshot/source check | PASS |
| M-01 | Filter change jumps to page top | URL navigation uses `scroll:false`; existing history contract preserved | 390px scrollY 500 before/after; URL/back/forward | PASS |
| M-02 | Mobile comparison state unclear | Shared chevron, border, 44px summary, and ARIA state | 390x844 closed/open screenshot | PASS |
| B-01 | Season and series cannot combine | Independent URL patches and intersection predicate | Unit test plus browser URL/filter flow | PASS |
| B-02 | CCS-256-003 displays 10 instead of 11 laps | Official race axis plus H:MM:SS final-lap parser | Collector fixture/unit test and Production value | PASS |
| B-03 | KNS-256-010 displays 10 instead of 11 laps | Same generalized official-axis/final-lap fix | Collector fixture/unit test and Production value | PASS |
| B-04 | KNS-256-011 gap chart misses P2 | Explicit authoritative lap-axis handoff, matching-lap finite gap retention, including the separate generalized exact-zero case, plus visible overlap | Rendered LineChart payload, targeted regression test, and Production chart verification | PASS |

## 4. Desktop Layout

### D-01

`RiderDiscovery` places the input and search button in one responsive row at
desktop widths, using the same minimum height and `items-center` alignment.

### D-02

`RiderSelector` keeps the selected rider control and previous/next buttons in a
single group. The arrow controls remain 44px-class targets.

### D-03

The visible `注目選手 ... vs ...` chart heading was removed from `ChartTabs`.
The chart keeps the screen-reader comparison identity and the Control Deck
identity, so context is not lost.

### D-04

`ChartDetailPanel` and `RaceResultsTable` no longer impose an internal
max-height scroll container. Lap rows and result rows remain in normal
document flow; only the page scrolls.

### D-05

`ChartDetailPanel` uses the shared `Disclosure` component. Its whole summary is
the native keyboard-operable trigger, with a down chevron while closed and an
up chevron while open.

### D-06

`LapDetailDisclosure` uses the same shared component. The summary border and
content are joined by one rounded outer border with only the open-state divider.

### D-07

The active results surface in `RaceViewer` uses the same disclosure component
and interaction pattern. Its embedded result table does not add a competing
outer card border.

### D-08

The obsolete `結果表を飛ばして分析操作へ` action and its focus/anchor path
were removed. The existing result selection and navigation path remains.

### D-09

The desktop comparison panel is wrapped in the shared disclosure. Closing the
summary returns the chart to the compact control-deck height without changing
the selected comparison riders.

### D-10

Pinned riders use a stronger selected background, a check icon, and the visible
`選択中` label. These are separate from hover and keyboard focus styling.

## 5. Mobile Layout

### M-01

Home filter updates use the existing URL state serializer and
`router.push(..., { scroll: false })`; canonicalization uses
`router.replace(..., { scroll: false })`. No mobile-only branch was added.

### M-02

The mobile comparison surface is controlled by the same `Disclosure` component
as the desktop and lap/result surfaces. At 390px the summary remains a clear
44px-class tap target and its chevron/ARIA state changes on toggle.

## 6. Data / Functional Bugs

### B-01

#### Reproduction

Before: reproduced in the URL-state behavior: changing one filter cleared the
other. The regression test and browser flow now retain both values.

#### Root cause

Home filter URL updates were modeled as a dependent reset: season changes
cleared series, and the canonicalization predicate treated a valid pair as an
invalid state.

#### Fix

Season and series are independent URL patches. The predicate filters by both
values when both are present. A filter is cleared only when its own clear
control is used; stale combinations are canonicalized only when no matching
meet remains.

#### Regression test

`tests/urlState.test.ts` and `tests/ux3-7r3-home.test.ts` cover season-only,
series-only, combined state, clearing, URL serialization, and scroll-free
navigation.

#### Verification

Browser flow reached `/?season=2025-26&series=%E9%96%A2%E8%A5%BF` and displayed
12 meetings. Clear, back, and forward restored the corresponding URLs.

### B-02

#### Reproduction

Before: reproduced in the collector parse path. The official final cumulative
time used `H:MM:SS.s`, while the parser accepted only `MM:SS.s`, so lap 11 was
dropped and the viewer inferred 10 laps from measured checkpoints.

#### Root cause

The collector's clock parser did not accept the hour-prefixed form used by the
official result page. The viewer also had no explicit official race-lap axis,
so a rider-derived checkpoint union became the race total.

#### Fix

`parseClockToSec` now accepts both `MM:SS.s` and `H:MM:SS.s` with range checks.
The collector parses the official lap count from race metadata and emits
`raceLapNumbers`. The viewer validates the optional axis and uses it for the
race total, while preserving missing rider measurements as missing.

#### Regression test

`tests/parseRaceHtml.test.ts`, `tests/timeFormat.test.ts`,
`tests/targetRaceRegression.test.ts`, and
`tests/ux3-7r3-data.test.ts` cover the parser, target payload, official 1..11
axis, final checkpoint, and lap-down behavior.

#### Verification

Official race 27834 is an 11-lap race. The target rider
`KNS-167-0031` retains lap 11 with cumulative time 3789.2 seconds in the
collector payload and viewer regression data.

### B-03

#### Reproduction

Before: reproduced by the same parser/axis path. Race 27770's measured table
columns begin at lap 2 and the lap 11 cumulative total is hour-prefixed, so a
measured-column union gave 10.

#### Root cause

Same generalized root cause as B-02: H:MM:SS parsing failure combined with
using measured checkpoint columns as the race total. This is not a race-ID
conditional.

#### Fix

The official metadata produces the complete 1..11 axis. The measured rider
records remain numbered 2..11, with no synthetic lap 1 rider record.

#### Regression test

The parser official-axis test, target payload test, and viewer B-03 test assert
race axis 1..11, measured first lap 2, and final measured lap 11.

#### Verification

Official race 27770 is an 11-lap race. The target rider
`CCM-000-1602` retains measured laps 2..11 and final cumulative time 3825.6
seconds.

### B-04

#### Reproduction

Before: the owner-reported chart state was reproduced in the actual rendered
Recharts payload. The source-backed P2 lap-2 gap is `+0.9`, but the chart data
passed into the rendered line contained `{lapNumber: 2}` without the P2 field;
the line therefore started at lap 3. The prior tests exercised the pure
transform only and did not inspect the chart integration payload.

#### Root cause

The chart integration allowed `buildGapSeries` to derive its own lap axis via a
default parameter instead of receiving the reconciled axis already used by
`ChartTabs`/the X axis. That left a hidden calculation boundary where pure
transform coverage could pass while the rendered payload omitted the first P2
point. The calculation must be keyed by lap number, not by array index or
truthiness. The separate zero-baseline styling remains a generalized visual
guard, not the cause of this target race's missing point.

#### Fix

`buildGapSeries` now requires the authoritative lap axis from its caller, and
`GapChart` passes the same reconciled `raceLapNumbers` used by the X axis. It
retains only finite same-lap arithmetic results, including `0`, while the
existing zero-baseline visibility styling remains in place. No rank-array
offset or race-ID branch was added.

#### Regression test

`tests/ux3-7r3-data.test.ts` asserts the target P2 values when the explicit
reconciled X-axis `[1..8]` is passed, and invokes `GapChart` to inspect the
nested Recharts `LineChart.props.data` payload. It asserts lap 2 `+0.9`
through lap 8 and the presence of the P2 field at lap 2, and separately covers
the generalized `gap = 0` case. The collector target regression asserts the
official P1/P2 first measured cumulative values. Inspectable payload evidence
is saved in `evidence/ux3-7r3/bug-b04-gap-chart-payload.json`.

#### Verification

For race 27160 / KNS-256-011, the official axis is 1..8 and the source-backed
P2 gap values at measured laps 2..8 are `+0.9, +16, +20.6, +24.1, +27.5,
+23.9, +4.9` seconds. The first point follows from P1/P2 cumulative values
of 872.2 and 873.1 seconds; subsequent matching-lap points remain present
through lap 8. These target values are nonzero; the separately tested exact
finite `gap = 0` behavior is a generalized regression contract, not a claim
about this race's P2 series.

## 7. Official Data Cross-check

The official pages identify the race structures as follows:

| Race | Official structure | App/collector expectation |
|---|---|---|
| 27834 / CCS-256-003 | 0.1+2.5km x 11Lap; headers 1..11 | `raceLapNumbers` 1..11; selected rider final lap 11 |
| 27770 / KNS-256-010 | 11Lap; measured table headers begin at 2 | `raceLapNumbers` 1..11; measured values 2..11 |
| 27160 / KNS-256-011 | 8Lap; measured table headers begin at 2 | `raceLapNumbers` 1..8; P2 measured-lap gaps `+0.9, +16, +20.6, +24.1, +27.5, +23.9, +4.9` seconds |

The collector payload changes are limited to the shared contract and the two
missing final records; no race-ID conditional exists in viewer or collector
logic.

## 8. Disclosure Consistency

`components/Disclosure.tsx` is shared by selected-lap detail, lap detail,
results, desktop comparison, and mobile comparison. All surfaces use a native
`details`/`summary`, continuous border, open/closed chevron, hover/focus
styles, and synchronized `aria-expanded`.

## 9. Accessibility

- Native `summary` activation provides Enter/Space keyboard operation.
- Each summary exposes `aria-expanded` and `aria-controls` for its content.
- Focus-visible rings remain present.
- Disclosure and comparison targets use 44px-class minimum heights.
- Selected comparison state uses background, border/check, and text label, not
  color alone.

## 10. Desktop Visual Verification

Exact viewport checks completed at 1440x900 and 1280x720. The screenshots show
aligned rider search controls, aligned rider switching controls, closed/open
comparison, selected-lap detail, and results disclosure. Both viewports report
`document.documentElement.scrollWidth === innerWidth`.

Evidence: `docs/user-testing/evidence/ux3-7r3/desktop-*.png`.

## 11. Mobile Visual Verification

Exact viewport checks completed at 390x844 and 320x568. The 390px evidence
shows closed/open comparison states and measured filter scroll preservation.
The 320px check reports no horizontal overflow.

Evidence: `docs/user-testing/evidence/ux3-7r3/mobile-*.png`.

## 12. Functional Flow

Verified locally: fresh entry, season filter, series filter, season+series,
filter clear, race selection/deep link, results open, result rider selection,
rider search, rider switching, comparison open/collapse/add/remove controls,
metric tabs, lap selection, selected-lap disclosure, lap-detail disclosure,
results disclosure, reload, back, and forward.

## 13. Data Regression

Existing DNF, lap-down, rank, lap-number, pace, sign-direction, sparse-data,
and metric semantics remain covered by the existing viewer suite. New tests
guard official race axes, H:MM:SS parsing, missing final laps, finite zero gap,
and malformed metadata fallback.

## 14. Automated Tests

- Viewer: `npm test` — 156 passed.
- Collector: `npm test` — 12 passed.
- Viewer typecheck: `npx tsc --noEmit` — PASS.
- Viewer lint: `npm run lint` — PASS.
- Viewer build: `npm run build` — PASS.
- Viewer and collector `git diff --check` — PASS.
- No existing test was deleted or skipped.

## 15. MR-01〜MR-03 Regression

PASS. Existing chart identity, metric-direction, sign, marker, tooltip, and
comparison-key tests remain green; the shared disclosure changes preserve the
existing chart context and metric controls.

## 16. POS-01〜POS-05 Regression

PASS. Existing sticky navigation, result placement, chart placement, control
deck, and mobile/desktop order tests remain green. Results remain selectable
and the obsolete skip action is removed without replacing the navigation
contract.

## 17. Remaining Issues

No owner-reported behavior remains failing in the local or current Production
verification. Release completion is blocked by the autonomous review gate:
the final reviewer requires the implementation revision to be pushed, while
the Autobuild protocol forbids pushing until a reviewer returns PASS. UX3-8
is intentionally not started.

## 18. Production Deployment

The latest viewer implementation is locally committed as `a5c2649` and was
deployed to Production for verification as `dpl_BFU5Lvs6LBPraYK9YrVRG9Z7NFGz`
(`READY`, alias `https://ajocc-laptime-viewer.vercel.app`). The collector
contract is already pushed as `08eaaa4`. The viewer normal push remains
blocked by the Autobuild review gate described in Section 17.

## 19. Production Smoke Test

Production verification covers the home combined-filter flow, the three target
race URLs, all four exact viewports, and one-by-one checks for D-01--D-10,
M-01--M-02, and B-01--B-04. B-02 renders axis 1..11, B-03 renders axis 1..11,
and B-04 renders P2 values `null, +0.9, +16, +20.6, +24.1, +27.5, +23.9,
+4.9` on axis 1..8. The Production rendered payload is recorded in
`evidence/ux3-7r3/bug-b04-gap-chart-payload.json`; final alias verification
was completed at the deployed URL above. The final viewer push and a reviewer
PASS after that push remain outstanding.

## 20. Final Verdict

UX3-7R3: NEEDS_REVISION — RELEASE GATE INCOMPLETE

All 16 owner-reported issues are implemented and verified in the available
local/Production evidence, but the required viewer push and post-push
reviewer PASS could not be completed without violating the Autobuild hook.
