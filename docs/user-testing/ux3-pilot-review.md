# UX3-0.5 Human User Test Pilot Calibration Review

ステータス: `FINAL CALIBRATION — PILOT EVIDENCE REVIEWED`

判定: `UX3-0.5 NEEDS TEST PROTOCOL REVISION`

## Review history

- `499db3809419a694ff98a62631691ff7cc7f87ff`: Pilot recordがrepository内に存在せず、推測を避けて停止。
- `50312288981b06f23a465ffd594d8b10cf9d3272`: 再探索でもrecord未発見であることを記録。
- 今回: `docs/user-testing/pilot-participant-01.md` を追加し、実recordを読んで校正を再開。

前2回の「recordなし」という判断は削除せず、今回record追加によって更新された内容をこの文書に残す。今回もproduct codeは変更していない。

## Evidence source

今回読んだ実record:

- `docs/user-testing/pilot-participant-01.md`

併せて確認したtest kit:

- `docs/user-testing/ux3-test-plan.md`
- `docs/user-testing/ux3-moderator-script.md`
- `docs/user-testing/ux3-participant-record-template.md`
- `docs/user-testing/ux3-observation-sheet.md`
- `docs/user-testing/ux3-results-analysis-template.md`
- 本ファイルの前回レビュー履歴

## Pilot participant and environment

| Item | Evidence |
| --- | --- |
| Participant ID | `P_1_1` |
| Background | A: 自転車競技に詳しい |
| AJOCC familiarity | `uses it` |
| Race/lap analysis experience | `low` |
| Prior product experience | `seen once` |
| Device | Desktop PC、27インチモニター |
| OS | Windows 11 |
| Browser | Chrome（versionは未記録） |
| Input | mouse + keyboard |
| Orientation | landscape |
| URL | production URL |
| Date / start / end | `not recorded` |
| Target race/category/riders | `not recorded` |
| Data fallback | `no / yes, describe` のplaceholderが残っており確定不能 |

参加者は、サイトの目的を「レース結果をグラフ化し、ほかの選手と比較できるもの」と理解していた。最初の視線は結果表→グラフ→トップ差の順で、最初の操作意図は大会選択→選手選択→グラフ切替だった。これは第一印象と目的理解の証拠として扱うが、1名のPilot-only evidenceであり、正式なUX findingにはしない。

## Pilot timeline reconstruction

Recordの時間欄は見出しが「秒」だが、start/end時刻がなく、値の実単位も確認できない。したがって、数値を合計したり、分へ変換したりしない。

| Phase | Duration | Friction | Moderator intervention |
| --- | ---: | --- | --- |
| Introduction | `not recorded` | `not recorded` | `not recorded` |
| Task 0 | `not recorded` | 余白、表の横長、グラフの小ささへの反応 | `not recorded` |
| Task 1 | `5`（record欄のraw value。unit未確認） | 位置の分かりにくさ、空白、major scroll reversal `あり`、hesitation `あり` | `not recorded`。欄は`M0–M3` placeholder |
| Task 2 | `5`（raw value。unit未確認） | 情報が複数箇所に散らばる | `not recorded` |
| Task 3 | `3`（raw value。unit未確認） | 比較できるが比較している感覚が弱い | `not recorded` |
| Task 4 | `5`（raw value。unit未確認） | 複数線・他選手との関係を読み取りにくい | `not recorded` |
| Task 5 | `3`（raw value。unit未確認） | 選手変更方法は分かるが最初に探した | `not recorded` |
| Task 6 / free exploration | `10`（raw value。unit未確認） | hesitation、wrong turn、major scroll reversal `あり`。押せる場所と結果の予測が困難 | `not recorded` |
| Post-test interview | `not recorded` | 一部質問の回答欄が空欄 | `not recorded` |
| Total | `not recorded` | start/endがないため判定不能 | — |

### Duration gate

判定: `UNKNOWN`。

目標は10〜15分だが、実際の総時間、Introduction、Task 0、post-testの時間がない。Task 1〜6のraw valueもunitが検証できないため、`5+5+3+5+3+10`をdurationとして合計しない。今回のPilotだけから`PASS / TOO SHORT / TOO LONG`を決めることはできない。

