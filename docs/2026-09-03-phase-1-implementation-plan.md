# Phase 1 実装計画

- 作成日: 2026-09-03
- 対象: `docs/2026-09-03-integrated-product-improvement-roadmap.md` の Phase 1 のみ
- 状態: 実装前レビュー用
- この文書の作成時点ではソースコードを変更していない

## 1. 目的

Phase 1を、既存のNext.js App Router、ローカルstate、クライアント取得、Recharts、shadcn/Base UIという構成を保ったまま、安全に分割実装する。主眼は次の4点である。

1. 周回・DNF・周回遅れを誤解させない。
2. カテゴリー選択直後に最終結果へ到達できる。
3. モバイル、キーボード、低視力・色覚多様性を含む基本操作を成立させる。
4. 失敗時に再試行または大会一覧へ戻れる。

任意比較、URL同期、新しい分析指標、サーバー中心のデータ取得への全面移行は行わない。

## 2. 調査対象

### レビュー文書

- `docs/2026-09-02-product-review.md`
- `docs/2026-09-03-data-visualization-review.md`
- `docs/2026-09-03-first-time-user-ux-test.md`
- `docs/2026-09-03-integrated-product-improvement-roadmap.md`

### 現行実装

- routes: `app/page.tsx`, `app/race/[meetId]/page.tsx`, `app/layout.tsx`
- page components: `MeetSelector`, `RaceViewer`, `RaceHeader`, `RiderSelector`, `SummaryCard`, `ComparisonAdjuster`, `ChartTabs`
- charts: `RankBumpChart`, `GapChart`, `PaceChart`, `LapTimeChart`
- hooks/state: `useMeetData`, `useRaceData`, `useComparisonRiders` と `RaceViewer` のローカルstate
- data: `lib/types.ts`, `lib/dataTransform.ts`, `lib/chartColors.ts`
- styling/accessibility: `app/globals.css`, `components/ui/*` の利用箇所
- tests/build: `package.json`, `tsconfig.json`
- Next.js 16.3.3 ローカルガイド: error handling、`notFound()`、Server/Client Component境界、Vitest、accessibility

### 実データ

ビューアが参照するデータ生成リポジトリのローカルチェックアウト `02_ajocc-data-collector` を読み取り専用で集計した。コミット済みHEADは `91d8918` だが、同リポジトリには別作業の未コミット変更があるため、それらには依存しない。

## 3. 現在の実装との照合結果

### コード上の事実

- レビューにある `components/charts/LapTimeChart.tsx` というパスは現状と異なり、実ファイルは `components/LapTimeChart.tsx` である。他のチャートも `components/` 直下にある。
- `buildGapSeries` と `buildPaceDeltaSeries` は、基準選手の `lapNumber` を取得しながら比較選手を `rider.laps[i]` で参照する。開始周または欠損位置が違うと別周回を突合する。
- `RankBumpChart` と `LapTimeChart` はすでに `find(lapNumber)` を使う。Phase 1で全チャートのデータ生成を全面書き換える必要はない。
- `getGapAtRiderFinish` は同一周回を検索するが、見つからない場合に基準選手の最終累積タイムへフォールバックする。この場合は異なる終了点を比較するため、差を表示しない方が安全である。
- `getRaceLapNumbers` は「1位選手は必ず完全」という前提だが、実データには型どおりでないレコードがある。この前提は外す。
- `RiderStatus` は `finished | dnf` のみで、DNFの `finalPosition` は公式順位ではなく、完走者の後ろに付けた内部連番である。
- カテゴリー変更時、`selfRiderId` は解除されるが `comparisonMode` は保持される。このため `all` のまま別カテゴリーへ移る。
- 検索は `r.name.includes(query)` だけで、空白・全半角・英字大小文字を正規化しない。ラベルはplaceholderのみである。
- `FieldLabel` 自体は `<label>` だが、シーズン・シリーズ・カテゴリーのSelect triggerに `id`、labelに `htmlFor` がなく、関連付けられていない。
- `MeetSelector` はモバイルでも `min-w-[42rem]`、大会名は `whitespace-nowrap` で、横スクロールが必要になる。
- `RaceHeader` と上部の大会名は `truncate` のため、モバイルで主要情報が切れる。
- 共通Button、Select、Toggle、Tabsの既定高さは24〜36pxである。Phase 1では共通primitiveを全面変更せず、主要操作の利用箇所で44px相当を確保する。
- 全チャートが `type="monotone"` を使う。欠損を接続する指定はないが、意図を固定するため `connectNulls={false}` を明示する。
- 再試行は同じrouteへのLinkであり、同じコンポーネントのfetchを確実に再実行しない。
- 存在しない `meetId`、大会一覧取得失敗、壊れた一覧JSONが同じ表示になる。現行のClient Componentだけでは実HTTP 404を返せない。
- 自動テストとtest scriptはない。lint/build scriptだけがある。

