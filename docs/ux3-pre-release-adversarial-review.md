# UX3-1A Pre-release Adversarial Review

Status: DESIGN REVIEW — HUMAN EVIDENCE PENDING
Human Field Test: NOT YET EXECUTED

Pilotは存在するが、正式datasetには含めない。Pilotはprotocol calibrationと仮説形成には使えるが、Human Field Testの代替、Human validation済みの根拠、participant間比較の根拠、またはproduct変更を直接承認する根拠ではない。

## 1. Review purpose and boundary

このreviewは、公開前に「初見ユーザーがどこで嫌になるか」を敵対的に確認するための設計監査である。AI/source reviewでHuman User Testを置き換えない。

今回確認した資料は次のとおり。

- `docs/user-testing/ux3-pilot-review.md`
- `docs/user-testing/ux3-test-plan.md`
- `docs/user-testing/ux3-moderator-script.md`
- `docs/user-testing/ux3-participant-record-template.md`
- `docs/user-testing/ux3-observation-sheet.md`
- `docs/user-testing/ux3-results-analysis-template.md`
- `docs/DESIGN.md`
- `docs/2026-09-05-project-handoff.md`
- Home / race / analysis components and styles

この文書の分類は、artifactまたは既存記録の状態を表す。ユーザーが実際にそう感じたことを意味しない。

- `HUMAN CONFIRMATION NEEDED`: 実ユーザーの観察・発話・task行動が必要。
- `TECHNICALLY CONFIRMED`: sourceまたは既存仕様から、UI要素・状態・契約の存在を確認できる。ただし使いやすさは未確認。
- `VISUALLY PLAUSIBLE`: layout / density / prominenceなど、sourceまたは既存のPilot signalから視覚的な懸念は妥当だが、ユーザー影響は未確認。
- `NOT REPRODUCED`: 今回確認したsourceと記録から、その問題を再現できる根拠がない。

## 2. Reviewer perspectives

### Reviewer A — First-time General User

AJOCCやcyclocrossを知らない初見利用者として、最初の画面で「何のサイトか」「最初に何をするか」「何が押せるか」を確認する。chart、comparison、選手変更が説明なしに理解できるかは、sourceだけでは確定せずHuman確認を要する。

### Reviewer B — Cycling User

順位やレース結果には慣れているが、このアプリは初見の利用者として、欲しい結果への到達、Resultsとanalysisの関係、race/category/rider変更、lap analysisの価値を確認する。domain knowledgeがあっても本アプリのdiscoverabilityを保証しない。

### Reviewer C — Data / Dashboard UX Reviewer

visual hierarchy、information density、whitespace、chart prominence、control placement、repeated analysis、affordance、progressive disclosureの観点で、画面内の情報の優先順位と操作の予測可能性を確認する。

### Reviewer D — Hostile Usability Reviewer

設計を正当化せず、「なんかダサい」「なんか面倒」「何を押すか分からない」「情報が散らばっている」「スクロールしたくない」「覚える必要がある」「一回使ってもう使わなくなりそう」という第一印象につながる要因を探す。これらの感想はHuman evidenceなしにはfindingに昇格しない。

## 3. Adversarial findings

| Perspective | Finding / inspection question | Available evidence | Classification | Human interpretation status |
| --- | --- | --- | --- | --- |
| A | Homeの目的と最初の行動 | Homeには「AJOCC results」「大会を選ぶ」、season / seriesの絞り込み説明がある。 | TECHNICALLY CONFIRMED | 初見で十分に意味が通るかは HUMAN CONFIRMATION NEEDED |
| A / B | Resultsからanalysisへ移るときの文脈 | Results tableから選手を選び、analysis region、選手、比較、metricを表示する構造がある。 | TECHNICALLY CONFIRMED | 遷移が自然か、戻り方を理解できるかは HUMAN CONFIRMATION NEEDED |
| B / C | Chartが主役として十分目立つか | Pilotには「chartが小さい」「もっと目立ってほしい」がある。source上はchart以外にもsummary、lap detail、controlsが同一analysis flowに存在する。 | VISUALLY PLAUSIBLE | 感じ方とtask影響は HUMAN CONFIRMATION NEEDED |
| A / B | Comparisonの場所が分かるか | `比較対象`、`固定`、`全員`、`選手を変更`などの明示的controlは存在する。Pilotでは比較している感覚が弱いというsignalがある。 | HUMAN CONFIRMATION NEEDED | Pilot-only hypothesis。formal findingではない |
| A / B | Rider switchingのdiscoverability | `選手を変更` trigger、検索入力、prev / next操作が存在する。 | TECHNICALLY CONFIRMED | 初回にcontrolを探すか、変更後の状態を理解できるかは HUMAN CONFIRMATION NEEDED |
| A / C | 何が押せるか、押すと何が起きるか | button、select、disclosure、chart tabs、mobile dialogなどの操作要素とlabelはsourceで確認できる。 | TECHNICALLY CONFIRMED | interaction predictabilityは HUMAN CONFIRMATION NEEDED |
| C / D | Analysis情報が複数領域に分かれ、探索コストが積み上がるか | Context bar、rider selector、summary、comparison、chart、lap detail、Results disclosureに分割されている。 | VISUALLY PLAUSIBLE | 断片化が実際の迷い・離脱を生むかは HUMAN CONFIRMATION NEEDED |
| C / D | 余白、表の横幅、上下移動 | Pilotと既存UX記録に、余白、横長の表、上下移動への懸念がある。sourceはdesktop gridとmobile disclosureを持つが、全viewportでの体験は未確認。 | VISUALLY PLAUSIBLE | exact deviceでのscroll burdenは HUMAN CONFIRMATION NEEDED |
| C | Repeated analysisの操作負荷 | category、rider、compare、tab、lapをURL stateとして保持し、analysis contextを表示する構造がある。 | TECHNICALLY CONFIRMED | stateを覚える必要があるか、反復利用が面倒かは HUMAN CONFIRMATION NEEDED |
| A / B | Chartの意味とmetricの理解 | タイム差、周回差、ラップ、順位というmetric labelとanalysis contextがある。 | TECHNICALLY CONFIRMED | chartを正しく解釈できるかは HUMAN CONFIRMATION NEEDED |
| B | Dataの信頼境界 | Race headerに更新導線、取得元データ、公式リザルトではない旨がある。 | TECHNICALLY CONFIRMED | 注意書きが理解・信頼判断に役立つかは HUMAN CONFIRMATION NEEDED |
| A / C | Mobileの主要操作とkeyboard focus | sourceには44px相当の主要操作、mobile専用のanalysis actions / disclosures、focus管理がある。 | TECHNICALLY CONFIRMED | 320px / 390px級で読みやすく操作できるかは HUMAN CONFIRMATION NEEDED |
| D | 「なんかダサい」「パッと見いまいちが勝つ」 | Pilotのparticipant commentとして記録されているが、1名のPilot signalであり、sourceだけから主観的印象は再現できない。 | HUMAN CONFIRMATION NEEDED | high-priority hypothesis for main test |
| D | 大規模なtask failureまたは致命的な誤解 | 今回確認した資料とsourceから、全participantに共通するtask破綻は確認できない。 | NOT REPRODUCED | Human Field Testで再確認する |