これはproduct UXの問題ではなく、開始・終了時刻と単位を必須化できていなかったmeasurement protocolの問題である。main testでは各taskとsession全体のstart/endを秒で記録する。

## Task-by-task audit

判定基準: `KEEP`、`REWORD`、`MERGE`、`REMOVE`。Pilotの1名のproduct反応はTask文変更の根拠にせず、文が目的を伝えたか、実施上の重複や不明瞭さがあったかだけを見る。

| Task | Verdict | Pilot evidence | Protocol decision |
| --- | --- | --- | --- |
| 0 First Impression | `KEEP` | サイト目的と最初の行動を言語化できた。第一印象の配置・密度への反応も得られた | 目的文と操作なしを維持 |
| 1 Race Result | `KEEP` | 大会選択は直感的と記録され、結果を探す目的は成立。completionは未選択 | UI名を示さない目的文を維持。完了値を必須化 |
| 2 Rider Analysis | `KEEP` | 「選手の分析はどうなっているか分かる」が情報の散在を指摘。目的の理解不足という証拠はない | 文を変更せず、結果解釈を1つ聞く形式を維持 |
| 3 Comparison | `KEEP` | 「何となく比較している」と理解。比較の確信が弱い | product signalとして本番確認。task文は変更しない |
| 4 Investigation | `KEEP` | ペース・順位の変化を探す目的は成立。線の関係理解に困難 | Task 2との重複はなく、深掘りtaskとして維持 |
| 5 Another Rider | `KEEP` | 別選手へ切り替える目的は成立。最初に導線を探した | Task 2で学習した操作を再利用する repeated-analysis taskとして維持 |
| 6 Free Exploration | `KEEP`（時間box明確化） | 自由探索で操作可能性と結果予測への困難が表出。自由探索の目的自体は有効 | 文の目的は維持し、制限を1〜2分から60〜90秒へ明示 |

全Taskについて、Pilot recordには実際の読み上げ発話やmoderator説明の記録がないため、neutralityを完全に証明するものではない。ただし、record上にUI名を教えたという証拠はない。main testではmoderator codeと発言を記録する。

## Task order and learning effect

順序は変更しない。Task 2で選手分析の導線を学び、Task 5で別選手への切替を繰り返すため、Task 5は純粋な初回discoverabilityではなく、学習後の反復操作を測るtaskになる。この差はUX3の目的に合っており、削除・独立化しない。

Task 3とTask 4はどちらもchart解釈を含むが、Task 3は周囲との比較、Task 4はレース中の変化と詳細確認で目的が異なる。統合しない。

## Protocol friction vs product UX friction

### Test protocol friction

Pilot recordから確認できるprotocol / recording上の問題:

- 総時間、Introduction、Task 0、post-testの開始終了がない。
- Task時間欄の単位が検証できない。
- `success/partial/fail` が全Taskでplaceholderのまま。
- first click、moderator interventionが未確定。`M0–M3`は範囲placeholderで、実コードではない。
- Think Aloudの逐語発話、促し、沈黙の長さがない。
- critical moment欄が未記録。
- quote欄が空欄で、観察者の要約とparticipantの原文が区別できない。
- overall ease、would use again、backlog check等が未記録。

これにより、Pilotを10〜15分に分類したり、clean successを集計したりできない。main testではリアルタイム必須項目を絞り、後から補完する項目を分ける。

### Pilot-only product UX signals

以下はPilotで記録された潜在的なUX signalである。すべて `Main test confirmation needed = YES` とし、正式finding・実装targetへ昇格させない。

| Signal | Evidence | Severity candidate | Main test confirmation needed |
| --- | --- | --- | --- |
| 初期画面の余白・情報配置への違和感 | Task 0、interviewで「余白の無駄」「配置・見せ方がいまいち」「パッと見いまいち」 | P2 candidate | YES |
| 結果表の横幅・空白で選手とtimeの対応が読みづらい | Task 1、interviewの表への指摘 | P2 candidate | YES |
| 比較導線・比較状態の意味が弱い | pre-testで比較場所が不明、Task 3で「比較している感がない」 | P2 candidate | YES |
| 複数線・他選手との関係が読みづらい | Task 4で線の関係を理解しづらい | P2/P3 candidate | YES |
| 選手変更導線の初回discoverability | Task 5で最初に探した | P2 candidate | YES |
| 自由探索で操作可能性・結果予測が分かりにくい | Task 6でhesitation/wrong turn/scrollあり | P2 candidate | YES |
| 小さい文字・buttonと小さな摩擦の累積 | post-testの快適さ2、button/文字への指摘 | P2/P3 candidate | YES |

