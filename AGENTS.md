<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 開発者について

個人開発者。予算に限りがあるため、コストと品質のバランスを重視する。

# モデル運用方針

- 通常のコーディング作業（実装・デバッグ・リファクタ）はTerraを使用する
- 単純作業（フォーマット、簡単な文字列置換、ログ確認、一問一答の質問）はLunaに切り替えて良い
- 大規模な変更やアーキテクチャ判断が必要な場合は、着手前に必ず計画（Plan）を提示し、承認を得てから実行する
- 迷ったら軽い方に倒さず、実装の正しさを優先する（手戻りの方がコストが高いため）

# 作業の進め方

- 複数ファイルにまたがる変更や、破壊的な変更（ファイル削除、DBスキーマ変更、依存関係の大規模更新など）を行う前は、必ず確認を取ってから実行する
- 不明点がある場合は、憶測で進めずに質問する
- 変更後は可能な範囲で自己検証する（テストがあれば実行、なければ簡単な動作確認の手順を示す）

# コーディングスタイル全般

- コメントは必要最小限にし、コードの意図が分かりにくい箇所にのみ書く
- 既存のコードスタイル・命名規則がある場合はそれに合わせる（迷ったらプロジェクト側のAGENTS.mdを優先）

# 触ってはいけないもの

- `.env` や認証情報を含むファイルは読み書きしない・出力しない
- gitの設定（`.git`内部）を直接操作しない

# コミュニケーション

- 説明は簡潔に。長い前置きは不要
- 日本語で応答する

# 2026-09-01 作業記録

## 完了した内容

- 大会選択画面を追加した。開催日の降順で開催日・シリーズ・大会名を表示し、シーズンとシリーズで絞り込める。
- 大会を選ぶと `/race/[meetId]` のリザルト可視化画面へ遷移する。
- リザルト画面でカテゴリーを選択でき、AJOCCの大会ページに掲載されているカテゴリー順をそのまま利用する。
- データ収集側で `meets.json` を生成し、ビューアが大会一覧とカテゴリー情報を取得する構成にした。
- 25-26シーズンの実データを収集・検証した。66大会、1,192カテゴリー分のJSONがあり、対応するリザルトJSONの欠落は0件。
- 変更は以下のコミットで反映済み。
  - 設計書: `b4faf39 docs: add meet filter design`
  - データ収集側: `9a2bfb9 feat: add season meet metadata and results`
  - ビューア側: `c7e2d47 feat: add meet and category selection`
- ビューアはVercel本番環境へデプロイ済み。公開URLは `https://cyclocross-viewer.vercel.app/`。
- ビューアのlint・build、データJSONの整合性確認を実施済み。

## 次回の優先作業

1. 公開環境で大会一覧の読み込み、シーズン・シリーズ絞り込み、大会遷移、カテゴリー切り替えを実際に操作してデバッグする。
2. 25-26シーズンの代表的なシリーズ・カテゴリーで、表示名とカテゴリー順がAJOCCの大会ページと一致するか確認する。
3. GitHub Actionsの定期実行と手動実行を確認し、新しい大会・カテゴリーが追加された場合に `meets.json` とリザルトJSONが更新されることを確認する。
4. 取得失敗した大会の扱い（現在はカテゴリー情報が取れない3大会）を確認し、必要なら再取得やエラー表示を改善する。

## 注意事項

- ビューアは `https://raw.githubusercontent.com/tai1729/cyclocross-data-collector/main` から `meets.json` とリザルトJSONを取得する。
- ローカル作業時にGitのsafe.directoryエラーが出る場合は、各コマンドに `git -c safe.directory=C:/Users/tai/projects/<repo>` を付ける。
- `AGENTS.md` と `next.config.ts` には今回の機能以外の既存未コミット変更があるため、次回も内容を確認してから扱う。
