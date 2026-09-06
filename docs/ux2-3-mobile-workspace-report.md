# UX2-3 Mobile Analysis Workspace Report

## Scope and method

This slice changes only the active analysis presentation below `1024px`.
Browse state, the Desktop UX2-2 branch, URL/history semantics, data transforms,
chart calculations, and the existing results/lap-detail content remain outside
the implementation scope.

The representative state was `MMJ-256-005 / ME1 / rider=KNS-000-4368`, with
the default `±2` comparison and the existing Rank chart. The blind baseline is
the measurement recorded before source inspection in
`docs/ux-task-test-v2.md`:

| Metric | 390×844 baseline | 320×568 baseline |
| --- | ---: | ---: |
| Analysis region start | ~913px | not separately recorded |
| Chart top | ~2741px | ~2599px |
| Initial plot visibility | 0px | 0px |
| Configuration footprint | full rider list + summary + comparison controls | full rider list + summary + comparison controls |
| Repeated-analysis cost | repeated page-level travel between controls and chart | repeated page-level travel between controls and chart |

The baseline was observed before the UX2 workspace source was inspected. It is
retained as evidence, not as a fixed pixel target.

## Mobile problems confirmed by the baseline

- The active state inherited the browse/results-first vertical stack.
- A full rider search/list, summary cards, comparison controls, lap detail, and
  metric/chart surface were all expanded in one document flow.
- The chart was the last primary surface, so a rider/comparison/metric sequence
  required repeated long scrolls even after UX2-1 stopped accidental top resets.
- At 320px, wrapping increased the cost of every preceding block and left no
  useful chart plot in the initial viewport.

## Adopted Mobile architecture

Active Mobile now has this explicit DOM and visual order:

```text
compact context
  → compact rider trigger + comparison disclosure
  → ChartTabs (metric tabs + chart)
  → existing SummaryCard / LapSummaryCard
  → existing LapDetailTable
  → closed native results disclosure
```

Browse remains the existing full-results-first state. The same
`RaceResultsTable` is mounted exactly once: before analysis in browse, and
inside the closed `結果表を表示` details surface after the workspace in active
Mobile. UX2-4 owns any further results or lap-detail redesign.

### Context

`AnalysisContextBar` remains text-readable and always exposes race, category,
selected rider plus status, comparison mode/count, and active metric. On
Mobile it uses a denser two-column grid; the race item spans the full width so
long race names wrap predictably instead of being squeezed into one narrow
cell. No required state is conveyed by color or by truncation alone.

### Rider selection

The selected rider remains visible in the compact trigger with a 44px hit area.
On active Mobile, `RiderSelector` opens a native modal `<dialog>` styled as a
bottom sheet. This was chosen over a page disclosure because rider lists can
be long and opening the list must not push the chart down or compete with page
scroll.

The sheet provides:

- labeled search input focused on open;
- selected-row reveal within the bounded internal list;
- 44px rider rows and visible selected state;
- explicit close button, Escape/cancel, and backdrop close;
- native modal inertness/body-scroll prevention through `showModal()`;
- list-only internal scrolling with `overscroll-behavior: contain`;
- `min(70dvh, 32rem)` height cap and bottom safe-area padding;
- focus return to the opener with `preventScroll`;
- search reset on close and no URL/history entry for open/close.

Selecting a rider performs exactly the existing URL push once, closes the
sheet, and leaves the same UX2-1 `scroll: false` behavior in place.

### Comparison

Comparison uses a native inline `<details>` because its mode list is small and
the existing `±0`–`±5`, fixed, all-mode guard, pinned IDs, and 44px controls can
be reused without a second modal. The summary always exposes current mode and
displayed count. It remains open after a mode change so a pinned selection can
continue; removing a pinned row falls back to the summary only when the
removed control no longer exists.

### Metric and chart

`ChartTabs` remains the existing metric/chart owner and is placed immediately
after the Mobile action row. URL keys, tab semantics, chart data, tooltip,
legend, lap selection, and `scroll: false` navigation are unchanged. Mobile
uses short visible labels (`順位`, `差`, `周回`, `ラップ`) while preserving the
full accessible names. The tab row is width-constrained and does not create a
page-level horizontal scroll container.

### Sticky, safe area, and keyboard

No additional Mobile sticky layer was introduced. `RaceHeader` remains the
only sticky surface so 320px does not lose a quarter of its content to stacked
sticky controls. The rider sheet and pinned comparison panel include
`env(safe-area-inset-bottom)` padding. The native dialog's internal list is
the only sheet scroll surface; the page is inert while it is open. Search is a
normal text input, so the virtual keyboard can resize the native sheet without
requiring a timeout or manual page `scrollTo`.

