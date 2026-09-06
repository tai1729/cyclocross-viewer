# UX2-4 Information Hierarchy Report

Date: 2026-09-06
Scope: Results, Lap Detail, and supporting-information hierarchy only

## Executive result

The active analysis workspace now keeps the chart and context as the primary
surface. Lap Detail is a closed-by-default, information-scented disclosure;
Results keeps its existing bounded table behind the completed Desktop/Mobile
disclosures and now exposes the full rider count in the closed label.

No chart calculation, data transform, URL key, history rule, table data, or
AJOCC status meaning was changed.

## Baseline

The pre-UX2-4 active workspace already had the UX2-2/UX2-3 chart-first order,
but Lap Detail was rendered as a full table immediately after the chart. The
baseline CUA accessibility tree showed a seven-row `和田 良平のラップ詳細`
table before any user requested it. Results was closed, but its label was only
`結果表を表示`, so the closed state had weak information scent.

The earlier phase measurements provide the comparison point for the primary
region:

| viewport | chart top before UX2-2 | chart top after UX2-2 / UX2-3 baseline |
| --- | ---: | ---: |
| 1440x900 | 1289px | 525px |
| 1280x720 | 1309px | 525px |

The earlier Mobile audit measured the pre-workspace chart at approximately
2741px (390px) and 2599px (320px), with no plot area in the first viewport.
UX2-3 had already moved the chart to the primary Mobile region; UX2-4 keeps
that structure and reduces only the supporting-content footprint.

Exact 390px/320px browser viewport emulation and DOM evaluation were not
available in the connected browser host. The Mobile conclusions below use the
existing phase measurements, source-level responsive contracts, automated
markup tests, and the same host browser's accessibility tree. The host CUA
also provided visual captures for Desktop analysis, Lap Detail open, and
Results open; those captures are not persisted as repository image files.

## Primary / Secondary / Tertiary classification

### Primary

- Current race and category context.
- Current rider and comparison state.
- Selected metric and the existing ChartTabs/chart detail panel.
- The chart itself.

### Secondary

- Selected-rider summary and Lap Summary cards.
- Lap Detail measured rows used to verify a chart trend or inspect a lap.
- The full Results table used to browse the category or choose another rider.

### Tertiary

- Explanatory copy and secondary metadata inside the existing cards and tables.
- Empty/missing-value explanations that are needed while inspecting details.

The classification preserves all information but changes when supporting
content consumes space. Primary content is present in the analysis viewport;
secondary tables are available on demand; tertiary copy remains inside the
surface that explains it.

## Results role and behavior

Results has two roles: category browsing and rider discovery. Browse mode keeps
the existing full table and its existing navigation behavior. Active analysis
uses the existing native `details` disclosure separately for Desktop and
Mobile, both initially closed. The summary is now:

`結果表を表示・N名`

where `N` is exactly `race.riders.length`, including rows that are unavailable
for chart analysis. The table remains a single renderer with its native table
semantics, caption, selected-row highlight, `aria-pressed` state, and existing
bounded `max-h-[32rem] overflow-y-auto` region.

When the active Results table is open and a different rider is selected, that
is explicit user navigation. RaceViewer closes both presentation disclosures,
uses the existing rider URL push with `scroll: false`, and after the URL-derived
workspace is ready only reveals `#race-analysis` if it has no viewport
intersection. It then focuses the current visible analysis control. A visible
workspace is not moved. Opening or closing the disclosure itself performs no
scroll and no URL write.

## Lap Detail role and behavior

Lap Detail is supporting evidence: it validates individual lap time, cumulative
time, rank, comparison deltas, missing values, DNF/lap-down observations, and
the measured points behind the chart. The chart detail panel remains the quick
per-lap surface, so the full table is not required on initial entry.

The adopted approach is a native `details` disclosure, closed by default on
both Desktop and Mobile. Its summary is generated from the existing measured
rows:

- `ラップ詳細を表示・N周・選手名` when `N > 0`.
- `ラップ詳細を表示・有効な実測ラップなし` when no valid measured rows
  exist.

The existing `LapDetailTable` remains the sole table renderer. The disclosure
does not infer a lap count from malformed, duplicated, or missing records.

## Alternatives considered

### Lap Detail always open

This preserved the lowest interaction cost but made every analysis entry pay for
the full table height and competed with the chart's supporting hierarchy.

### Compact summary plus full disclosure (adopted)

This removes the initial table footprint while keeping one explicit action,
an exact measured-row count, the full existing table, and native keyboard
semantics. It does not add a new table or a second status model.

### Selected-lap quick detail plus full table disclosure

This could reduce more space, but it would duplicate the existing chart detail
model and introduce a new selected-lap relationship in this bounded slice. The
existing chart detail already provides that quick evidence, so the additional
state was not justified.

