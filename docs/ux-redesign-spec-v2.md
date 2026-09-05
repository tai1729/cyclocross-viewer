# AJOCC Lap Time Viewer — Recommended UX Redesign Specification v2

## Scope and design contract

本仕様は、現在のrace pageをBrowse stateとAnalysis workspace stateに分け、
分析開始後にchart/dataを主役にするための実装仕様である。今回は仕様確定のみを
行い、製品コード・依存関係・upstream JSON・公開routeは変更しない。

### Preserve

- `/` と `/race/[meetId]` の公開route
- `MeetEntry` / `RaceResult` / `Rider` / `LapRecord` のupstream contract
- `season`、`series`、`category`、`rider`、`compare`、`fixed`、`tab`、`lap` の
  URL keyと既定値
- `invalid-data`、`network`、`http`、`not-found`、loading、analysis unavailable
  の既存区分
- sparse lap、DNF、lapped、duplicate、missing checkpointの意味論
- rank / cumulative gap / per-lap gap / lap の4 chartと既存の数値計算
- page-level horizontal overflowを発生させない既存方針

### Not in scope

- 指標の新設・チャート式・順位計算の変更
- 大会名検索、保存、認証、analytics、export
- 新しいproduction dependency、route、server API、data field
- chart libraryの交換
- 公式リザルトURLや公式性の推測

## Workspace state model

新しいURL keyは追加しない。`analysisMode`は次の既存URL状態から導出する。

| State | Condition | Visible purpose |
| --- | --- | --- |
| `browse` | race data loaded and `rider` absent | 大会・カテゴリー結果を読む、選手を選ぶ |
| `analyze` | race data loaded and valid rider ID present | 選手・比較・指標を変えながらchartを読む |
| `analysis-unavailable` | rider IDは存在するがdata-quality/errorまたはcheckpointなし | 状態説明と利用可能な数値を読む。無効なchartは出さない |
| `loading` | category/race JSONが未取得または切替中 | 旧raceのchartを混ぜず、既存loadingを出す |
| `error` / `not-found` | 既存境界のエラー | 既存のretry/list導線を維持 |

`metric`は新しい状態名ではなく、既存の `tab=rank|gap|pace|lap` を指すUI語とする。
`compare`、`fixed`、`lap` の正規化は既存 `urlState` 契約に従う。

## Component behavior

### Race page shell

1. `RaceHeader`はrace name、category、rider count、freshness、source、非公式注記を
   既存どおり表示する。`sticky top: 0`のpage headerは維持する。
2. `browse`では、category selectorと結果表を主要面として表示する。
3. `analyze`では、結果表を同じ高さのfull tableで残さず、選択中riderと結果の
   要約を1カード（高さ目安88px以内）に畳む。「結果表を表示」操作でのみ全表を
   開く。結果表を開いている間もページ全体が唯一のscroll containerである。
4. `#race-analysis`のtargetはanalysis workspace headingとする。結果表を飛ばす
   リンクは、headingをsticky headerの下へ配置し、headingにfocusを置く。

### AnalysisContextBar

`analyze`と`analysis-unavailable`で表示し、次を必ず文字列で表示する。

- race name（長い場合は2行までwrap）
- category name/id
- selected rider nameと最終順位/状態
- comparison mode（`±2`、`±5`、`固定3名`、`全員`など）
- 現在のmetric label

Desktopでは最大2行、Mobileでは最大3行・高さ96pxを目安とする。race/categoryを
再選択するnavigation action、rider変更action、result tableを開くactionを持つ。
色・線種だけでstateを表現しない。

`RaceHeader`と同時にstickyにする場合、context barはheaderの実測高さ分だけ下に
配置する。headerの高さはResizeObserver等でCSS custom propertyへ反映し、固定値だけ
に依存しない。page以外のworkspace scroll containerは作らない。

### RiderSelector

- `browse`では検索欄と現在カテゴリーの選手リストを表示する。
- `analyze`では初期状態をcompact selected-rider control（順位、名前、変更、
  前後移動）にする。全選手リストは通常DOMで常時表示しない。
