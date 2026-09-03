# Phase 1 実装後 UX / Regression Review

- 対象: https://ajocc-laptime-viewer.vercel.app/
- 実施日: 2026-09-03
- 公開版確認: desktop、390×844、320×568
- 確認順序: 公開サイトの初見操作 → `docs/` の計画・レビュー照合 → ソースレビュー
- ローカルコードの変更: なし

## 1. Verdict

**NEEDS REVISION**

最大の理由は、対象URLにPhase 1の実装が反映されていないことです。ローカル作業ツリーにはPhase 1相当の変更がありますが、公開版ではリザルト表、修正されたDNF表示、エラー復旧、初見向けラベル、モバイル文字切れ修正、step/linearチャートを確認できませんでした。そのため、ブラウザで確認可能なAcceptance Criteriaの多くはFAILです。

## 2. Executive Summary

- 公開版だけでも大会選択から選手のラップ比較までは到達でき、基本的な分析フローは成立しています。
- 一方、サイトの目的、カテゴリー略称、比較範囲、`あなた` の意味は初見では推測が必要です。
- 公開版はカテゴリー選択直後に通常のリザルト表を表示せず、結果確認のためにも選手選択とチャート読解を要求します。
- DNF選手が通常の最下位のように `15/15` と表示され、結果の意味を誤認させます。
- mobileではページ全体の不要な横スクロールは抑えられていますが、大会名・見出しの文字切れと44px未満の操作領域が残っています。
- 98人の実レースで「全員」を選ぶとチャートが判読不能になり、tooltipが画面外へ伸びて下部項目を操作・確認できません。
- ローカルPhase 1はデータ契約、リザルト表、検索正規化、再試行、線形状などを概ね妥当に実装し、test・lint・buildも通過しています。
- ただし、公開版との不一致に加え、タブのARIA関連付け、巨大なTab移動列、カテゴリー切替時の一時的な旧データ表示リスクが残ります。
- 現状はPhase 2へ進む前に、Phase 1を公開可能な単位へ確定し、対象URL上で再受け入れ確認する必要があります。

## 3. What Improved

対象URL上で、Phase 1による改善として実際に確認できた項目はありません。ブラウザ表示はローカルPhase 1実装前の挙動でした。

未公開のローカル作業ツリーでは、次の改善を確認しました。

- 周回データを配列位置ではなく `lapNumber` で照合し、欠損、重複、DNF、周回遅れを分ける結果モデルが追加されています。
- カテゴリー選択直後に4列の意味的なリザルト表を表示し、行から既存分析へ進める構成になっています。
- `あなた` を `注目選手` へ置き換え、検索範囲、比較範囲、表示人数を説明しています。
- 検索をNFKC正規化、空白除去、大小文字無視へ改善しています。
- 存在しない大会、通信失敗、不正データを分け、実fetchを行う再試行と一覧復帰を追加しています。
- 順位をstep線、gap・pace・lapをlinear線にし、欠損を接続しない設定へ変更しています。
- mobile向けの折返し、44px操作領域、focus ring、配色コントラストの改善があります。
- ローカル検証は `npm test` 13/13、lint、production build、`git diff --check` がすべて成功しました。

これらは方向として有効ですが、公開版で確認できるまではUX上の改善完了とは判定しません。

## 4. Blocking Issues

### B1. 対象URLにPhase 1が反映されていない