Keyboard behavior uses native semantics: rider trigger → dialog search → rider
rows → close, with Escape closing and focus returning to the trigger. Metric
tabs retain `role=tab`/selected semantics. Comparison and results use native
`details`/`summary` behavior. No hidden or Desktop-only focus target is added
to the Mobile tree.

## Before / after evidence

### After structure and measurable targets

The after implementation removes the full results table and full rider list
from the active Mobile path before the chart. The first active Mobile viewport
therefore contains only the race header, context, compact action row, metric
tabs, and the beginning of the existing chart surface; supporting cards,
lap detail, and results follow it.

| Metric | Before | After implementation |
| --- | ---: | --- |
| Chart top, 390px | ~2741px | immediately after context + compact actions + ChartTabs header; exact pixel capture unavailable in this CUA session |
| Chart top, 320px | ~2599px | same chart-first branch; exact pixel capture unavailable in this CUA session |
| Visible chart height | 0px in both baselines | existing chart frame is mounted directly after tabs; no height/calculation change |
| Configuration height | full rider list + full comparison panel | compact trigger + closed comparison summary; detailed controls are on demand |
| Scroll to first chart | multiple viewport transitions | no results/list/table traversal in the active Mobile branch |
| Repeated-analysis scroll count | repeated control ↔ chart travel | control changes remain in the workspace; rider list opens as an overlay |

The exact-width after pixel values are intentionally not fabricated. The
available persistent Chrome CUA surface captures the host viewport but does not
expose a viewport override or a local screenshot path; the `agent-browser`
CLI and Playwright package are not installed in this repository. The branch
was verified through the responsive source contract, static presentation tests,
the existing exact-width baseline, and live Desktop/browser regression smoke.
The same limitation applies to repository screenshot assets: CUA screenshots
were captured during verification but cannot be written to `docs/` from this
surface.

### 390px findings

The active branch has no Desktop grid/sidebar, no full rider list before the
chart, no active results table before the workspace, and no page-level
horizontal overflow by construction (`min-w-0`, full-width context item, and
compact tab labels). The 44px action controls remain available; the rider
dialog is capped to the viewport and its list scrolls internally.

### 320px findings

The action controls stack rather than forcing a narrow two-control row. The
context race item spans both columns, tab labels remain short but fully named
for assistive technology, and all primary controls retain `min-h-11`/44px
hit areas. No new sticky layer is present. Long values wrap instead of creating
document overflow.

### Desktop regression

The Desktop branch remains `>=1024px` and is not rendered through the Mobile
dialog/disclosure components. The live representative Desktop smoke showed the
UX2-2 context bar, left control rail, chart-first surface, lap detail, and
closed results disclosure. Existing UX2-2 measurements remain:

| Viewport | Chart top before UX2-2 | Chart top after UX2-2 |
| --- | ---: | ---: |
| 1440×900 | 1289px | 525px |
| 1280×720 | 1309px | 525px |

The current Mobile-only changes do not alter these `>=1024px` placements.

### UX2-1 regression

Live browser smoke on the representative deep link verified:

- metric change updates the URL and selected tab while the chart remains in
  view;
- browser Back restores the prior metric and Forward restores the next metric;
- Desktop results disclosure opens/closes without a URL entry and returns
  focus to its native summary;
- browser console contained no warning or error entries.

The existing centralized navigation writer and `scroll: false` options were
not changed for rider, comparison, metric, or lap transitions.

## Known limitations and risks

- Exact 390×844 and 320×568 live pixel measurements and saved image files need
  a browser runner with viewport override support. This is an environment
  limitation, not an intentional product shortcut; it remains a verification
  follow-up before broad UX2-4 content changes.
- The comparison disclosure can increase document height while open. It is
  intentionally inline per the resolved UX2-3 contract; the summary remains
  closed during normal analysis.
- Results and lap detail are only repositioned/contained. Their content and
  density are deliberately deferred to UX2-4.
- Resize/hydration changes presentation only; URL state and history remain the
  single durable source of truth.

## UX2-4 handoff

UX2-4 should evaluate a dedicated lap-detail disclosure, result-table density,
large-data table ergonomics, and whether comparison editing should remain an
inline disclosure after real-device testing. It must preserve the single-table
rule, current AJOCC/DNF/lapped/missing-lap semantics, and the UX2-1 URL/scroll/
focus contract.

## Status

Implementation, automated validation, and independent review are complete for
the code scope. The reviewer returned `PASS`; the responsive structure,
accessibility contract, and environment-qualified Mobile evidence were
accepted with the non-blocking limitations above.
