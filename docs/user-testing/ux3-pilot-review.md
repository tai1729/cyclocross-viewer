# UX3-0.5 Human User Test Pilot Final Evaluation

ステータス: `FINAL EVIDENCE-BASED PILOT EVALUATION`

判定: `UX3-0.5 READY FOR HUMAN FIELD TEST`

この文書は、`docs/user-testing/pilot-participant-01.md` に残っている現在のrecordを、test kitと照合して評価した最終レビューである。Pilotは1名のprotocol校正用記録であり、正式なUX finding、participant count、severity集計、product変更の根拠にはしない。product codeは変更していない。

## Review history and scope

- 過去のレビューではpilot recordが見つからず、推測を避けて停止していた。
- 現在は `docs/user-testing/pilot-participant-01.md` が存在するため、その内容を確認した。
- 過去の停止履歴は監査上有用な範囲だけ保持し、今回の判定は現在利用できるrecordに基づく。
- 対象はPilot evidence、Task wording/order、duration measurement、moderator recording、main-test readinessである。製品コード、tests、package/config、backlogの変更は対象外とした。

## Evidence sources

### Available evidence

- `docs/user-testing/pilot-participant-01.md`
- `docs/user-testing/ux3-test-plan.md`
- `docs/user-testing/ux3-moderator-script.md`
- `docs/user-testing/ux3-participant-record-template.md`
- `docs/user-testing/ux3-observation-sheet.md`
- `docs/user-testing/ux3-results-analysis-template.md`

Recordにある主な利用可能evidenceは、参加者のfirst impression、Task 0〜6の要約、いくつかのparticipant quote相当のメモ、1〜5の5項目評価、Task別の概算値、scroll / hesitation / wrong turnの有無である。

### Missing evidence

- sessionのstart/end、実施日、Task 0、導入、post-testの開始終了時刻
- Task 1〜6の値の確定単位、first click、実際のcompletion判定、Taskごとの時刻
- moderatorの発言、介入時刻、`M0`〜`M3`の実コード、`LEADING`の有無
- Think Aloudの逐語記録、沈黙時間、recording overhead、discussion時間
- 対象race/category/rider、正確なviewport、network/data fallbackの確定値
- 正式なparticipant数、再現回数、原因別のduration配分

### Field-level evidence status

`EVALUABLE` はrecordがその項目を直接支持する、`PARTIALLY EVALUABLE` は要約または推定を含み限定的に扱える、`NOT RECORDED` は判定に必要なrecordがない、という意味で使う。

| Field | Status | Current record-based evaluation |
| --- | --- | --- |
| Participant profile and device class | `EVALUABLE` | `P_1_1`、自転車競技に詳しい、AJOCC `uses it`、race/lap analysis `low`、desktop PC、Windows 11、Chrome、27インチ、mouse + keyboard。 |
| Prior product experience | `EVALUABLE` | `seen once`。完全なfirst-use evidenceではない。 |
| First impression and stated purpose | `EVALUABLE` | 結果をグラフ化し、他選手と比較するサイトという理解、結果表→グラフ→トップ差への視線、選手・グラフへの初期関心が記録されている。 |
| Task goal understanding | `PARTIALLY EVALUABLE` | Task 0〜5は目的理解または目的に沿う発話があるが、Task 1〜5の正式completion判定はない。Task 6の探索目的達成は記録されていない。 |
| Task 1〜6 approximate durations | `PARTIALLY EVALUABLE` | recordの `5 / 5 / 3 / 5 / 3 / 10` を、内容上もっとも整合する「分」の概算として暫定利用する。厳密な実測ではない。 |
| Exact total duration | `NOT RECORDED` | session start/endがないため、正確な総時間は `UNKNOWN / NOT RECORDED`。 |
| Moderator intervention | `NOT RECORDED` | 各Taskの欄は `NR` または `M0–M3` placeholderで、実際の介入は確定不能。 |
| Think Aloud quality and duration | `NOT RECORDED` | 発話、促し、沈黙時間がない。Think Aloudの十分性は評価しない。 |
| Product friction signals | `PARTIALLY EVALUABLE` | participant 1名の観察・self-reportとして仮説化できるが、正式findingではない。 |
| Pilot-wide evidence for protocol and hypotheses | `PARTIALLY EVALUABLE` | protocol校正とPilot-only hypothesisには利用できるが、1名かつ `seen once` のため一般化、severity確定、product変更判断は行わない。 |
| Product code status | `EVALUABLE` | 今回のレビューによるproduct code変更はない。 |

## Pilot participant limitation

