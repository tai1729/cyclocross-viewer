# AJOCC Lap Time Viewer — Product Source of Truth

## Current release status

- Phase 1 production completion is closed as of 2026-09-05.
- The production URL is `https://ajocc-laptime-viewer.vercel.app/`.
- The verified release is `bab760bea87c2dfc126b70559e375a721b68dd5a`; its Vercel production deployment is READY and reports the same `githubCommitSha`.
- Phase 1 blockers are zero and Phase 2 is READY for a separately designed and audited task.

## Phase 2 Slice 1 current behavior

- Phase 2 Slice 1 adds a local `固定` comparison mode for the active race
  category. It compares the selected graphable primary rider with up to four
  individually fixed graphable riders.
- Fixed riders can be searched by normalized name or rider ID, added, and
  removed from an inline keyboard-accessible picker. Valid-checkpoint DNF
  riders remain eligible; riders without valid checkpoints are excluded.
- Fixed IDs persist while switching comparison modes, are reconciled when the
  primary changes, and are cleared when the category changes. Numeric rank
  presets and the existing eight-rider `全員` guard remain unchanged.
- URL synchronization, time-difference presentation, lap tables, and other
  Phase 2 slices remain out of scope.

## Phase 2 Slice 2 current behavior

- Charts distinguish the selected primary rider, active fixed riders in pinned
  mode, and all other displayed riders as context. The primary has the strongest
  treatment, fixed riders have distinct role colors, and context remains visible
  with a neutral low-emphasis treatment.
- Gap and pace retain the primary rider's zero baseline. In all mode the legend
  is suppressed and context riders are summarized at the hovered point instead
  of being listed individually.
- Charts use only sparse measured values. Missing values and laps are omitted;
  they are not inferred, interpolated, or aggregated across missing data.
- Slice 2 adds no new data contracts and no new production dependencies.

この文書は、製品全体の長期的なSource of Truthである。現在の実装、テスト、既存設計、2026-09-02〜03のレビューから確認できる事実を整理する。将来の変更仕様は `docs/DESIGN.md` に記載する。

## Problem

AJOCCシクロクロスの公開結果は大会・カテゴリーごとの結果確認には使えるが、選手ごとの周回順位、累積タイム差、単周タイムの推移を同じ画面で比較してレース展開を読むには追加の整理が必要である。

本製品は、別リポジトリのcollectorが生成した正規化済みデータを使い、次を一つの閲覧フローにまとめる。

- シーズン・シリーズから大会を探す
- 大会内のカテゴリーとリザルトを確認する
- 注目選手を選び、近い最終順位の選手と周回推移を比較する
- DNF、周回遅れ、欠損・異常データを完走の通常タイム差と混同しない

## Users

既存レビューが想定している利用者は次のとおり。実ユーザーの構成比や利用頻度を示す計測データはリポジトリ内にないため、優先順位は検証済みの確定事実ではない。

- AJOCCレースへ出場し、自分の結果と周回推移を振り返る選手
- 特定の選手や近い順位の選手を比較するコーチ、チーム関係者、分析利用者
- 選手を応援し、結果とレース展開を確認する観戦者
- AJOCCのカテゴリー略号や分析指標に詳しくない初見利用者
- 会場や移動中にスマートフォンで結果を確認する利用者

## Goals

- 大会とカテゴリーを選べば、順位、選手、周回データ由来の結果、完走/DNF状態を確認できる。
- リザルト行または選手検索から注目選手を選び、順位、トップ差、ペース差、ラップタイムの周回推移を比較できる。
- 同じ `lapNumber` の記録だけを比較し、欠損値を補完せず、計測されていない変化を示さない。
- DNFの内部連番を公式順位のように表示せず、周回遅れの完走者と区別する。
- デスクトップと狭いモバイル画面の双方で、主要情報と操作へ到達できる。
- 通信失敗、不正データ、存在しない大会で行き止まりを作らず、再試行または大会一覧へ戻れる。
- upstreamのカテゴリー名とデータ契約を尊重し、根拠のない名称・結果・状態を創作しない。

## Non-Goals