- **Problem:** ローカルPhase 1変更が未コミット状態で、対象URLは旧UIのままです。公開版にリザルト表、DNF結果モデル、初見向け文言、専用not-found、再試行、step/linear線がありません。
- **Reproduction:** 対象URLで任意の大会とカテゴリーを開く。カテゴリー直後は選手selectorだけが表示されます。存在しない `/race/not-a-real-meet` では汎用エラーだけが表示されます。順位チャートは曲線です。
- **User impact:** Phase 1の目的だった結果確認、誤読防止、mobile改善、障害復旧を利用できません。今回の「Phase 1実装後」受け入れ評価も成立しません。
- **Suggested direction:** Phase 1変更をレビュー可能なコミットへまとめ、対象URLまたは明示したpreview URLへデプロイし、同じ実データとviewportでAcceptance Criteriaを再実行してください。デプロイ識別用のcommit SHAも記録すると再発を防げます。
- **Severity:** Critical
- **Relevant files/components:** Phase 1変更一式、Vercel deployment設定、`components/RaceResultsTable.tsx`、`components/RaceViewer.tsx`、`app/race/[meetId]/not-found.tsx`、`app/race/[meetId]/error.tsx`

### B2. 大人数の「全員」比較が実データで破綻する

- **Problem:** 98人・11周の実レースで98系列を同時描画します。線は判別不能で、tooltipは約2,786px高になり、390×844のviewport外にある選手を読めません。15人でもtooltip下部がviewport外へ出ました。
- **Reproduction:** `CYCLOCROSS TOKYO 2026 Day2` → `ME1` → 任意選手 → 比較を `全員` → chart内をtap/hover。98人の線と全員分のtooltipが表示されます。
- **User impact:** 比較機能が「誰が速いか」「差がどこで生まれたか」を答えるどころか、情報を取得できない状態になります。mobileではtooltip下部へスクロールする手段もありません。
- **Suggested direction:** Phase 3相当の全面再設計を先取りする必要はありません。ただし、Phase 1完了条件として、少なくとも大人数時の「全員」を制限・確認付きにする、tooltipをviewport内でスクロール可能にする、または表示対象を安全な上限へ絞るガードが必要です。
- **Severity:** High
- **Relevant files/components:** `hooks/useComparisonRiders.ts`、`components/ComparisonAdjuster.tsx`、`components/RankBumpChart.tsx`、`components/GapChart.tsx`、`components/PaceChart.tsx`、`components/LapTimeChart.tsx`、`lib/chartColors.ts`

### B3. タブの意味的な関連付けが壊れている

- **Problem:** `ChartTabs` がtab listとtab panelを別々の`Tabs` rootへ分割しています。公開DOMでtabの `aria-controls` とtabpanelの `aria-labelledby` が付かず、操作と表示内容の関係を支援技術へ伝えられません。
- **Reproduction:** chart tabを開きDOMのtab/tabpanelを確認する。tabは選択状態を持ちますが対応panel IDを参照しません。
- **User impact:** screen reader利用者が、選択したタブと表示されたチャートの関係を理解しづらくなります。Phase 1のkeyboard/accessibility完了条件を満たしません。
- **Suggested direction:** `Tabs` rootを1つにし、その配下へ`TabsList`、説明、`TabsContent`を配置してください。修正後は実ブラウザのAccessibility Treeで関連付けを再確認してください。
- **Severity:** High
- **Relevant files/components:** `components/ChartTabs.tsx:63`、`components/ChartTabs.tsx:80`、`components/ui/tabs.tsx`

### B4. Phase 1の結果表が大人数時のkeyboard経路をさらに長くする

- **Problem:** ローカルPhase 1では、98行すべての選手名をbuttonにした結果表の後に、同じ98人分のselector buttonが続きます。最大196個近い選手buttonを通常のTab順へ置く構造です。
- **Reproduction:** ローカル実装の`RaceResultsTable`と`RiderSelector`を、98人のME1でDOM順に確認する。
- **User impact:** keyboard利用者が検索、比較、chart tabへ到達するまで大量のTab操作を要求されます。結果表追加によるaccessibility regressionになる可能性が高いです。
- **Suggested direction:** 結果表から分析UIへのskip link、検索・現在選択へのショートカット、または表行とselectorの役割重複を減らす構成を検討してください。意味的な表と行選択自体は維持すべきです。
- **Severity:** High
- **Relevant files/components:** `components/RaceResultsTable.tsx:82`、`components/RaceResultsTable.tsx:126`、`components/RiderSelector.tsx:139`、`components/RaceViewer.tsx:137`