このparticipantはプロダクトを `seen once` であり、完全な初見ではない。したがって、Pilot kitの実施性、質問の理解、観察可能なfrictionの校正には使えるが、first-use discoverabilityの正式な証拠としては弱い。本番では `never used` の参加者を優先し、Pilot participantはformal main-test count、repetition count、severity aggregationから除外する。

## Duration evaluation

### Recorded task durations

| Task | Record value | Working interpretation |
| --- | ---: | --- |
| Task 1 | 約5分 | `PARTIALLY EVALUABLE`。recordのraw valueを分の概算として扱う。 |
| Task 2 | 約5分 | `PARTIALLY EVALUABLE`。同上。 |
| Task 3 | 約3分 | `PARTIALLY EVALUABLE`。同上。 |
| Task 4 | 約5分 | `PARTIALLY EVALUABLE`。同上。 |
| Task 5 | 約3分 | `PARTIALLY EVALUABLE`。同上。 |
| Task 6 | 約10分 | `PARTIALLY EVALUABLE`。同上。ただしprotocolの60〜90秒boxを大きく超える。 |
| Task 1〜6 subtotal | **約31分** | 記録されたTask durationの概算合計（recorded task duration ≈31 min）。 |
| Exact session total | `UNKNOWN / NOT RECORDED` | Task 0、導入、interview、終了の時間がない。 |

Prior target was `10〜15分` for the complete session.したがって、record valuesが分単位の概算であるという前提では、Task 1〜6だけで約31分となり、prior targetに対して **TOO LONG** と評価する。ただし、正確なsession totalそのものは `UNKNOWN / NOT RECORDED` であり、これはexact durationの判定ではない。

### Duration cause decomposition

recordから原因別の分数は配分できない。以下は確認できる範囲と、main testで確認が必要な範囲を分けたものだ。

| Possible cause | Current evidence | Evaluation |
| --- | --- | --- |
| Product UX friction | Task 1の空白・横長、Task 3の比較感の弱さ、Task 4の線の関係、Task 6の操作予測困難などが記録されている。 | 時間を延ばした可能性はあるが、因果・分数は `PARTIALLY EVALUABLE`。main test confirmationが必要。 |
| Free exploration | Task 6は自由探索で、record値は約10分。 | 約10分の主な要因の一つである可能性はあるが、Task 6がtimeboxどおりだったかも含めて原因配分は `NOT RECORDED`。main testで確認する。 |
| Discussion | participantとの説明・確認・interviewの長さがない。 | `NOT RECORDED`。duration原因としては未確認。 |
| Think Aloud | Think Aloud発話・促し・沈黙時間がない。 | `NOT RECORDED`。duration原因としては未確認。 |
| Task protocol | Task 6の時間box、Taskごとのend条件、completion記録が実施record上で確定しない。 | 長時間化に寄与した可能性はあるが、分数は `NOT RECORDED`。main testで固定する。 |
| Recording overhead | moderatorの入力時間、recording機材、記録中断がない。 | `NOT RECORDED`。原因として推測しない。 |

**Task 6 assessment:** 約10分は、仕様上の60〜90秒の自由探索より明らかに長い。これは「自由探索そのものを削除すべき」というproduct判断ではなく、timebox、end記録、discussion / Think Aloud / recording overheadを分離できなかったprotocol上の重要なsignalである。Task 6中のproduct frictionが長時間化に寄与した可能性は残るが、Pilot単独からは確定しない。

## Task-by-task evaluation

Task wordingとorderは `ux3-test-plan.md` の現行文をそのまま保持する。`completion confidence` は正式なcompletion率ではなく、このrecordからの限定的な確信度である。

