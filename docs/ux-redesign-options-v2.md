# AJOCC Lap Time Viewer — UX Redesign Options v2

## Current information hierarchy

現状の実際の視覚・DOM順は、概ね次の通りである。

```text
大会一覧
  → category select
  → race header / metadata
  → 結果表
  → RiderSelector
  → status summary / lap summary
  → comparison controls
  → lap detail table
  → metric tabs + chart
```

Browseには適した順序だが、選手選択後も同じ順序と密度が続く。そのため、
分析中の本来の優先順位である `現在のcontext → chart → detail` と逆転する。

### Problem definition

本タスクで解くべき問題は、データ処理やチャートの正しさではなく、次の4点。

1. 同一analysis context内の比較・指標変更で視点がページ先頭へ戻る。
2. chartが選手選択・比較設定・lap detailの後ろにあり、Time to Insightが長い。
3. 選択後も再選択用のリストが大きく残り、ConfigurationがPrimaryを圧迫する。
4. DesktopとMobileが同じ縦順序で構成され、Mobileでは摩擦が増幅する。

以下の3案は、既存のroute、URL state、data semantics、charts、error surfacesを
活かしながら、情報設計の変更幅を比較する。

## Option A — Existing structure, low-risk improvement

### Structure

- 既存のrace pageとDesktop two-column layoutを維持する。
- 選手選択後は`RiderSelector`をcompact selected-rider controlに閉じる。
- `ChartTabs`を`LapDetailTable`より前へ移動する。
- `router.push`時に同一race内のstate changeではpage scrollを保持する。
- 結果表カードに「分析中: rider / metric / compare」の小さなcontext rowを追加。
- Mobileでは比較設定をwrapするが、基本的には既存の縦積みを維持する。

### Merits

- 既存componentの責務・URL contract・data flowを最も保ちやすい。
- 差分が小さく、release regressionの切り分けが容易。
- Desktopでchartとleft railを並べる既存gridを再利用できる。

### Demerits

- 結果表とlap detailが残るため、Mobileの縦長問題は限定的にしか解消しない。
- 設定UIが分析中にも常時表示される。
- 「Browse pageの下にchartがある」という構造的印象は残る。

### 評価

| 観点 | 評価 |
| --- | --- |
| 実装コスト | Low〜Medium |
| regression risk | Low〜Medium |
| Desktop適性 | Good |
| Mobile適性 | Fair |
| expected UX impact | Medium |

## Option B — Analysis workspace（Recommended）

### Structure

ページをBrowse stateとAnalysis stateの2段階に分ける。

```text
Browse state
  race/category context
  result table（Primary）
  「選手を選んで分析」

Analysis state（riderが存在する状態）
  compact context bar（race / category / rider / comparison）
  Desktop: control rail | chart-first main area
  Mobile: sticky compact toolbar + chart-first main area
  lap detail / supporting data
  結果表はcompact summaryから必要時だけ開く
```

- Desktop 1024px以上は左に280〜320pxのcontrol rail、右にmain analysisを置く。
- mainの順序は `metric tabs → chart → lap detail`。
- Mobileはページを唯一のscroll containerとし、sticky context/metric toolbarを
  残す。選手と固定比較対象の一覧はbottom sheetまたはmodal disclosureで開く。
- race/categoryのcontextは常時見える。大会再選択はcompact actionに格下げする。

### Merits

- chart/dataを画面の主役へ明確に昇格できる。
- 「条件変更→結果確認」を同一viewport内で繰り返せる。
- Desktopの横幅とMobileの限られた高さを別々に最適化できる。
- 既存のcomponentとdata modelを再配置するため、機能の再発明が少ない。

### Demerits

- Browse/Analysisの状態切替、focus、sticky offset、dialog focus returnが必要。
- 結果表を畳むことで、ユーザーが全員の順位を見たい場合の導線設計が必要。
- DOM順を変更するため、既存のanchor/focus smokeとregression testの更新が必要。

### 評価

| 観点 | 評価 |
| --- | --- |
| 実装コスト | Medium |
| regression risk | Medium |
| Desktop適性 | Excellent |
| Mobile適性 | Excellent |
| expected UX impact | High |

## Option C — Analysis canvas / information architecture rewrite

### Structure

- Race pageを分析canvasとして再定義し、Desktopでは常時split viewにする。
- 結果表・rider picker・comparison pickerをdrawerとして扱い、chartを中心に置く。
- URLのquery stateとworkspace sub-stateを別のnavigation modelで管理する。
- Mobileではchart full-screenに近い表示とbottom sheetを組み合わせる。
- browse用の大会一覧と分析canvasのroute/entry pointを明確に分離する。

### Merits

- 分析に必要な情報だけを常時画面に置ける。
- 大規模データ・複数選手比較・将来の保存/共有機能に拡張しやすい。
- chart中心のproduct identityを最も強く打ち出せる。

### Demerits