## 5. Minor Issues

- レース一覧に検索がなく、66件から大会名で探す場合はseries filterと目視に依存します。開催日降順であることも画面上では明示されません。
- `ME1`、`WJ`などカテゴリー略称の説明がなく、AJOCCに不慣れな利用者には意味が分かりません。元データに正式名称がない場合は推測表示を避ける方針は妥当です。
- 320pxでは比較toggleが内部横スクロールになり、右端の`全員`が初期状態で見切れます。ページ全体の横スクロールではありませんが、機能の発見性は下がります。
- 公開版では戻るリンクが320pxで2行に折れ、ヘッダーの視線移動が不自然です。
- `RaceResultsTable`は選択のたびに全選手をsortし、各行で`getRiderResult`を再計算します。98人規模では結果モデルを`useMemo`で一度作る方が堅牢です。
- error/retryのUI構造がhome、route error、race data errorで重複し、文言・disabled・live regionの差が生まれやすい構造です。
- `useRaceData`は`dataUrl`変更直後のrenderで旧`race`を保持します。effectがloadingを立てるまで、新カテゴリー名と旧カテゴリーの結果表が一時的に組み合わさる余地があります。

## 6. Regression Findings

公開版にPhase 1自体が反映されていないため、Phase 1による**公開環境上の確定regressionは確認できません**。

ソースレビューでは、反映前に解消すべきregressionリスクを2件確認しました。

- 新しい結果表が全行をtabbableにするため、大人数カテゴリーでは既存selectorと合わせてkeyboard操作量がほぼ倍増します。
- 各chartのwrapperに追加した `role="img"` は、内部のRecharts tooltip/applicationを単一画像として平坦化する可能性があります。実ブラウザとscreen readerで確認し、必要なら`figure`/`group`と説明の関連付けへ変更すべきです。

desktopの3列大会一覧や既存の選手分析フローをソース上で意図的に壊す変更は見つかりませんでした。

## 7. Mobile Findings

### 確認結果

| 項目 | 結果 | 所見 |
|---|---|---|
| レース選択 | PARTIAL | 390px/320pxとも選択可能でページ横overflowなし。ただし大会名が切れて識別しづらい |
| カテゴリー選択 | PASS | selectは操作可能。略称の説明は不足 |
| 選手選択 | PASS | 検索、一覧、前後移動が動作。長い氏名も選択済み表示では折返し可能 |
| 比較 | PARTIAL | `±0`〜`全員`は動作。320pxでtoggleの内部横スクロールが必要 |
| chart | PARTIAL | 幅内に収まるが11px前後の文字は小さく、多系列では読めない |
| table | FAIL | 公開版にPhase 1のリザルト表が存在しないため確認不能 |
| tooltip | PARTIAL | tapで表示・外側tapで解除できる。15人/98人ではviewport外へ伸びて読めない |
| scrolling | PARTIAL | ページ全体の不要な横scrollはなし。大会名の切り捨てと比較toggleの内部scrollあり |

### 詳細

- 390pxで測定した公開版の主な高さは、前後移動buttonが32px、比較toggleが28px、chart tabが25pxでした。44×44px基準を満たしません。
- 320pxでは`← 大会一覧`が2行になり、比較toggle右端の`全員`が横scrollするまで見えません。
- mobileの大会一覧は画面外横scrollを発生させない代わりに大会名を切り捨てており、誤選択につながります。
- `ウィリアムス 飛`のような長めの氏名は、選手一覧と選択後表示で崩れませんでした。
- 8人程度のchartは選択線の太さとlegendで追えます。15人以上ではlegendが消え、色と線の対応をtooltipに依存します。
- 98人の全員比較はdesktop/mobileとも情報過多です。特にmobile tooltipは下部へ到達できません。

## 8. Chart Findings

