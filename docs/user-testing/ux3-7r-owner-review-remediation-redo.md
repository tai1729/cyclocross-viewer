# UX3-7R Owner Review Remediation REDO

## 1. Why UX3-7 Was Rejected

The previous report and verdict remain historical and are not edited:

```text
UX3-7:
RELEASED — POST-RELEASE HUMAN VALIDATION CONTINUES
```

The Owner Human reviewed the released Production UI and reported that the
original P-A-01 dissatisfaction remained materially visible. UX3-7 therefore
passed code-level and automated gates but failed its UX-effectiveness test:

```text
UX3-7 remediation effectiveness:
REJECTED BY OWNER HUMAN

Reason:
Original P-A-01 dissatisfaction remained materially visible
in the released UI.
```

The specific cause was macro, not data or test correctness. UX3-7 added an
automatic first rider, labels, a chart key, markers, chart height, and hints,
but retained the large race/context stack and the desktop side rail. The chart
still arrived late in the viewport, supporting information still competed with
it, and Results/controls still required too much exploration.

## 2. Baselines

| Item | Evidence |
| --- | --- |
| UX3-6 baseline | `28683845d05a43db5b61366dff5cfcc3a6959b31` |
| UX3-7 implementation | `30ee798a2dbc82f828fc0f28837c9663ee9bbd39` |
| UX3-7 report | `475485f6f1d6d3aa823a8cf05835ce6b8e5bf100` |
| Before URL | `https://ajocc-laptime-viewer.vercel.app/race/MMJ-256-005?rider=KNS-000-4368` |
| After validation URL | `http://localhost:3000/race/MMJ-256-005?rider=KNS-000-4368` before deployment; Production recheck follows push |
| Fixed state | race `MMJ-256-005`, category `ME1`, rider `KNS-000-4368`, rank tab, default `±2`, no pinned lap |

The required audit was performed with:

```text
git status
git log -5 --oneline
git diff 28683845d05a43db5b61366dff5cfcc3a6959b31..30ee798a2dbc82f828fc0f28837c9663ee9bbd39
```

Existing user-owned changes in `docs/feedback/` and the untracked UX3-2/UX3-3
field-test records were not modified or staged.

## 3. Original P-A-01 Review

The source of truth was reread from the first line through the final
facilitator notes:
`docs/user-testing/ux3-2-participant-post-test-qa-P-A-01.md`.
P-A-01 is Owner Human evidence from a nearly first-use desktop session, not an
External Human field-test result. The detailed negative/improvement records
below preserve the original question IDs and answer meaning. Positive-only,
`NR`, and `N/A` responses are retained in the source but are not counted as
negative findings.

### P-A-01-Q01

### Original question

「このサイトを使ってみて、全体としてどう感じましたか？」

### Owner answer

「ある程度分析や検索できるツールだと思いましたが、まだもっと良くなる(現状まだまだ)という感想です。」

### Original dissatisfaction

The overall experience still felt unfinished despite the data/product value.

### Requested / implied improvement

Improve the visible analysis flow and usability, not only the data content.

### Current Production

現在も不満が成立するか: `YES` in the UX3-7 release; the before screenshot
shows the same low-density, chart-late composition.

### Why UX3-7 failed to resolve it

UX3-7 changed local labels and markers but did not change the page priority
structure that produced the overall impression.

### Concrete redesign required

Make analysis identity, controls, chart, and Results form one intentional flow;
remove the desktop rail and reduce duplicated context.

### Acceptance Criteria

- [x] The primary viewport has a clear analysis flow.
- [x] The chart is a full-width primary surface.
- [x] Supporting content no longer competes with the chart before it.

### Visual proof required

Before: `before-desktop-1440x900.png` and `before-mobile-390x844.png`.
After: corresponding `after-*` images showing the chart stage earlier and wider.

### P-A-01-Q03

### Original question

「一番使いにくかった、または分かりにくかったところはどこですか？」

### Owner answer

After selecting a meet, it was unclear how the graph appeared; selecting a rider
made it appear, and the first-place rider should be shown initially. The stepped
rank graph was also hard to read.

### Original dissatisfaction

The initial analysis path was opaque and the primary chart did not look ready.

### Requested / implied improvement

Show a useful first analysis immediately and give the graph enough priority and
space.

### Current Production

現在も不満が成立するか: `YES` for hierarchy/space in the UX3-7 release;
first-rider auto-selection alone was not enough.

### Why UX3-7 failed to resolve it

Auto-selection removed the empty state, but the chart remained below the large
context and rail; the visual reason to continue was still weak.

### Concrete redesign required

Compact the race context, put the rider control in a compact deck, and make the
chart stage full width with its line key adjacent.

### Acceptance Criteria

- [x] Fresh explicit-state entry shows a selected rider and chart without a
  result-table prerequisite.
- [x] Rank chart is visibly the first large analytical surface.
- [x] The stepped rank semantics remain unchanged and readable.

### Visual proof required

The 1280x720 and 390x844 After images show the chart card/plot starting in the
initial viewport rather than an empty analysis state.

### P-A-01-Q05

### Original question

「最初から最後まで、自分が次に何をすればよいか分かりましたか？」

### Owner answer

Rider selection was understandable, but comparison, lap detail, show/hide
behavior, and clickable locations were difficult to find.

### Original dissatisfaction

The action/result relationship was scattered and interactive surfaces looked
too much like ordinary text.

### Requested / implied improvement

Group the actions around the analysis subject and make each result predictable.

### Current Production

現在も不満が成立するか: `YES` in the old release; labels existed but were
distributed across the side rail and below-chart surfaces.

### Why UX3-7 failed to resolve it

UX3-7 mostly renamed controls; it did not consolidate their spatial context.

### Concrete redesign required

Use a single Analysis Control Deck with visible rider-change and comparison
actions, then place chart, lap detail, and Results in a fixed vertical order.

### Acceptance Criteria

- [x] Rider change is a visible button in the same deck as the current rider.
- [x] Comparison mode is a visible control with current count.
- [x] Lap detail and Results remain labeled native disclosures.

### Visual proof required

After screenshots and the Playwright flow show the control deck, Results action,
and lap disclosure in their new positions.

### P-A-01-Q06

### Original question

「特に分かりやすかった画面や機能はありましたか？」

### Owner answer

Rank and lap graphs were valuable, but other riders' times were bundled and hard
to compare.

### Original dissatisfaction

The product's most valuable surface was not giving comparison lines enough
identity.

### Requested / implied improvement

Keep the graph as the hero and identify each comparison rider at the chart.

### Current Production

現在も不満が成立するか: `PARTIAL` in UX3-7; a key existed, but it was easy to
miss below the visible plot.

### Why UX3-7 failed to resolve it

The key/markers were a local addition, not part of the initial chart stage.

### Concrete redesign required