- 結果表から選手を選んだ場合も、同じ `analyze` compact stateへ遷移する。
  選択経路によって大きいlistが残ることを許可しない。
- Desktopではcontrol rail内のpopover/disclosure、Mobileでは`aria-modal="true"`
  のbottom sheet/dialogで選手検索とリストを表示する。
- sheet/dialog内のリストだけが内部scrollする。リストの最大高さは`min(70vh,
  32rem)`とし、選手の順位・名前・selected stateを各ボタンのaccessible nameに
  含める。
- 開く前のtriggerを記録し、選択またはEscape/close後にtriggerへfocusを戻す。
  選手変更後にpage scrollを変更しない。
- 選手がdata-quality error/no checkpointでも選択状態は保持し、main側に既存の
  analysis unavailable messageを出す。graphableでない選手を固定比較対象には
  追加しない。

### Comparison controls

- `±0`〜`±5`、`固定`、`全員`と既存のdisabled/limitを維持する。
- Desktopではcontrol railで常時コンパクトに表示し、現在値と表示人数を隣接させる。
- Mobileではtoolbarに現在の比較値を常時表示し、変更操作はbottom sheet/dialogで
  行う。`±0..±5`は44px以上のtargetを持つ。固定モードの選手pickerは同じsheetの
  別見出しで、最大4名・primary除外・stale ID除外を表示する。
- `all`のgraphable rider数制限、legend suppression、crowded detailの既存挙動は
  変更しない。許可されない`all`は既存説明付きdisabledとする。
- sheetを閉じたあと、選択した比較ボタンまたは比較triggerへfocusを返す。

### ChartTabs and main analysis

- DOM/reading orderは `AnalysisContextBar → primary summary/status → ChartTabs →
  LapDetailTable → optional full results` とする。
- `ChartTabs`のtab listをmain analysisの最初に置く。現在の`rank/gap/pace/lap`
  と説明文、chart、既存の`ChartDetailPanel`を同じcomponent境界で維持する。
- chart panelはDesktopで幅いっぱい、plot min-height 360px、Mobileで幅いっぱい・
  plot min-height 240pxを基準にする。既存のRecharts軸、sparse point、line type、
  tooltip、legend roleを変更しない。
- validなprimary riderがある`analyze`では、1440×900と1280×720のactive状態で
  tab labelとchart plotting frameの少なくとも先頭100pxが同一viewportに入るよう、
  result full tableとlap detailをchartより前に置かない。
- `analysis-unavailable`ではchart tabsを無理に表示せず、既存の理由をmainの
  primary slotへ出す。checkpointはあるがtimed lapがない場合など、既存の
  unavailable/empty stateとlap detailを維持する。
- DNFは最後の有効checkpointより後ろを補完せず、lappedはDNFと混同しない。
  その状態をchartの直前に短いstatus textで示す。計測済み区間のchartは閲覧可能。

### Lap detail and results

- `LapDetailTable`はchartの直後へ移動する。既存のdesktop table/mobile labeled
  rows、fixed riderのsparse delta、missing value表示を保持する。
- `LapDetailTable`はsupporting dataとして、初期active viewportを占領しない。
  `ラップ詳細を表示`のdisclosureで閉じる場合も、開閉後に現在のchart位置を保持する。
- full resultsは`結果表を表示`で開け、結果表内のsticky headerと最大高さは既存方針を
  保つ。開いた結果表はbrowse purposeのsurfaceとして扱い、analysis toolbarは
  画面上部に残す。

## State transition table