### 実データ監査

| 項目 | 確認結果 | Phase 1での扱い |
|---|---:|---|
| レースJSON | 1,192件 | 代表例だけでなく純粋関数の境界ケースをテストする |
| 選手 | 18,274人 | 多人数表は68人規模まで手動確認する |
| status | `finished` 17,931 / `dnf` 343 | この2状態だけを型とUIで扱う。DNS等を推測追加しない |
| DNFで周回あり / なし | 276 / 67 | 最終通過を出せる場合と出せない場合を分ける |
| `dataQuality: error` | 1人 | リザルトには残し、分析不可を明示する |
| 周回なし | 128人（finished 61 / dnf 67） | 結果行は残し、周回分析は不可にする |
| `lapNumber` 欠落 | 450レコード・450人・56レース | 型アサーションを信用せず、そのレコードを計算・描画から除外する |
| 真の重複 `lapNumber` | 0人 | 将来データ用のテストだけ用意する |
| 中間周回の欠損 | 0人 | 将来発生しても線をつながない実装にする |
| 1周目以外から始まるレース | 40レース | 最初の記録は累積チェックポイントには使えるが、単周lap/paceには使わない |
| winnerより少ない周回でfinished | 3,311人 | DNFではなく周回遅れとして `-N周` を表示する |
| 利用可能な選手フィールド | ID、氏名、内部最終順、status、laps、dataQuality | 所属・ゼッケン検索は実装しない |
| カテゴリー名 | 103種類、すべて略号または大会独自名称 | 検証済み正式名称を捏造せず、現行名＋人数を表示する |
| 公式結果URL・公式結果文字列 | なし | Phase 1の結果列は周回データ由来と明記する |

## 4. Phase 1で固定するデータ意味論

実装前に、次をテスト可能な契約として固定する。

### 4.1 チェックポイントと有効ラップ

- 有効チェックポイント: `lapNumber` が正の整数で、`cumulativeTimeSec` と `rankAtLap` が有限値のレコード。
- 単周タイムとして有効: 有効チェックポイントであり、`lapTimeSec > 0`、かつ `lapNumber === 1` または直前の周回番号の有効チェックポイントが存在するレコード。
- 最初の記録が2周目以降なら、その最初の `lapTimeSec` は複数周の合算の可能性があるためラップ/ペースから除外する。累積差と周回終了順位には使える。
- `lapNumber` 欠落、非数、0以下、重複は表示位置を確定できないため計算対象外にする。重複時はその番号を曖昧な値として除外し、別周回には影響させない。
- 中間欠損と選手の終了後は値を補完しない。Rechartsにも `connectNulls={false}` を明示する。
- x軸の周回番号は1位選手だけでなく、レース内の有効チェックポイントの和集合を昇順にする。

### 4.2 結果・順位・ステータス

- `finished` かつleaderと同じ最終周回: `finalPosition` を順位、leaderは最終累積タイム、それ以外はleaderとの差を結果として表示する。
- `finished` かつleaderより少ない最終周回: `finalPosition` は順位として表示し、時間差の代わりに `-N周` を結果として表示する。
- `dnf`: `finalPosition` を順位として表示しない。statusは `DNF`。有効チェックポイントがあれば「N周目まで」「最終通過M位」、なければ「周回記録なし」とする。
- DNFの差を出す場合は、leaderに同じ `lapNumber` のチェックポイントがある場合だけ「離脱時点の差」として返す。別終了点へのフォールバックはしない。
- `dataQuality: error` または有効周回なしでもリザルト行から削除しない。分析対象にした場合は既存の理由表示を出す。
- 現行JSONに公式結果文字列がないため、UIで「公式タイム」とは呼ばない。結果表に「周回データに基づく表示」と注記する。

### 4.3 カテゴリーと検索

- 参加人数は選択中raceの `riders.length`。必要なら完走・DNF内訳を併記する。
- 正式カテゴリー名は現行データに存在しない。Phase 1では `MeetCategory.name` / `RaceResult.category` をそのまま表示し、推測マッピングを追加しない。
- 検索対象は「選択中カテゴリーの選手名」のみ。NFKC正規化、全空白除去、英字小文字化を検索語と氏名の双方に適用する。
- `riderId` はゼッケンではないため、ゼッケン検索として扱わない。

## 5. 実装方針