Render the role/name line key immediately after the plot, with the same marker
and dash mapping used in every series.

### Acceptance Criteria

- [x] `注目選手` and every displayed comparison name are visible in the deck or
  post-plot key.
- [x] Marker/dash mapping is text-backed and not color-only.
- [x] Key wraps without page overflow.

### Visual proof required

The After images visibly show the plotted lines followed by the adjacent key.

### P-A-01-Q08

### Original question

「途中で迷ったところ、または探しにくかったところはありましたか？」

### Owner answer

Series ordering made selection hard to find, and comparison could not be read on
the graph without looking at a lower table.

### Original dissatisfaction

The selected comparison relationship was not visible where the comparison was
being read.

### Requested / implied improvement

Make comparison identity local to the chart and keep race/category navigation
ordered and understandable.

### Current Production

現在も不満が成立するか: `PARTIAL`; chart comparison is clearly improved, but
the historical series-order complaint is not a chart-stage issue.

### Why UX3-7 failed to resolve it

UX3-7 added names but left the name-to-line mapping below the first plot view.

### Concrete redesign required

Use a compact `主選手 vs 比較選手` chart heading and post-plot key. Keep existing
category ordering contract unchanged.

### Acceptance Criteria

- [x] The chart heading names the current rider and comparison riders.
- [x] The key is adjacent to the plot and not dependent on a lower table.
- [x] Category selection behavior remains unchanged.

### Visual proof required

Same-state Before/After chart screenshots and the key DOM order assertion.

### P-A-01-Q09

### Original question

「リザルト表について、どう感じましたか？」

### Owner answer

The table itself was fine, but after selecting a rider it became hidden at the
very bottom; it should be below the graph.

### Original dissatisfaction

Results existed but were not discoverable in the analysis flow.

### Requested / implied improvement

Keep the chart primary while making Results action visible and the table below
the graph.

### Current Production

現在も不満が成立するか: `YES` in the old UX3-7 screen.

### Why UX3-7 failed to resolve it

The old disclosure was visually below the workspace and the desktop layout
allowed it to be missed.

### Concrete redesign required

Add one prominent Results action in RaceHeader and render the authoritative
disclosure after chart/supporting content.

### Acceptance Criteria

- [x] `結果表を表示・8名` is visible in the race context.
- [x] The table/disclosure appears after the chart in DOM/visual order.
- [x] Selecting a result still changes the analysis rider.

### Visual proof required

Before desktop lacks a visible Results action; After desktop/mobile show it in
the race header and the closed disclosure below the chart.

### P-A-01-Q10

### Original question

「最初にチャートを見たとき、何を表すグラフだと思いましたか？」

### Owner answer

The Owner understood it as a comparison graph, but only later understood the
rank plus/minus meaning.

### Original dissatisfaction

The chart did not explain its subject and metric at first glance.

### Requested / implied improvement

Put the `who vs who` identity and active metric next to the tabs/plot.

### Current Production

現在も不満が成立するか: `PARTIAL` in UX3-7; the chart title was not a strong
macro surface.

### Why UX3-7 failed to resolve it

The reading guide existed but was visually subordinate and disconnected from
the chart identity.

### Concrete redesign required

Use a chart-stage heading with explicit primary/comparison names and a visible
metric label.

### Acceptance Criteria

- [x] Chart heading names both sides of the comparison.
- [x] Active metric is visible beside the chart tabs.
- [x] Direction guide remains visible and tested.

### Visual proof required

After screenshots show the chart heading, active metric, and guide before the
plot.

### P-A-01-Q11

### Original question

「比較機能について、どう理解しましたか？」

### Owner answer

The before/after-rank comparison was interesting; seeing all riders would be
useful, but values separated outside the graph were hard to read.

### Original dissatisfaction

Comparison was valuable but its controls and in-chart identity were weak.

### Requested / implied improvement

Show who is compared at the chart, with an obvious comparison mode control.

### Current Production

現在も不満が成立するか: `PARTIAL` in UX3-7; controls were labeled but still
remote from the chart hierarchy.

### Why UX3-7 failed to resolve it

Microcopy did not make comparison the relationship being read.

### Concrete redesign required

Keep comparison mode in the control deck and identity/key immediately at the
chart.

### Acceptance Criteria

- [x] Mode and count are visible before the chart.
- [x] Primary and comparison names are visible at the chart.
- [x] The complete key remains available in all supported modes.

### Visual proof required

After 1280x720 and mobile images plus fixed/all-mode automated tests.

### P-A-01-Q12

### Original question

「前の画面へ戻る、または別の大会・カテゴリーを見る操作は分かりましたか？」

### Owner answer

Browser side-button back was acceptable, but the list/category controls became
hidden after scrolling and should stay fixed.

### Original dissatisfaction

Navigation context was lost during long-page scrolling.

### Requested / implied improvement

Keep a compact path back to the event/category available while reviewing.

### Current Production

現在も不満が成立するか: `PARTIAL`; the redesign shortens the page before the
chart, but it does not add a new sticky navigation layer.

### Why UX3-7 failed to resolve it

UX3-7 deferred the navigation restructuring and changed no scroll context.

### Concrete redesign required

This remains a bounded follow-up candidate: a sticky compact race path must be
designed against the existing sticky RaceHeader without stacking fixed layers.

### Acceptance Criteria

- [ ] A future navigation change must keep back/category available without
  obscuring chart content.
- [x] UX3-7R has materially reduced the amount of scrolling before analysis.

### Visual proof required

Full-page scroll capture and focus/overlap checks are required before claiming
this record CLEARLY CHANGED.

### P-A-01-Q13

### Original question

「使用したDesktopまたはMobileで、操作しやすかった点としにくかった点は何ですか？」

### Owner answer

Controls looked monochrome, so buttons/lists might be missed.

### Original dissatisfaction

Interactive affordances were visually close to passive text.

### Requested / implied improvement

Use explicit button shapes, borders, state, and action labels.

### Current Production

現在も不満が成立するか: `YES` in the old screen.

### Why UX3-7 failed to resolve it

Semantic controls were present, but their placement and grouping remained low
contrast and scattered.

### Concrete redesign required

Use the visible control deck, outlined controls, selected states, and action
labels in the first analysis surface.

### Acceptance Criteria

- [x] Rider change is a bordered button with a `変更` action.
- [x] Comparison presets have selected state and labels.
- [x] Focus rings and semantic buttons remain intact.

### Visual proof required

After screenshots and Playwright locator/keyboard evidence.

### P-A-01-Q16

### Original question

「一つだけ直せるとしたら、どこを直してほしいですか？」

### Owner answer

Make the graph larger and compact things that do not deserve so much screen
space; fix the layout.

### Original dissatisfaction

The most direct Owner request was macro information priority and chart scale.

### Requested / implied improvement

Chart-first full-width composition with less preceding/supporting bulk.