| Trigger | URL/history | UI transition | Page scroll | Focus |
| --- | --- | --- | --- | --- |
| race link | new route | race loading then browse | top is allowed | clicked link or first usable race control |
| category change | one `push`; clear rider/fixed/tab/lap; compare=2 | old analysis hidden until new race succeeds | top allowed; no stale chart | category trigger after success when keyboard initiated |
| result row selects rider (`browse→analyze`) | one `push` with `rider` | collapse full results, open workspace, show chart-first main | scroll workspace heading into view once; never page top | focus workspace heading (`tabIndex=-1`) so screen reader enters new region |
| rider change inside `analyze` | one `push` | update context/summary/chart in place; picker closes | preserve workspace anchor; `scrollY` must not be forced to 0 | restore focus to rider trigger; announce new rider |
| comparison change | one `push` | update chart/detail without changing mode layout | preserve workspace anchor; no page top | clicked compare option/trigger |
| metric/tab change | one `push` with existing `tab` | swap chart content in fixed panel; preserve valid pinned lap | preserve workspace anchor; no page top | clicked tab, visible selected state |
| lap hover | no URL write | transient detail update | unchanged | pointer only; no forced focus |
| lap select/previous/next/clear | existing URL rule | update detail panel | unchanged | activating lap control; clear returns focus to clear/selector |
| open/close rider or comparison sheet | no durable URL until selection | modal/sheet opens; page scroll lock while open | page position captured and restored exactly | first input on open; trigger on close |
| open full results disclosure | no URL write | expand the existing results under the active workspace; keep `aria-expanded` and a visible heading | preserve the workspace anchor; if the heading is outside the viewport, scroll it below the sticky context offset | focus the disclosure heading/table header after opening; on close return to `結果表を表示` and restore the saved workspace anchor |
| close full results disclosure | no URL write | collapse results without clearing selected rider or analysis state | restore the saved workspace anchor; never go to page top | return focus to the same `結果表を表示` trigger |
| open/close lap detail disclosure | no URL write | expand/collapse supporting lap detail below the chart; keep chart, metric, and context state | opening may scroll the lap-detail heading below the sticky context offset; closing restores the saved chart/context anchor | focus lap-detail heading/table header after opening; return focus to `ラップ詳細を表示` on close |
| direct deep link with rider | existing URL | load `analyze` state atomically; no stale race content | initial browser position is respected; if opened at top, chart-first workspace is visible within target viewport | heading only when navigation is keyboard/anchor initiated |
| browser back/forward | URL is source of truth | apply target category/rider/compare/tab/lap atomically | no code path may unconditionally scroll to page top for same-race active state; native restoration may be used | focus current context or preserved browser target; never focus hidden control |
| invalid/stale URL values | canonical `replace` after relevant data loaded | existing safe defaults/unavailable states | no new scroll | no focus steal during loading/canonicalization |

`scrollY`保持のテストは絶対座標ではなく、`AnalysisContextBar`のviewport内位置を
  anchorとして確認する。同一analysis actionの前後で、context barのtop変化は
  layout shift分を除き24px以内、かつ`scrollY=0`への強制移動がないことを要求する。

## Loading, error, and empty behavior

1. Home loading/network/http/invalid-dataは既存のloading/error/retryを維持する。
2. race/category切替では、旧categoryのchartと新categoryのcontextを混在させない。
   新JSONが成功するまでanalysis内容はloading branchへ置き換える。
3. rider未選択は`browse`であり、chartをダミー表示しない。「結果表から選手を
   選ぶ」CTAと、既存の分析region導線を表示する。
4. riderが存在するがdata-quality error/no checkpointの場合は
   `analysis-unavailable`。selected rider context、状態説明、再選択actionを表示し、
   zero lineや推定chartを出さない。
5. comparison riderが0名なら既存のgap/pace empty messageを維持する。lap axisが
   ある場合のdetail navigationは既存仕様どおり利用でき、comparisonが存在すると
   誤認させない。
6. DNF、lapped、duplicate、missing、post-end recordは既存のdataTransform意味論に
   従い、値の補完・接続・公式順位への変換をしない。
7. 大会が存在しない場合は既存not-foundを表示し、一覧へ戻るcontextを維持する。

## Responsive behavior

### Breakpoints

- `>=1024px`: Desktop workspace grid。1280pxと1440pxを同一構造で扱う。
- `<1024px`: Mobile/tablet workspace。390pxと320pxを最小対象とする。
- `320px`ではbody/documentのpage-level horizontal overflowを0にする。

### Desktop

- outer page paddingを除くmain widthを、left control rail 280〜320pxと、
  right main `minmax(0, 1fr)`に分ける。