| Chart | 判定 | ユーザーが理解できること | 課題 |
|---|---|---|---|
| 順位 | **IMPROVE** | 周回ごとの順位変動、抜いた/抜かれた時点、レース展開 | 公開版の曲線は計測間の連続変化を示唆する。ローカルのstep線が妥当。多人数では追跡不能 |
| ギャップ | **KEEP** | 注目選手に対して、どの周回で累積差が広がった/縮まったか | `±0`と符号の理解に説明が必要。大人数tooltipは破綻 |
| ペース | **RECONSIDER** | その周だけで注目選手と相手のどちらが差を作ったか | ラベルから想像する「本人のペース/安定性」ではなく相対lap差。意味は有用だが名称と符号の認知負荷が高い |
| ラップ | **IMPROVE** | 各周の絶対タイム、後半の失速、ばらつき、概算の最速周 | 正確な最速や改善対象はtooltipを逐次読む必要がある。多系列では線とlegendが過密 |

### 質問への答えやすさ

| 質問 | 評価 | 主な手段 |
|---|---|---|
| 誰が速い？ | PARTIAL | 最終順位は選手一覧から分かるが、最速lapは即答しづらい |
| どの周回が速い？ | PASS | ラップchartとtooltip。ただし目視比較が必要 |
| 誰が安定している？ | PARTIAL | ラップchartの線のばらつきから推測できるが指標はない |
| 誰が後半失速した？ | PASS | ラップchartと順位chartを併用できる |
| どこで選手間の差が生まれた？ | PASS | ギャップとペースが直接答える |
| レース展開はどう変化した？ | PASS | 順位とギャップの組合せが有効 |
| 自分が改善すべき周回はどこ？ | PARTIAL | ペースとラップから推測可能だが、`自分`は任意に選んだ注目選手である説明が必要 |

このサービスの主要価値は周回比較と差の発生箇所の理解です。新しい指標を増やすより、Phase 1では線形状、ラベル、欠損、DNF、大人数時の安全性を正すことを優先すべきです。

## 9. Accessibility Findings

- season、series、categoryは可視テキストが近くにありますが、公開DOMでは常時labelとcomboboxの明確な関連付けを確認できませんでした。検索はplaceholder依存です。
- 検索欄のfocus ringは明瞭でした。一方、browser automationではTab移動を安定して再現できなかったため、全フローのkeyboard完遂は未検証です。
- button、link、combobox、tab自体は意味的controlです。ただしchart tabとtabpanelのARIA関連付けは壊れています。
- 公開版の選択選手は太線、outline、`あなた`の文字を併用し、完全な色依存ではありません。競合選手同士の識別は色依存が強く、6色を超えると色が再利用されます。
- オレンジの通常サイズlink色は紙色背景に対して約3.31:1、白背景に約3.61:1で、通常文字の4.5:1を満たしませんでした。
- chartの文字はmobileで小さく、全員比較ではlegend非表示と色再利用により識別手段が不足します。
- 主要操作領域は公開版で44px未満です。ローカル変更では改善されていますが、対象URLでは未確認です。
- 390px/320pxへのresize自体でページ全体は横overflowしません。ただし文字を隠して成立させている箇所があります。
- 公開版のエラーalertは文字で伝わりますが、再試行buttonや一覧復帰linkがなくkeyboard利用者にも行き止まりです。

## 10. Acceptance Criteria Results

判定は対象URLのブラウザ挙動を優先しました。ブラウザから直接見えないデータ契約・build条件だけ、ローカルのテストとソースを根拠にしています。

### Step 1 — データ契約と純粋関数

| Acceptance Criteria | 判定 | 根拠 |
|---|---|---|
| 同一`lapNumber`だけでgap/paceを計算 | PASS | ローカルunit testと実装で確認 |
| 配列位置ずれで別周回を比較しない | PASS | ローカルunit testで確認 |
| 中間欠損を補完しない | PASS | ローカルunit testで確認 |
| 2周目開始記録をgap/rankに使いlap/paceに使わない | PASS | ローカルunit testで確認 |
| DNFの内部`finalPosition`を公式順位へ出さない | PASS | ローカル結果モデルで確認。公開UIへの反映はStep 2でFAIL |
| 周回遅れfinishedを`lapDeficit`で時間差と区別 | PASS | ローカルunit testで確認 |
| 欠落、0秒、重複、空配列、dataQuality errorを安全処理 | PASS | ローカルfixture testで確認 |
| `npm test`が非watchで完了 | PASS | 13/13成功 |

### Step 2 — ステータスとリザルト表

| Acceptance Criteria | 判定 | 根拠 |
|---|---|---|
| 選手未選択でも結果表を表示 | FAIL | 公開版に結果表なし |
| finished、周回遅れ、DNF、周回なし、data errorを別表示 | FAIL | 公開版はDNFを通常最下位のように表示 |
| DNF順位欄に内部連番を出さない | FAIL | 鈴木来人（DNF）が`15/15`表示 |
| desktop 4列、行選択がsummary/chartへ同期 | FAIL | 公開版に結果表なし |
| mobile 390pxでページ/表の横scrollなし | PARTIAL | ページ横scrollはなし。表は未公開で未確認 |
| keyboardで結果行選択、状態を読み上げ/視覚表示 | FAIL | 公開版に結果表なし |
| 1人、4人、68人で適切な密度/高さ | NOT VERIFIED | 公開版に結果表なし |
| 0人で表見出し付きempty、分析を要求しない | NOT VERIFIED | 対象実データと公開UIで確認できず |

### Step 3 — mobile大会一覧と見出し

| Acceptance Criteria | 判定 | 根拠 |
|---|---|---|
| 320/390pxで大会名・大会/race見出しが切れない | FAIL | 公開版で大会名と見出しが切れる |
| 大会一覧に横scrollがない | PASS | 320/390pxのdocument幅で確認 |
| desktop 1280px以上で3列を維持 | PASS | 日付・series・大会名の3列を確認 |
| season変更時解除、件数、降順、0件emptyを維持 | PARTIAL | 件数、series絞込、降順は確認。season解除と0件は未確認 |
| 大会linkのkeyboard focusが見える | NOT VERIFIED | automation上で安定してTab移動を再現できず |

### Step 4 — ラベル、検索、state

| Acceptance Criteria | 判定 | 根拠 |
|---|---|---|
| 空白/全角空白/大小文字を正規化して検索 | NOT VERIFIED | ローカルunit testはPASSだが対象URLで該当氏名を再現できず、変更も未公開 |
| 検索対象が現在カテゴリー内の氏名と常時分かる | FAIL | 公開版はplaceholderのみ |
| 画面/legend/説明から`あなた`を除去 | FAIL | 公開版に`あなた`表示あり |
| 参加人数とfinished/DNF内訳を表示 | FAIL | 公開版は内訳なし |
| `±2`の意味と実表示人数を文言で理解できる | FAIL | toggle値だけで説明なし |
| `all`後のカテゴリー変更で未選択/mode 2へ戻る | NOT VERIFIED | ローカル実装はresetするが対象URLで再確認できず |
| 正式名称・所属・bibを推測表示しない | PASS | 公開版/ローカルとも推測表示なし |

### Step 5 — エラー復旧

| Acceptance Criteria | 判定 | 根拠 |
|---|---|---|
| 存在するmeet URLでRaceViewer表示 | PASS | 複数大会で確認 |
| 不正meet IDを専用not-found、一覧link、可能なら404 | FAIL | 汎用取得エラーで一覧linkなし |
| meets通信/5xxをnot-found扱いしない | NOT VERIFIED | 障害条件を安全に再現できず |
| race JSONの404/network/invalidを別説明 | NOT VERIFIED | 公開データを壊さず再現できず。ローカル型分岐は確認 |
| retryが実fetchし、連打を防止 | FAIL | 公開版にretryなし |
| home取得失敗に実retry | FAIL | 公開版にretryなし |
| 全error/not-foundからkeyboardで一覧復帰 | FAIL | 公開不正URLは一覧linkなし |
| SSR/全race server fetch/cache/metadataを変更しない | PASS | ソースレビューで対象外変更なし |