### Current Production

現在も不満が成立するか: `YES` in the previous release.

### Why UX3-7 failed to resolve it

The chart height was increased inside the old side-rail layout, so the usable
plot still began late and the chart did not become the page's visual thesis.

### Concrete redesign required

Remove the side rail, compact context, and let the chart stage span the page.

### Acceptance Criteria

- [x] Chart stage is full width at desktop.
- [x] Plot begins earlier than the baseline at 1280x720 and 1440x900.
- [x] Summary/supporting cards are below the plot.

### Visual proof required

Measured screenshot comparison: baseline plot top about 532px at 1440x900;
After plot top about 500–520px with a full-width chart and post-plot key.

### P-A-01-Q18

### Original question

「こうだったらもっと使いたいと思うことはありますか？」

### Owner answer

A more polished race-results layout/UI would increase use and recommendation.

### Original dissatisfaction

The product value was being undermined by presentation.

### Requested / implied improvement

Make the page hierarchy intentional and coherent.

### Current Production

現在も不満が成立するか: `YES` in the UX3-7 release.

### Why UX3-7 failed to resolve it

The release had several isolated polish patches but no coherent composition.

### Concrete redesign required

Use one analysis flow and one chart stage, avoiding duplicated identity and
control surfaces.

### Acceptance Criteria

- [x] Visual hierarchy is explicit in the After screenshots.
- [x] No duplicate Results action/disclosure appears before the chart.

### Visual proof required

Before/After paired screenshots at all required sizes.

### P-A-01-Q20

### Original question

「その他、自由に感想を教えてください。」

### Owner answer

Content was rated 8/10, but layout/usability 4/10; usability stayed in memory
more than the data.

### Original dissatisfaction

This is a summary signal for the concrete layout findings above, not a separate
feature request.

### Requested / implied improvement

Prioritize interaction and visual usability when evaluating release readiness.

### Current Production

現在も不満が成立するか: `YES` for the old layout; this redo is the direct
remediation of the summarized complaint.

### Why UX3-7 failed to resolve it

The previous gate treated code/test completion as UX effectiveness.

### Concrete redesign required

Use Owner visual acceptance as a separate gate from automated correctness.

### Acceptance Criteria

- [x] Visual evidence is required and inspected.
- [x] Automated PASS is not used as a substitute for Owner-effect evidence.

### Visual proof required

The complete evidence directory and this question-level report.

### P-A-01-Q22

### Original question

「大会・カテゴリー・選手を探す流れで良かったところはありましたか？」

### Owner answer

Meet/category selection was fine, but finding a rider is hard without knowing
the race/category.

### Original dissatisfaction

Cross-race rider discovery is not solved by a category-local analysis screen.

### Requested / implied improvement

Provide a better rider discovery path if the product is expected to start from a
rider rather than a meet.

### Current Production

現在も不満が成立するか: `YES` as a product-level discovery issue; not the
primary chart workspace.

### Why UX3-7 failed to resolve it

UX3-7 did not implement cross-meet search and the Owner record did not define a
new route or index contract.

### Concrete redesign required

The current redo makes `注目選手を変更` and category-local search prominent;
cross-meet discovery needs a separately specified data/index decision.

### Acceptance Criteria

- [x] Current-category rider change is visible and searchable.
- [ ] Cross-meet/cross-category rider search is not claimed fixed here.

### Visual proof required

After mobile/desktop control-deck screenshots and a separate product decision
before adding a cross-event index.

### P-A-01-Q27

### Original question

「どこを押せばよいか分からなかったところはありましたか？」

### Owner answer

The category-change list did not look like a list, and the feedback link was
hard to spot.

### Original dissatisfaction

Some controls were visually passive.

### Requested / implied improvement

Strengthen select/button affordance and keep the primary analysis controls
obvious.

### Current Production

現在も不満が成立するか: `PARTIAL`; category select is now a standard visible
combobox, while feedback placement is outside this remediation's core flow.

### Why UX3-7 failed to resolve it

The prior work focused on analysis labels, not the category control's visible
container or the full page hierarchy.

### Concrete redesign required

Keep the native labeled category combobox and explicit analysis buttons; do not
add unrelated feedback UI changes.

### Acceptance Criteria

- [x] Category is an accessible labeled combobox.
- [x] Main analysis actions are semantic, bordered controls.

### Visual proof required

Viewport screenshots showing category control and analysis deck.

### P-A-01-Q28

### Original question

「言葉の意味が分からなかったところはありましたか？」

### Owner answer

「比較対象の固定ってなに」と initially caused confusion.

### Original dissatisfaction

The action named the implementation state, not the user's intent.

### Requested / implied improvement

Name the action as adding/removing a comparison rider.

### Current Production

現在も不満が成立するか: `YES` in the old release.

### Why UX3-7 failed to resolve it

Renaming to `固定比較` still left the relationship visually separate from the
current rider.

### Concrete redesign required

Group `比較する選手`, mode, count, add/remove controls, and chart identity.

### Acceptance Criteria

- [x] The deck says `比較する選手`.
- [x] Fixed mode offers `比較する選手を追加` and `比較から外す` labels.
- [x] Chart heading/key makes the resulting relationship visible.

### Visual proof required

After screenshots and fixed-comparison Playwright flow.

### P-A-01-Q29

### Original question

「表示されている情報が多すぎる、または少なすぎると感じたところはありましたか？」

### Owner answer

The issue was not quantity but missing priority; less-important information
occupied too much screen space.

### Original dissatisfaction

Everything had similar visual weight.

### Requested / implied improvement

Give race context, rider/control state, chart, and supporting information
different visual priority.

### Current Production

現在も不満が成立するか: `YES` in the old release.

### Why UX3-7 failed to resolve it

The old grid made summary, lap summary, and controls compete with the chart.

### Concrete redesign required

Full-width chart stage first; quieter summary/detail cards afterward.

### Acceptance Criteria

- [x] Race context is compact.
- [x] Chart stage is full width and visually stronger.
- [x] Supporting cards are below the chart.

### Visual proof required

Paired 1440x900/1280x720 screenshots.

### P-A-01-Q30

### Original question

「不要だと思った情報、ボタン、説明はありましたか？」

### Owner answer

The question was about presentation priority, not deletion: where and in what
form information was shown mattered more.

### Original dissatisfaction

The page used space inefficiently.

### Requested / implied improvement

Restructure rather than remove valuable race analysis information.

### Current Production

現在も不満が成立するか: `YES` in the previous release.

### Why UX3-7 failed to resolve it

Small margin/label changes did not alter structural competition.

### Concrete redesign required

Keep data but change order, grouping, and chart dominance.

### Acceptance Criteria

- [x] No chart/supporting data contract is removed.
- [x] Layout order carries the intended priority.

### Visual proof required

Before/After full-width chart and compact deck images.

