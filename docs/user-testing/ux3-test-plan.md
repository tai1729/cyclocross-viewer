# UX3-0 小規模人間ユーザーテスト計画

ステータス: `UX3-0 USER TEST READY`

## 目的

このテストは、AJOCC LapTime Viewer のUX2実装が、実際の初見ユーザーにとって自然に使えるかを検証するformative usability testである。Codex、browser automation、既存のUX2検証結果は人間参加者の代替にしない。

最重要質問は次のとおり。

> アプリの構造やUI名称を教えられていない初見ユーザーが、分析したい情報へ自然に到達できるか。

検証する仮説:

- 最初に何をすればよいか理解できる。
- 設定フォームではなく、結果・分析が主目的の画面として理解される。
- 特定選手を探し、走りの推移を読む方法を発見できる。
- 周囲の選手との比較方法と現在の比較状態を理解できる。
- 指標の切替を自発的に発見できる。
- Results / Lap Detail は必要時に発見でき、初期画面を過度に占有しない。
- 条件変更と分析結果の確認を繰り返しても、迷い・往復・文脈喪失が大きくならない。
- UX2-5で残ったP2候補（初回選択後のpointer focus、狭い画面のtooltip/legend等）が人間の主要行動で観察されるか。

この段階では、参加者データが集まる前にUX3の実装計画やUI変更案を確定しない。

## 範囲と非目標

- 対象: production URL `https://ajocc-laptime-viewer.vercel.app/`
- 対象: 初見ユーザーの発見性、理解、操作負荷、分析の反復性、印象。
- 対象外: 統計的有意差、機能の網羅率、チャート計算の正しさの再検証、正式なSUSスコア、完全なスクリーンリーダー認証。
- 参加者にUX2の設計意図、Option B、workspaceという用語、正しい操作手順を説明しない。
- product codeはこのテスト準備では変更しない。

## 参加者構成

3〜5人。統計的代表性ではなく、異なる前提知識から大きな摩擦を発見するための構成とする。

| 枠 | 想定属性 | 推奨人数 | 観察したい差 |
| --- | --- | ---: | --- |
| A | シクロクロス、ロード、レース結果などに詳しい | 1〜2 | 順位・lap・比較の概念を自然に解釈できるか |
| B | スポーツ／データアプリは使うがAJOCCには詳しくない | 1〜2 | 分析UIの一般的な手掛かりが通じるか |
| C | AJOCCやlap分析に不慣れな一般ユーザー | 1 | 初回の意味理解、用語、結果への到達性 |

同一人物を繰り返し参加者として数えない。UX2の開発・検証に関与した人は可能なら避け、参加する場合は背景に明記する。

## 環境

### 共通

- production URLを使用する。テスト前にURL、読み込み、代表race/category、対象選手、比較対象が有効であることを確認する。
- 新しいbrowser sessionまたはincognito相当から開始する。既存のURL、scroll、local stateを引き継がない。
- moderatorの端末から操作を奪わず、参加者が操作する。
- 画面録画・音声録音・氏名収集は、事前に明示的な同意を得た場合だけ行う。未同意なら手書き／手入力メモのみとする。
- 個人情報、競技上の機密、参加者の発言を公開資料へ転記する際はID化する。

### 環境割り当て

| 環境 | 目安 | 人数の目安 | 必須記録 |
| --- | --- | ---: | --- |
| Desktop | 1280〜1920px、通常のChrome/Edge/Safari等 | 2〜3 | viewport、browser、task時間、scroll/focus観察 |
| Mobile | 実スマートフォン優先。390px級または320px級を含む | 1〜2 | 端末、viewport相当、向き、touch、sheet、横overflow |

全員が両方の環境を使う必要はない。小規模でもDesktop/Mobile双方の事例が得られるように割り当てる。参加者が自分の端末を使う場合は、端末名とブラウザを記録する。

## facilitator用事前準備

参加者へ見せる前に、次を準備する。参加者にはこの設定表を見せない。

