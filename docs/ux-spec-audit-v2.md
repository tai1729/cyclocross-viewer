# AJOCC Lap Time Viewer — UX Redesign Specification Audit v2

## Audit scope and evidence

監査対象は `docs/ux-redesign-spec-v2.md` のRecommended Designである。blind
first-useの実測、source inspection、2名の独立 `spec_auditor` の指摘を反映した。
監査は実装の合否ではなく、実装者がproduct intentを推測せずに着手できるかを
判定する。実装はまだ行っていない。

### Sources inspected after blind test

- `docs/PRODUCT.md`
- `docs/DESIGN.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/SPEC_AUDIT.md`
- `components/RaceViewer.tsx`
- `components/RaceHeader.tsx`
- `components/RaceResultsTable.tsx`
- `components/RiderSelector.tsx`
- `components/ComparisonAdjuster.tsx`
- `components/ChartTabs.tsx`
- `components/LapDetailTable.tsx`
- `lib/urlState.ts`
- `hooks/useRaceData.ts`
- `docs/ux-task-test-v2.md`
- `docs/ux-redesign-options-v2.md`

## Inconsistencies checked

| Potential inconsistency | Resolution |
| --- | --- |
| 既存docsではinitial chartがrank-first | Recommended Designはdefault metricを変更しない。chartの位置と到達性だけを変える |
| 既存DOMはlap detailがchartより前 | 新仕様ではchart→lap detailを明示。data semanticsとtable内容は変更しない |
| 既存URL docsはscroll/focusを同期しない | URL keyは変えず、同一analysis actionのscroll/focusはUI behaviorとして定義。scrollをURLへ保存しない |
| user briefの「metric」と実装の`tab` | metricは既存`tab`のUI語と明示し、新query keyを追加しない |
| category変更と同一analysis設定変更 | categoryは別race dataのnavigationなのでtop/resetを許可。同一raceのrider/compare/tabは保持 |
| mobile bottom sheetの候補と依存関係制約 | 新dependencyは追加せず、既存Base UIまたはnative dialog相当で実装する境界を定義 |
| exact pixel positionとresponsive design | 現状座標はbaseline。acceptanceはviewport visibility、anchor位置、overflow、scroll intentで判定 |

## Missing states audit

| State / transition | Covered in spec | Remaining risk |
| --- | --- | --- |
| home loading/error/empty | preserve existing surfaces | low |
| race loading/category switch | atomic replacement, no stale chart | medium: needs browser test during slow fetch |
| no rider | browse state + CTA | low |
| valid rider | analyze, chart-first | medium: needs visual check at 1280×720 |
| data-quality/no checkpoint | analysis-unavailable | low |
| no comparison riders | existing gap/pace empty | low |
| DNF | status before chart, pre-boundary points only | medium: verify chart/detail order does not hide status |
| lap-down finished rider | existing lapped semantics retained | low |
| duplicate/missing lap | existing sparse semantics retained | low |
| comparison `±0..±5` | persistent compact value + sheet | low |
| pinned 4 riders | fixed picker bounded and labeled | medium: long names at 320px |
| all mode limit | existing guard/legend behavior retained | medium: crowded detail visual density |
| metric/tab change | in-place swap, `tab` URL, focus retention | low |
| lap hover/select/clear | existing chart detail behavior retained | low |
| browser back/forward | atomic URL source of truth, no forced top | medium: App Router scroll restoration must be tested |
| direct deep link | analyze state derived from `rider` | medium: first paint/anchor timing |
| invalid URL | existing canonicalization/defaults | low |
| 320/390 keyboard | 44px targets, dialog focus return, no horizontal overflow | medium: requires real keyboard smoke |

## Regression risk

| Risk | Why it can regress | Required guard |
| --- | --- | --- |
| route query state disappears | workspace refactor bypasses `RaceViewer.pushRaceUrl` | keep URL writer centralized; test reload/share/back/forward |
| old chart flashes during category load | visual shell renders old race while new data is pending | atomic loading branch; slow-network browser smoke |
| focus lost after rerender | ChartTabs/rider control remounts on query change | stable focus return + activeElement assertions |
| sticky header overlap | two sticky surfaces use independent offsets | measured header CSS variable and screenshot at four sizes |
| chart frame moves when compare changes | legend/detail height changes the main panel | stable chart panel min-height; context anchor test |
| results become undiscoverable | active state collapses full table too aggressively | explicit `結果表を表示`, keyboard reachable, no data deletion |
| Mobile modal traps user | new sheet lacks Escape/close/focus restore | dialog accessibility test; page scroll restoration |
| all/pinned becomes unreadable | compact rail/sheet hides too much or wraps badly | max rider/fixed limits, labeled values, 320px fixture |
| DNF/lapped meaning is obscured | chart-first presentation can precede status | status text immediately before chart/main slot |
| internal scroll becomes nested page scroll | picker/detail list gains unintended scroll container | only bounded existing lists may scroll; browser overflow check |

## Accessibility risk

1. Visual reordering could cause screen-reader order to disagree with chart meaning. The
   spec therefore fixes one DOM order: context/status → chart → lap detail → optional
   full results.
2. Sticky controls can hide content when focus scrolls. The implementation must use the
   measured sticky offset and `scroll-margin-top` for the workspace heading and tabs.
3. Dialog/sheet focus can be lost if selection changes URL and remounts the parent. The
   opener must be stable or an equivalent compact trigger must receive focus.
4. Four metric labels may not fit at 320px. The visible labels must remain distinguishable;
   `aria-label` can carry the full Japanese name but cannot replace a visible selected state.
5. SVG chart points remain nonessential interaction targets. The existing native lap
   selector, previous/next, clear, and semantic detail panel remain the keyboard path.