### Unbounded results expansion or a second results view

This would increase implementation and regression risk without improving the
closed-state information scent. The existing one-table bounded scroll region
is sufficient for the current dataset contract.

## Adopted architecture

The active layout remains:

```text
Desktop: Context / ChartTabs + Chart / Lap Detail disclosure / control rail / Results disclosure
Mobile:  Context / compact controls / ChartTabs + Chart / summary cards /
         Lap Detail disclosure / Results disclosure
```

`RaceViewer` owns one local `lapDetailOpen` preference. Existing Desktop and
Mobile Results preferences remain separate. None of these presentation states
are serialized into URL or browser history.

Same-mount rider, comparison, metric, lap, and responsive presentation changes
preserve disclosure state. Fresh reload starts closed. Entering or leaving
analysis, category transitions, loading, and error states close supporting
disclosures so stale tables are not exposed.

## Desktop behavior and measurements

The Desktop branch and UX2-2 control rail remain structurally unchanged. The
chart top remains the established 525px target at both 1440x900 and 1280x720.
The old initial Lap Detail table (seven rows in the baseline capture) is
replaced by one 44px minimum-height summary control plus its normal spacing.
The Results disclosure remains a compact summary row; only its information
scent changes to include the rider count.

| metric | UX2-4 before | UX2-4 after |
| --- | --- | --- |
| chart top, 1440x900 | 525px | 525px |
| chart top, 1280x720 | 525px | 525px |
| initial Lap Detail | full seven-row table in baseline state | one closed summary control (`min-h-11`) |
| Results collapsed state | unlabeled count (`結果表を表示`) | count-bearing label (`結果表を表示・8名` in the verified race) |
| open Lap Detail | existing full table | same existing full table |
| open Results | existing one bounded table | same existing one bounded table |

In the host-browser visual capture after selecting another rider from Results,
the chart remained in view, the new context was visible, and both supporting
disclosures were collapsed. The chart was not displaced by an upstream table
opening because both disclosures are after the chart.

## Mobile behavior and measurements

UX2-3's Mobile rider modal, compact comparison disclosure, context bar, metric
tabs, and chart-first order remain in place. The only new supporting surface is
the closed Lap Detail summary before the existing Results disclosure. This keeps
the initial secondary height to two compact disclosure controls instead of a
full Lap Detail table plus the Results region.

| metric | UX2-4 before | UX2-4 after |
| --- | --- | --- |
| chart top, 390px | UX2-3 chart-first baseline; exact value unavailable in this host | unchanged by UX2-4 |
| chart top, 320px | UX2-3 chart-first baseline; exact value unavailable in this host | unchanged by UX2-4 |
| initial Lap Detail | full table after chart | one 44px minimum-height summary control |
| Results collapsed | compact disclosure without count | 44px minimum-height count-bearing disclosure |
| opened Lap Detail / Results | existing responsive content | same content and semantics; no new page-level horizontal overflow |

The existing Lap Detail responsive grid uses wrapped labels and the existing
Results table uses fixed prioritized columns within its bounded region. No new
page-level horizontal scroll container was introduced. Exact-width open-state
pixel measurements remain a tooling limitation and are a UX2-5 follow-up.

## 320px and large dataset findings

The 320px contract is protected by wrapping summary labels, `min-w-0` layout
containers, existing responsive table rows, and the existing 44px Results
summary. Lap Detail opens to the existing responsive labeled rows rather than
an additional wide table. Long race/rider names wrap in the disclosure summary.

The Results table remains bounded to 32rem vertically, so a 98-rider category
does not create an unbounded analysis document. Pagination, virtualization, and
new filtering were intentionally not added because they would be UX2-5 scope
and are not required by the current data contract.

## DNF, lap-down, missing, and duplicate semantics

No data transform or status code changed. Existing SummaryCard,
LapSummaryCard, RaceResultsTable, and LapDetailTable remain the authorities for
DNF, lapped riders, missing laps, unavailable data, and duplicate-checkpoint
handling. The disclosure labels only report rendered measured-row count; they
do not turn invalid or absent data into a value. Focused tests explicitly cover
the duplicate-invalidates-measured-rows case and the no-valid-measured-lap
label.

## Accessibility, focus, and scroll

- Both disclosures use native `details/summary` semantics with `aria-expanded`
  supplied by the browser, keyboard open/close, visible focus styling, and a
  minimum 44px Lap Detail target. Results retains its existing 44px Mobile
  target and compact Desktop target.
- Existing native Results table caption/headers and Lap Detail ARIA table rows
  remain intact. The current rider is still represented by row highlight,
  `aria-pressed`, and `分析中` text.