採用するのは、既存コンポーネントとローカルstateを保った漸進的変更である。

- 新しいstate管理ライブラリは導入しない。
- データ意味論は `lib/dataTransform.ts` の純粋関数へ集約する。
- 結果一覧は責務を分けるため、小さな新規 `RaceResultsTable` として追加する。
- テスト対象は純粋関数に限定し、`node:test` を `tsx` 経由で実行する。Vitest/Testing Library一式はPhase 1には追加しない。
- 404だけは現在のClient Component構造が実HTTP statusを妨げる。`app/race/[meetId]/page.tsx` に大会存在確認だけを移し、`RaceViewer` とレースJSON取得はClient Componentのまま保つ。
- アクセシビリティ修正は共通UI primitiveの全面変更ではなく、Phase 1で触る主要操作の呼び出し側に限定する。

## 6. 実装Step

### Step 1 — 周回データ契約と変換テストを固定する

| 観点 | 計画 |
|---|---|
| 何を変更するか | 有効チェックポイント、有効な単周タイム、周回番号Map、レース周回和集合、結果表示モデルを純粋関数化し、gap/pace/summaryを同一ルールへ揃える |
| なぜ | 配列位置による誤突合、異なる終了点の差、型どおりでない実データによる静かな誤表示を先に止めるため |
| 対象ファイル | `lib/types.ts`, `lib/dataTransform.ts`, `tests/dataTransform.test.ts`（新規）, `package.json`, `package-lock.json` |
| 対象component / function | `getGapAtRiderFinish`, `getRiderSummary`, `getRaceLapNumbers`, `buildGapSeries`, `buildPaceDeltaSeries`。新規候補: `getValidCheckpoints`, `getValidTimedLaps`, `buildLapMap`, `getRiderResult` |
| 変更方法 | target riderを毎回添字参照せず `Map<lapNumber, LapRecord>` で結合する。欠損はpropertyを作らない。summary/resultは `finished`、`lapped`、`dnf`、`unavailable` を識別できる値を返す。`tsx` だけをdevDependencyに追加し、`node:test` を使うtest scriptを追加する |
| 期待UX | 同じ周回だけが比較され、DNF・周回遅れ・欠損を完走の時間差と誤認しない |
| desktop | 見た目は原則変えず、値の正確性だけが変わる |
| mobile | desktopと同じ意味論になる。表示幅依存の差はない |
| accessibility | 読み上げ文言の元になるstatus/resultを文字列で返せる |
| 他機能への影響 | 4チャート、SummaryCard、新規結果表が同じ変換関数に依存する。`useComparisonRiders` の選出方法は変えない |
| regression risk | High。符号、1周目以外から始まるデータ、周回遅れ、DNFの既存表示が変わる |

Acceptance Criteria:

- 通常完走者同士は同一 `lapNumber` のみでgap/paceが計算される。
- 比較選手の配列位置がずれても別周回同士を比較しない。
- 中間欠損は前後の値で補完されない。
- 2周目から始まる最初の記録はgap/rankには使われ、lap/paceには使われない。
- DNFの内部 `finalPosition` が公式順位として結果モデルへ出ない。
- 周回遅れのfinished riderは `lapDeficit > 0` となり、時間差と区別される。
- `lapNumber` 欠落、0秒、重複、空配列、`dataQuality: error` のfixtureで例外を出さず安全な値を返す。
- `npm test` が追加した全テストを非watchで完了する。

### Step 2 — ステータス表示とレスポンシブなリザルト表を追加する

| 観点 | 計画 |
|---|---|
| 何を変更するか | カテゴリー選択直後に、順位・選手・結果・ステータスを表示する一覧を追加し、選手名/分析操作から既存の `selfRiderId` を選択する。SummaryCardもStep 1の結果モデルに合わせる |
| なぜ | 通常結果を見るだけでも選手選択とチャート読解が必要な現状を解消し、DNFの内部連番を隠すため |
| 対象ファイル | `components/RaceResultsTable.tsx`（新規）, `components/RaceViewer.tsx`, `components/SummaryCard.tsx`, `lib/types.ts`, `lib/dataTransform.ts` |
| 対象component / function | 新規 `RaceResultsTable`; `RaceViewer` の結果表配置と `setSelfRiderId`; `SummaryCard`; Step 1の `getRiderResult` / `getRiderSummary` |
| 変更方法 | 意味的な `<table>` を使い、列は4つに固定する。選手名を44px以上のbuttonにし、選択中は `aria-pressed`、チェック/「分析中」、太字・枠を併用する。表は縦方向だけをスクロール可能な上限高を設け、横スクロールを使わない。行選択後も既存の選手selector、summary、chartを使う |
| 期待UX | カテゴリーを開くだけで結果全体を確認でき、興味のある行から同じ分析画面へ進める |
| desktop | 結果表を分析ワークスペースの前に全幅で置く。列見出しと4列を表示し、分析UIは既存の2カラムを維持する |
| mobile | 順位・短い選手名・結果・statusが390px内に収まる。長い氏名は折返し、所属列などは追加しない |
| accessibility | table caption、scope付きheader、buttonの具体的なaccessible name、文字によるstatusを提供する。選択を色だけで示さない |
| 他機能への影響 | 選択stateは既存 `selfRiderId` を共有するため、検索・前後移動・summary・chartと同期する |
| regression risk | Medium。68人表の高さ、長い氏名、selected state同期、DNF/周回なしの表示が主なリスク |

