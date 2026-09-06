# UX3-0 Results Analysis Template

このテンプレートは、3〜5人の実セッション終了後に記入する。参加者データがない状態では、仮説を結果として埋めない。

分析対象URL: `https://ajocc-laptime-viewer.vercel.app/`

- Analysis date:
- Analyst:
- Sessions included: `P__–P__`
- Tested commit / production note:
- Data exclusions and reasons:

## Executive summary

### Overall verdict

- `CLEAR` — 主要taskで反復するP0/P1がなく、現状維持または限定的な追加調査でよい。
- `UX3 INVESTIGATION` — P2/P3または発見性の疑問が反復した。実装前に追加調査・仕様検討が必要。
- `BLOCKING` — P0/P1、task completion不能、重大な誤解がある。根拠を示して優先修正を検討する。

- One-sentence finding:
- Evidence strength and limitation:
- Recommendation: `NO CHANGE / UX3 INVESTIGATION / BLOCKING`

## Participant overview

| ID | Background | Device / viewport | AJOCC familiarity | Relevant prior experience | Notes |
| --- | --- | --- | --- | --- | --- |
| P1 |  |  |  |  |  |
| P2 |  |  |  |  |  |
| P3 |  |  |  |  |  |
| P4 |  |  |  |  |  |
| P5 |  |  |  |  |  |

Sample caveat: 3〜5人のformative testであり、母集団への成功率推定や統計的結論には使わない。

## Task success and time

`Success rate = success人数 / valid participant数`。`Partial` と `Fail` の理由をNotesに書く。技術障害の時間は製品task時間から除くが、技術障害自体は別に報告する。

| Task | Valid N | Success | Partial | Fail | Success rate | Median time | First-click correct | Median Ease | Median Confidence | Notes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 0 First impression |  | n/a | n/a | n/a | n/a |  | n/a |  |  |  |
| 1 Race result |  |  |  |  |  |  |  |  |  |  |
| 2 Rider analysis |  |  |  |  |  |  |  |  |  |  |
| 3 Compare |  |  |  |  |  |  |  |  |  |  |
| 4 Investigate change |  |  |  |  |  |  |  |  |  |  |
| 5 Switch rider |  |  |  |  |  |  |  |  |  |  |
| 6 Free exploration |  |  |  |  |  |  |  |  |  |  |

## First impression and three-minute test

- Most common first visual target:
- Most common inferred purpose:
- First-action success:
- Time to first meaningful result (definition used):
- Three-minute result: `PASS / MARGINAL / FAIL`
- Evidence:
- Did participant describe the site as analysis-first, result lookup, or configuration-first?
- Did the impression differ by device or background?

## Repeated friction

| Finding | Participant count | Occurrence count | Tasks | Severity | Representative quote | Evidence refs | Confidence |
| --- | ---: | ---: | --- | --- | --- | --- | --- |
|  |  |  |  | P0–P3 |  |  | low/med/high |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

Repetition interpretation:

- `3/4`など複数参加者に同じtask阻害がある場合は強いsignalとして扱う。
- 1人の好みや1回の言い換えは、他の証拠がない限りP2/P3候補に留める。
- P0（不能・データ誤り）は1件でも即時記録する。

## Critical incidents

| # | Participant / task | Timestamp | Action | Quote | Expected | Actual | Suspected cause | Severity | Disposition |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 |  |  |  |  |  |  |  | P0–P3 | investigate/backlog/none |
| 2 |  |  |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |  |  |

## Strongest positive findings

1. Finding / evidence / participant count:
2. Finding / evidence / participant count:
3. Finding / evidence / participant count:

## Strongest negative findings

1. Finding / evidence / participant count / severity:
2. Finding / evidence / participant count / severity:
3. Finding / evidence / participant count / severity:

## Unexpected behavior

- Unexpected behavior:
- Who observed it:
- Is it a product issue, data issue, or test setup issue?
- Does it repeat?
- Follow-up needed:

## Feature discovery analysis

| Surface | Found naturally | Found after search | Not found | Not needed | Meaning understood | Interpretation |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Current context |  |  |  |  |  |  |
| Rider change |  |  |  |  |  |  |
| Metric switch |  |  |  |  |  |  |
| Comparison |  |  |  |  |  |  |
| Lap Detail |  |  |  |  |  |  |
| Results |  |  |  |  |  |  |

`Not found` と `Not needed` を統合しない。特定機能を使わなかったことだけで失敗と判定しない。

## Ratings and qualitative impression

| Metric | Median | Range | Notes |
| --- | ---: | --- | --- |
| Overall ease |  |  |  |
| Easy to learn |  |  |  |
| Easy to navigate |  |  |  |
| Easy to compare |  |  |  |
| Understand current context |  |  |  |
| Pleasant to use |  |  |  |

- Participants who would use again:
- Participants reporting “なんとなく使いづらい”:
- Most common reason:

## Severity-ranked findings

### P0

- None / finding, evidence, participant count, action:

### P1

- None / finding, evidence, participant count, action:

### P2

- Finding, evidence, participant count, action:

### P3

- Finding, evidence, participant count, action:

Severity rules:

- P0: task completion不能、correctness/data meaningの重大な誤り。
- P1: 主要taskをかなり妨げるが、支援や回避で完了できる場合を含む。
- P2: 明確な摩擦だがtaskは完了できる。
- P3: polish、個人の好み、低影響の文言・見た目。

## Existing backlog findings

| UX3 backlog item | Observed evidence | Participant count | Severity | Decision |
| --- | --- | ---: | --- | --- |
| Exact-device responsive evidence harness |  |  | P2 | keep / update / close |
| Large-category Results navigation |  |  | P2 | keep / investigate |
| Narrow chart tooltip / legend |  |  | P3 | keep / investigate |
| Broader assistive-technology certification |  |  | P2 | keep / schedule |
| First-entry pointer focus handoff |  |  | P2 | keep / investigate |

参加者へbacklog項目を教えてはいけない。自然発生した行動・発話・focus反応のみを証拠にする。

## UX3 candidate changes

この欄は実データとseverityを記録した後にのみ書く。

| Candidate | Evidence | Participant count | Expected value | Scope | Risk | Recommendation |
| --- | --- | ---: | --- | --- | --- | --- |
|  |  |  |  |  |  | `NO CHANGE / RESEARCH / IMPLEMENT` |

`IMPLEMENT`と書く場合でも、このテンプレートだけで実装開始しない。別途、UX3の設計・仕様監査を行う。

## Do-not-change findings

UX2の現状を維持する根拠になった観察を記録する。

| Behavior that worked | Evidence / participant count | Why not change |
| --- | --- | --- |
|  |  |  |

## Final analysis decision

- Final verdict: `CLEAR / UX3 INVESTIGATION / BLOCKING`
- P0 count:
- P1 count:
- P2 count:
- P3 count:
- Additional data needed:
- UX3 implementation plan created now? `must be NO until participant data and design review exist`
- Next human action:
