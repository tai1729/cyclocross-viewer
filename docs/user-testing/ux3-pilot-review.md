# UX3-0.5 Human User Test Pilot Calibration Review

ステータス: `BLOCKED — PILOT RECORD NOT FOUND`

暫定判定: `UX3-0.5 NEEDS TEST PROTOCOL REVISION`

## Review scope

このレビューの対象はproduct UXではなく、UX3-0の人間ユーザーテストprotocolである。Pilot participant 1名の実記録を根拠に、task文、moderator行動、測定項目、所要時間、記録負荷を校正することを目的とした。

ただし、対象となるPilot recordがこのrepository内で特定できなかった。したがって、以下ではPilot participantの行動・時間・発話・介入・task結果を推測していない。

## Source documents confirmed

次の5つのtest kitは読み込み済みである。

- `docs/user-testing/ux3-test-plan.md`
- `docs/user-testing/ux3-moderator-script.md`
- `docs/user-testing/ux3-participant-record-template.md`
- `docs/user-testing/ux3-observation-sheet.md`
- `docs/user-testing/ux3-results-analysis-template.md`

## Pilot record discovery

### Search scope

- `docs/user-testing/` の全ファイル名と内容
- `docs/` 配下のMarkdown、text、JSONの候補
- repository全体の、`pilot`、`participant`、`user test`、`Participant ID`、`UX3-0.5` 等の文字列
- hidden fileを含む検索。ただし `.git` と `node_modules` は除外

### Found files

見つかったのは次のtemplateだけである。

- `ux3-test-plan.md`
- `ux3-moderator-script.md`
- `ux3-participant-record-template.md`
- `ux3-observation-sheet.md`
- `ux3-results-analysis-template.md`

### Missing evidence

以下を持つPilot実記録は見つからなかった。

- Pilot participant IDまたは背景
- 実施日時、端末、viewport、browser
- Task 0〜6の開始・終了時刻
- participantの発話・hesitation・wrong turn
- moderator intervention
- Ease / Confidence
- critical moment
- post-test interview

この状態では、Pilotが実施済みか、別の場所に保存されているか、記録が未提出なのかをrepositoryだけから判断できない。

## Pilot participant / duration / timeline

| Item | Result |
| --- | --- |
| Pilot participant | `NOT EVALUABLE — record missing` |
| Participant background | `NOT EVALUABLE` |
| Device / viewport | `NOT EVALUABLE` |
| Start / end time | `NOT EVALUABLE` |
| Total duration | `NOT EVALUABLE` |
| Task 0〜6 timeline | `NOT EVALUABLE` |
| Post-test interview | `NOT EVALUABLE` |
| Moderator interventions | `NOT EVALUABLE` |
| Recording burden | `NOT EVALUABLE` |

10〜15分の判定（`TOO SHORT / GOOD / TOO LONG`）は、実測時間なしには行わない。

## Protocol audit result

実Pilotに基づく校正は実施できない。各項目を「問題なし」とは判定せず、`PENDING RECORD` とする。

| Audit area | Result | Reason |
| --- | --- | --- |
| Task wording neutrality | `PENDING RECORD` | participantがどう解釈・反応したか不明 |
| Task realism | `PENDING RECORD` | 自然な目的として理解されたか不明 |
| Task difficulty | `PENDING RECORD` | 完了時間、失敗、介入が不明 |
| Task dependency / learning effect | `PENDING RECORD` | 後続taskで学習効果が出たか不明 |
| Moderator intervention | `PENDING RECORD` | 発言ログが不明 |
| Three-second rule | `PENDING RECORD` | hesitationの種類と回数が不明 |
| Think Aloud | `PENDING RECORD` | 発話量・沈黙・実況化の有無が不明 |
| Measurement feasibility | `PENDING RECORD` | 実際に記録できたか不明 |
| Recording burden | `PENDING RECORD` | moderatorの負荷が不明 |
| Ease / Confidence wording | `PENDING RECORD` | participantの理解が不明 |
| Critical moment template | `PENDING RECORD` | 記録可能性が不明 |
| Post-test interview | `PENDING RECORD` | 重複・疲労・回答価値が不明 |