1. `meets.json`から、読み込みが安定し、対象categoryに十分な選手がいるraceを1件選ぶ。可能なら8人以上、large-dataset観察では98人前後のcategoryを別枠で用意する。
2. 初回用のcategoryと、明確な対象選手を決める。選手名の読み方に不安がある場合は、参加者へ正しい名前を提示するだけでよい。
3. 周囲の選手比較が成立するよう、対象選手の前後に複数のgraphable riderがいることを確認する。
4. 使うrace名、category、対象選手、別選手、比較の事実上の期待値、データ品質（DNF、lap down等）をこの計画とは別のfacilitatorメモに記録する。
5. 参加者へは、UIラベルやURL queryを教えず、タスクの目的と必要な対象名だけを読み上げる。
6. テスト中のデータ読み込み失敗に備え、同じ意味の予備raceを1件用意する。予備への切替は技術的問題として記録し、参加者の失敗には数えない。

## 1セッションの進行（15〜25分）

参加者へは、intro、Task 0〜6、post-test interviewを含めて15〜25分程度と伝える。task後またはsession後の詳細な記録・分類は参加者の待ち時間に含めず、参加者が退出した後に行う。

| 時間 | 内容 | 目的 |
| ---: | --- | --- |
| 0:00–2:00 | 同意、think-aloud、禁止事項の説明 | 心理的安全性と記録条件を揃える |
| 2:00–3:00 | Task 0 First Impression | 第一印象と最初の意図を得る |
| 3:00–5:00 | Task 1 | 大会結果への到達性 |
| 5:00–8:00 | Task 2 | 選手分析とchart発見 |
| 8:00–11:00 | Task 3 | 周囲との比較 |
| 11:00–14:00 | Task 4 | 指標・変化・lap情報の探索 |
| 14:00–16:00 | Task 5 | 別選手への切替 |
| 16:00–17:30 | Task 6 | 自発的発見（60〜90秒固定） |
| 17:30–22:30 | interviewと1〜5評価（4〜6分） | 言語化された印象と優先順位 |
| 22:30–25:00 | interview follow-up / close buffer（必要時のみ） | 追加確認と終了 |

Task 0〜5は、目的達成の見込みが低く制限時間に達した場合は中止して次へ進む。中止は失敗ではなく観察データである。Task 6はプロンプト後60〜90秒を固定timeboxとして実施し、途中で短縮・省略しない。時間不足時はTask 0〜3、Task 5、post-testを優先し、Task 4のdeep dive、interview follow-up、close bufferを短縮または省略する。

## Moderator protocol

### 基本ルール

- participantの目的、発話、迷いを観察し、操作方法を教えない。
- 参加者が沈黙したときは最低3秒待つ。
- およそ3秒の停止だけではfriction eventとしない。control探索、cursorの迷走、探索的な上下scroll、迷い発話などのbehavioral evidenceがある場合だけ`Interaction hesitation`として記録し、chart・表・数値を読むための`Reading / analysis pause`はhesitation countから除外する。判定できない場合は`NR`とする。
- 参加者が「次に何をすればよいか分からない」と言ったら、まず「今、何を探していますか？」と尋ねる。
- 「ここです」「このボタンです」「グラフは下です」「比較はここです」「選手変更はこちらです」は言わない。
- 参加者が結果を得た後に、正しさを先回りして肯定しない。「そう思った理由を教えてください」と聞く。
- 参加者が自分から機能を使わなかったこともデータとして残す。Lap Detail等を必ず使わせない。

### Neutral probe（中立質問）

必要時に1回ずつ使用し、答えやUI名を含めない。

1. 「今、何を探していますか？」
2. 「次に何が起こると思っていますか？」
3. 「どこを押そうと思っていますか？」
4. 「画面のどの情報が判断材料になっていますか？」
5. 「その表示をどういう意味だと理解しましたか？」
6. 「別の方法を試すとしたら、何を試しますか？」

