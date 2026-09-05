# AJOCC Lap Time Viewer — Task-based UX Audit v2

## Test methodology

- 実施日: 2026-09-05 JST
- 対象: <https://ajocc-laptime-viewer.vercel.app/>
- 方式: 既存docs・ソースを見ない blind first-use を先に実施し、その後に
  実装を照合した task-based heuristic test
- 実施者: 1セッションの初見相当テスト（統計的なユーザビリティ検証ではない）
- ビューポート: Desktop 1440×900 / 1280×720、Mobile 390×844 / 320×568
- 主なテストデータ: 最上段の大会「2025-26もみじシクロクロス第5戦」、
  初期カテゴリー `ME1`、比較対象の変更では `±2` から `±5`、指標変更では
  `順位` から `タイム差`
- 計測方法: ブラウザ上の `scrollY`、document height、要素の
  `getBoundingClientRect()`、クリック後のURL・focus・画面状態を記録した。
  CSS pxを基準にし、スクロール1回はブラウザの約1 viewport分として数えた。

### Evidence caveat

以下は1回の操作セッションから得た観測であり、ユーザー全体の事実ではない。
特に「使いづらい」という評価は、再現した操作摩擦から立てた仮説である。
実装前後に複数人のユーザーテストで検証する必要がある。座標は現状の
baselineであり、将来のpixel要件ではない。

## Tasks and observations

### Task 1 — ある大会のカテゴリー結果を確認する

#### Desktop

1. `/` の最初の表示で「大会を選ぶ」は明確で、最上段の大会は1クリックで開けた。
2. 1440×900ではシーズン・シリーズのコントロールが `y=147..179`、最初の
   大会行が `y=305..350`。結果一覧を探すこと自体は迷いにくい。
3. 大会ページではカテゴリー `ME1` が初期選択され、結果表の上端は
   `y=366`、分析領域の開始は `y=791`。初期カテゴリーの結果確認は大会リンク
   1クリックで可能だった。
4. 別カテゴリーを選ぶ場合は、カテゴリーを開く→項目を選ぶの2操作。選択後は
   URLに `category` が追加され、選手・比較・指標はリセットされる。
5. 1280×720では結果表の上部は見えるが、一覧の表示可能行数が減るため、
   大会名が長い場合は1画面で比較しづらい。

#### Mobile

- 390×844ではシーズンとシリーズが縦積みになり、最初の大会行は
  `y=433..503`。大会選択自体は1クリックで可能だが、画面の約半分が
  大会以外の導入・フィルターで占有される。
- 320×568ではフィルター領域が `y=163..328`、大会カード開始が約`y=387`、
  最初の大会行は `y=474..544`。結果表の見出しと最初の行を同じ画面で読むには
  追加スクロールが必要になる。
- 大会ページの320pxではカテゴリーは `y=99..143`、結果表は
  `y=520..924`、分析領域は `y=957`から始まる。結果確認の導線はあるが、
  「結果を見る」体験の中心が下端に寄る。

### Task 2 — 特定選手のラップ推移を見る

#### Observations

- 結果表の選手名ボタンから1クリックで選手を選べる。選択状態は行の背景、
  チェック表示、「分析中」テキストで示されるため、選択のfeedback自体はある。
- ただし結果表から選ぶと、分析側の `RiderSelector` はリスト表示のまま残る。
  選択後の `RiderSelector` は、検索欄と最大8名の選手リストを含む大きな領域を
  占有する。
- 1440×900で選手を選んだ直後は、分析開始が`y=791`、比較設定の一部が
  `y=1492`、グラフ枠の上端が`y=1289`。ページ先頭からグラフ枠まで
  約1.43 viewport分あり、最初の画面にはグラフが現れない。
- 390×844では選手選択後のグラフ上端が`y=2741`、320pxでは約`y=2599`。
  ページ先頭から約3.25〜4.6 viewport分下であり、初見ユーザーが
  「選手を選べたので分析できた」と感じるまでに大きな空白がある。