### Step 6 — chart線形状

| Acceptance Criteria | 判定 | 根拠 |
|---|---|---|
| 順位が曲線でなくstep線 | FAIL | 公開版はmonotone曲線 |
| gap/pace/lapがlinearで実測点を識別可能 | FAIL | 公開版は曲線補間 |
| 中間欠損/終了後を接続しない | NOT VERIFIED | 公開版の中間欠損例を特定できず。ローカルは`connectNulls=false` |
| DNFが最終有効checkpointで停止 | PASS | JPN MEのDNFでlap 2停止を確認 |
| 1人カテゴリーで順位/lap、比較tab emptyが崩れない | PARTIAL | `±0`の単独表示とemptyは確認。1人だけの実カテゴリーは未確認 |
| 8人/15人以上でerrorなし、注目選手を見失わない | PARTIAL | 8/15人は描画成功。98人全員では実質見失う |
| データ計算test、lint、build成功 | PASS | ローカルですべて成功 |

### Step 7 — 横断accessibility

| Acceptance Criteria | 判定 | 根拠 |
|---|---|---|
| season/series/category/searchに常時labelを関連付け | FAIL | 公開版は関連が不十分、searchはplaceholder依存 |
| Tab順が視覚順と大きく逆転しない | NOT VERIFIED | Tab操作を安定再現できず。ローカル大人数は操作数過多 |
| 主要操作のfocus-visibleがring/outlineで分かる | PARTIAL | searchでは確認。全controlは未確認 |
| mobile主要タップ領域が原則44×44px以上 | FAIL | 32px/28px/25pxのcontrolを確認 |
| Toggle/tab/result選択が色以外でも分かる | PARTIAL | toggle/tab/選手はoutline・太さあり。結果表は未公開 |
| 本文4.5:1、chart線3:1以上 | FAIL | 公開オレンジ文字が約3.31:1。ローカルpaletteは改善済み |
| reduced-motionへ新しい不要animationを追加しない | PASS | ソース上で新しいsmooth scroll/animation追加なし |
| keyboardだけで結果、選手、比較、tab、retry、一覧復帰 | FAIL | 公開版に結果表/retry/一覧復帰がなく、tab関連付けも不備 |

## 11. Recommended Actions

1. **Phase 1をコミット・デプロイし、対象URLとcommit SHAを一致させる。** 現状では他の受け入れ作業を完了扱いにできません。
2. **デプロイ後にPhase 1のbrowser Acceptance Criteriaを再実行する。** 特にDNF、リザルト表、320/390px文字切れ、invalid meet、retry、step/linear線を優先します。
3. **chart tabの単一Tabs root化と、大人数結果表から分析UIへのkeyboard経路短縮を行う。** Phase 1のaccessibility完了条件です。
4. **大人数の`全員`比較へ最小限の安全策を入れる。** 少なくともtooltipをviewport内で読めるようにし、98系列を無警告で描画しないようにします。
5. **カテゴリー切替時の旧race一時表示を防ぎ、代表データのUI回帰テストを追加する。** 3人、8人、15人、98人、DNFを固定シナリオにします。

## 12. Phase 2 Readiness

**NOT READY**

Phase 1の変更が対象公開URLへ反映されておらず、ブラウザで確認すべきAcceptance Criteriaの大半がFAILだからです。また、ローカル変更にもタブのARIA関連付けと大人数keyboard経路というPhase 1内のaccessibility課題が残ります。Phase 1をデプロイし、上記blocking issueを解消して再受け入れを通した後にPhase 2へ進むべきです。

## Appendix A — First-time UX Task Log