Acceptance Criteria:

- 選手未選択でも結果表が表示される。
- finished同一周回、finished周回遅れ、DNF、周回なし、dataQuality errorが別表示になる。
- DNF行の順位欄に内部連番が出ない。
- Desktopで4列の対応が崩れず、表から選んだ選手がsummary/chartへ反映される。
- Mobile 390pxでページまたは表の横スクロールが発生しない。
- keyboardだけで結果行を選べ、選択状態が読み上げと見た目の両方で分かる。
- 1人、4人、68人のカテゴリーで空き過ぎ・過密・無限高にならない。
- データ0人では見出しを保ったempty stateを表示し、分析UIは選手選択を要求しない。

### Step 3 — モバイルの大会一覧と見出しの文字切れを解消する

| 観点 | 計画 |
|---|---|
| 何を変更するか | 大会一覧をモバイルでは日付/シリーズの補助行＋折返し可能な大会名の2段表示にし、大会ページ上部の大会名・race名も折り返す |
| なぜ | 入口で大会を識別できず、誤った大会を開く可能性があるため |
| 対象ファイル | `components/MeetSelector.tsx`, `components/RaceViewer.tsx`, `components/RaceHeader.tsx` |
| 対象component / function | `MeetSelector` のfiltered list、`RaceViewer` の戻るリンク横の大会名、`RaceHeader` の `<h1>` |
| 変更方法 | モバイルの `overflow-x-auto`, `min-w-[42rem]`, `whitespace-nowrap` を外す。リンクをモバイル2段、`sm` 以上で現行3列へ戻す。見出しはモバイルで `whitespace-normal break-words`、desktopだけ必要に応じ1行省略を維持する |
| 期待UX | 横スワイプなしで大会名を読んで選べる |
| desktop | 日付・シリーズ・大会名の3列構成と一覧密度を維持する |
| mobile | 大会名を主情報として複数行表示し、カード幅内に収める |
| accessibility | 各大会は引き続き1つのLink。focus-visible輪郭を追加し、hoverだけに依存しない |
| 他機能への影響 | season/series filter、開催日降順、0件表示、リンク先は変えない |
| regression risk | Low〜Medium。非常に長い大会名と英数字の連続、desktopの列幅が主なリスク |

Acceptance Criteria:

- Mobile 320px/390pxで大会名・大会見出し・race見出しが横方向に切れない。
- 大会一覧に横スクロールが発生しない。
- Desktop 1280px以上で日付、シリーズ、大会名を走査しやすい3列が維持される。
- season変更時のseries解除、件数表示、開催日降順、0件empty stateが従来どおり動く。
- keyboard focusが各大会リンクで視覚的に分かる。

### Step 4 — 初見向けラベル、検索正規化、カテゴリー変更時stateを整える