これらは1名のself-reportと不完全なtask completion記録から得た仮説であり、UX3-1でparticipant countとoccurrenceを確認する。

## Moderator intervention review

実recordでは、各Taskの欄が`M0–M3`で、実際の介入種類・時刻・発言が選択されていない。したがって、NEUTRAL / THINK-ALOUD REMINDER / BORDERLINE / LEADINGの分類は `not recorded` である。

main testでは次を確定する。

- taskごとにコードは1つだけ選ぶ。
- 中立質問または一般的なThink Aloud reminderは `M1`。
- task目的の言い直しは `M2`。
- 技術障害からの復旧は `M3`。
- control、位置、操作、正解、意味を教えた場合は `LEADING`。
- `LEADING` taskはclean successとして集計しない。

## Think-Aloud review

recordにはparticipantの発言欄が空で、Task commentsも逐語quoteではなく要約形式である。Think Aloudが十分だったか、操作実況だったか、無言だったかは `not recorded`。このためPilotから「実用的だった」とは判定しない。

main testでは、5秒程度沈黙して操作を続けるときにtask中1回だけ「考えていることを短く声に出してもらえますか？」と促す。アプリ操作を例にしない。促し後も無言なら`TA=low`と記録し、taskを説明し直さない。

## Hesitation definition and three-second rule

Pilot recordのhesitation欄は`あり`または`あまりなし`で、秒数・行動・発話がない。このrecordから、3秒閾値のfalse positive頻度は検証できない。

main testでは次を正式定義とする。

- `Interaction hesitation`: 3秒以上の停止 **かつ** cursorのcontrol間移動、上下探索、戻る操作、または「どこだろう」等の迷い発話がある。friction countへ含める。
- `Reading / analysis pause`: chart・表・数値を理解する停止で、操作探索や迷い発話がない。friction countへ含めず、別のreading pauseとして記録する。
- 判定できない場合は`NR`とする。

したがって、単純な「3秒以上停止」は採用しない。3秒は観察開始の閾値として残し、behavioral evidenceを必須にする。これはPilot evidenceが完全だったからではなく、Pilotの記録粒度では単純閾値を検証できなかったためのmeasurement保護である。

## Recording burden and measurement changes

判定: `HIGH (operational recording risk)`。

実際のmoderator所要時間はrecordされていないため、時間負荷そのものは測定できない。一方で、必須項目を含むparticipant recordにcompletion、介入、時刻、quote、critical momentsが大量に残っておらず、現行templateの同時記録負荷または入力ルールの曖昧さが高いことは確認できる。

### Real-time minimum for main test

- session start/end
- task start/end（秒）
- `success / partial / fail / NR`
- `M0 / M1 / M2 / M3 / LEADING` の1コード
- major frictionの短いメモ
- notable quote最大1件

### Post-task / post-session reconstruction

- first click
- interaction hesitation count
- reading pause count
- wrong turn
- major scroll reversal
- severity、suspected cause、UX recommendation
- critical momentのexpected / actual / follow-up

Ease / Confidenceはpost-testの5項目を必須とし、taskごとの数値は記録できる場合だけ残す。測定できない項目を成功・失敗へ変換しない。

## Post-test interview review

| Question area | Pilot evidence | Decision |
| --- | --- | --- |
| 一番分かりやすかったところ | 大会選択という具体的回答 | KEEP |
| 一番分かりにくかったところ | 比較場所という具体的回答 | KEEP |
| 何度も戻った/探した場所 | scroll範囲と上下移動への回答 | KEEP |
| もっと目立ってほしいもの | 選手選択、グラフ、選択中内容 | KEEP |
| 画面を取りすぎるもの | context、rider/lap/comparison、横長表 | KEEP |
| グラフ・条件変更 | chart切替は直感的、lap選択は不明 | KEEP |
| もう一度使う見込み | 回答は記録されたが設問欄はplaceholder | KEEP; `NR`を許可 |
| 「なんとなく使いづらい」 | 「パッと見いまいちが勝つ」 | KEEP |
| 1つだけ直すなら | 配置・見せ方 | KEEP |