- 320pxで先に「結果表を飛ばして分析操作へ」を使うと、アンカー移動後の
  `scrollY=917`で分析領域に着地する。しかし、その位置で選手を選ぶと
  `scrollY=0`へ戻り、選択後のグラフは再びページ下部になる。

#### Hypothesis

選手選択そのものは理解できるが、選択後に「分析結果が見える」という因果が
  弱い。選択UIと結果UIが同じ強さで残り、グラフが分析の主役に昇格しない。

### Task 3 — 特定選手と周囲の選手を比較する

- 1440pxでグラフまでスクロールした状態（`scrollY=900`）では、比較範囲の
  `±5`ボタンは画面左側の`y=592`にあり、グラフと同時に操作できる。
- `±5`をクリックすると、URLは `compare=5` になったが、`scrollY=900→0`。
  グラフの絶対位置は約`y=1289`のままなので、ユーザーは同じ分析画面を
  再確認するためにもう一度下へ移動する必要がある。
- 390pxで`scrollY=1688`まで移動し比較ボタンを画面上端へ出した場合も、
  クリック後に`scrollY=0`へ戻り、グラフは`y=2741`へ戻った。
- したがって、典型的な
  「設定 → グラフ → 設定 → グラフ」の往復は、機能が連続するほど増幅する。
  各操作単体のクリックは成功しても、連続分析の摩擦が大きい。

### Task 4 — 順位・ギャップ・ペース・ラップを切り替える

- 1440pxでグラフを表示した状態では、指標タブは`y=309`付近で、グラフの
  上部と同じviewport内にある。タブの選択状態は下線と太字で判別できる。
- `順位→タイム差`でクリックするとURLに `tab=gap` が追加されたが、
  `scrollY=900→0`。表示内容は変わるものの、視線は結果表・大会情報まで戻る。
- 390pxでも指標タブが画面内にある`scrollY=2532`で変更したところ、
  `scrollY=0`へ戻った。タブ切り替えを連続比較するほど、グラフ確認のたびに
  長距離スクロールが必要になる。
- 変更後のfocusはクリックした指標ボタンに残る一方、ページ内の視覚位置は
  focus対象と分析結果が分離する。

### Task 5 — 初見ユーザーが3分以内に意味のある分析を1つ行う

#### Time to Value

「大会の結果表を1つ読む」を価値と定義すると、Desktopは大会リンク1クリック、
Mobileは大会リンク1クリック＋320pxでは約1スクロールで到達できる。結果確認だけ
なら短い。ただし、シーズン・シリーズを使って目的の大会を探す場合、66大会の
一覧に大会名検索がないため、目的の大会を目視で探す負荷が残る。

#### Time to Insight

「選手のラップ推移または比較グラフから1つの傾向を読む」を価値と定義する。

- Desktop: 大会1クリック＋選手1クリック＋約1 viewportスクロールでグラフに
  到達できるが、スクロール後に比較範囲を変更すると先頭へ戻る。
- Mobile 390: 大会1クリック＋選手1クリックの後、グラフ上端まで約2741px。
- Mobile 320: 分析アンカーを使っても選手選択後に先頭へ戻り、グラフ上端まで
  約2599px。初見で意味のあるグラフを読むまでに、操作より移動が主役になる。

#### 心理的負荷の推定

- 最初の30秒: 「大会を選ぶ」は明快。ただしシリーズ名・大会名の情報量が多く、
  何を基準に選ぶかはユーザー任せ。
- 最初の1分: 結果表は読みやすいが、カテゴリー略号、分析導線、選手選択の
  関係を理解する必要がある。
- 分析画面到達時: 選手を選んだ結果として表示されるのが選手選択・ラップ詳細で、
  最重要のグラフではない。設定画面に入った印象が先に立つ。
- 条件変更時: ボタンの状態変化は確認できるが、視点がページ上部へ戻り、
  変更と結果の因果を短期記憶で保持しなければならない。
- グラフ読解時: グラフ自体は表示後に読み取れるが、比較・指標変更のたびに
  同じ移動を繰り返すため、分析の集中が切れる。

## Interaction friction audit