| 観点 | 計画 |
|---|---|
| 何を変更するか | 「あなた」を「注目選手」または実名へ変更し、選択中カテゴリーの人数、検索範囲、`±N` の意味と現在人数を表示する。氏名検索を正規化する。カテゴリー変更時に比較modeを2へ戻す |
| なぜ | ログイン本人と誤認する、検索対象と比較数の意味が分からない、`all` が別カテゴリーへ残る問題を解消するため |
| 対象ファイル | `lib/search.ts`（新規）, `tests/search.test.ts`（新規）, `components/RaceViewer.tsx`, `components/RaceHeader.tsx`, `components/RiderSelector.tsx`, `components/ComparisonAdjuster.tsx`, `components/ChartTabs.tsx`, `components/RankBumpChart.tsx`, `components/GapChart.tsx`, `components/PaceChart.tsx`, `components/LapTimeChart.tsx` |
| 対象component / function | `RiderSelector.filtered`, `RaceViewer.changeCategory`, `ComparisonAdjuster`, chart legend/reference labels、`ChartTabs.TABS` |
| 変更方法 | `normalizeSearchText` をNFKC→空白除去→小文字化で実装し、query/name双方へ適用する。検索欄に「E1内の選手名を検索」等の常時label/descriptionを付ける。比較説明は現行modeを維持したまま「最終順位の前後2位以内・現在5名」のように出す。category headerに `N名（完走X / DNF Y）` を表示する。`changeCategory` で `comparisonMode=2` に戻す |
| 期待UX | 誰を中心に何人と比較しているか分かり、氏名の空白や全半角を意識せず検索できる |
| desktop | 既存のcompactな左カラム内に補助文を追加するが、比較UIの機能は変えない |
| mobile | 短い説明を折り返し、横幅を増やさない。検索時の自動focus方針は維持する |
| accessibility | placeholder依存をやめ、label/descriptionをinputと関連付ける。実名と役割を文字で伝える |
| 他機能への影響 | 任意比較やmode種類は変更しない。Chartの初期tabも変更しない |
| regression risk | Medium。日本語空白、全角英数、選手変更、カテゴリー変更後のstate同期が主なリスク |

Acceptance Criteria:

- `横山 航太` を `横山航太`、全角空白を含む入力、大小文字が異なる英字入力で検索できる。
- 検索対象が現在のカテゴリー内の氏名であると常時分かる。
- 画面上とchart legend/説明から「あなた」がなくなり、注目選手名または「注目選手」になる。
- 選択中カテゴリーの参加人数とfinished/DNF内訳が表示される。
- `±2` が順位範囲であり、実際の表示人数が端の順位では変わることを文言で理解できる。
- `all` 選択後にカテゴリーを変更すると、選手未選択かつmode 2へ戻る。
- 正式名称・所属・ゼッケンを推測表示・推測検索しない。

### Step 5 — 取得失敗、実再試行、not found、一覧復帰を分離する

| 観点 | 計画 |
|---|---|
| 何を変更するか | hookのerrorを種別付きにし、実fetchを再実行するretryを返す。大会routeでmeet存在確認だけをServer Componentへ移し、`notFound()`、route error UI、一覧リンクを追加する |
| なぜ | 現状は通信失敗・不正ID・不正JSONが同じで、再試行Linkも再取得を保証しないため |
| 対象ファイル | `lib/dataSource.ts`（新規）, `hooks/useMeetData.ts`, `hooks/useRaceData.ts`, `app/page.tsx`, `app/race/[meetId]/page.tsx`, `app/race/[meetId]/not-found.tsx`（新規）, `app/race/[meetId]/error.tsx`（新規）, `components/RaceViewer.tsx` |
| 対象component / function | `useMeetData`, `useRaceData`, `Home`, `RacePage`, `RaceViewer` error branch。新規候補: `DataLoadErrorKind`, `fetchMeetById` |
| 変更方法 | `not-found` / `network` / `http` / `invalid-data` を区別する。hookはretry counterまたはcallbackで同じURLを再fetchし、buttonから呼ぶ。race pageはNext 16のasync `params` を受け、meets取得成功後にIDがなければ `notFound()`。通信/JSON不正はthrowして `error.tsx` の `retry()` で再取得する。レースJSON取得は従来どおりclient hookに残す |
| 期待UX | 一時障害はその場で再試行でき、存在しない大会はその旨が分かり、必ず一覧へ戻れる |
| desktop | alert内に主操作「再試行」と副操作「大会一覧へ」を横並びで表示できる |
| mobile | 操作を縦積みまたは十分な幅/高さで表示し、行き止まりを作らない |
| accessibility | error alertを文字で説明し、button/linkの役割を分ける。再試行中はdisabledとlive statusを出す |
| 他機能への影響 | race routeの大会一覧取得だけserverへ移る。RaceViewer、カテゴリーstate、レースJSONのclient fetch、homeのclient filterは維持する |
| regression risk | High。Next.jsのServer/Client境界、404 status、fetch失敗時のerror boundary、retryの多重実行が主なリスク |

Acceptance Criteria:

- 存在するmeet URLは従来どおりRaceViewerを表示する。
- 存在しないmeet IDは専用not-found UIと大会一覧リンクを表示し、可能な非stream応答ではHTTP 404になる。
- meets取得の通信/5xx失敗を「大会が存在しない」と表示しない。
- race JSONの404、通信失敗、不正JSON/最低限のshape不正で異なる説明を表示する。
- 「再試行」はページ内stateのまま実際にfetchを再実行し、連打中は多重実行しない。
- homeの大会一覧取得失敗にも実再試行がある。
- すべてのerror/not-found stateから大会一覧へkeyboardで戻れる。
- SSR、全raceデータのserver fetch、cache戦略、metadata/OGは変更しない。

