# UX3-0 Participant Record Template

このファイルを参加者1人につき1部コピーする。氏名や連絡先は記録せず、participant IDを使う。未記入は推測で埋めず `NR`（not recorded）とする。

## Participant profile

- Participant ID: `P__`
- Date / time:
- Consent: `yes / no / partial`
- Recording: `none / notes / screen / audio / screen+audio`
- Background: `A cycling knowledgeable / B sports-data app user / C general user / other:`
- AJOCC familiarity: `none / heard of it / uses it / expert`
- Race/lap analysis familiarity: `none / low / medium / high`
- Prior experience with this product: `none / seen once / used before`
- Facilitator:

## Test environment

- URL:
- Device:
- OS:
- Browser/version:
- Viewport or screen size:
- Orientation: `portrait / landscape`
- Input: `mouse+keyboard / touch / trackpad / other`
- Network note:
- Target race/category (facilitator-only values):
- Target rider / alternate rider (facilitator-only values):
- Data issue or fallback race used: `no / yes, describe`

## Pre-test observation

- First visual target:
- What participant thought the site was for:
- Intended first action:
- Initial confusion or confidence:
- Verbatim quote:

## Task results

`NR` は記録なしを意味する。placeholderを残さず、分からない値を推測しない。

### Real-time minimum

各taskで、読み上げ直前にstart、終了時にendを秒単位で記録する。exactなstart/endが取れない場合は、durationに`approx.`と明記した近似時間を記録し、推測や捏造はしない。participantを待たせないため、real-time minimumはtask outcome、時間、major hesitation/friction、介入コード1つ、notable quoteとし、全tableをその場で埋める必要はない。

| Task | Start | End | Duration (s; exact or `approx.`) | Completion | Intervention (`M0/M1/M2/M3/LEADING`) | Major hesitation / friction | Notable quote |
| --- | --- | --- | ---: | --- | --- | --- | --- |
| 0 First impression |  |  |  | n/a |  |  |  |
| 1 Race result |  |  |  | success/partial/fail/NR |  |  |  |
| 2 Rider analysis |  |  |  | success/partial/fail/NR |  |  |  |
| 3 Compare |  |  |  | success/partial/fail/NR |  |  |  |
| 4 Investigate change |  |  |  | success/partial/fail/NR |  |  |  |
| 5 Switch rider |  |  |  | success/partial/fail/NR |  |  |  |
| 6 Free exploration |  |  |  | success/partial/fail/NR |  |  |  |

Task 6 is a fixed 60–90 second timebox; record End when the timebox is reached.

`LEADING` が付いたtaskはclean successとして集計しない。M2/M3/LEADINGの理由と時刻は下記のfriction/event欄へ記録する。

介入コードは1つだけ記録する。`M0`は介入なし、`M1`は中立的なThink Aloud reminderまたはprobe、`M2`は中立的な質問・probeによるタスク目的の言い直し、`M3`は現行定義どおり技術問題からの復旧とする。現行定義で直接の操作案内・救済をM3に含めない。直接教えた場合は`LEADING`とし、定義が判断できない場合は`NR`とする。

一問ずつ進めるQ&A形式は将来のprotocol改善候補にとどめ、このtable templateを置き換えない。

### Post-task / session reconstruction

参加者の操作を止めないため、次はtask後または参加者退出後のsession後に補完する。詳細なfriction、severity、suspected cause、critical moment、facilitator findingsはこの段階で記録する。読解中の停止は`Reading / analysis pause`としてhesitation countから除外し、およそ3秒の停止にcontrol探索、cursorの迷走、探索的scroll、迷い発話が加わる場合だけ`Interaction hesitation`とする。判定できない場合は`NR`とする。

| Task | First click | Interaction hesitations | Reading pauses | Wrong turns | Major scroll reversals | Ease 1–5 | Confidence 1–5 | Notes |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 0 First impression | n/a |  |  |  |  |  |  |  |
| 1 Race result |  |  |  |  |  |  |  |  |
| 2 Rider analysis |  |  |  |  |  |  |  |  |
| 3 Compare |  |  |  |  |  |  |  |  |
| 4 Investigate change |  |  |  |  |  |  |  |  |
| 5 Switch rider |  |  |  |  |  |  |  |  |
| 6 Free exploration | n/a |  |  |  |  |  |  |  |