- right mainはtab/chartを先に、その下にlap detailを置く。
- full result tableはactive stateではcollapsed summary。開いた場合もchartの
  内容とcontext barを失わせない。
- sticky context barはRaceHeaderの下に置き、header実測高さをoffsetとする。
- 1280×720でも、active stateに入った直後にchart tabとplot frameの上端が認識
  できる。設定railの高さがmain chartの上部を押し下げない。

### Mobile 390px / 320px

- horizontal paddingは16px、interactive targetは原則44px以上。
- context bar + metric toolbarはstickyで、合計高さを最大144pxとする。
  race/category/rider/compare/metricを省略せず、長い名前は2行wrapする。
- active stateでfull results、rider list、fixed rider list、lap detailを同時に
  展開しない。初期表示はcontext + compact summary + chart。
- metric tabは4つの44px targetを横方向に並べ、320pxで文字が切れる場合は短い
  visible labelと`aria-label`の完全名を使う。横スクロールを要求しない。
- rider/comparison sheetはviewport高の70%以下、リスト部分だけ内部scroll、
  Escape/close/selectionでtrigger focusとpage scrollを復元する。
- chartはscreen widthからpaddingを引いた幅で描画し、plot min-height 240px。
  lap detailはchart後のdisclosureにする。
- selected riderが変わっても、ページ先頭ではなく現在のcontext/chart workspaceを
  保持する。320pxの結果表→選手→chartで上下の大往復を要求しない。

## Accessibility and focus contract

- workspaceには一意の`h2`と`aria-labelledby`を置き、headingは必要時だけfocus可能。
- active metricはtab semantics、selected rider/comparisonは`aria-pressed`または
  equivalentな状態を持つ。現在値は色以外の文字でも読める。
- sheet/dialogは名前、`aria-modal`、Escape、focus return、visible focus ringを持つ。
- 選手名・比較値・lap valueはchart SVGだけに依存せず、既存のdetail panel/tableで
  keyboard/screen readerに提供する。
- chart rerenderでfocusをbodyやhidden DOMへ失わない。選択されたtriggerが消える
  場合は、同じlabelの新しいcompact triggerへfocusを移す。
- `prefers-reduced-motion`ではscroll behaviorをsmoothにせず、layout animationを
  使わない。focus ringは320px/390pxでも視認できる。
- screen reader向けlive regionは、rider/metric/comparisonの変更結果を一度だけ
  簡潔に読み上げ、URL canonicalizationやhoverでは読み上げない。

## Technical integration boundaries

- `RaceViewer`がURL state、workspace mode、scroll intentを調整する。
- `RaceHeader`はrace contextのsource/freshness/error境界を所有する。
- `RiderSelector`、`ComparisonAdjuster`、`ComparisonRiderPicker`は選択UIだけを
  所有し、page navigationを直接作らない。
- `ChartTabs`はmetric/chart/detailのmain surfaceを所有し、tab変更は既存の
  `tab` URL stateを通じて行う。
- `LapDetailTable`はchartの下のsupporting surfaceへ移動するが、transformと
  表示値の契約は変えない。
- `urlState.ts`のkey、normalization、default、unknown param順序を変更しない。
- `router.push`/`replace`の既存のhistory意味を保ちつつ、同一analysis actionの
  navigationには明示的なscroll-preservation intentを付ける。category/new routeの
  top navigationとは分離する。
- 新しいscroll containerやproduction dependencyを導入しない。

## UX acceptance criteria

1. **Scroll stability**: active stateでrider、comparison、metricを変更しても、
   page topへ戻らない。context barのviewport位置は24px以内の変動に収まり、
   clicked controlのfocusが残る。
2. **Analysis visibility**: 1440×900と1280×720でvalid riderのactive stateに
   入った直後、chart tabとplot frameの先頭100pxが主要viewport内で認識できる。
   320×568と390×844でもmetric toolbarとchartまたはprimary statusが最初のactive
   viewportで認識できる。