### Step 6 — チャートを実測点に忠実な線へ変更する

| 観点 | 計画 |
|---|---|
| 何を変更するか | 順位をstep線、gap/pace/lapをlinear線にし、実測点を表示、欠損非接続を明示する |
| なぜ | `monotone` が周回間の未計測変化を示唆し、欠損・終了点を誤読させるため |
| 対象ファイル | `components/RankBumpChart.tsx`, `components/GapChart.tsx`, `components/PaceChart.tsx`, `components/LapTimeChart.tsx`, `lib/dataTransform.ts` |
| 対象component / function | 各 `<Line>`、`RankBumpChart.data`, `LapTimeChart.data`, `buildGapSeries`, `buildPaceDeltaSeries` |
| 変更方法 | Rankは `type="stepAfter"`、他は `type="linear"`。`connectNulls={false}` を全Lineに付ける。混雑時も注目選手の実測点は残し、他系列は小さい点またはactive dotで値の所在を示す。x軸はStep 1の周回和集合を使う |
| 期待UX | 値が測られた周回と線の終わりを正確に読める |
| desktop | chartサイズ・tab数・初期tabを変えず、線形状だけを正す |
| mobile | 点が小さすぎないようactive dotを維持するが、tooltip設計の全面変更はしない |
| accessibility | 色だけでなく線形状、太さ、点、実名ラベルを併用する。chart containerに短いaccessible name/summaryを付ける |
| 他機能への影響 | 現行4tab、comparison mode、色割当は維持。ペース置換やタイム差改名はPhase 2以降 |
| regression risk | Medium。step方向、gap符号、欠損前後の線、密集時の点が主なリスク |

Acceptance Criteria:

- 順位チャートに曲線がなく、各周終了時の順位として読めるstep線になる。
- gap/pace/lapに曲線補間がなく、実測点が視覚的に分かる。
- 中間欠損と選手終了後を線で接続しない。
- DNFは最終有効チェックポイントで線が止まる。
- 1人だけのカテゴリーで順位・lap chartが崩れず、比較相手が必要なtabは既存empty stateを表示する。
- 8人程度と15人以上でレンダリングエラーがなく、注目選手を見失わない。
- chartのデータ計算テスト、lint、buildが通る。

### Step 7 — フォーム、タップ領域、focus、コントラストを横断確認する

| 観点 | 計画 |
|---|---|
| 何を変更するか | Phase 1で触る全操作にlabel関連付け、44px相当の主要タップ領域、focus-visible、十分な文字/線コントラスト、非色依存の選択表示を適用する |
| なぜ | 新しい結果表だけでなく、入口からchartまでkeyboard/touchで一貫して操作できる必要があるため |
| 対象ファイル | `components/MeetSelector.tsx`, `components/RaceViewer.tsx`, `components/RiderSelector.tsx`, `components/RaceResultsTable.tsx`, `components/ComparisonAdjuster.tsx`, `components/ChartTabs.tsx`, 各chart, `lib/chartColors.ts`, `app/globals.css` |
| 対象component / function | season/series/category Select、search Input、前後Button、ToggleGroup、TabsTrigger、結果行button、chart legend/labels |
| 変更方法 | Select triggerに安定したid、labelにhtmlFor、補足にaria-describedbyを付ける。主要controlはモバイルで最低44px、desktop密度は必要に応じ32〜36pxを維持する。既存の低コントラスト `text-ink/40〜55` と小文字の `text-flag` をtokenへ置換する。chart paletteは白/紙背景に3:1以上、通常文字は4.5:1以上を実測する。active状態にチェック、太字、枠、underline等を追加する |
| 期待UX | touch、mouse、keyboardで同じ操作と選択状態へ到達できる |
| desktop | 情報密度を大きく下げず、focus時だけ明確なringを表示する |
| mobile | 前後移動、Select、比較toggle、chart tab、結果行が押しやすくなる |
| accessibility | WCAG 2.2 AAを基準に、label、focus、target size、contrast、非色依存を満たす。詳細chart data tableはPhase 2のlap表と合わせる |
| 他機能への影響 | `components/ui/*` の既定variant/sizeは原則変更しないため、未確認画面への波及を抑える |
| regression risk | Medium。高さ増加によるmobile縦長化、token変更による全体色、Base UIのid/aria伝播が主なリスク |

Acceptance Criteria:

- season、series、category、searchが読み上げ可能な常時labelと関連付く。
- Tab順が大会filter→大会一覧→戻る→category→result→選手/比較→chart tabの視覚順と大きく逆転しない。
- 主要操作のfocus-visibleが背景色だけでなくring/outlineで分かる。
- Mobileの主要タップ領域が原則44×44px以上になる。
- Toggle/tab/result選択が色を見なくてもテキスト、チェック、underline、太さのいずれかで判別できる。
- 通常本文・補助文字は4.5:1以上、chart線など非テキストは3:1以上を満たす。
- prefers-reduced-motion利用者に新しいsmooth scroll/不要なanimationを追加しない。
- keyboardだけで結果選択、選手変更、比較mode、chart tab、再試行、一覧復帰を完了できる。

## 7. 依存関係と実装順序

```text
Step 1 データ契約・テスト
  ├─> Step 2 ステータス・結果表
  └─> Step 6 チャート表現

Step 3 モバイル入口 ─┐
Step 4 ラベル・検索 ─┼─> Step 7 横断アクセシビリティ確認
Step 5 エラー復旧 ───┤
Step 2 結果表 ───────┤
Step 6 チャート ─────┘
```

推奨順は `1 → 2 → 3 → 4 → 5 → 6 → 7` とする。Step 3〜5はStep 1と技術的には独立だが、1つずつ実装・検証する。Step 7は先送りではなく、各Stepで基本対応した後の取りこぼし確認である。

各Stepは個別コミット可能な単位にし、少なくとも `npm test` と `npm run lint` を通してから次へ進む。Step 1、5、6では追加で `npm run build` を実行する。

## 8. Verification Plan

### 自動検証

- `npm test`: data transformとsearch normalization。
- `npm run lint`: JSX/React/アクセシビリティ上の静的問題。
- `npm run build`: Next.js 16.3.3のroute、Server/Client境界、型、Recharts props。
- 必要に応じ `npx tsc --noEmit`: buildログで型エラー位置が不明な場合の補助。

### 手動検証matrix

| 観点 | 確認内容 |
|---|---|
| Desktop | 1280px以上。大会3列、結果4列、分析2カラム、長い大会名、68人結果表 |
| Mobile | 320px / 390px / 768px境界。横overflowなし、見出し折返し、44px操作、結果4列 |
| Keyboard | Tab/Shift+Tab、Enter/Space、Select矢印、結果選択、前後選手、toggle、tabs、retry、一覧復帰 |
| Loading | homeのmeets、race routeのmeets、categoryのrace JSON。内容が停止に見えず、control連打で競合しない |
| Empty state | filter 0大会、0 rider、比較相手0、周回0、category 0。見出しと戻る導線を保つ |
| Error state | network、HTTP 404/500、invalid JSON、top-level shape不正、dataQuality error。原因と次操作を分ける |
| Not found | 存在しないmeet IDと、存在するmeetの一時取得失敗を混同しない |
| Representative normal race | `MMJ-256-005 / ME1` 相当の8人完走中心ケース |
| DNF | `MMJ-256-005 / ME2` またはDNFが周回あり/なし双方のカテゴリー |
| Large field | `KNS-256-010 / E1` 相当の68人ケース。結果表・検索・all chart |
| Single athlete | `CXK-256-004 / WU15` 相当。1人結果、比較empty、summary/chart |
| Multiple athletes | 1位・中位・最下位、同一周回完走・周回遅れ・DNFを順に選ぶ |
| Data anomaly | `lapNumber` 欠落、0秒、2周目開始をfixtureと実データの双方で確認 |
| Chart | 4tabすべてでlinear/step、実測点、線の終了、tooltip値、注目選手名 |
| Contrast | 紙/白背景に対する文字4.5:1、線・focus 3:1を計測する |

### 重点シナリオ

1. 390pxで大会を横スクロールせず選び、カテゴリー変更後すぐ結果を確認し、結果行から選手を分析する。
2. DNF選手を選び、内部順位が出ず、「最終通過」「N周目まで」「離脱時点の差」が通常完走と区別される。
3. winnerより周回が少ないfinished riderを選び、DNFではなく順位＋`-N周`になる。
4. `all` 選択後にカテゴリーを変更し、modeと選手が安全な初期状態へ戻る。
5. keyboardだけで検索・結果選択・chart切替・error再試行・一覧復帰を行う。

## 9. Scope Guard

### Phase 1に含めない