### P-A-01-Q31

### Original question

「期待した動きと違ったところはありましたか？」

### Owner answer

Selecting a fixed rider moved the rider to the top and made the selected rider
hard to recognize.

### Original dissatisfaction

Selection state and result were not predictable.

### Requested / implied improvement

Keep the main rider visibly distinct from comparison riders and expose selected
state without relying on list position.

### Current Production

現在も不満が成立するか: `YES` in the old release.

### Why UX3-7 failed to resolve it

The fixed-rider list remained a separate implementation-oriented surface.

### Concrete redesign required

Make the main rider a stable `注目選手` control and put comparison actions in a
separate labeled group.

### Acceptance Criteria

- [x] Main rider remains in the `注目選手` control.
- [x] Comparison add/remove is in the comparison group.
- [x] Chart key role labels identify the main line.

### Visual proof required

Control-deck screenshot plus fixed comparison flow.

### P-A-01-Q32

### Original question

「文字が読みにくい、押しにくい、または見つけにくいところはありましたか？」

### Owner answer

The graph legend was too small and overlapped the lap-axis text.

### Original dissatisfaction

The line mapping was hard to read at the point of use.

### Requested / implied improvement

Use a readable, wrapping key separated from the plot axis.

### Current Production

現在も不満が成立するか: `YES` in the old release.

### Why UX3-7 failed to resolve it

The prior key was below the plot and still easy to miss; merely adding markers
did not fix placement.

### Concrete redesign required

Place a bordered role/name key immediately after the plot and allow wrapping.

### Acceptance Criteria

- [x] Key is visible immediately after the plot.
- [x] Key no longer overlaps x-axis labels.
- [x] Key does not create horizontal overflow at 320px.

### Visual proof required

After 390x844 and 320x568 images.

### P-A-01-Q33

### Original question

「もう一度使うとしたら、最初に直してほしいところはどこですか？」

### Owner answer

「レイアウト、UIの見せ方」

### Original dissatisfaction

The requested correction was structural presentation, not terminology alone.

### Requested / implied improvement

Rework the analysis page hierarchy.

### Current Production

現在も不満が成立するか: `YES` in the prior release.

### Why UX3-7 failed to resolve it

The previous scope deliberately limited layout change.

### Concrete redesign required

Remove the side rail and introduce the compact chart-first composition.

### Acceptance Criteria

- [x] Macro DOM order visibly changed.
- [x] Before/After visual difference is clear.

### Visual proof required

All four viewport pairs.

### P-A-01-Q34

### Original question

「テスト中に、意味が分からないまま進めた表示や操作はありましたか？」

### Owner answer

The selected-lap use never became clear; the Owner expected hover/card values.

### Original dissatisfaction

The action/result relationship was separated from the chart.

### Requested / implied improvement

Keep interaction guidance and selected-lap detail close to the chart.

### Current Production

現在も不満が成立するか: `PARTIAL` in UX3-7; the hint existed but followed the
plot and the chart was late.

### Why UX3-7 failed to resolve it

Copy was added without moving the chart interaction surface into a primary
stage.

### Concrete redesign required

Keep a short interaction hint adjacent to the key/plot and retain the measured
detail disclosure immediately after the active chart.

### Acceptance Criteria

- [x] Interaction hint is visible after the plot and before detail.
- [x] Selected-lap detail remains native, labeled, and keyboard-operable.
- [x] Measured values/formulas are unchanged.

### Visual proof required

After chart screenshots and Playwright lap-detail interaction.

### P-A-01-Q35

### Original question

「意味が分からなかった言葉や略称はありましたか？」

### Owner answer

`注目選手`, `参考選手`, and `比較対象の固定` were initially unclear.

### Original dissatisfaction

Role terminology was not anchored to a visible relationship.

### Requested / implied improvement

Use role labels with the current rider and comparison names at the same surface.

### Current Production

現在も不満が成立するか: `YES` in the prior release.

### Why UX3-7 failed to resolve it

The terms were renamed but their relationship still required scanning.

### Concrete redesign required

Use Japanese control labels plus a `注目選手 … vs …` chart heading and role/name
key.

### Acceptance Criteria

- [x] Main role and comparison role are visible in the chart key.
- [x] Action labels describe add/change/remove outcomes.

### Visual proof required

After 1440x900 and mobile images.

### P-A-01-Q45

### Original question

「リザルト表で、目的の選手は見つけやすかったですか？」

### Owner answer

The Owner visually searched from the top; typing in search felt troublesome.

### Original dissatisfaction

The Results selection surface was not an efficient way to find a rider.

### Requested / implied improvement

Make current-category rider switching searchable and visible without hiding it.

### Current Production

現在も不満が成立するか: `PARTIAL`; the new visible rider-change control opens
the existing category-local search, but the Results table itself is unchanged.

### Why UX3-7 failed to resolve it

UX3-7 counted the selector label change as a discovery fix.

### Concrete redesign required

Expose the rider-change action in the first control deck; a cross-event search
would require a separate data/index decision.

### Acceptance Criteria

- [x] Visible `注目選手` change action opens a searchable current-category list.
- [ ] Cross-category/event rider search is not claimed solved.

### Visual proof required

Control-deck screenshot and rider-change browser flow.

### P-A-01-Q46

### Original question

「リザルトから選手の分析へ進めると理解しましたか？」

### Owner answer

It was unclear and felt unfriendly that a result row had to be selected before
the graph appeared.

### Original dissatisfaction

The product hid its primary value behind a required first click.

### Requested / implied improvement

Show the first analysis by default while preserving result-row selection.

### Current Production

現在も不満が成立するか: `YES` in UX3-7's released hierarchy.

### Why UX3-7 failed to resolve it

Auto-selection existed, but the page still visually made Results/side-rail
navigation look like the primary path.

### Concrete redesign required

Chart-first active state with Results as a visible alternative action.

### Acceptance Criteria

- [x] Explicit rider deep link immediately shows the chart stage.
- [x] Race header offers Results without forcing it before analysis.

### Visual proof required

Before/After 1280x720 and 390x844.

### P-A-01-Q53

### Original question

「どの線がどの選手か分かりましたか？」

### Owner answer

「分からない」。The selected-lap table below the graph was also hard to read
and felt unnecessarily separated.

### Original dissatisfaction

Line identity and detail context were separated from the main graph.

### Requested / implied improvement

Pre-plot line key, clear role labels, and nearby detail interaction.

### Current Production

現在も不満が成立するか: `YES` in the old release.

### Why UX3-7 failed to resolve it

The previous key/marker work was below the graph's first visible region.

### Concrete redesign required

Make the key a first-class part of the chart stage immediately after the plot.

### Acceptance Criteria

- [x] Every visible line has a matching role/name entry.
- [x] Key uses the same marker/dash style as plotted lines.
- [x] Selected-lap detail follows the active chart, not a distant side rail.