- AJOCCの公式リザルトを置き換えること、または本製品の表示を公式記録として扱うこと
- viewerから `data.cyclocross.jp` を直接スクレイピングすること
- 大会、カテゴリー、結果データを編集・登録する管理機能
- 周回単位データからコース上の正確な追い抜き地点、転倒、機材トラブル、失速原因を推定すること
- upstreamに存在しない所属、ゼッケン、カテゴリー正式名称、DNS/DSQ/OTLなどを推測表示すること
- 複数大会をまたぐ選手成績集計、ランキング、履歴管理
- 現時点で未実装の任意選手比較、URLによる分析状態共有、画像/CSVエクスポートを既存挙動として扱うこと

## Core User Flows

### 1. 大会を探す

1. `/` を開く。
2. collectorの `meets.json` を取得する。
3. 必要に応じてシーズンとシリーズを選ぶ。シーズン変更時はシリーズ選択を解除する。
4. 開催日降順の一覧から大会を選ぶ。
5. `/race/[meetId]` へ移動する。

### 2. カテゴリーのリザルトを確認する

1. 大会URLを開くと、server側で大会IDを `meets.json` に照合する。
2. 大会に保存された掲載順でカテゴリーを表示し、初期カテゴリーは先頭とする。
3. 選択カテゴリーの `race-{raceId}.json` をclient側で取得する。
4. 順位、選手、結果、状態のリザルト表を確認する。
5. カテゴリー変更時は注目選手を解除し、比較範囲を既定の `±2` へ戻す。

### 3. 注目選手を分析する

1. リザルト表の選手名、または現在カテゴリー内の選手検索から注目選手を選ぶ。
2. 選手の状態に応じて、順位/トップ差/昇格圏、DNFの到達周回/最終通過/離脱時点の差、または分析不可理由を確認する。
3. 最終順位の前後 `±0`〜`±5` を比較範囲として選ぶ。
4. グラフ表示可能な選手が8名以下のカテゴリーでは「全員」も選べる。9名以上では全員比較を無効化する。
5. 順位、ギャップ、ペース、ラップの4タブを切り替えて周回推移を確認する。

### 4. 失敗から復旧する

- 大会一覧またはレースJSONの取得失敗時は、原因に応じた説明と実fetchを行う再試行を表示する。
- 存在しない大会IDは専用not-found画面を表示する。
- レース取得エラーとnot-found画面から大会一覧へ戻れる。
- データ品質異常または周回なしの選手はリザルトから消さず、分析できない理由を表示する。

## Product Constraints

### Data source and ownership

- viewerのデータ源は `https://raw.githubusercontent.com/tai1729/cyclocross-data-collector/main` にある `meets.json` と `data/race-{raceId}.json` である。
- データ収集・スクレイピング・生成は別リポジトリの責務であり、このリポジトリは閲覧と派生計算を担当する。
- categoryの表示名と順序はupstream値をそのまま使う。全国共通名称へ推測正規化しない。
- 現行Rider契約で確認済みの状態は `finished | dnf`、品質は `ok | error` である。
- 現行データには、所属、ゼッケン、公式結果文字列、信頼できる公式結果URLが含まれない。

### Data semantics

- 有効チェックポイントは、正の整数 `lapNumber` と有限の `cumulativeTimeSec` / `rankAtLap` を持つ一意な記録である。
- 同一選手内で重複した `lapNumber` は曖昧なため、その周回番号の記録を計算対象外とする。
- 単周タイムは `lapTimeSec > 0` かつ、1周目または直前周回の有効チェックポイントがある場合だけ有効とする。
- 2周目以降から始まる最初の記録は累積差と順位には利用できるが、単周ラップ/ペースには利用しない。
- 欠損周回、選手の終了後、不正値は補完しない。グラフの線も欠損をまたいで接続しない。
- DNFの `finalPosition` は完走者の後ろに付く内部連番であり、公式順位として表示しない。
- `finished` でもleaderより最終周回が少ない場合は周回遅れとして順位と `-N周` を表示し、DNFとは扱わない。
- DNFの差はleaderの同じチェックポイントが存在する場合だけ「離脱時点の差」として扱う。