| Task | 成否 | 操作開始点 | 迷い・推測・不足 |
|---|---|---|---|
| サイトの目的を理解 | PARTIAL | landingの`AJOCC results`と`大会を選ぶ` | リザルト閲覧までは分かるが、周回比較サイトである説明、AJOCCの説明、データ更新時点がない |
| レースを探す | PASS | season/series filterと大会一覧 | 大会名検索なし。最新順の明示なし。mobileで大会名切れ |
| カテゴリーを選ぶ | PASS | 大会ページ上部のselect | `ME1`等の略称を理解する必要あり |
| レース結果を確認 | PARTIAL | category選択後の選手一覧 | 順位付き一覧はあるが、通常の結果表、結果/status、総合時間がない |
| 特定選手を探す | PASS | `選手を検索`入力 | category内検索だと推測する必要あり。空白正規化は公開版で未確認 |
| 1人のlap推移を見る | PASS | 選手選択→`±0`→`ラップ` | `±0`で単独になることを推測する必要あり |
| 複数選手を比較 | PARTIAL | 選手選択→比較toggle | 任意選手を追加するUIではなく、最終順位の近傍を自動選択する仕様が説明されない |
| 誰がどの周で速いか | PARTIAL | `ラップ`/`ペース`とtooltip | 正確な値はpointへhover/tapが必要。最速周の即時判別は難しい |
| 差がどこで生まれたか | PASS | `ギャップ`と`ペース` | 符号と基準の説明を読む必要あり。大人数では破綻 |
| レース展開を把握 | PASS | `順位`と`ギャップ` | 曲線補間が実測以上の連続性を示す。多人数では情報過多 |

不要に感じた情報は少なく、問題は主に不足と説明不足です。4chartの説明文は有用ですが、最初にリザルトを見たい利用者にも選手選択と分析UIを見せる点が過剰でした。

## Appendix B — Representative Data / Edge Cases

| 大会 / Category | 規模・特徴 | 結果 |
|---|---|---|
| MMJ-256-005 / ME1 | 8人、7周 | 基本フロー、単独/近傍/全員、4chartを確認 |
| JPN-256-002 / ME | 15人、8周、DNFあり | DNF線は2周で停止。ただしsummaryは`15/15`で誤解を招く。全員tooltipは画面外へ伸びる |
| JPN-256-002 / WJ | 3人 | `±0`で順位/lap単独表示、gap/pace empty stateを確認 |
| CYCLOCROSS TOKYO 2026 Day2 / ME1 | 98人、11周、複数DNF | selectorは動作。全員chartとtooltipが破綻。長い氏名`ウィリアムス 飛`は表示可能 |

- 1人だけの実カテゴリー、DNS、DSQは今回の公開データ操作では確認できず、存在を仮定した不具合判定はしていません。
- loading表示は通信が速く安定再現できなかったためNOT VERIFIEDです。
- 欠損の中間周回がある実選手は画面操作だけで確実に特定できず、公開版の欠損線はNOT VERIFIEDです。

## Appendix C — Source Review Notes

- `lib/dataTransform.ts`の純粋関数化とfixture testは妥当で、不必要な大規模依存追加はありません。
- `RaceResultsTable`のsemantic table、caption、scope、`aria-pressed`、文字statusは良い設計です。
- `ChartTabs`の2つのTabs rootはfragileで、ARIA関係を破壊しています。
- 4chartのwrapper `role="img"` とRecharts内部のinteractive semanticsの共存は実機screen reader確認が必要です。
- `lib/chartColors.ts`は6色を循環するため、7人以上で色が重複します。全員比較の識別には使えません。
- `RaceResultsTable`の結果計算はrender内で全行繰り返されます。現時点で操作遅延は実測していませんが、precomputeしやすい箇所です。
- `useRaceData`のstateはURLと紐付いておらず、カテゴリー変更直後のstale data表示に弱い構造です。
- `AbortController`とin-flight guardを使ったretryは過度に複雑ではなく、今回の要件に見合います。
- package変更はテスト実行環境の追加が中心で、production bundleへの大規模な依存更新は見つかりませんでした。