### Static preflight（Pilot evidenceではない）

test kitの構造上は、Task 0〜6、10〜15分の時間枠、中立質問、M0〜M3介入コード、3秒停止ルール、participant record、横断matrix、P0〜P3分類を定義済みである。しかし、これは資料を読んだ結果であり、Pilotで実運用できたという証拠ではない。

## Task wording audit

Pilot recordがないため、Task 0〜6の各判定は確定しない。

| Task | Static intent | Pilot judgment |
| --- | --- | --- |
| 0 First Impression | 操作なしで目的と第一印象を聞く | `PENDING RECORD` |
| 1 Race Result | 大会・categoryという目的だけを与える | `PENDING RECORD` |
| 2 Rider Analysis | 選手の走りの理解を求める | `PENDING RECORD` |
| 3 Comparison | 周囲との比較という目的を与える | `PENDING RECORD` |
| 4 Investigation | ペース・順位の変化を探す | `PENDING RECORD` |
| 5 Another Rider | 同じcategoryの別選手を見る | `PENDING RECORD` |
| 6 Free Exploration | 使用機能を指定せず自由探索 | `PENDING RECORD` |

現時点で、`Slightly Leading` や `Leading` へ変更する根拠はない。根拠なしにTask文を変更すると、本番participantsとの比較可能性を損なうため、Pilot record受領までは変更しない。

## Task order / learning effect

現在の順序は、第一印象から結果、個人分析、比較、変化探索、別選手、自由探索へ進む設計である。PilotがTask 2で学習した操作をTask 5へ持ち越したか、またその影響が発生したかは記録不在のため判定不能。

本番の比較可能性を優先し、現時点では順序を変更しない。Pilot record受領後に、次のいずれかを証拠付きで判断する。

- 順序を維持する
- Task 5を別sessionの独立taskにする
- 一部taskを統合・短縮する
- learning effectをprotocol上の既知の制約として許容する

## Moderator intervention audit

許可済みのM1中立質問、境界的な発言、操作方法を教えるM2/M3以外の逸脱があったかは確認できない。Pilot record受領時は、moderatorの逐語ログまたは時刻付きメモを次のように分類する。

| Classification | 判定基準 | 今回 |
| --- | --- | --- |
| Allowed | 「今何を探していますか？」等の中立質問、Think Aloud reminder | `NOT EVALUABLE` |
| Borderline | participantの方向・解釈に影響した可能性がある発言 | `NOT EVALUABLE` |
| Disallowed | control、位置、操作、正解を明示した発言 | `NOT EVALUABLE` |

## Three-second rule

現在のtest kitでは、3秒以上の停止をfriction eventとして記録する。ただし、自然なデータ読解のための停止と、操作方法を探す停止を同一視しない方針は、Pilotで確認する必要がある。

本番用の暫定記録ルールは次のとおり。Pilot recordで問題がなかったことを意味しない。

- `Interaction hesitation`: control、次の導線、選択方法を探して停止。friction countに含める。
- `Reading / analysis pause`: chartや数値の意味を考えて停止。自然な読解として別カウントにする。
- 判定不能: `NR` とし、勝手にfrictionへ分類しない。

## Think Aloud audit

参加者が考えを声に出せたか、操作実況になったか、沈黙が増えたか、正解を当てようとしたかはPilot record不在のため不明。台本には既に、アプリの操作方法を使わない一般例（「ここかな」「この数字は何だろう」）と、短い発話でよいことを含めている。Pilot evidenceなしに追加説明はしない。

## Measurement audit

| Measurement | Classification now | Pilot evidence |
| --- | --- | --- |
| success / partial / fail | `KEEP — audit pending` | なし |
| completion time | `KEEP — audit pending` | なし |
| first-click correctness | `KEEP — audit pending` | なし |
| hesitation | `CLARIFY — distinguish interaction vs reading` | なし |
| wrong turn | `KEEP — audit pending` | なし |
| major scroll reversal | `KEEP — audit pending` | なし |
| moderator intervention | `KEEP — audit pending` | なし |
| Ease | `KEEP — audit pending` | なし |
| Confidence | `KEEP — audit pending` | なし |
| quotes | `KEEP — audit pending` | なし |
| critical moments | `SIMPLIFY at capture time; retain evidence fields` | なし |
| suspected cause / severity | `DEFER to after-session analysis` | なし |