質問の重複・誘導性を示すPilot evidenceはない。自由回答を先に聞き、数値評価、「なんとなく使いづらい」、最後の改善要望の順にする現在の流れを維持する。空欄は`NR`とする。

## Test kit changes

### Changed

- `ux3-test-plan.md`: Task 6を60〜90秒へ明示。記録順序、real-time minimum、`LEADING`、Think Aloud、interaction/reading pause定義を追加。participant file命名規則を追加。
- `ux3-moderator-script.md`: taskごとのstart/end・completion・単一介入コード・lead interventionの記録手順、Think Aloud reminder、Task 6の60〜90秒を追加。
- `ux3-participant-record-template.md`: real-time minimumとpost-task reconstructionを分離。start/end、duration unit、completion、単一介入コード、interaction/reading pauseを明示。
- `ux3-observation-sheet.md`: `LEADING`除外、秒単位・NR・placeholderを推測しない集計ルールを追加。
- `ux3-results-analysis-template.md`: `LEADING`とduration集計の除外ルールを追加。
- `ux3-pilot-review.md`: 本文を実測ベースへ更新し、過去のrecord欠落履歴を保持。

### Unchanged

- Task 0〜6の目的文は維持。Task 6の時間boxだけ明確化。
- Task orderは維持。
- product source code、tests、application config、UX3 backlogは変更なし。

## Final main-test protocol

本番participantsへは次を同じ順序・同じ目的文で実施する。

1. Task 0 — First Impression
2. Task 1 — Race Result
3. Task 2 — Rider Analysis
4. Task 3 — Comparison
5. Task 4 — Investigation
6. Task 5 — Another Rider
7. Task 6 — Free Exploration（60〜90秒）
8. Post-test interview

main test開始後は、参加者間比較のためprotocolを変更しない。技術障害だけはM3として記録し、同じ条件の予備raceへ切り替える。

### File naming

- Pilot: `pilot-participant-01.md`（正式dataset外）
- Main: `participant-01.md`、`participant-02.md`、`participant-03.md`、必要に応じて`participant-04.md`、`participant-05.md`

### Expected duration

目標: `12〜15分`。Intro、Task 0〜6、post-test、最小限の記録を含む。Task 6を60〜90秒に固定し、Task後の分析用補完はparticipant退出後に行うため、participantの待ち時間へ含めない。

## Readiness gate

| Gate | Result |
| --- | --- |
| Pilot record identified and read | PASS |
| Task wording usable without UI instruction | PASS with moderator-delivery logging required |
| Task order comparable | PASS |
| Actual Pilot total duration measured | FAIL — start/end and units missing |
| Moderator intervention rule clear | PASS after protocol revision |
| Hesitation definition clear | PASS after protocol revision; Pilot frequency remains unknown |
| Recording burden acceptable | FAIL for old form; revised split capture required |
| Think Aloud protocol operational | PASS after protocol revision; Pilot quality not measurable |
| Participant template usable | PASS after template revision |
| Product code unchanged | PASS |

総時間の実測欠落と旧recordの記録負荷は、main test開始前に解消すべきprotocol上のblocking issueである。新templateで別のPilotを再実施するか、facilitatorが実recordのstart/end・単位・介入・completionを補足してから本番へ進む。

## Final verdict

`UX3-0.5 NEEDS TEST PROTOCOL REVISION`

今回の判定はPilot participantのproduct UXが悪かったという意味ではない。実測recordを読んだ結果、Task文・Task order・product codeには変更不要だった一方、総時間を判定できる時刻情報と、main testで比較可能なcompletion / intervention / hesitation記録が不足していた。上記のprotocol改訂を適用し、実時間を取得できる確認を1回行った後に、`UX3-0.5 READY FOR HUMAN FIELD TEST` を再判定する。