### Visual proof required

After chart-stage images and line-key DOM order test.

### P-A-01-Q56

### Original question

「チャート上で分かりにくかった表示はありましたか？」

### Owner answer

Understanding whether an upper time/lap-difference line was good or bad took
time and could be misunderstood.

### Original dissatisfaction

Metric direction and sign were not immediately interpretable.

### Requested / implied improvement

Keep direction/sign guidance next to the active metric.

### Current Production

現在も不満が成立するか: `PARTIAL` in UX3-7; the guide existed but had weak
chart hierarchy.

### Why UX3-7 failed to resolve it

The semantic fix was correct but not visually integrated into a primary stage.

### Concrete redesign required

Keep the guide immediately above the plot; place the post-plot key and hint
before detail; preserve metric
formulas and `-1周` semantics.

### Acceptance Criteria

- [x] Active metric guide is visible before each plot.
- [x] Positive/negative meaning remains relative to the selected rider.
- [x] MR-02/MR-03 tests remain green.

### Visual proof required

After chart images for rank, and automated metric-guide tests.

### P-A-01-Q58

### Original question

「チャートで、逆に不要だと思う情報はありますか？」

### Owner answer

The selected-lap table below the graph felt unnecessary.

### Original dissatisfaction

The supporting detail surface competed with the graph and was disconnected.

### Requested / implied improvement

Use hover/selected-lap detail as support without letting it lead the page.

### Current Production

現在も不満が成立するか: `YES` in the old release.

### Why UX3-7 failed to resolve it

The table remained a large side/below surface and only received explanatory
copy.

### Concrete redesign required

Keep the detail as a closed, compact disclosure after the chart; do not remove
measured information or interaction.

### Acceptance Criteria

- [x] Detail is visually secondary to the chart.
- [x] It is closed by default and keyboard-operable.
- [x] Lap values remain available when explicitly requested.

### Visual proof required

After chart-first screenshots and lap disclosure browser flow.

### P-A-01-Q59

### Original question

「チャートを改善するとしたら、どこを変えてほしいですか？」

### Owner answer

Remove the separated lap table, show values on graph hover, and make the graph
larger vertically.

### Original dissatisfaction

The chart did not occupy enough of the screen and its value lookup was
disconnected.

### Requested / implied improvement

Increase plot prominence and keep line/detail context adjacent.

### Current Production

現在も不満が成立するか: `YES` in the old release.

### Why UX3-7 failed to resolve it

The previous height change did not compensate for the old macro layout.

### Concrete redesign required

Full-width chart stage, post-plot key, compact hint, and secondary detail below.

### Acceptance Criteria

- [x] Plot area is full width and starts earlier than baseline.
- [x] Hover/click behavior remains available.
- [x] Detail no longer occupies the chart's primary position.

### Visual proof required

Measured chart top/width comparison at 1440x900 and 1280x720.

### P-A-01-Q60

### Original question

「比較機能があることに気付きましたか？」

### Owner answer

Yes, but it was not well understood on first use.

### Original dissatisfaction

Comparison was not discoverable as a relationship.

### Requested / implied improvement

Make comparison mode, names, and resulting lines visible as one unit.

### Current Production

現在も不満が成立するか: `YES` in the UX3-7 release.

### Why UX3-7 failed to resolve it

The old labels were spread between context, rail, and lower key.

### Concrete redesign required

Control deck plus chart `注目選手 vs 比較選手` heading and key.

### Acceptance Criteria

- [x] Comparison mode is visible in the deck.
- [x] Comparison names are visible in the chart heading/key.
- [x] The fixed comparison flow is operable.

### Visual proof required

After screenshots and Playwright fixed-comparison flow.

### P-A-01-Q65

### Original question

「比較について、変えてほしいところや追加してほしいことはありますか？」

### Owner answer

The fixed-rider selection UI/operation was dramatically difficult.

### Original dissatisfaction

The high-value comparison customization had a poor action/result relationship.

### Requested / implied improvement

Move fixed comparison into the same clearly labeled deck and name add/remove
outcomes.

### Current Production

現在も不満が成立するか: `YES` in the old release.

### Why UX3-7 failed to resolve it

Renaming `固定` to `固定比較` did not make the control spatially coherent.

### Concrete redesign required

Use a visible `比較する選手` group, explicit fixed picker, and chart identity.

### Acceptance Criteria

- [x] Fixed comparison is a visible mode option.
- [x] Search/add/remove labels predict the result.
- [x] Fixed flow works after metric reload and rider changes.

### Visual proof required

Playwright flow and desktop control-deck screenshot.

### P-A-01-Q68

### Original question

「選手は探しやすかったですか？」

### Owner answer

Without knowing the category, finding a rider was described as effectively
impossible; even with it, search took time.

### Original dissatisfaction

Cross-category/event rider discovery remains a product-level gap.

### Requested / implied improvement

Provide an event/rider discovery path if this becomes a product entry mode.

### Current Production

現在も不満が成立するか: `PARTIAL`; current-category switching is clearer, but
cross-event search is not implemented.

### Why UX3-7 failed to resolve it

The old release treated the category-local selector as sufficient evidence.

### Concrete redesign required

This redo fixes the analysis-page rider switch; a cross-event search requires an
explicit index/data contract and is tracked as a separate product-direction
decision, not as missing External Human evidence.

### Acceptance Criteria

- [x] Current-category rider change is visible and searchable.
- [ ] Cross-event rider search remains a separate bounded product decision.

### Visual proof required

After control-deck screenshots and rider-change flow; separate evidence is
required for any future cross-event search.

### P-A-01-Q69

### Original question

「前の画面へ戻りやすかったですか？」

### Owner answer

Returning to the meet list became difficult when scrolled lower on the page.

### Original dissatisfaction

The page lost a clear return path during exploration.

### Requested / implied improvement

Keep return/navigation context available without covering chart content.

### Current Production

現在も不満が成立するか: `PARTIAL`; the analysis content is materially shorter
before the chart, but the original separate top link is not sticky.

### Why UX3-7 failed to resolve it

The prior implementation deferred sticky navigation for regression risk.

### Concrete redesign required

Retain as a bounded follow-up to the sticky RaceHeader; do not introduce a
second fixed layer in this chart remediation.

### Acceptance Criteria

- [x] The chart flow is reachable with materially less pre-chart scrolling.
- [ ] Full-page return link remains a follow-up acceptance item.

### Visual proof required

Full-page scroll/focus capture before claiming final resolution.

### P-A-01-Q70

### Original question

「今、自分がどこにいるか分かりやすかったですか？」

### Owner answer

Many scrollable areas made location slightly unclear.

### Original dissatisfaction

The page had no strong analysis-stage anchor.

### Requested / implied improvement

Create a clear chart-stage anchor and stable order.