3. **Configuration density**: active stateの初期表示にfull rider list、full
   result table、lap detail tableを同時に出さない。低頻度の選択一覧はsheet/dialog
   を開いたときだけ表示する。
4. **Repeated analysis**: 同じrace/riderでcompareを3回、metricを4種類連続して
   変更でき、各変更後にページ上下の往復を必要としない。
5. **Context preservation**: race、category、selected rider、comparison、metric
   の現在値が、sticky context/toolbarに文字として常時表示される。
6. **Mobile**: 320×568でも、rider変更・comparison変更・metric変更のprimary
   controlsへ1回のtapで到達でき、変更後にpage topへ戻らない。page-level
   horizontal overflowはない。
7. **State coverage**: loading、network/http/invalid-data、not-found、no rider、
   no comparison、unavailable, DNF, lapped, missing/duplicate lap, `all` limit,
   pinned limit, URL invalidation, back/forward, direct deep linkを壊さない。
8. **Accessibility**: keyboard onlyで大会→カテゴリー→選手→比較→metric→lap
   detailまで移動でき、sheet focus return、visible focus、screen reader labelが
   ある。色・hover・SVGのみを必須情報にしない。

## Validation plan for the future implementation phase

- Unit/regression: 既存全テスト、URL normalization、dataTransform、comparison、
  chart detailを実行。
- Required commands: `npm test`、`npx tsc --noEmit`、`npm run lint`、
  `npm run build`、`git diff --check`。
- Browser matrix: 1440×900、1280×720、390×844、320×568でbrowse/analyze、
  rider/comparison/metric、sheet focus、direct URL、back/forward、error/not-found。
- Behavior assertions: action前後の`scrollY`、context bar位置、activeElement、
  URL、document/page overflow、visible chart frameを記録する。
- User validation: 少なくとも3名の初見ユーザーでTask 1〜5を再実施し、Time to Value、
  Time to Insight、スクロール回数、操作完了率、読み間違いを現状baselineと比較する。

## UX2-1 execution contract (resolved 2026-09-05)

UX2-1 implements only the state, URL, history, scroll, and focus foundation. It
does not implement the chart-first composition, compact workspace layout, mobile
sheet, or disclosure changes assigned to UX2-2 through UX2-5.

### Transition classification

| Transition | Classification | Router call | Scroll | State effect |
| --- | --- | --- | --- | --- |
| race link, list return, or another route | Navigation | existing route navigation | normal/top allowed | new page context |
| category change, including a category query on the same `/race/[meetId]` path | Navigation | `router.push(href, { scroll: true })` | top allowed | clear rider/fixed/tab/lap and set compare to `2`; show loading until the new race succeeds |
| rider change while a rider is already selected | Analysis context | `router.push(href, { scroll: false })` | preserve workspace | update the selected rider in place |
| first rider selection from browse | Navigation into analysis | `router.push(href, { scroll: true })` | existing explicit analysis-entry behavior allowed | enter analysis with the selected rider |
| comparison/fixed-rider change | View preference | `router.push(href, { scroll: false })` | preserve workspace | update comparison mode or fixed IDs |
| metric/tab or deliberate lap change | View preference | `router.push(href, { scroll: false })` | preserve workspace | update the existing `tab`/`lap` state |
| canonical cleanup after data validation | Non-user synchronization | `router.replace(href, { scroll: false })` | unchanged | normalize only after the relevant data is available |

The existing query keys, defaults, serialization order, unknown repeated query
pairs, and durable `push` history semantics remain unchanged. Scroll position is
not serialized in the URL. Hover remains transient and never writes history.

### Focus and browser traversal

Same-analysis controls retain their native focus when their DOM node remains a
valid representation of the restored state. A rider picker selection returns
focus to the stable rider trigger; a keyboard selection from the result table
keeps the existing analysis-region focus behavior. On browser back/forward, an
active same-race state keeps a valid focused control when possible; if the old
control is stale or removed, focus moves to the current visible metric tab or
another visible analysis control using `focus({ preventScroll: true })`. A
category back/forward transition focuses the loaded category trigger only after
the new race has completed; loading and canonicalization do not steal focus.