| Friction | Evidence | Severity | Hypothesis / impact |
| --- | --- | --- | --- |
| 同一分析内のscroll-to-top | `compare` と `tab` 変更で `scrollY=900→0` | High | 連続比較を中断し、設定とグラフの往復を強制する |
| 選手選択後のグラフ遅延 | 1440pxで`y=1289`、390pxで`y=2741`、320pxで約`y=2599` | High | Time to Insightを押し上げ、選択成功のfeedbackが結果につながらない |
| 選手リストの重複表示 | 結果表で選んでも分析側リストが開いたまま | High | 低頻度の再選択UIが分析画面の大部分を占有する |
| 結果表と分析の主役逆転 | 結果表・設定・ラップ詳細が先、ChartTabsが最後 | High | 「設定する画面」と認識され、分析画面の目的が遅れて伝わる |
| Mobileの縦積み増幅 | 390/320pxでコントロール、詳細表、チャートが全て縦積み | High | 画面幅が狭いほど、主要操作に戻る距離が長くなる |
| 大会探索の目視依存 | 初期一覧66大会、検索なし | Medium | 初見ユーザーの最初の30秒を大会識別に消費する |

## Scroll / focus stability audit

### Observed behavior classification

| Action | Observed movement | Classification |
| --- | --- | --- |
| 大会リンクを開く | 新しいrouteの先頭 | 正当なnavigation |
| `#race-analysis`リンク | `scrollY=917`付近へアンカー移動 | 新しいcontentを見せるための正当なscroll |
| 結果表から選手を選ぶ | topでの選択はその場に留まるが、アンカー後は`917→0` | route/state変更によるscroll resetの疑い |
| 比較範囲変更 | `900→0` | accidental scroll resetの疑い |
| 指標変更 | `900→0` | accidental scroll resetの疑い |
| 選手リストを開く | selected rowを`scrollIntoView({block:"center"})` | 内部リストに対する意図的なscroll |
| キーボードで結果表選択 | `requestAnimationFrame`後に分析regionへfocus | keyboard向けの正当なfocus移動。ただし視覚的到達先の再定義が必要 |

### Technical cause candidates after source inspection

1. `components/RaceViewer.tsx:200-210` の `pushRaceUrl()` は rider、comparison、
   tab、lapのdurable stateを毎回 `router.push()`する。Next.js App Routerの
   query navigationがデフォルトのscroll-to-topを行うため、同一race内の設定変更
   でもページ先頭へ戻る可能性が高い。実測はこの仮説と一致する。
2. `components/RaceViewer.tsx:172-186` にはcategory/stateのcanonicalization用
   `router.replace()`もあり、loading完了時やURL正規化時の不要な移動を追加検証する
   必要がある。
3. `components/RaceViewer.tsx:368` の分析領域はDesktopだけ
   `320px + 残り` のgrid、Mobileでは全て縦積みである。`RaceViewer.tsx:414-426`
   のDOM順は `LapDetailTable → ChartTabs` で、ラップ詳細がチャートより前に置かれる。
4. `components/RiderSelector.tsx:26` の `isOpen` は
   `useState(selectedRiderId === null)`という初期値だけで、結果表から親の
   `selectedRiderId`が更新されたとき自動的に閉じない。内部リストから選んだ場合
   だけ`handleSelect()`が`setIsOpen(false)`するため、選択経路により画面密度が変わる。
5. `components/RiderSelector.tsx:58` の`scrollIntoView`、`RiderSelector.tsx:134`
   の`autoFocus`、`RaceResultsTable.tsx:153`の分析region focusは意図的なfocus/inner
   scrollであり、page-level scroll resetの第一原因ではないが、再設計時に衝突しうる。
6. `components/RaceHeader.tsx:16` は`sticky top-0`で、現在のrace contextは
   scroll中も上部に残る。一方、同じ位置に新しいsticky toolbarを追加する場合は
   header高さとの重なりを仕様で固定する必要がある。

## Viewport usage

### Desktop baseline

1440×900のrace pageで選手を選択した場合の概算順序は次の通り。