### Current Production

現在も不満が成立するか: `PARTIAL`; the `周回分析` region and chart stage are
now a stronger anchor, but a sticky breadcrumb is not added.

### Why UX3-7 failed to resolve it

The previous grid increased scanning between rail and chart.

### Concrete redesign required

Use a single vertical active-analysis flow and keep disclosure surfaces closed.

### Acceptance Criteria

- [x] `周回分析` contains one coherent vertical sequence.
- [x] Chart, controls, and supporting disclosures have stable order.

### Visual proof required

After full-page desktop/mobile screenshots and region DOM order.

### P-A-01-Q75

### Original question

「スクロール量やスクロールの方向は負担になりましたか？」

### Owner answer

Rider selection required too much scrolling.

### Original dissatisfaction

The selector was a large side surface competing with the chart.

### Requested / implied improvement

Use a compact visible selected rider with a targeted search surface.

### Current Production

現在も不満が成立するか: `PARTIAL`; visible change controls now avoid an always-
open long list, while the picker still scrolls when opened.

### Why UX3-7 failed to resolve it

The previous selector remained in the desktop rail and only changed labels.

### Concrete redesign required

Keep rider list closed after selection and open it through the same-context
`注目選手を変更` button.

### Acceptance Criteria

- [x] Selected rider is visible without scrolling a list.
- [x] Search list is bounded and opens on demand.
- [x] Mobile picker remains a bounded dialog.

### Visual proof required

390x844/320x568 screenshots and rider-switch flow.

### P-A-01-Q77

### Original question

「チャートの大きさや読みやすさはどうでしたか？」

### Owner answer

「もっと縦方向にも大きくしてほしい」

### Original dissatisfaction

The graph did not feel like the primary analytical surface.

### Requested / implied improvement

Increase usable chart prominence, not only CSS height.

### Current Production

現在も不満が成立するか: `YES` in the old release.

### Why UX3-7 failed to resolve it

The height class increased, but the old structure pushed the chart down.

### Concrete redesign required

Full-width chart stage, compact header/deck, post-plot key, and supporting cards
after the plot.

### Acceptance Criteria

- [x] After chart card is the first dominant surface after controls.
- [x] After plot begins earlier than baseline and spans the available width.
- [x] Mobile plot remains practical and non-overflowing.

### Visual proof required

Before/After measurements and all four exact viewport images.

### P-A-01-Q78

### Original question

「情報量や情報の配置は適切でしたか？」

### Owner answer

Information placement and order were still not good enough.

### Original dissatisfaction

The page did not teach the user what to look at first.

### Requested / implied improvement

Race context → rider/control → chart → detail/results.

### Current Production

現在も不満が成立するか: `YES` in the previous release.

### Why UX3-7 failed to resolve it

The layout retained a side rail and repeated context card.

### Concrete redesign required

Single full-width vertical order with no duplicated pre-chart identity block.

### Acceptance Criteria

- [x] DOM order is documented and visible.
- [x] Chart identity is local to the chart.
- [x] Supporting information is lower priority by placement.

### Visual proof required

Four viewport pairs and DOM-order regression test.

### P-A-01-Q79

### Original question

「Desktopで、マウス操作、画面の余白、一覧性についてどう感じましたか？」

### Owner answer

There was wasted whitespace and the layout was not good.

### Original dissatisfaction

The desktop used space without establishing chart dominance.

### Requested / implied improvement

Use the desktop viewport for the chart and make the analysis flow scannable.

### Current Production

現在も不満が成立するか: `YES` in the old release.

### Why UX3-7 failed to resolve it

Small margins changed but the rail/context architecture remained.

### Concrete redesign required

Remove the side rail and duplicate context; give the chart the full content
width.

### Acceptance Criteria

- [x] No persistent desktop rail beside the chart.
- [x] Chart width uses the available content width.
- [x] The screenshot visibly differs at 1440x900 and 1280x720.

### Visual proof required

Before/After desktop pairs in the evidence directory.

## 4. UX3-7 Implementation Audit

The diff from the UX3-6 baseline to UX3-7 was reviewed file by file. “Visible”
means a first-use person could see a meaningful surface change in the same
state; a code-level or micro change is not accepted as resolving a macro Owner
finding.

| Previous UX3-7 change | Classification | UX3-7R finding |
| --- | --- | --- |
| First graphable rider auto-selection | VISIBLE UX CHANGE, but incomplete | It removed the empty state; it did not fix page hierarchy. |
| `AnalysisContextBar` labels/names | CODE-LEVEL / MICRO CHANGE ONLY for the macro complaint | False positive when counted as hierarchy resolution; it duplicated dense context. |
| Comparison label renames (`固定比較`, `比較する選手`) | CODE-LEVEL / MICRO CHANGE ONLY | False positive when counted as comparison-flow resolution. |
| Shared chart key and role names | VISIBLE LOCAL UX CHANGE, insufficient placement | False positive as a complete line-identity fix because the key was below the first plot view. |
| Marker/dash extension | VISIBLE LOCAL UX CHANGE | Correct MR-01 regression work, not proof of Owner discoverability. |
| Chart height classes | CODE-LEVEL / MICRO CHANGE ONLY in experience effect | False positive as chart-dominance resolution; macro offset remained. |
| Interaction hint | CODE-LEVEL / MICRO CHANGE ONLY | False positive when counted as selected-lap resolution without stage placement. |
| Results disclosure/order adjustment | CODE-LEVEL / MICRO CHANGE ONLY in the released screenshot | False positive; the result action was not prominent in the desktop first view. |
| Rider control labels/selected state | VISIBLE LOCAL UX CHANGE, incomplete | Useful but still inside the rail and not enough for Q31/Q75. |

False-positive implementation count for the Owner remediation claim: **7**.
The old code remains valid for its functional contracts; the error was the
effectiveness interpretation, not that every line of code was useless.

## 5. False Positive Fixes

UX3-7R fixes the false-positive pattern by:

1. Removing the active-analysis desktop side rail.
2. Removing the redundant pre-chart context card from the rendered flow.
3. Introducing a compact full-width Analysis Control Deck.
4. Making Results action visible in RaceHeader while keeping the table below
   the chart.
5. Making the plot the first chart-stage surface, then placing the shared line
   key and interaction guidance immediately after it.
6. Compacting the category/race context and chart card spacing, including a
   narrow-viewport rule that keeps the plot visible at 320x568.
7. Requiring exact screenshots and visual inspection before claiming resolution.

## 6. Owner Finding Matrix

`UX3-7R` uses only the required visual-status vocabulary. `Implemented` is not
used as an acceptance result.