- A normal disclosure toggle keeps focus on its summary. No table heading is
  autofocus-targeted, no hidden table element keeps focus, and no custom
  `scrollTo`, timeout, or magic delay is used.
- Active Results row selection is the explicit-navigation exception. It closes
  the disclosure, keeps the existing rider URL `scroll: false` contract, and
  conditionally reveals the analysis region only if it is outside the viewport.

## Before / after browser evidence

The host browser was verified at the local route
`/race/MMJ-256-005?rider=KNS-000-4368`:

1. Initial AX state showed `ラップ詳細を表示・7周・和田 良平` and
   `結果表を表示・8名`, both collapsed.
2. Opening Lap Detail exposed the existing table with seven measured rows;
   the summary retained focus on close.
3. Opening Results exposed one semantic table with eight rows, a selected-row
   `aria-pressed` state, and current-rider `分析中` text; the summary retained
   focus on close.
4. Selecting `黒田 将広` from Results changed the URL to its rider state,
   collapsed Results, showed the new context, and focused the selected metric
   tab. The host screenshot showed chart and context still visible.
5. Changing the metric changed the URL to `tab=pace` while the chart workspace
   remained visible and metric-tab focus was preserved.

The connected CUA host does not expose reliable exact viewport override or
`scrollY`/DOM-rect evaluation, so 390px/320px numeric pixel claims are not
invented here. Existing exact-width phase baselines and responsive automated
checks are preserved instead.

## Validation and regression status

Executed after implementation:

- `npm.cmd test` — PASS, 80 tests.
- `npx.cmd tsc --noEmit` — PASS.
- `npm.cmd run lint` — PASS.
- `npm.cmd run build` — PASS.
- `git diff --check` — PASS.
- Added pure contract coverage for Results rider intent, URL-targeted pending
  consumption, stale query/popstate clearing, conditional viewport reveal, and
  loading/error/category/lifecycle reset decisions in
  `tests/resultsInteraction.test.ts`. The helper is used by the production
  `RaceViewer` path; no test dependency was added.
- Browser smoke — PASS for initial state, Lap Detail open/close, Results
  open/close, Results rider selection, metric navigation, focus, and chart
  visibility in the connected Desktop host.

UX2-1 rider/comparison/metric/lap URL and scroll contract was not changed;
UX2-2 Desktop chart/control/context order was preserved; UX2-3 Mobile
presentation components and touch-target rules were not changed.

## Known limitations

- Exact 390px/320px CUA viewport and open-state pixel measurements could not be
  collected in this environment. UX2-5 should run a real-device or viewport-
  emulated matrix and persist screenshots.
- Browser Back/Forward was not directly callable through the connected CUA
  tab API in this run. Existing URL-state and navigation tests continue to
  cover restoration semantics.
- Results remains a full table when opened. Search/filter or virtualization is
  intentionally deferred until a large-dataset usability test demonstrates the
  need.

## UX2-5 handoff

- Run exact-width Desktop/Mobile screenshots and DOM metrics, especially opened
  disclosures at 320px.
- Exercise native browser Back/Forward and direct reload with disclosure states
  to confirm local presentation reset/preservation expectations.
- Test categories containing DNF, lap-down, missing and duplicate rows while
  opening both supporting surfaces.
- Reassess whether Results needs search/filter/virtualization only after real
  98+ rider data and touch/keyboard sessions.

## Acceptance checklist

| criterion | result |
| --- | --- |
| AC1 hierarchy | PASS — chart/context remain primary; supporting tables are on demand |
| AC2 Results | PASS — count-bearing closed summary and full table on open |
| AC3 Lap Detail | PASS — measured-lap disclosure follows the chart |
| AC4 no information loss | PASS — existing Results/LapDetail renderers are retained |
| AC5 progressive disclosure | PASS — initial supporting footprint is reduced without new deep navigation |
| AC6 information scent | PASS — labels identify result count or measured lap count/rider |
| AC7 large dataset | PASS — existing Results region remains vertically bounded |
| AC8 status semantics | PASS — DNF/lap-down/missing/duplicate/unavailable logic unchanged |
| AC9 Mobile | PASS — existing 390/320 responsive branches and openable surfaces preserved |
| AC10 accessibility | PASS — native disclosure/table semantics, focus styling, and keyboard behavior retained |
| AC11 scroll stability | PASS — open/close is local; only explicit Results rider navigation can conditionally reveal workspace |
| AC12 UX2-1 regression | PASS |
| AC13 UX2-2 regression | PASS — Desktop chart top target remains 525px |
| AC14 UX2-3 regression | PASS — Mobile modal/comparison/chart-first structure unchanged |
| AC15 analysis logic | PASS — no chart/data transform or data semantics changes |

Independent reviewer verdict: `PASS` with no blocking, major, or minor findings.