| Task / wording | Goal understood | Useful evidence | Protocol friction | Product friction | Approx. duration | Completion confidence | Keep / Reword / Merge / Remove |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| **Task 0 — First Impression（操作なし、45秒）**<br>「サイトを開いて、5〜10秒だけ見てください。まだ操作はしないでください。」<br>「これは何をするサイトだと思いますか？」<br>「最初に何をすればよさそうですか？」<br>「一番目についたものは何ですか？」 | `EVALUABLE` — サイト目的、最初の行動、first visual targetを回答できた。 | 結果表→グラフ→トップ差。大会選択は直感的。余白、横長の表、グラフの小ささへの反応。 | start/end、視線測定、moderator発話は `NOT RECORDED`。 | 配置・visual hierarchyへの違和感は観察できるが、1名の仮説。 | `NOT RECORDED` | `PARTIALLY EVALUABLE` — `partial`記録。 | **KEEP** |
| **Task 1 — 大会のカテゴリー結果を探す**<br>「[大会名]で、[カテゴリー名]の結果を確認したいと思っています。結果を探してください。」 | `PARTIALLY EVALUABLE` — 結果を探す目的は成立した可能性が高いが、categoryの正式completionは未記録。 | 大会選択は直感的。結果表の空白、横幅、誰がどのtimeかの読みづらさ。major scroll reversal `あり`。 | first click、start/end、completion、介入が `NOT RECORDED`。 | 結果表のlayout / information density仮説。 | 約5分（推定） | `PARTIALLY EVALUABLE` — `success（推定）`。 | **KEEP** |
| **Task 2 — 1人の選手の走りを確認する**<br>「[選手名]がこのレース中にどのような走りをしていたか確認してください。分かったことを1つ、声に出して教えてください。」 | `PARTIALLY EVALUABLE` — 選手分析の意味は理解した可能性が高いが、最初の意味ある解釈は正式記録なし。 | 「選手の分析はどうなっているかわかる」。情報が複数箇所に散らばるとの発言。 | 読み上げ、介入、completion、発話の逐語性が `NOT RECORDED`。 | context / fragmentation仮説。 | 約5分（推定） | `PARTIALLY EVALUABLE` — `success（推定）`。 | **KEEP** |
| **Task 3 — 周囲の選手と比べる**<br>「この選手が周囲の選手と比べて、どんな位置で走っていたか調べてください。比較したと思える根拠を教えてください。」 | `PARTIALLY EVALUABLE` — 比較の存在は認識したが、比較結果の意味の理解は弱い。 | 「何となく比較しているんだなとわかる」「あまり比較している感がない」。 | comparison発見、変更後feedback、介入、completionは `NOT RECORDED`。 | comparison discoverability / feedback仮説。 | 約3分（推定） | `PARTIALLY EVALUABLE` — `success（推定）`だが意味理解は限定的。 | **KEEP** |
| **Task 4 — レース中の変化を調べる**<br>「この選手がレース中のどこかでペースや順位を大きく変えた場所がないか調べてください。気になった箇所があれば、何が起きたと思うか教えてください。」 | `PARTIALLY EVALUABLE` — ペース・順位の変化を探す目的は成立した可能性が高い。 | 他選手の線との関係を読み取りにくい。chart解釈の困難が記録されている。 | metric切替、Lap Detail、tooltip/legend、介入、completionは `NOT RECORDED`。 | multiple lines / analysis relationshipの仮説。 | 約5分（推定） | `PARTIALLY EVALUABLE` — `success（推定）`。 | **KEEP** |
| **Task 5 — 別の選手へ切り替える**<br>「同じカテゴリーの別の選手についても、同じように確認してください。今回は[別選手名]を見てください。」 | `EVALUABLE` — 別選手へ切り替える目的は理解した可能性が高い。 | 選手変更方法は分かったが、導線を最初に探した。 | 到達経路、context loss、focus、介入、completionは `NOT RECORDED`。 | first-time rider-change discoverability仮説。Task 2後の学習効果がある。 | 約3分（推定） | `PARTIALLY EVALUABLE` — `success（推定）`。 | **KEEP** |
| **Task 6 — 自由探索（60〜90秒）**<br>「ここから60〜90秒、気になる情報を自由に見てみてください。使わない機能があっても問題ありません。」 | `NOT RECORDED` — 自由探索で何を発見したか、目的達成の判定がない。 | hesitation、wrong turn、major scroll reversal。押せる場所と結果を予測しにくいという発言。 | 60〜90秒のtimebox、end時刻、discussion、介入は `NOT RECORDED`。 | affordance / predictability仮説。 | 約10分（推定） | `NOT RECORDED` — `n/a`。 | **KEEP** |

Task wording、Task order、Task 3とTask 4の分離、Task 5の反復分析、Task 6の自由探索目的は変更しない。Task 6の60〜90秒は現行wordingに明示されており、main testでは実時間とend条件を記録する。

## Pilot signals: hypotheses only

以下はrecordに現れた7カテゴリである。いずれもparticipant 1名のsignalで、正式finding・severity確定・product変更にはしない。Main-test confirmation列は要求どおり全て `REQUIRED` とする。

