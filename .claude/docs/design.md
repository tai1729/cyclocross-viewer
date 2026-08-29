# 設計書：AJOCCシクロクロス ラップタイム可視化アプリ

対応する要件は `requirements.md` を参照。

## 1. システム構成

2つのリポジトリに分離する。データの鮮度とアプリのデプロイサイクルを完全に独立させることが狙い。

```
[リポジトリA: cyclocross-data-collector]
  GitHub Actions（scheduled workflow, 10〜15分おき）
   └─ data.cyclocross.jp のCSVをサーバー側でfetch（CORS制約を受けない）
   └─ CSVパターン（累積時間 / ラップタイム）を判定し、統一スキーマへ正規化
   └─ 正規化済みJSONを自リポジトリにcommit & push
        （このリポジトリは「JSONを配るためだけの倉庫」）
              │
              │ raw.githubusercontent.com 経由で配信
              │ （GitHubのraw配信はCORS許可 = Access-Control-Allow-Origin: *）
              ▼
[リポジトリB: cyclocross-viewer]
  Next.js、Vercelにデプロイ
   └─ ページ表示時にクライアント側でJSONをfetch（ビルド時取り込みではない）
   └─ UIコードの変更時だけVercelを再デプロイすればよい
```

### 採用理由

- Vercel Hobbyプランの無料Cron Jobsは実質1日1回程度までの制限があり、10分間隔の要件を満たせない → 収集はGitHub Actionsに寄せる
- リポジトリを分離し、フロントは実行時にJSONをfetchする構成にすることで、データ更新のたびにフロントを再デプロイする必要がなくなる

## 2. リポジトリA: cyclocross-data-collector

### 2.1 技術選定

- **言語**: TypeScript / Node.js
  - フロント（リポジトリB）と型定義・正規化ロジックの設計を揃えやすい
  - GitHub Actionsとの親和性が高い
  - CSVパースは `papaparse` 等を利用
- **実行環境**: GitHub Actions（`schedule`トリガー）

### 2.2 処理フロー

1. 対象race_idのリストを設定ファイル（例: `races.json`）で管理する
2. 各race_idについて `https://data.cyclocross.jp/race/{race_id}` からCSVを取得する
3. CSVの形式を判定する（下記2.3）
4. 統一スキーマ（下記2.4）に変換する
5. `data/race-{race_id}.json` として自リポジトリにcommit & pushする

### 2.3 CSVフォーマットの判定ロジック（叩き台）

2パターンが混在するため、以下のヒューリスティックで判定する。

- **累積時間パターン**: 周回が進むごとに値が単調増加し、後半の値が「周回数 × 想定ラップタイム」程度まで大きくなる
- **ラップタイムパターン**: 各周回の値が概ね近い範囲（数分程度）に収まる

判定不能・値が異常（前の周回より大幅に減少する等）な場合は、当該選手・当該周回をエラーデータとして除外し、UI側でエラー表示に回せるようフラグを持たせる。完璧な自動判定は目指さず、「明らかにおかしい時は弾く」程度の割り切りとする。

### 2.4 正規化後のJSONスキーマ（案）

```json
{
  "raceId": "27160",
  "raceName": "string",
  "category": "string",
  "updatedAt": "ISO8601",
  "riders": [
    {
      "riderId": "string",
      "name": "string",
      "finalPosition": 5,
      "laps": [
        {
          "lapNumber": 1,
          "lapTimeSec": 312,
          "cumulativeTimeSec": 312,
          "rankAtLap": 3
        },
        {
          "lapNumber": 2,
          "lapTimeSec": 305,
          "cumulativeTimeSec": 617,
          "rankAtLap": 4
        }
      ],
      "dataQuality": "ok"
    }
  ]
}
```

- `lapTimeSec` と `cumulativeTimeSec` を両方持たせることで、フロント側はどちらのグラフでも計算し直さずに使える
- `rankAtLap` は順位推移バンプチャート（機能⑤）にそのまま使う
- `dataQuality` に異常値フラグを持たせ、フロント側で警告表示に使う

## 3. リポジトリB: cyclocross-viewer

### 3.1 技術選定

- Next.js（Static Export相当の構成）
- ホスティング: Vercel
- グラフライブラリ: Recharts

### 3.2 画面レイアウト（スマホ縦画面、1画面完結SPA）

```
┌─────────────────────────┐
│ [レース名/カテゴリ] ▼    │ ← ヘッダー(sticky)
├─────────────────────────┤
│ 🔍 選手を選択            │ ← 選手選択エリア(sticky)
├─────────────────────────┤
│ 順位: 5位 / 32名          │ ← サマリーカード(常時表示)
│ トップ差: +1'23"          │
│ 昇格圏(3位)差: +0'41"     │
├─────────────────────────┤
│ [順位] [ギャップ] [ラップ] │ ← タブ切替
├─────────────────────────┤
│   (選択タブに応じてグラフ表示) │
├─────────────────────────┤
│ [比較対象: 自分+前後2名] 🔧│ ← 比較対象の微調整(任意)
└─────────────────────────┘
```

### 3.3 コンポーネント構成

```
app/
 └─ page.tsx                     … トップレベル、状態管理のオーケストレーション

components/
 ├─ RaceHeader.tsx                … レース名・カテゴリ表示
 ├─ RiderSelector.tsx             … 選手検索・選択UI
 ├─ SummaryCard.tsx               … 順位/トップ差/昇格圏差
 ├─ ChartTabs.tsx                 … タブ切替コンテナ
 │   ├─ RankBumpChart.tsx         … 順位推移バンプチャート
 │   ├─ GapChart.tsx              … ギャップチャート
 │   └─ LapTimeChart.tsx          … ラップタイム推移
 └─ ComparisonAdjuster.tsx        … 比較対象の追加/削除（任意機能）

hooks/
 ├─ useRaceData.ts                … リポジトリAのJSONをfetch＆キャッシュ
 └─ useComparisonRiders.ts        … 「自分選択→前後2〜3名自動選出」ロジック

lib/
 ├─ dataTransform.ts              … ギャップ計算等、表示用の追加加工ロジック
 └─ types.ts                      … Rider, LapRecord, RaceResult 等の型定義（リポジトリAのスキーマと対応させる）
```

### 3.4 データ取得方法

- `useRaceData.ts` 内で `fetch("https://raw.githubusercontent.com/{org}/cyclocross-data-collector/main/data/race-{raceId}.json")` を実行する
- ビルド時ではなく実行時（クライアントサイド）にfetchすることで、データ更新とフロントのデプロイを分離する

## 4. 未確定事項・次のステップ

- race_idの一覧をどう管理するか（手動追加 / meetページから自動取得するか）は未確定。MVP-0では手動管理で十分
- `dataQuality` が異常な場合のUI表示方法は未設計。MVP-0では簡易的な非表示扱いでよい
- リポジトリAのJSON蓄積によるリポジトリ肥大化は、MVP規模（数レース分）では問題にならない想定