- 任意の比較選手追加・削除、比較上限5人、主選手/固定比較/集団の新stateモデル（Phase 2）。
- 全員表示を中央値・四分位帯へ置換すること（Phase 3実験）。
- URLへのseason/category/rider/comparison/tab同期（Phase 2）。
- タイム差を初期tabにする実験、ギャップの改名、1周得失tooltip統合（Phase 2〜3）。
- 現行ペースchartの削除、発散棒、安定性プロフィール、失速ランキング（Phase 3またはReject）。
- lap table、fastest lap、平均lap、最大得失要約（Phase 2）。
- chart下固定詳細、完全なkeyboard tooltip、全chart値の代替data table（Phase 2）。Phase 1はaccessible name/summaryと結果表まで。
- 全画面のServer Component化、全race server fetch、cache/revalidate設計、dynamic import、metadata/OG（Later）。
- 公式結果リンク、更新日時・対象期間。現行データにURL/信頼できる更新メタデータがなく、統合roadmapではPhase 2に配置されている。
- カテゴリー正式名称の静的推測map。検証済みupstream fieldが追加された後に扱う。
- 所属・ゼッケン検索。現行Riderに該当fieldがない。
- DNS/DSQ/OTL等のstatus追加。現在のcollectorはDNSを除外し、実データstatusはfinished/dnfだけである。
- runtime schema library、state管理library、design system、directory再編、全component書き換え。
- data collector側の再収集・スキーマ変更。`lapNumber` 欠落450件はviewerで安全に除外し、upstream修正は別計画とする。

### 最小限の構造変更を認める理由

- `RaceResultsTable` 新設: `RaceViewer` にtable描画・status分岐・選択操作まで追加すると責務がさらに集中するため。1つの表示責務だけを切り出す。
- race pageの部分的Server Component化: `notFound()` はNext.js 16.3.3ではServer Component / Server Function / Route Handlerで使う仕様であり、実404を返すには現在の全面Client Componentが妨げになるため。大会存在確認だけに限定する。
- `tsx` 追加: Phase 1必須のTypeScript純粋関数テストを既存のNode対応範囲で実行するため。React UI test一式より依存を小さくする。

## 10. 変更予定ファイル

### 新規

- `components/RaceResultsTable.tsx`
- `lib/search.ts`
- `lib/dataSource.ts`
- `tests/dataTransform.test.ts`
- `tests/search.test.ts`
- `app/race/[meetId]/not-found.tsx`
- `app/race/[meetId]/error.tsx`

### 既存変更

- `package.json`
- `package-lock.json`
- `lib/types.ts`
- `lib/dataTransform.ts`
- `lib/chartColors.ts`
- `hooks/useMeetData.ts`
- `hooks/useRaceData.ts`
- `app/page.tsx`
- `app/globals.css`
- `app/race/[meetId]/page.tsx`
- `components/MeetSelector.tsx`
- `components/RaceViewer.tsx`
- `components/RaceHeader.tsx`
- `components/RiderSelector.tsx`
- `components/SummaryCard.tsx`
- `components/ComparisonAdjuster.tsx`
- `components/ChartTabs.tsx`
- `components/RankBumpChart.tsx`
- `components/GapChart.tsx`
- `components/PaceChart.tsx`
- `components/LapTimeChart.tsx`

`components/ui/*` は原則変更しない。実装時にBase UI側の属性伝播でどうしても関連付けできないことが確認された場合だけ、該当primitiveに限定した別提案を行う。

## 11. 最大のリスク

最大のリスクは、現行JSONの型が実データを正確に表していないことである。特に `lapNumber` 欠落とDNFの内部連番を、TypeScriptの型アサーションだけで正常値として扱うと、結果表を追加することで誤情報がより目立つ形になる。

対策は、Step 1をUIより先に行い、異常レコードを補完・推測せず除外し、結果/summary/chartが同じ純粋関数を使い、実データ境界ケースを自動テストすることである。

次点は、真の404のためのroute境界変更である。ここはStep 5単独でbuildと実HTTP応答を確認し、全データ取得のserver移行へ範囲を広げない。

## 12. 実装開始前の承認ポイント

この計画で実装する場合、次の判断を承認対象とする。

1. 正式カテゴリー名、所属、ゼッケン、公式結果文字列はデータがないためPhase 1で推測実装しない。
2. DNF内部順位は非表示、周回遅れfinishedは順位＋`-N周`、DNFは最終通過情報を表示する。
3. 結果表は新規componentにし、現行の選手selectorと分析UIを残す。
4. 実404のため、大会存在確認だけをrace pageのServer Componentへ移す。
5. テスト用devDependencyは `tsx` 1つに限定する。

承認後も、各Stepを個別に実装・検証し、Phase 2 / Phase 3へ範囲を広げない。