| Signal | Pilot evidence | Candidate severity | Main-test confirmation |
| --- | --- | --- | --- |
| **A. Layout / spatial efficiency** | 「余白の無駄づかいが多い」「表も選手の列が異様に横長」「上行ったり下行ったりが大変」 | P2 candidate | `REQUIRED` |
| **B. Chart prominence** | 「グラフが画面の1/4ぐらいしかない」「グラフをもっと目立たせてほしい」 | P2 candidate | `REQUIRED` |
| **C. Comparison discoverability / feedback** | 「ほかの選手と比較するところがわからなかった」「あまり比較している感がない」 | P2 candidate | `REQUIRED` |
| **D. Rider switching discoverability** | 「選手を変えるところはわかるが、どこにあるか最初探した」 | P2 candidate | `REQUIRED` |
| **E. Interaction predictability** | 「どこが押せて、押したらどうなるか全く想像がつかず」 | P1〜P2 candidate | `REQUIRED` |
| **F. Fragmentation / analysis relationship** | 「選手の分析…いろんな場所に散らばっている」「ほかの選手の線がこうだからこうだとわかる、という関係がわかりづらい」 | P2 candidate | `REQUIRED` |
| **G. Accumulated micro-friction** | 「文字が小さかったり、ボタンが小さかったり」「小さな不便が積み重なって使いづらい」 | P2 candidate | `REQUIRED` |

### High-priority hypothesis

「なんとなく使いづらい」は、単一のP1 defectを意味するとは限らず、first-impression visual hierarchy、比較の意味、controlの予測可能性、small text/button、scrollの複数の小さな摩擦が累積した結果かもしれない。「パッと見いまいちが勝つ」は、その累積がcontent valueより先に知覚される可能性を示すPilot-only hypothesisである。本番で自然発生するか、どの行動・発話・participant数に対応するかを確認する。1名Pilotからformal UX findingにはしない。

## Moderator evidence and intervention guidance

### Pilot moderator evidence

Moderator evidence: **`NOT RECORDED`**。recordの `M0–M3` はplaceholderであり、実際の発言、時刻、介入の種類を示さない。したがってPilotについて、neutrality、Think Aloud reminder、leading、clean successを判定しない。

### Main-test M0–M3 guidance

| Code | Main-test meaning |
| --- | --- |
| `M0` | 介入なし。 |
| `M1` | 一般的なThink Aloud reminderまたは中立質問。「今、何を探していますか？」など、UIの場所・操作・正解を示さない。 |
| `M2` | Task目的を一度だけ言い直す。目的以外の操作方法は教えない。 |
| `M3` | 読み込み失敗、session切替、データ障害など技術問題からの復旧。待ち時間をcompletion timeに含めない。 |

1つのTaskにつき1コードだけを記録する。control、位置、操作、正解、意味を教えた場合は `LEADING` とし、そのTaskをclean successとして集計しない。`M2`、`M3`、`LEADING` は理由と時刻を残す。

## Think Aloud and hesitation definitions

Think AloudはPilotでは `NOT RECORDED`。main testでは、5秒程度沈黙して操作を続けたときTask中1回だけ「考えていることを短く声に出してもらえますか？」と促す。アプリの操作方法を例にせず、促し後も無言なら `TA=low` と記録する。

Formal hesitation definition:

- `Interaction hesitation`: 3秒以上の停止 **かつ** cursorのcontrol間移動、上下探索、戻る操作、または「どこだろう」等の迷い発話があるもの。friction countに含める。
- `Reading / analysis pause`: chart、表、数値を理解するための停止で、操作探索や迷い発話がないもの。friction countに含めず、別のreading pauseとして記録する。
- 判定できない場合は `NR` とする。

「3秒以上停止」だけではhesitationと判定しない。Pilotの記録粒度ではfalse positiveを検証できないため、main testではbehavioral evidenceを必須にする。

## Recording burden and minimum capture

Recording burden: **`HIGH`**。Pilotでmoderatorの実時間負荷は測定できないが、必須項目がrecordに大量に残っておらず、旧方式では同時記録の負荷または入力ルールの曖昧さが高いことが分かる。main testでは、その場で必須な項目と後から補完する項目を分ける。

### Minimum during-session capture

- session start/end
- 各Taskのstart/end（秒）
- `success / partial / fail / NR`
- `M0 / M1 / M2 / M3 / LEADING` の1コード
- major frictionの短いメモ
- notable participant quote最大1件

### Minimum after-session capture

- first click
- interaction hesitation count / reading pause count
- wrong turn / major scroll reversal
- severity、suspected cause、UX recommendation
- critical momentの`expected / actual / follow-up`
- post-testのEase / Confidenceと空欄の `NR`

記録できない値を推測して埋めない。Pilotの空欄を成功・失敗へ変換しない。

## Final main-test protocol

### Participants