### Platform and UX

- Next.js App Router、React、TypeScript、Recharts、Tailwind CSS、shadcn/Base UIという現行構成を基準とする。
- UIは温かい紙色、濃いインク色、オレンジの主要アクセント、等幅数字を使うレース計測ボードの方向性を保つ。
- モバイルでは大会名や結果表を横スクロール前提にせず、320px/390px級の狭い幅でも主要情報を読めることを重視する。
- 主要なモバイル操作は原則44px相当、keyboard focusは視覚的に確認可能、選択・状態は色だけに依存させない。
- 周回値は離散的な実測点である。順位はstep線、タイム系列はlinear線を使い、曲線補間を行わない。

### Compatibility

- 公開route `/` と `/race/[meetId]` を維持する。
- `MeetEntry`、`RaceResult`、`Rider`、`LapRecord` はupstream JSONとの境界契約であり、変更にはcollectorとの互換性確認が必要である。
- エラー種別 `not-found | network | http | invalid-data` と、既存の復旧導線を安易に統合・削除しない。
- 認証、アカウント、秘密情報を前提としない。外部JSONは `lib/dataSource.ts` でtop-levelとriderの最低限shapeを確認し、lap recordの有効性は `lib/dataTransform.ts` で利用時に判定する。完全なruntime schema検証済みとはみなさず、値をHTMLとして直接挿入しない。

## Existing Behavior

### Routes and loading

- `/` はClient Componentで大会一覧を取得し、loading skeleton、取得エラー、再試行を表示する。
- `/race/[meetId]` はServer Componentで大会の存在を確認し、存在しなければ `notFound()` を使う。
- 大会が存在する場合、`RaceViewer` がカテゴリー選択とレースJSON取得をclient側で管理する。

### Selection and result display

- シーズン/シリーズfilterはローカルstateで、URLには保存しない。
- カテゴリーはupstreamの `order` 順、初期値は先頭カテゴリーである。
- リザルト表は4列（順位、選手、結果、状態）で、最大高を設け縦スクロールする。
- リザルト表の選手をkeyboardで選べ、分析領域へfocusを移せる。大人数時は表を飛ばすskip linkがある。
- 選手検索は現在カテゴリー内の氏名だけを対象とし、NFKC、空白除去、英字大小文字を正規化する。

### Analysis

- 注目選手選択後にSummaryと比較範囲を表示する。
- 既定比較は最終順位の前後2位以内で、任意の複数選手を直接追加する機能はない。
- chart初期タブは順位である。
- 順位は `stepAfter`、ギャップ/ペース/ラップは `linear`、すべて `connectNulls={false}` である。
- 比較系列の色は最終順位順に8色を循環する。8名超の全員比較はUIで禁止する。

### Known uncertainty

以下は既存資料から確定できないため、将来taskで必要になった時点で確認する。

- AJOCCとの公式な関係、公式表示として許容される表現、ブランド利用条件
- 正規の本番URLと、公開環境がどのcommitを反映しているかを示す運用方法
- 実利用者の構成、最頻タスク、端末比率、各分析タブの利用頻度
- `promotionZoneRank` の全カテゴリーに対する業務ルールとupstreamでの生成根拠
- 将来upstreamに追加される可能性があるstatusや公式結果fieldの契約

## Historical References

- `docs/superpowers/specs/2026-09-01-season-series-meet-category-filter-design.md`
- `docs/superpowers/specs/2026-09-02-shadcn-race-board-design.md`
- `docs/2026-09-02-product-review.md`
- `docs/2026-09-03-first-time-user-ux-test.md`
- `docs/2026-09-03-data-visualization-review.md`
- `docs/2026-09-03-integrated-product-improvement-roadmap.md`
- `docs/2026-09-03-phase-1-implementation-plan.md`
- `docs/2026-09-03-phase-1-ux-regression-review.md`

これらは作成時点の設計・レビュー・履歴資産であり、削除しない。現在の挙動と矛盾する記述（例: Phase 1実装前の公開版評価、当時存在しなかったtest script）は、日付付きの履歴として解釈し、現在の実装と本書を優先する。