- route、focus、responsive、dialog、browser historyの変更範囲が大きい。
- 既存の結果表と分析の関係が変わり、regression riskが最も高い。
- ユーザーが順位を確認するだけのTask 1には重い。
- new layoutのための実ユーザーテストがない状態では設計判断が多すぎる。

### 評価

| 観点 | 評価 |
| --- | --- |
| 実装コスト | High |
| regression risk | High |
| Desktop適性 | Excellent |
| Mobile適性 | Good（実装品質依存） |
| expected UX impact | High〜Very High |

## Comparison

| Option | 主役 | Desktop | Mobile | Scroll stability | Configuration density | Cost | Risk | Impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 結果表＋下部chart | 改善 | 部分改善 | 良 | 中 | Low〜Med | Low〜Med | Medium |
| B | context＋chart | 強い | 強い | 強 | 低 | Medium | Medium | High |
| C | canvas＋chart | 最強 | 強いが複雑 | 強 | 最低 | High | High | High〜Very High |

## Recommended Design

Option Bを推奨する。

理由は、今回の課題が「chartがない」ことではなく、chartの前にBrowseと
Configurationの構造が残り続けることだからである。Option Aは原因の一部、特に
scroll resetと選択後のlist残留を直せるが、Mobileの縦積みを根本的には変えない。
Option Cは効果が大きいものの、既存の良い機能を保ちながら最初の検証を行うには
変更が過大である。Option Bなら、既存のdata transform、URL state、4種類のchart、
lap detail、error semanticsを保ったまま、Primary/Configurationの順序だけを
明確に変えられる。

### Target hierarchy

Analysis stateでは次の順序を採用する。

1. 今どの大会・カテゴリー・選手・比較条件を見ているか（Context）
2. 現在の指標とchart（Primary analysis）
3. 選手の主要summary（Primary supporting）
4. 指標・比較・選手変更の操作（Configuration）
5. lap detailと全結果表（Supporting / on demand）
6. 大会・カテゴリー再選択（Navigation / rare）

## Desktop wireframe

### Browse state

```text
┌──────────────────────────────────────────────────────────────────────┐
│ AJOCC RESULTS   大会を選ぶ                                           │
│ [シーズン] [シリーズ]                                                │
│                                                                      │
│ 結果を確認する大会                                                   │
│ 2026-03-15  もみじ  2025-26もみじシクロクロス第5戦                 │
│ 2026-03-08  四国    シクロクロス四国 第3戦                         │
└──────────────────────────────────────────────────────────────────────┘
```

### Analysis state

```text
┌──────────────────────────────────────────────────────────────────────┐
│ ← 大会一覧   2025-26もみじシクロクロス第5戦 / ME1                   │  sticky context
│ 注目: 和田 良平   比較: 前後2位   [選手を変更] [結果表を表示]          │
├───────────────────┬──────────────────────────────────────────────────┤
│ CONTROL RAIL      │  [順位] [タイム差] [周回差] [ラップ]              │
│                   │                                                  │
│ 和田 良平          │                 MAIN CHART                       │
│ 1位 / 8            │          （valid riderならすぐ見える）            │
│ 58:28              │                                                  │
│                   │  選択中の周回 / 詳細                             │
│ 最速 7:57          ├──────────────────────────────────────────────────┤
│ 平均 8:21          │ lap detail（必要なとき読む supporting data）     │
│                   │                                                  │
│ 比較対象 [±0…±5]  │                                                  │
└───────────────────┴──────────────────────────────────────────────────┘
```

Desktopのcontrol railは同一workspace内のConfigurationであり、race/categoryの
再選択はcontext barのcompact actionにする。chartの上端を結果表の下へ押し出さない
ため、Analysis stateでは結果表をsummaryに畳む。

## Mobile wireframe

```text
┌──────────────────────────────┐
│ ← 大会一覧   もみじ / ME1      │ sticky race context
│ 注目: 和田 良平  [変更]         │ sticky analysis context
│ [順位][Gap][Pace][Lap]          │ sticky primary control
│ 比較 ±2  [比較を変更]           │ sticky/compact control
├──────────────────────────────┤
│                                │
│          MAIN CHART             │
│     （最初のviewportで認識）    │
│                                │
├──────────────────────────────┤
│ 1位 / 8   トップ差 —           │ compact summary
│ 最速 7:57  平均 8:21           │
├──────────────────────────────┤
│ [ラップ詳細を表示]             │ disclosure
│ [結果表を表示]                 │ disclosure
└──────────────────────────────┘

[選手を変更] → bottom sheet（検索＋選手リスト）
[比較を変更] → bottom sheet（±0〜±5 / 固定 / 全員）
```

Mobileではmetricと現在のrider/comparisonを画面上部に残し、選手一覧・固定選手
一覧のような低頻度操作だけをsheetへ移す。sheetを閉じた後は元のtoolbarへfocusを
戻し、chartのpage positionを変えない。