```text
0 ───────── race link / category / race header
~270 ────── result card and table (to ~758)
~791 ────── analysis region
~791..1552  rider selector, summary, lap summary, comparison settings
~1209 ───── metric tabs
~1289 ───── chart
~1705 ───── selected-lap detail
```

Desktopは横幅を活かしているが、analysis region内の設定railが高く、chartの
上端が最初のviewport外にある。結果表は重要なContext/Primary informationだが、
分析開始後もBrowse時と同じ密度で残る。

### Mobile baseline

390×844で選手選択後は、analysis regionが約`y=913`から始まり、選手リストが
`y=513..880`相当、比較設定が`y=1702..1794`、指標タブが`y=2635..2679`、
chartが`y=2741`。320pxでは選手選択後のchartが約`y=2599`。

```text
Primary/context: race header + result table
Configuration: rider list + search + summary + compare controls
Supporting: lap detail table
Primary analysis: chart (最後)
```

狭い画面ではConfigurationとSupportingがviewportの複数倍を占有し、Primary
analysisの面積比率と順序が逆転している。

### Importance vs area classification

| UI | Importance | Current role | Current area balance |
| --- | --- | --- | --- |
| 大会・カテゴリーの識別 | Context / Primary | race header + category select | 初期表示では妥当、分析中は大きすぎる |
| 結果表 | Primary for browse / Secondary for analysis | full card + scroll list | 分析中もBrowse密度のまま |
| 注目選手 | Primary | result button + rider picker | 2箇所に重複し、選択後もlistが残る |
| 比較条件 | Configuration | `±0..±5`/固定/全員 | 分析中に常時大きく表示される |
| 指標切替 | Primary analysis control | ChartTabs | 操作は重要だがchartと共に下部 |
| Chart | Primary analysis | ChartTabs | 最下部で面積・視認性ともに不利 |
| ラップ詳細・サマリー | Supporting | cards/table | chartより前にあり主役を奪う |
| GitHub/更新時刻/注記 | Context | sticky race header | 情報として必要だが分析中は圧縮可能 |

## Desktop findings

- 1440pxでは横幅に余裕があるのに、結果表と設定railの高さが支配的で、chartは
  画面下に追いやられる。
- 1280pxでは一覧・結果表の一行情報量は保てるが、720px高ではanalysisの
  primary contentが初期viewportに現れにくい。
- 現在の`RaceHeader`のstickyはcontext保持に有効。これを活かし、race/category/
  rider/compareのcompact contextを追加する方向が自然。
- Desktopでは左railをConfiguration、右側をPrimary analysisに固定するsplit view
  が横幅の使い方として合理的である。ただしleft rail全体をstickyにするのではなく、
  ページを唯一のscroll containerとして維持する必要がある。

## Mobile findings

- 390pxでは導入・category・結果・分析設定を読めるが、chartへ到達するまでに
  3 viewport以上を横断する。
- 320pxでは大会タイトルと説明のwrapが増え、結果表上端だけでviewportが埋まる。
  analysisへのanchorはあるが、そこでの選手選択がtop resetを再発させる。
- MobileはDesktopを縮小しただけではなく、`結果表`をcompact summaryに畳み、
  選手・比較選択をbottom sheet/disclosureに分離し、metricと現在contextを
  sticky toolbarに残す構造が必要。
- 内部スクロールは既存の結果表・選手リスト・chart detailのように、ラベルと
  accessible nameを持つ限定領域に限る。ページ全体を二重scrollにしない。

## Recommended hypothesis to validate next

「大会を選んだ後、選手・比較条件・指標をcompact context/toolbarにまとめ、
Chartをlap detailより前に配置し、同一analysis contextのstate changeでscrollを
保持すると、Time to Insightと連続比較の完了率が改善する。」

この仮説は、次の3条件で再テストする。

1. 同じ大会・選手で`±2→±5→±1`を3回変更する。
2. `順位→タイム差→ペース→ラップ`を連続で切り替える。
3. 320pxで結果表から選手を選び、グラフ上の1つの傾向を口頭で説明する。