The existing selected-row `scrollIntoView` behavior remains limited to revealing
the selected row in the bounded rider list when that picker is opened. It must
not move page-level scroll as a side effect of a URL-driven rider update.

## UX2-2 desktop workspace execution contract (resolved 2026-09-06)

UX2-2 implements the Desktop composition only. It does not introduce the
Mobile sheet, Mobile compact header, lap-detail disclosure redesign, or any
new URL/data behavior.

### Responsive boundary

- `lg` (`min-width: 1024px`) is the Desktop workspace boundary. At and above
  this width, active analysis uses the workspace grid described below.
- Below `1024px`, the existing vertical/mobile composition remains the source
  of truth for this slice. Desktop-only CSS must not create a sidebar, results
  disclosure, or sticky workspace toolbar below the boundary.
- The existing mobile DOM remains usable at 390px and 320px; UX2-3 owns its
  future chart-first mobile reordering and sheets.

### Active Desktop structure

When a loaded race has a selected rider, `RaceViewer` renders this single
Desktop workspace structure without duplicating durable state:

```text
RaceHeader (existing sticky header)
  compact active-results disclosure (closed by default)
  #race-analysis
    focusable h2 / skip target
    AnalysisContextBar (race, category, rider, comparison, metric)
    desktop grid
      control rail (280–320px)
        compact RiderSelector trigger/list disclosure
        SummaryCard + LapSummaryCard
        ComparisonAdjuster + fixed picker when selected
      primary column
        ChartTabs (tabs, reading hint, chart, detail panel)
        LapDetailTable (supporting content)
```

The active results table is represented once in the Desktop tree, inside a
native `details` disclosure with a keyboard-reachable `summary` named
`結果表を表示`. It has no URL or history state. The disclosure is closed when
entering analysis and may be opened explicitly; browse state and all widths
below `1024px` keep the existing full results surface. The table remains in
the DOM when the disclosure is open and retains its existing semantic labels.

The Desktop-only visual order is applied at the workspace boundary: the
primary `ChartTabs` surface precedes `LapDetailTable`; the pre-existing mobile
vertical order is not changed by this slice. No chart calculation, table value,
status meaning, or comparison eligibility changes.

### Context and controls

- `AnalysisContextBar` is a compact, text-readable context surface. It always
  shows race name, category, selected rider (including position/status),
  comparison mode/count, and the active metric. Long race/rider names wrap
  rather than causing horizontal overflow.
- The context bar is not a second sticky surface in UX2-2. `RaceHeader` remains
  the only sticky page header; the context bar is placed directly before the
  workspace grid so it remains visible in the initial chart-first viewport.
  UX2-3 may revisit a measured mobile toolbar after this Desktop slice.
- The selected rider control is compact in active analysis, but its existing
  search/list path remains available on activation. A transition from browse
  to analysis must close the full rider list after the selected URL state is
  applied; a later rider change returns focus to the stable compact trigger.
- Comparison controls remain in the Desktop rail with their existing ±0–±5,
  fixed, all, disabled, and count semantics. Current values remain visible;
  no list or search capability is removed.
- Metric controls remain inside `ChartTabs`, immediately above the primary
  chart. `tab` URL, history, and UX2-1 `{ scroll: false }` navigation are
  unchanged.

### Scroll, focus, and layout stability

- No new scroll container, `scrollTo`, timeout, or magic pixel restoration is
  allowed. Same-workspace rider/comparison/metric/lap transitions continue to
  use the UX2-1 navigation contract and preserve the page position.
- Entering analysis from a result row may use the existing explicit analysis
  anchor behavior. Category/new-race navigation keeps its existing top/loaded
  content behavior.
- The workspace heading remains the stable `#race-analysis` skip/focus target;
  its focus behavior and `preventScroll` reconciliation remain unchanged.
- The results disclosure is an explicit user navigation surface. Opening it
  may reveal the table below the compact context, but opening/closing it does
  not write URL/history and must not change existing same-workspace focus
  behavior.