| P-A-01 | Original dissatisfaction | UX3-7 | UX3-7R | Visual proof | Final |
| --- | --- | --- | --- | --- | --- |
| Q03/Q46 | Initial graph path unclear | Still present | CLEARLY CHANGED | 1280/390/320 screenshots | PASS |
| Q05/Q13 | Controls and results hard to discover | Still present | CLEARLY CHANGED | control deck + E2E | PASS |
| Q06/Q08/Q11/Q53/Q60 | Comparison/line identity weak | Still present | CLEARLY CHANGED | deck identity + post-plot key + chart title | PASS |
| Q09 | Results hidden low on page | Still present | CLEARLY CHANGED | header action + below-chart disclosure | PASS |
| Q10/Q56 | Chart meaning/direction delayed | Partial | CLEARLY CHANGED | chart title/metric guide | PASS |
| Q12/Q69 | Back/list hidden on long scroll | Still present | PARTIALLY CHANGED | shorter pre-chart path only | FOLLOW-UP |
| Q16/Q29/Q30/Q77/Q78/Q79 | Space, priority, chart size, layout | Still present | CLEARLY CHANGED | four viewport pairs | PASS |
| Q22/Q45/Q68 | Cross-category/race rider discovery | Still present | PARTIALLY CHANGED | current-category switch flow | FOLLOW-UP |
| Q27 | Category list/feedback affordance | Still present | CLEARLY CHANGED for category; PARTIALLY CHANGED for feedback | category screenshot | PASS / FOLLOW-UP |
| Q28/Q35/Q65 | Fixed comparison terminology/operation | Still present | CLEARLY CHANGED | `選手を指定` label + fixed picker flow | PASS |
| Q31/Q75 | Current selection and scroll burden | Still present | CLEARLY CHANGED | compact selected rider + flow | PASS |
| Q32 | Legend too small/overlapping | Still present | CLEARLY CHANGED | post-plot wrapping key | PASS |
| Q34/Q58/Q59 | Lap table separated/graph too small | Still present | CLEARLY CHANGED | taller plot + compact in-stage detail + chart tooltip | PASS |

The two follow-up groups are not External Human deferrals. They are explicitly
bounded product/navigation decisions: cross-event search needs a data/index
contract, and a sticky back path needs a single-layer navigation design. The
main Owner complaints about the analysis screen itself are CLEARLY CHANGED.

## 7. Astra / Sol / Terra Findings

The prior Astra/Sol/Terra material was re-read as corroborating evidence, not
as a substitute for P-A-01. Their common roots were:

| Root cause | Astra | Sol | Terra | UX3-7R decision |
| --- | --- | --- | --- | --- |
| Chart did not dominate | Supported | Supported | Supported | Implement full-width chart stage |
| Current rider/change action unclear | Supported | Supported | Supported | Implement control deck |
| Comparison relationship weak | Supported | Supported | Supported | Implement `主選手 vs 比較選手` + key |
| Line/name mapping weak | Supported | Supported | Supported | Keep deck identity plus post-plot key; retain markers/dashes |
| Metric direction terminology | Supported | Supported | Supported | Preserve MR-02/MR-03 guide |
| Broad navigation/search rewrite | Caution | Caution | Caution | Keep bounded follow-up with concrete reason |

## 8. Root Cause Analysis

The released implementation optimized isolated evidence hooks instead of the
Owner's scan path. The root cause was the composition:

```text
large race/category context
  -> duplicated analysis context
  -> desktop side rail
  -> chart plot/key below or beside supporting content
  -> Results disclosure after exploration
```

UX3-7R changes it to:

```text
compact race context + Results action
  -> Analysis Control Deck (current rider + comparison action)
  -> full-width chart heading/tabs/guide/key/plot
  -> summary + lap detail
  -> Results disclosure/table
```

## 9. Redesign Decisions

- Existing AJOCC data/metric semantics, URL state, and route contracts remain.
- Existing rider/comparison mechanics remain; only their composition changes.
- Results is still the authoritative selection table. Its action is visible in
  the race header; its disclosure/table follows the chart.
- The plot is the first chart-stage surface. The shared line key follows it
  immediately, keeping the chart visually primary while preserving direct
  line-to-name mapping before the detail controls.
- The chart is full width on desktop and remains `min-w-0`/wrapping on mobile.
- Summary and lap detail remain available but are visually secondary.
- No External Human availability condition is used as a blocker.

## 10. Implementation

| Finding → root cause | Change | Files |
| --- | --- | --- |
| Chart late/side-rail priority | Active analysis is full-width vertical; controls move to deck | `components/RaceViewer.tsx`, `components/AnalysisControlDeck.tsx` |
| Duplicated analysis identity | Compact current-rider/comparison identity is carried by deck/chart; old dense bar is no longer rendered in active flow | `components/RaceViewer.tsx`, `components/AnalysisContextBar.tsx` |
| Results hard to find | RaceHeader Results action; disclosure/table after chart | `components/RaceHeader.tsx`, `components/RaceViewer.tsx` |
| Line identity below/away from plot | Chart plot first, then one active-tab role/name key; deck and heading say who vs who | `components/ChartTabs.tsx`, `components/AnalysisControlDeck.tsx`, `tests/chartTabs.test.ts` |
| Fixed comparison outcome unclear | Visible `選手を指定` label and name-based aria description | `components/ComparisonAdjuster.tsx` |
| Results action state unclear | `aria-expanded` plus scroll-to-open disclosure behavior | `components/RaceViewer.tsx` |
| Selected-lap values detached and oversized | Compact in-stage detail strip below chart; existing chart tooltip remains the immediate hover/tap value surface | `components/ChartDetailPanel.tsx`, `components/ChartTabs.tsx` |
| Excessive vertical padding | Compact root/category/chart/card spacing and 320px-specific pre-plot reduction | `components/RaceViewer.tsx`, `components/RaceHeader.tsx`, `components/AnalysisControlDeck.tsx`, `components/ChartTabs.tsx` |
| Regression coverage | Updated chart/context tests plus direct control-deck rendering test | `tests/analysisContextBar.test.ts`, `tests/chartTabs.test.ts`, `tests/analysisControlDeck.test.ts` |

## 11. Before / After Evidence

Evidence directory:
`docs/user-testing/evidence/ux3-7r/`

Before is the released UX3-7 Production alias. After is the same state in the
current local release candidate. Each image was opened and visually inspected,
not accepted by DOM inspection alone. The capture also records exact plot
coordinates and document width for each viewport.

| Viewport | Before | After | Visual result |
| --- | --- | --- | --- |
| 1440×900 | `before-desktop-1440x900.png` | `after-desktop-1440x900.png` | Side rail removed; full-width chart and line key visible; plot begins about 503px vs baseline about 532px. |
| 1280×720 | `before-desktop-1280x720.png` | `after-desktop-1280x720.png` | Chart stage spans width; key and plot enter initial viewport; baseline had rail and later plot. |
| 390×844 | `before-mobile-390x844.png` | `after-mobile-390x844.png` | Selected rider, comparison identity, chart title/tabs, and a large plot are visible; no horizontal overflow. |
| 320×568 | `before-mobile-320x568.png` | `after-mobile-320x568.png` | Compact 320px rules put the chart plot at about y=500px, so the plot is visible in the initial viewport without clipping/overflow. |

