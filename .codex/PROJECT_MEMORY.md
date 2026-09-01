# AJOCC Lap Time Viewer: 開発引き継ぎメモ

最終更新: 2026-08-31

## リポジトリ構成

| 役割 | ローカル | GitHub | 状態 |
| --- | --- | --- | --- |
| ビューア | `01_ajocc-laptime-viewer` | `tai1729/cyclocross-viewer` | Next.js + TypeScript + Recharts。Vercelへデプロイ済み。 |
| 収集基盤 | `02_ajocc-data-collector` | `tai1729/cyclocross-data-collector` | Node.js + TypeScript。GitHub Actionsで収集。 |

このワークスペースはビューア側。collectorは兄弟ディレクトリにあるため、変更時は明示的にそちらへ移動する。

## 完了済み

### ビューア（MVP-0）

- 選手選択、前後順位へのワンタップ移動、選択リスト再表示時の選択選手への自動スクロール。
- サマリーカード（順位、トップ差、昇格圏差）。
- 順位、累積ギャップ、周回ごとのペース差、ラップタイムの4グラフ。
- 比較対象の切替: ±0 / ±1 / ±2 / ±3 / ±4 / ±5 / 全員。デフォルトは±2。
- モバイル優先。PC幅では左サイドバー＋右のグラフ領域となる2カラム。
- 実データは`raw.githubusercontent.com`から実行時に取得する。

### 収集基盤（MVP-1）

- `data.cyclocross.jp`には直接取得できるCSVがないため、HTMLの`table__result`と`table__laptime`をCheerioでスクレイピングする。
- DNFは部分ラップデータを保持して取り込む。DNSは除外する。
- ラップ表に最終周のタイムがない完走者は、結果表の正式ゴールタイムから最終周を補完する。
- 周回遅れの選手は実際にラップ数が少ないため、欠損として補完しない。
- `rankAtLap`は周回ごとの累積タイムから再計算する。

## 現在のMVP-1拡張

collectorのコミット `1024ad3` で、全国・全カテゴリの自動発見と開催日限定の収集を実装済み。

### 追加したファイル・役割

- `lib/raceConfig.ts`: `RaceEntry`、JST日付処理、JSON設定の読み書き。
- `scripts/updateSchedule.ts`: AJOCCカレンダーから開催日を抽出し、収集workflowのcronを生成。
- `scripts/discover.ts`: `data.cyclocross.jp/meet`から未発見大会を探し、全カテゴリーのrace_idを追加。
- `race_days.json`: カレンダーから抽出した開催日一覧。
- `known_meets.json`: 展開済み大会スラッグの重複防止用一覧。
- `.github/workflows/update-schedule.yml`: 月次のカレンダー更新用workflow。

### 設定形式

`races.json`は旧来の`string[]`ではなく、以下の形式。

```json
[
  { "raceId": "27160", "meetDate": "2026-02-08" }
]
```

### GitHub Actionsの挙動

- `Update race collection schedule`
  - 毎月1日 09:00 JSTに実行。
  - `workflow_dispatch`あり（手動実行可）。
  - `https://www.cyclocross.jp/calendar/`から開催日を取得。
  - `collect.yml`の`BEGIN/END GENERATED RACE SCHEDULE`間だけを更新。
- `Collect race data`
  - 開催日当日の09:00〜23:00 JSTに毎時実行。
  - `workflow_dispatch`あり。日付またぎで結果が公開された場合に手動実行する。
  - `discover` → `collect`の順で実行。
  - 同時アクセスは最大5件。
  - 大会日から14日以内のレースを再収集。古いレースはJSON未作成時だけ収集。
  - 一部失敗しても成功分はcommit対象に残す。

### 初回・運用確認

1. GitHub Actionsから`Update race collection schedule`を手動実行し、`race_days.json`と`collect.yml`がbotコミットで更新されることを確認する。
2. `Collect race data`を手動実行し、収集・commitが成功することを確認する。
3. 月途中でカレンダーが変わった場合は、1を手動実行する。

2026-08-31時点ではカレンダーから28日分の開催日を取得済み。次回の開催日は2026-09-21。現在は対象サイトの大会一覧に直近大会がないため、`discover`を実行しても新規レース0件となるのは正常。

## 重要な注意点

- GitHub Actionsでbotがpushした直後は、ローカルpushがnon-fast-forwardで拒否されることがある。`git pull --rebase origin main`で取り込んでから再pushする。
- Actionsがworkflowファイルを更新するにはリポジトリ設定でActionsの`Workflow permissions`を`Read and write permissions`にしておく。
- GitHub Actionsのcronは`timezone: "Asia/Tokyo"`を使っている。UTCへの手動換算は不要。
- 収集基盤の詳細設計書はcollector側の`docs/superpowers/specs/2026-08-29-nationwide-race-discovery-design.md`にある。
- `.env`や認証情報は読み書き・出力しない。

## 次回やること

### 最優先: GitHub Actionsの実運用確認

1. `cyclocross-data-collector`リポジトリのActionsで、`Update race collection schedule`を手動実行する。
2. 成功後、botが`race_days.json`と`.github/workflows/collect.yml`を更新するコミットを作成できたか確認する。
3. 続けて`Collect race data`を手動実行し、`discover`と`collect`が成功することを確認する。
4. 失敗した場合はActionsログを確認する。特にActionsの`Workflow permissions`が`Read and write permissions`か確認する。

### 次の開発候補

- ビューア側で複数レース・カテゴリーを検索・選択できるUIを追加する（現在は`race-27160.json`固定）。
- 収集済みレースの一覧JSONをcollector側で生成し、ビューアがレース一覧を取得できるようにする。
- 収集失敗の通知や、スクレイピング対象HTMLの構造変更を検知する仕組みを検討する。