- The primary chart column reserves the existing chart plot frame; Desktop
  chart plotting remains at least `360px`/the existing component minimum, and
  the layout must not collapse the chart when comparison legends grow.

### UX2-2 acceptance additions

1. At 1440×900, a normal valid analysis state shows the context, metric tabs,
   and a meaningful chart plot area without an additional scroll.
2. At 1280×720, the tabs and a practical chart plot area are visible without
   the full results table or lap detail preceding the chart.
3. Desktop configuration is limited to the 280–320px rail; active full results
   are closed by default and the full rider list is not left open.
4. Race/category/rider/comparison/metric are readable in the active context;
   no state is represented by color alone.
5. Metric, comparison, rider, browser back/forward, deep link, and keyboard
   behavior satisfy UX2-1 without URL/history or scroll regressions.
6. At 390px and 320px the existing mobile composition remains usable and has
   no Desktop-only sidebar/disclosure leak or page-level horizontal overflow.

### UX2-2 audit resolutions (2026-09-06)

- `1024px` is the only Desktop boundary. A resize across it changes only the
  responsive presentation; URL state, selected rider, history, scroll, and the
  user's Desktop results-disclosure preference are retained. The implementation
  must not derive durable analysis state from `matchMedia`.
- In Desktop `analyze`, the results disclosure is rendered after the active
  workspace (after chart and lap detail). Its summary is the compact on-demand
  results action. Opening it expands the existing results card in that place;
  it does not push a new history entry or move focus away from the summary.
  `browse` always renders the existing full results before analysis entry.
  Below `1024px`, the existing full-results placement and appearance remain.
- The Desktop workspace DOM order is `h2/context/status → ChartTabs →
  LapDetailTable → control rail → results disclosure`. CSS grid places the
  control rail visually to the left, but it is not placed before the primary
  chart in the reading order. The context bar is the primary status surface;
  SummaryCard/LapSummaryCard remain supporting detail in the rail.
- Context text is: race name, category, selected rider name plus a readable
  position/status string, comparison label plus displayed count, and active
  metric. `DNF`/lapped/unavailable wording follows the existing result/status
  meaning; pinned mode shows the fixed count rather than a long rider-name list.
  Race and rider names may wrap to two lines in the context/trigger; the
  selected-rider trigger keeps its action label visible and uses an accessible
  full name if visual truncation is unavoidable.
- The existing `max-h-[32rem] overflow-y-auto` results list is retained. It is
  the only pre-existing bounded result-list scroll surface; UX2-2 adds no
  workspace scroll container. The page remains the only page-level workspace
  scroll container.
- The measurable chart target is: at 1440×900, `ChartTabs` and at least 100px
  of the plot frame are within the initial viewport; at 1280×720, the tab list
  and at least 100px of plot frame are within the initial viewport. The visible
  frame must not be hidden by the existing sticky `RaceHeader`. These are
  browser assertions, not fixed document coordinates.
- `analysis-unavailable` retains the existing unavailable alert and does not
  render `ChartTabs` or `LapDetailTable`; its context still identifies the
  selected rider and reason. Valid analysis keeps the chart and moves lap
  detail after it. A category change continues to clear the rider and returns
  to browse after the target race loads.
- Keyboard result-row selection keeps the existing workspace-heading focus
  path. Pointer selection does not steal focus beyond the existing explicit
  navigation behavior. Disclosure open/close uses the native summary focus
  behavior, and browser traversal continues to reconcile only current visible
  controls under the UX2-1 contract.
- The Desktop results disclosure is not rendered below `1024px`; Mobile uses
  the existing full results table before the analysis workspace in DOM and
  visual order. Desktop uses one table instance after the workspace. The local
  Desktop open preference is updated only by the mounted Desktop disclosure,
  so responsive resize cannot turn a forced Mobile presentation into a saved
  open state.
- The active analysis children use explicit structural order per breakpoint:
  Mobile keeps the existing control rail, lap detail, then chart sequence;
  Desktop uses chart tabs, lap detail, then control rail. Desktop grid placement
  moves the rail visually left without relying on CSS `order` to define the
  Mobile DOM or assistive-technology sequence.