実記録がないため、現時点では `REMOVE` を決めない。リアルタイム必須は success、time、major friction、quote とし、severity、suspected cause、P0〜P3の最終判定はsession後に記録する方針を維持する。

## Critical moment capture

既存の9項目すべてをリアルタイムに埋める必要はない。Pilot record受領後に実運用負荷を確認するまでは、次の最小 capture を本番時の必須項目とする。

| 必須（その場） | 後から補完 |
| --- | --- |
| timestamp、task、participant action、verbatim quote | expected、actual、suspected cause、severity、follow-up |

記録できなかった項目は推測で補完せず `NR` とする。

## Post-test interview audit

post-test質問の重複、疲労、誘導性はPilot recordがないため未判定。重要質問「なんとなく使いづらいと感じた瞬間」は維持する。ただし、前の質問が回答を誘導したかは実際の順序・回答ログで確認する。

現時点の本番運用は次のとおり。

1. まず自由回答を聞く。
2. その後にEase / Confidenceの数値を聞く。
3. 「なんとなく使いづらい」の有無と瞬間を最後に聞く。
4. 最後に「1つだけ直せるなら」を聞く。

## Pilot-only UX signals

Pilot recordがないため、観察されたUX signalはない。

| Signal | Evidence | Pilot only | Needs confirmation |
| --- | --- | --- | --- |
| No pilot signal can be asserted | Pilot participant record not found | YES | Pilot record must be supplied before analysis |

comparison未発見、Results未使用、chart理解不足、focus問題などをPilot signalとして報告していない。これらを推測で埋めることは禁止する。

## Test kit changes

### Changes made

- 既存5ファイル: 変更なし。
- product source code: 変更なし。
- UX3 backlog: 変更なし。
- 新規作成: 本レビュー報告のみ。

### Pending changes

Pilot record受領後、必要な場合だけ、次の最小変更を行う。

- task文の一部修正
- 時間配分またはtask統合
- neutral probeの整理
- hesitationの分類説明
- realtime / post-session measurementの分離
- critical momentのcapture簡略化

変更する場合は、Pilot recordの該当行と理由をこの報告へ追記し、本番participants全員へ同じ改訂版を使用する。

## Final main-test protocol（暫定）

Pilotで校正済みとは言えないため、以下は「変更なしで保持している暫定protocol」である。

1. Task 0 First Impression
2. Task 1 Race Result
3. Task 2 Rider Analysis
4. Task 3 Comparison
5. Task 4 Investigation
6. Task 5 Another Rider
7. Task 6 Free Exploration
8. Post-test interview

参加者間の比較可能性を優先し、Pilot recordのレビュー前に内容・順序を変えない。Pilot参加者は本番datasetへ自動的に含めない。

## Participant recommendation

- 本番人数: 3〜5人
- Pilot participant: protocol calibration用として正式datasetから除外
- 構成: A cycling knowledgeable、B sports/data app user、C general userを分散
- Desktop/Mobile: 両方の観察が得られるよう割り当てる

## Missing input required

次のいずれかを提供する必要がある。

- `docs/user-testing/` 配下へPilot recordを追加
- repository内の別パスを明示
- 画面・音声・手書きメモ等の記録を匿名化して貼付

必要最低限: participant ID、実施時間、Task 0〜6の時系列、moderator intervention、主要発話、post-test回答。個人情報は削除してよい。

## Readiness verdict

`UX3-0.5 NEEDS TEST PROTOCOL REVISION`

これはPilotの製品評価が悪かったという意味ではない。Pilot evidenceがないため、protocolを「10〜15分で実用的」「neutral」「記録可能」「比較可能」と確認するreadiness gateを通過できない、という意味である。実記録が提供され、上記の校正を完了した後に、改めて `READY FOR HUMAN FIELD TEST` を判定する。