## Friction events

記録基準: およそ3秒の停止にcontrol探索、cursorの迷走、探索的scroll、迷い発話が加わる`Interaction hesitation`、同じ場所の往復、control探索scroll、誤操作、「分からない」、browser back、chart/current rider喪失、unexpected scroll、disclosure未発見、ラベル誤解。`Reading / analysis pause`はhesitation countに含めず、判定不能は`NR`とする。

| # | Timestamp | Task | Participant action / event | Quote | Suspected friction type | Severity initial | Evidence / screenshot ref |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 |  |  |  |  | discoverability/context/analysis/scroll/focus/label/other | P0–P3 |  |
| 2 |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |
| 4 |  |  |  |  |  |  |  |

## Critical moment log

事実と仮説を分ける。`expected behavior`はこのテストで観察したいユーザー目的を書き、実装仕様を勝手に追加しない。

| Timestamp | Task | Participant action | Participant quote | Expected behavior | Actual behavior | Suspected cause | Severity | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  | P0–P3 |  |
|  |  |  |  |  |  |  | P0–P3 |  |

## Feature discovery（participantが自発的に使ったか）

`found`は自然に使用、`found after search`は探して使用、`not found`は見つけられず、`not needed`は目的上不要と発言、`not observed`は判断不能。

| Surface / purpose | Status | First noticed at task | How participant reached it | Meaning understood? | Quote |
| --- | --- | --- | --- | --- | --- |
| 現在の大会・category・選手・比較の文脈 |  |  |  | yes/no/partial |  |
| 選手の変更 |  |  |  | yes/no/partial |  |
| 指標の切替 |  |  |  | yes/no/partial |  |
| 周囲との比較 |  |  |  | yes/no/partial |  |
| Lapの詳細値 |  |  |  | yes/no/partial |  |
| category全体の結果 |  |  |  | yes/no/partial |  |
| 自由探索でのその他の情報 |  |  |  | yes/no/partial |  |

## Post-test ratings

### Overall

- Overall ease (1–5):
- Would use again without help? `yes / maybe / no`
- “なんとなく使いづらい” moment: `none / yes, timestamp/task:`

| Rating | Score 1–5 | Reason / quote |
| --- | ---: | --- |
| Easy to learn |  |  |
| Easy to navigate |  |  |
| Easy to compare |  |  |
| Easy to understand current context |  |  |
| Pleasant to use |  |  |

### Interview notes

1. 一番分かりやすかったところ:
2. 一番分かりにくかったところ:
3. 何度も戻ったり探したりしたところ:
4. もっと目立ってほしかったもの:
5. 画面を取りすぎていると感じたもの:
6. グラフを見る・条件を変える操作:
7. もう一度使う場合の見込み:
8. 1つだけ直すなら:
9. その他:

## Existing backlog checks（誘導せず自然発生したか）

| Backlog item | Observed? | Task / evidence | Severity | Repeat with others? |
| --- | --- | --- | --- | --- |
| exact-device responsive evidenceの不足 |  |  | P2 |  |
| large-categoryでのResults rider discovery |  |  | P2 |  |
| narrow chart tooltip / legend |  |  | P3 |  |
| broader assistive-technology certification need |  |  | P2 |  |
| first-entry pointer focus handoff |  |  | P2 |  |

## Facilitator synthesis（セッション終了直後）

- Strongest positive signal:
- Strongest negative signal:
- Highest-severity candidate:
- Was the task result caused by user, data, or technical failure?
- Follow-up question for next participant:
- Do not over-interpret:

## Privacy / data handling

- Notes anonymized: `yes / no`
- Recording retained until:
- Deletion / access note:
- Publication permission for quote: `no / anonymous only / granted`