介入レベルは `M0=介入なし`、`M1=中立的なThink Aloud reminderまたはprobe（上記の中立質問）`、`M2=中立的な質問・probeでタスク目的を一度言い直す`、`M3=既存定義の技術障害からの復旧（新規session/予備race）` と記録する。現行定義ではM3を直接の操作案内・救済には広げず、control、位置、正解、意味を直接教えた場合は`LEADING`とする。M2/M3/LEADINGを行った場合は理由と時刻を書く。1つのtaskにつき介入コードは1つだけ記録し、範囲表記は使わない。

### 記録の順序と最小セット

記録負荷を下げるため、moderatorはすべての項目を同時に埋めない。

1. タスク文を読み上げる直前にstart時刻を秒まで記録する。
2. 目的達成、中止、または制限時間到達時にend時刻を秒まで記録する。durationは秒で計算し、単位を省略しない。exactなstart/endが取れない場合だけ、`approx.`と明記した近似時間を記録し、推測や捏造はしない。
3. その場で `success / partial / fail` を1つだけ選ぶ。選べない場合は `NR` とする。
4. その場で `M0 / M1 / M2 / M3 / LEADING` のいずれか1つを選ぶ。`M0–M3` の範囲表記を結果欄に残さない。
5. major hesitation/frictionがあれば1行、participantの原文が取れれば1 quoteだけ記録する。

その場で必須なのは、task outcome、exactなstart/endがない場合の`approx.`付き時間、major hesitation/friction、介入コード1つ、notable quoteである。real-timeに表の全欄を埋める必要はない。first click、wrong turn、scroll reversal、interaction hesitationの詳細、severity、suspected cause、facilitator findingは、参加者を待たせない範囲でメモし、task後またはsession後に補完する。記録できない値は推測せず `NR` とする。

一問ずつ進めるQ&A形式は将来のprotocol改善候補にとどめ、今回のtable templateを置き換えない。

### Think Aloudと介入の判定

参加者が5秒程度沈黙して操作を続けている場合、1回だけ「考えていることを短く声に出してもらえますか？」と促す。操作方法やアプリの例は提示しない。促し後も発話がない場合は `TA=low` と記録し、無理に質問を重ねない。

moderatorがcontrol、位置、正解、意味を直接教えた場合は `LEADING` と記録し、そのtaskをclean successとして数えない。中立質問や一般的なThink Aloud reminderは `M1` とする。

### Hesitationの定義

およそ3秒は候補を見つけるための観察閾値であり、単独ではfrictionに数えない。

- `Interaction hesitation`: およそ3秒の停止に加え、control探索、cursorの迷走、探索的な上下scroll、戻る操作、「どこだろう」等の迷い発話のいずれかがあるもの。friction countに含める。
- `Reading / analysis pause`: chart・表・数値を理解するための停止で、探索行動や迷い発話がないもの。hesitation countとfriction countに含めず、必要なら分析pauseとして記録する。
- 判定不能: `NR`。読み取りをfrictionに変換しない。

## タスク

以下は参加者へ読み上げる目的文。UIの固有名称は含めない。

### Task 0 — First Impression（操作なし、45秒）

サイトを開いて、5〜10秒だけ見てください。まだ操作はしないでください。

質問:

- 「これは何をするサイトだと思いますか？」
- 「最初に何をすればよさそうですか？」
- 「一番目についたものは何ですか？」

記録: first visual target、推測した目的、最初に押そうとしたもの、混乱、発話。回答後に通常操作へ進む。

### Task 1 — 大会のカテゴリー結果を探す

> 「[大会名]で、[カテゴリー名]の結果を確認したいと思っています。結果を探してください。」

大会名とcategory名はfacilitatorが指定するが、選び方やUI名は説明しない。完了は、参加者が目的のcategoryの結果を見つけ、「見つけた」と判断できる状態になった時点。

測定: 最初のクリック、完了時間、wrong turn、scroll、categoryの意味理解、結果の発見、Ease/Confidence。

### Task 2 — 1人の選手の走りを確認する

> 「[選手名]がこのレース中にどのような走りをしていたか確認してください。分かったことを1つ、声に出して教えてください。」

参加者が結果から探すか、別の導線を使うかは制限しない。発話した内容が順位推移、gap、pace、lapのいずれでも構わない。metric名やchartの場所を先に教えない。

測定: rider discovery、分析開始までの時間、chartまたは数値情報の発見、current contextの理解、最初の意味ある解釈、chartを見失った回数。

### Task 3 — 周囲の選手と比べる

> 「この選手が周囲の選手と比べて、どんな位置で走っていたか調べてください。比較したと思える根拠を教えてください。」

比較の人数や設定値は指定しない。参加者が現在値を説明できるか、変更を試すか、変更後に結果の違いを確認するかを観察する。

測定: comparisonの発見、意味の解釈、変更の発見、変更後feedback、chartとの往復、Confidence、誤解したラベル。

### Task 4 — レース中の変化を調べる

> 「この選手がレース中のどこかでペースや順位を大きく変えた場所がないか調べてください。気になった箇所があれば、何が起きたと思うか教えてください。」

参加者が自発的に指標を切り替えるか、細かいlap値を探すかを観察する。特定のUIや詳細パネルの使用は要求しない。

測定: 指標切替の発見、active stateの理解、値の読み取り、Lap Detailの自発的発見、tooltip/legendの問題、ラベルやstatusの誤解。

### Task 5 — 別の選手へ切り替える

> 「同じカテゴリーの別の選手についても、同じように確認してください。今回は[別選手名]を見てください。」

結果から選ぶか、選手を探す導線を使うかは指定しない。選択後に、race/category/選手の現在文脈を保てているか、前の選手と混同しないかを観察する。

測定: rider change discovery、別選手表示までの時間、chartへの復帰、scroll reversal、context loss、focusの見失い、URLを使う発話があった場合の記録。

### Task 6 — 自由探索（60〜90秒）

> 「ここから60〜90秒、気になる情報を自由に見てみてください。使わない機能があっても問題ありません。」

特定機能を促さない。何を最初に選ぶか、どの情報を掘り下げるか、どの機能を無視するかを記録する。Lap Detailを使わなかった場合は、後で理由を聞くが、使用を要求しない。

## 記録する指標

### タスク単位

| 指標 | 記録方法 |
| --- | --- |
| completion | `success` / `partial` / `fail`。目的を自力で達成したかで判定 |
| completion time | start/endを記録し、秒単位で計算する。単位不明の値は使用しない |
| first-click correctness | 最初の操作が目的へ直接向かったか。探索クリックはwrong turnとして別記録 |
| hesitation | およそ3秒の停止に加え、control探索・cursorの迷走・探索的scroll・迷い発話があるinteraction hesitationのみ。reading / analysis pauseとは分離し、判定不能は`NR` |
| wrong turn | 目的に向かわない操作、誤った項目、戻る操作。単なる確認クリックは除外 |
| major scroll reversal | 目的領域を探すため、1 viewport相当以上の上下往復が発生した回数 |
| moderator intervention | `M0` / `M1` / `M2` / `M3` / `LEADING`のいずれか1つだけ。理由と時刻を残す |
| Ease | タスク直後に1=とても使いにくい〜5=とても使いやすい |
| Confidence | 1=正しく操作できたか不明〜5=完全に理解した |

### Friction event

次のいずれかが発生したら時刻を記録する: およそ3秒の停止に加えてcontrol探索、cursorの迷走、探索的scroll、迷い発話があるinteraction hesitation、同じ場所の往復、control探索のためのscroll、誤ったcontrol、分からないという発言、browser backを逃げ道として使う、chart/current riderを見失う、unexpected scrollへの反応、disclosureを見つけられない、ラベルの意味の誤解。自然なreading / analysis pauseはhesitation countに含めず、別記録とする。判定不能は`NR`とする。

### Critical moment log

次のフィールドで記録する: `timestamp / task / participant action / participant quote / expected behavior / actual behavior / suspected cause / severity / evidence`。事後の解釈と、その場の事実を分けて書く。

## Post-test interview