## 4. Pilot hypothesis comparison

以下はPilot-only signalを、source / existing recordから確認できる範囲で再分類したもの。いずれもHuman-confirmed findingへ昇格させない。

| Pilot hypothesis | Technical / visual review | Classification | Required next evidence |
| --- | --- | --- | --- |
| Spatial efficiency: 余白、横長の表、上下移動 | 複数のanalysis領域とResults disclosureがあり、Pilotにも同じsignalがある。 | VISUALLY PLAUSIBLE | Humanでtask中のscroll、迷い、離脱を確認 |
| Chart prominence: chartが小さく感じられる | chart以外のsummary / controls / detailも同一flowにあるため、優先順位の懸念は妥当。 | VISUALLY PLAUSIBLE | Humanでchart発見・理解・再訪を確認 |
| Comparison discoverability | comparison controlは実在するが、発見・理解の成否はsourceから推測できない。 | HUMAN CONFIRMATION NEEDED | 初見participantの最初の探索と発話 |
| Rider switching discoverability | `選手を変更`と検索UIはsource上存在する。Pilotの初回探索signalはHumanで再確認が必要。 | TECHNICALLY CONFIRMED | control発見までの行動・発話 |
| Interaction predictability | 操作要素とlabelは存在するが、結果の予測可能性は利用者依存。 | HUMAN CONFIRMATION NEEDED | 誤操作、説明要求、3秒以上の探索 |
| Analysis controls fragmentation | context / rider / comparison / chart / lap detailが別領域にある。 | VISUALLY PLAUSIBLE | 反復taskで移動・記憶負荷を確認 |
| Accumulated micro-friction | 文字、button、scroll、spacingの個別懸念はあるが、累積感は主観的。 | HUMAN CONFIRMATION NEEDED | 複数participantの自然発話と再発数 |
| 「なんとなく使いづらい」「パッと見いまいち」 | Pilotの重要signalだが、AI reviewで感情や印象を再現しない。 | HUMAN CONFIRMATION NEEDED | high-priority hypothesisとしてmain testで確認 |

## 5. Release blocker assessment

### New release blocker

このAI/source reviewだけでは、新しいrelease blockerは確定しない。現在確認できるのは、主にvisual plausibilityとHuman confirmationが必要な仮説である。Human Field Test未実施は明示的なvalidation limitationだが、今回のfeedback system designをblockする理由ではない。

### Non-blocking concerns

- Pilot participantは1名で、`seen once`。first-use discoverability evidenceとして弱い。
- Pilotのapproximate time、intervention、viewport、exact clickなどは正式な再現証拠ではない。
- 各種UX signalは、3–5名のHuman Field Testまたは公開後の繰り返しfeedbackで確認する必要がある。
- Feedback intakeのprovider、retention、privacy設定は、実装前に確定する必要がある。

### Product change boundary

今回の結論はproduct code、CSS、component、chart logic、application configの変更を承認しない。Pilot hypothesisを理由にUIを即時変更しない。Human Field Testとproduction feedbackを別のevidence sourceとして蓄積する。

## 6. Decision and next phase

1. Human Field Testは `NOT YET EXECUTED` のまま保持する。
2. 上記のUX signalをPilot-only / technically or visually observed / Human confirmation requiredに分離する。
3. feedback entry pointは別紙specで設計し、implementationはspecとprivacy review後に開始する。
4. 3–5名を確保できた時点で、既存UX3 protocolを用いた正式Human Field Testを実施する。
5. 単独feedback 1件だけでproduct変更を開始せず、repeat、major task failure、severe misunderstanding、accessibility、correctnessを優先する。

## 7. Verdict

`UX3-1A FEEDBACK SYSTEM DESIGN READY`

このverdictは、pre-release adversarial reviewとfeedback intakeの設計が次段階へ進める状態であることを示す。Human validation済み、正式dataset完成、またはPilot仮説の確定を意味しない。