6. Status such as DNF, lapped, unavailable, selected rider, and active comparison must be
   available as text and live announcements where appropriate, never color alone.

## Mobile risk

- 320px has only 568px of height and long Japanese names wrap. The spec limits sticky
  context to144px, keeps full values in text, and moves low-frequency lists into bounded
  dialogs.
- A full results table may still be needed during Task 1. The collapsed state is only for
  `analyze`; browse remains result-first and the explicit result disclosure reopens it.
- `position: sticky` plus a dialog must not create a permanently locked body after close.
  Open/close smoke must assert `body` scroll and the pre-open page position.
- `metric` tabs and compare controls must not become a horizontal scrolling strip at 320px.
  If labels need abbreviation, the full accessible name and an adjacent explanation remain.
- A chart that is too short may be technically visible but unreadable. The 240px mobile
  plot minimum and user test for one interpretable trend are both required.

## Technical constraints

- Next.js 16 App Router query navigation currently explains the observed page reset. The
  implementation must explicitly distinguish page navigation from same-analysis updates;
  changing only CSS cannot satisfy Scroll stability.
- `RaceViewer` currently owns URL normalization, data loading, comparison state, and JSX
  ordering. The future implementation should keep URL/data ownership there or introduce a
  narrowly scoped workspace wrapper without duplicating state.
- `RiderSelector` currently sets `isOpen` only from its initial prop and uses
  `scrollIntoView`/conditional autofocus. The result-table selection path must be made
  consistent with the compact analysis state.
- `RaceHeader` is already sticky. Any analysis toolbar needs a measured offset and a
  stacking order; two `top:0` sticky elements are not acceptable.
- `LapDetailTable` already has mobile-safe labeled rows, but its full row set is not
  internally height-bounded in the current implementation. The redesigned lap-detail
  disclosure controls whether it occupies the page; bounded internal lists remain limited
  to the existing results/rider/detail-list surfaces. Reuse the labeled rows and do not
  introduce page-level horizontal scrolling.
- The existing URL contract intentionally excludes scroll, hover, search text, and tooltip
  state. The redesign must not serialize page scroll as an undocumented query parameter.
- No secret, credential, API, collector, deployment, or production configuration is needed.

## Unresolved decisions

No implementation-blocking product decision remains for the recommended direction. The
following are intentionally left as bounded implementation choices, not product ambiguity:

- whether the existing Base UI primitive or a native `dialog` supplies the sheet mechanics;
- the exact token values for compact card borders, focus ring, and chart height within the
  specified ranges;
- whether the full result disclosure uses a button-controlled region or an equivalent
  accessible disclosure primitive.

These choices must not change the specified state transition, focus, scroll, content order,
URL contract, or responsive behavior.

## Auditor resolutions incorporated

The two independent auditors asked for explicit decisions on chart-first meaning, control
ownership, DOM/keyboard order, per-action scroll behavior, anchor target, mobile defaults,
all/pinned limits, DNF/lapped status placement, pinned lap retention, browser navigation,
and baseline-vs-target measurements. The resolved answers are recorded in
`docs/ux-redesign-spec-v2.md` as follows:

- chart-first means controls/context remain actionable, but `ChartTabs` precedes
  `LapDetailTable` and active results collapse;
- the page is the only scroll container; only bounded picker/table/detail lists scroll;
- same-analysis rider/comparison/metric actions preserve the workspace anchor;
- category/new-route navigation may start at top and clears dependent state;
- `#race-analysis` targets a focusable workspace heading with sticky offset;
- Mobile keeps context, current rider, comparison, and metric visible while moving lists to
  a labeled sheet;
- existing all-mode eight-rider guard and pinned four-rider limit remain;
- DNF/lapped status is adjacent to the chart slot and measured values remain sparse;
- no new URL state is introduced and direct URL/back/forward behavior is defined;
- measured current coordinates are baseline evidence, not implementation pixel targets.

## Verdict

READY

`READY`は「この仕様を実装タスクへ分割できる」という意味であり、設計が実ユーザー
テストで検証済みという意味ではない。実装Phaseでは、まず低リスクなprototypeまたは
bounded sliceを作り、4 viewport・keyboard・error/data semantics・連続操作のbrowser
verificationと、3名以上のtask testを通過させる。

## UX2-2 implementation audit resolutions (2026-09-06)

Two independent auditors reviewed the UX2-2 boundary against the current
UX2-1 source and identified ambiguities in breakpoint behavior, results
disclosure placement, reading order, context content, chart measurement,
internal scrolling, and unavailable analysis. The Commander resolved them in
`docs/ux-redesign-spec-v2.md`, `docs/DESIGN.md`, and
`docs/IMPLEMENTATION_PLAN.md`:

- Desktop is `>=1024px`; resize preserves URL/state/history/scroll and the
  local disclosure preference.
- Active Desktop results are an explicit native disclosure after the workspace;
  browse/mobile remain full-result-first and no URL state is added.
- The primary Desktop reading order is context/status → chart tabs/chart → lap
  detail → controls → optional results, with the control rail visually placed
  left by grid placement.
- Context values and DNF/lapped/unavailable wording are text-readable; long
  labels wrap or retain a full accessible name.
- Existing bounded results scrolling remains; no new workspace scroll
  container or restoration mechanism is introduced.
- Both Desktop targets require the tab list and at least 100px of unobscured
  plot frame in the initial viewport. Unavailable analysis keeps the existing
  alert and omits chart/detail.

The remaining implementation choices are token-level styling and the exact
native disclosure class names; neither changes state, URL, focus, scroll,
responsive boundary, or data semantics.

VERDICT: READY FOR IMPLEMENTATION