誘導を避け、task全体が終わってから聞く。

1. 「全体としてどれくらい使いやすかったですか？」（1〜5）
2. 「一番分かりやすかったところはどこですか？」
3. 「一番分かりにくかったところはどこですか？」
4. 「操作中、何度も戻ったり探したりしたところはありましたか？」
5. 「もっと目立ってほしかったものはありますか？」
6. 「逆に、画面を取りすぎていると感じたものはありますか？」
7. 「グラフを見ることと、条件を変えることはどうでしたか？」
8. 「もう一度使うとしたら、迷わず使えそうですか？」
9. 「何か『なんとなく使いづらい』と感じた瞬間はありましたか？」
10. 「1つだけ直せるなら、どこを直しますか？」

次の5項目を各1〜5で評価してもらう。正式なSUSスコアではない。

| 項目 | 1 | 5 |
| --- | --- | --- |
| Easy to learn | 学びにくい | すぐ分かった |
| Easy to navigate | 探しにくい | 迷わない |
| Easy to compare | 比較しにくい | 比較しやすい |
| Easy to understand current context | 現在状態が不明 | 常に分かった |
| Pleasant to use | 不快 | 快適 |

## 分析方法

1. 参加者ごとの記録を匿名化し、まず事実（操作、時間、発話、介入）を転記する。
2. その後、同じ現象を「discoverability」「context」「analysis reading」「repetition」「disclosure」「scroll/focus」「content/label」「technical」へ分類する。
3. 各findingに `participant count / occurrence count / task impact / severity / qualitative evidence` を付ける。
4. 1人の好みと複数人の摩擦を分ける。`3/4 participants` の同一失敗は強いsignalだが、サンプルが小さいことを明記する。
5. 完了率、中央値時間、平均Ease/Confidenceは補助指標として扱い、少人数の平均だけで結論を出さない。
6. P0/P1は主要taskの妨害・誤解・不能として扱い、P2/P3は再現頻度と修正コストを見て扱う。
7. `docs/ux3-backlog.md` の項目は、参加者へ知らせずに自然発生した証拠だけで更新候補とする。再現しない項目を無理に修正しない。
8. 実データが揃うまでUX3 implementation planを作らない。結果の強さに応じて `NO CHANGE`、`UX3 INVESTIGATION`、`BLOCKING` のいずれかを記録する。

## Pilot

本番の前に1人でpilotを行う。pilotは製品評価ではなく、test kitの品質確認である。

- 参加者が待つ範囲（intro、Task 0〜6、post-test interview）が15〜25分に収まるか。post-session reconstructionやfacilitatorの詳細記録時間は含めない。
- Task 6の60〜90秒を維持しつつ、post-test interviewまで実施できるか。
- タスク文がUI名や正解操作を漏らしていないか。
- race/category/riderの提示が難しすぎないか。
- 参加者が途中で何をすればよいか分からなくなっても、中立質問だけで進められるか。
- real-time minimum（task outcome、時間または`approx.`時間、major hesitation、介入コード1つ、notable quote）だけで進行でき、全tableの同時記入を要求していないか。
- exactな時刻がない場合に`approx.`と明記でき、値を推測していないか。詳細なfriction、severity、cause、facilitator findingsを参加者退出後に補完できるか。
- 録音・画面共有・個人情報の同意フローが実際に読めるか。

pilotで観察された製品上の問題は、参加者データが1人分しかないため、原則として修正判断に使わない。task文、時間配分、記録方法の調整に使う。

## 成果物と終了条件

各セッション後に `participant-01.md`、`participant-02.md` の形式で `ux3-participant-record-template.md` を1部コピーして埋める。Pilotは `pilot-participant-01.md` として正式datasetから分離する。全セッション終了後に `ux3-observation-sheet.md` と `ux3-results-analysis-template.md` を更新する。

この準備フェーズの終了条件は、次の5ファイルが存在し、facilitatorがpilotを実施できることだけである。参加者データがない状態でUX3の実装着手や「使いやすくなった」という判定は行わない。