## 12. Desktop 1440×900

Visual result: PASS. The baseline showed a persistent left control rail and a
chart plot beginning below the main viewport midpoint. The After has a compact
full-width control deck, chart title/tabs/key, and a wider plot. The chart is
the first dominant analytical surface after controls.

## 13. Desktop 1280×720

Visual result: PASS. The After screenshot shows the chart title, metric tabs,
direction guide, and a full-width plot in the initial viewport; the line key
follows the plot within the same chart stage. The baseline showed the side rail
and a much smaller visible chart area.

## 14. Mobile 390×844

Visual result: PASS with normal vertical continuation. The current rider and
change action are visible together; the deck names the comparison; the chart
heading, tabs, and plot are visible without page overflow.

## 15. Mobile 320×568

Visual result: PASS for responsive safety and first-stage hierarchy. The chart
card and the top of the plot begin within the viewport; its title/tabs wrap
without horizontal clipping. The rest of the plot is accessed by ordinary
vertical scroll, not a hidden or overflowing horizontal surface.

## 16. P-A-01 Acceptance Matrix

The question-level records above are the detailed source. The summarized
acceptance result is:

| Status | Count | Interpretation |
| --- | ---: | --- |
| CLEARLY CHANGED | 30 | Major analysis-screen complaints have a visible structural change and no longer materially apply in the fixed-state After images. |
| PARTIALLY CHANGED | 8 | Bounded navigation/cross-event discovery follow-ups; not blocked by External Human availability. |
| NO MATERIAL CHANGE | 0 | No major Owner analysis-screen complaint is unchanged. |

## 17. Fresh Synthetic Review

Fresh Astra, Sol, and Terra reviews were run against the first UX3-7R
implementation batch, without being told the previous PASS. All three returned
`NEEDS_REVISION`. Their findings drove the second bounded revision batch recorded
in this report: comparison identity was moved into the deck, the fixed mode was
renamed to `選手を指定`, Results received `aria-expanded` and reveal scrolling,
the plot/key order was corrected, the 320px stack was reduced, and selected-lap
detail was changed to a closed compact details surface. A second fresh review
could not be started after those fixes because the Autobuild hook had already
entered `NEEDS_HUMAN` at the maximum revision count.

| Reviewer | Result | Required ten-question summary |
| --- | --- | --- |
| Astra | NEEDS_REVISION (first batch) | Found missing deck comparison names, detached selected-lap panel, 320px plot below the fold, and lint failure. |
| Sol | NEEDS_REVISION (first batch) | Found lint failure, opaque fixed-comparison label, missing Results state semantics, and insufficient direct deck coverage. |
| Terra | NEEDS_REVISION (first batch) | Found the pre-plot key/order conflict, mobile chart prominence risk, missing deck identity, and Results reveal feedback gap. |

Final-state reviewer gate: **NOT COMPLETED**. The hook-owned state is
`phase: NEEDS_HUMAN`, `last_blocker: Maximum revision cycles reached.` It is
not legitimate to claim fresh final-state synthetic PASS or to proceed to
Production on the basis of the first-batch reviews.

## 18. MR-01〜03 Regression

- MR-01: PASS. The post-plot series key and all chart series retain shared
  role/name marker/dash identity, including crowded views.
- MR-02: PASS. `周回差` remains single-lap time difference and remains distinct
  from result-table `-1周`; formulas and sparse measured semantics are unchanged.
- MR-03: PASS. Rank, cumulative gap, single-lap difference, and lap-time
  direction/sign explanations remain visible at the active chart.

## 19. POS-01〜05 Regression

- POS-01 results clarity: PASS. Results action is more discoverable and the
  existing table remains authoritative.
- POS-02 chart value: PASS. Chart is full width, earlier, and visually primary.
- POS-03 navigation path: PASS for route/category/rider contracts; sticky
  return-path follow-up remains documented.
- POS-04 metric switching: PASS. All four tabs remain operable and URL state is
  preserved.
- POS-05 comparison value: PASS. Current mode, names, key, add/remove, and
  comparison chart remain available.

## 20. Automated Validation

- `npm test`: PASS — 129 tests, 129 passed, 0 failed.
- `npx tsc --noEmit`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS — Next.js 16.3.3 production build.
- `git diff --check`: PASS.
- Temporary Playwright exact viewport screenshots: PASS at 1440×900,
  1280×720, 390×844, and 320×568.
- Temporary Playwright functional flow: PASS — Results open, rider selection,
  browser back/forward, metric switch, reload, fixed-comparison picker/add,
  and lap-detail disclosure.

## 21. Functional Regression

Verified through existing tests, browser accessibility snapshot, and the
temporary Playwright flow:

1. fresh entry / race context / category
2. Results discovery and disclosure
3. rider selection and rider switching
4. comparison mode and fixed comparison add/remove surface
5. all four metrics and URL state
6. lap interaction and lap detail disclosure
7. reload, deep link, browser back, and browser forward

## 22. Remaining Issues

- P-A-01 Q12/Q69: a sticky, single-layer back/list path is still not added.
- P-A-01 Q22/Q45/Q68: cross-event/cross-category rider discovery needs an
  explicit index/data-contract decision; current-category search and switching
  are available.
- P-A-01 Q27 feedback affordance: feedback entry is available, but its
  placement was not restructured in this pass.
- P-A-01 Q03: the rank chart remains a semantically correct `stepAfter` series;
  the redesign clarifies its direction but does not replace measured rank
  semantics with an inferred straight line.

Severity recheck: **S0 0 / S1 0 / S2 3 / S3 1 / S4 0**. These are known
non-destructive issues, but the Owner acceptance matrix is not all
`CLEARLY CHANGED`, and the final reviewer gate is incomplete; therefore this
redo must not be released.
- External Human pre-release validation was not executed because participants
  were unavailable. This is not a release blocker and is not claimed complete.

## 23. Production Verification

Production verification was **NOT EXECUTED**. The final reviewer gate did not
pass, so no commit or push was performed and the Production alias was not
changed. Local visual evidence does not substitute for that final Production
check.

## 24. Final Verdict

The local remediation batch and automated checks are complete, but the required
final-state independent reviewer and Production verification are unavailable
because the Autobuild hook has reached its bounded revision limit. The correct
verdict for this run is:

```text
UX3-7R:
NEEDS_REVISION — OWNER-REPORTED UX ISSUES STILL VISIBLE
```

External Human status remains:

```text
External Human pre-release:
NOT EXECUTED

Release blocker:
NO

Post-release human validation:
CONTINUES
```