`3〜5人`。Pilot participantは除外する。`never used` を優先し、AJOCC / cyclocross familiarityとrace/lap analysis experienceが同じになりすぎないよう、利用可能な範囲で混ぜる。Pilotの `seen once` は正式なfirst-use participantとして数えない。

### Session target and split

現実的なsession targetは `15〜25分` とする。

| Segment | Target | Contents |
| --- | ---: | --- |
| Core flow | 8〜13分 | Intro後、Task 0〜5を同じ順序・同じ目的文で実施。各Taskの目的達成または制限時間で次へ進む。 |
| Free exploration | 2〜3分 | Task 6そのものは60〜90秒固定。導入・終了確認・最小記録を含むsegment全体を3分以内の目安とする。 |
| Interview | 4〜6分 | post-testのQ&Aと5項目評価。自由回答を先に聞き、数値評価を後にする。 |
| Consent / close buffer | 1〜3分 | 同意、終了時刻、技術障害、追加コメント。 |

合計は参加者の発話量により15〜25分の範囲で運用する。長引く場合はTask 0〜3、Task 5、post-testを優先し、Task 4のdeep dive、interview follow-up、close bufferを短縮または省略する。Task 6の60〜90秒は固定し、短縮・省略しない。超過した場合はprotocol frictionとして記録する。

### Task execution

1. 新規browser session、viewport、device、browser、対象race/category/rider、data fallbackを開始前に記録する。
2. 同じTask 0〜6、同じorder、同じ目的文を使う。UI名、正解操作、比較場所、選手変更方法は先に教えない。
3. 参加者が止まったら最低3秒待ち、中立質問を一度だけ使う。M0〜M3または`LEADING`を1つ記録する。
4. Task 0〜5は目的達成、中止、またはtimebox到達でendを記録する。Task 6は60〜90秒の固定timebox到達時にendを記録する。durationを秒で計算する。
5. session終了時にpost-testを行い、end時刻を記録する。
6. participant退出後にfirst click、pause、wrong turn、scroll、critical momentなどを補完する。

Task wording/orderは変更しない。技術障害のみ `M3` として記録し、必要なら同条件の予備raceへ切り替える。

## Future improvement (Q&A format only)

**Q: Pilotを根拠にproduct codeを変更するか？**
A: 変更しない。今回のsignalsは仮説であり、main testで `REQUIRED` の確認を行う。

**Q: main testで最初に改善する測定は何か？**
A: session/task start-endを秒で記録し、completion、介入コード、major friction、quoteを最小必須項目として残す。後補完項目はparticipant操作を止めない。

**Q: 約10分のTask 6をどう扱うか？**
A: 自由探索の目的は保持し、promptの60〜90秒timebox、end時刻、超過理由を記録する。product friction、discussion、Think Aloud、recording overheadのどれが原因かはmain testで確認する。

**Q: 参加者条件はどう改善するか？**
A: `never used` を優先した3〜5人を正式datasetとし、Pilot `seen once` は除外する。AJOCC familiarityとanalysis experienceは可能な範囲で混ぜる。

**Q: 何をUX findingとして扱えるか？**
A: 複数participantで自然発生し、操作・発話・completion・時間などのfield-level evidenceが揃ったものだけを正式分析へ進める。1名Pilotの好みや未記録項目はfindingにしない。

## Readiness verdict

| Gate | Result |
| --- | --- |
| Available pilot record identified and read | `PASS` |
| Task 0〜6 wording and order usable | `PASS` |
| Task 1〜6 approximate duration reconstructed | `PARTIALLY EVALUABLE` — 約31分の概算subtotalのみ。 |
| Exact total duration | `NOT RECORDED` — `UNKNOWN`。 |
| Duration versus prior 10〜15 minute target | `TOO LONG` — Task 1〜6の分単位解釈に基づく暫定判定。 |
| Pilot-wide product UX evidence | `PARTIALLY EVALUABLE` — hypothesisとしては利用可能だが、formal finding・severity確定・product変更判断はmain testへ延期。 |
| Main-test capture minimum and M0〜M3 guidance | `PASS` — this reviewで明文化。 |
| Participant mix and Pilot exclusion | `PASS` — 3〜5人、`never used` priority。 |
| Product code unchanged | `PASS` |

最終判定: **`UX3-0.5 READY FOR HUMAN FIELD TEST`**

このreadinessはproduct UXが検証済み、またはPilotの仮説が確定したという意味ではない。現recordから確認できるprotocol上の不足を明示し、15〜25分のmain-test protocol、最小capture、参加者条件、未確定fieldの扱いを確定できたことに対するreadinessである。
