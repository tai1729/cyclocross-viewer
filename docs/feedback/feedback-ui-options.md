# Feedback UI Options

Status: DESIGN ONLY — NO PRODUCT IMPLEMENTATION
Human Field Test: NOT YET EXECUTED

この文書は、公開後のfeedback入口の比較である。いずれも今回の作業では実装しない。

## 1. Label comparison

| Label | Strength | Weakness | Decision |
| --- | --- | --- | --- |
| `ご意見・不具合を送る` | positive feedback、UX、bugを一度に含み、日本語利用者が行動を理解しやすい | わずかに長い | Recommended |
| `改善のご意見` | friendlyで改善提案を促しやすい | bug / data issueの入口だと分かりにくい | Not selected |
| `使いにくかった点を送る` | usability problemを具体的に促す | positive feedback、表示bug、data issueを狭める。negativeに偏る | Not selected |
| `フィードバックを送る` | 短く一般的 | 日本語利用者によっては何を送る入口か曖昧 | Not selected |

Recommended label: `ご意見・不具合を送る`

## 2. Option comparison

| Option | Discoverability | Intrusiveness | Implementation cost | Mobile | Desktop | Privacy | Expected response quality |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A. Footer / menu feedback | low〜medium。探せるが発見が遅い | very low | low | robust。固定overlayなし | robustだが常時視認性は低い | formとcontextだけなら小さい | 意図的に送る人が多く、深い報告になりやすいが件数は減りうる |
| B. Persistent compact feedback button | high。常に見つけやすい | low〜medium。位置と強調を抑える必要 | medium | fixed overlayを避け、menu / inlineへ適応が必要 | chart外のcompact controlとして配置しやすい | screenshotなし、context許可リストなら管理可能 | page contextが明確で、実利用中の摩擦を拾いやすい |
| C. Button + low-frequency micro-feedback | highest | medium〜high。頻度設計を誤るとsurvey化 | high。状態、頻度、dismiss、実験管理が必要 | modal interruptを避ける設計が難しい | exit / completion後なら可能 | responseとcontextの扱いが増える | passive userのsignalも取れるが、短く浅い回答や疲労が増える |

## 3. Option A — Footer / menu feedback

既存のfooterまたはmenuに `ご意見・不具合を送る` を置く。primary analysisを一切覆わず、実装負荷も小さい。

弱点は、問題が起きた瞬間に入口を思い出せない可能性と、mobileでfooterまで戻る手間である。継続利用者には十分だが、公開直後のdiscoverabilityはOption Bより弱い。

## 4. Option B — Persistent compact feedback button

recommended option。desktopではanalysisのchart、Results、rider controlsを覆わない低強調controlを常時表示する。mobileではfloating buttonを固定せず、既存menuまたはinline/footer配置に切り替える。どのviewportでも同じ短いformへ遷移する。

条件:

- labelは `ご意見・不具合を送る`
- primary actionより視覚的に弱くする
- chart上、scroll位置の主要control上、keyboard focus順の途中に重ねない
- popup、初回modal、毎回のrating promptにはしない
- entryからform送信まで2〜3 interaction程度
- 送信時にcurrent route、race、category、rider、metric、comparison、viewport、browser、versionを許可リストで付与する

このoptionはdiscoverabilityとintrusivenessのバランスがよい。ただし「常時表示」を理由に大きいfloating UIを置かない。mobileの配置は実装時に320px / 390px級で確認する。

## 5. Option C — Button + low-frequency micro-feedback

Option Bに加えて、低頻度で `この分析画面は使いやすかったですか？` を表示する案。negative回答時だけ `何が使いにくかったですか？` を任意表示する。

MVPでは採用しない。採用する場合の制約は次のとおり。

- 毎回表示しない
- analysis中にmodal interruptしない
- task完了または離脱時など、primary actionが終わったタイミングに限定する
- dismissを保存し、短期間に再表示しない
- NPS、長いsurvey、複数のrating promptを同時導入しない
- responseと自動contextのprivacy noticeを表示する

Micro-feedbackはHuman Field Testでもproduction feedbackでもない軽量signalであり、正式findingへ自動昇格させない。

## 6. Recommendation

Recommended: `Option B — Persistent compact feedback button`

ただし、desktopとmobileで同じ固定位置に押し込まず、mobileはmenu / footerへ落とす。実装時の入口は一つに保ち、formは次の最小構成とする。

1. `どんな内容ですか？` category choice
2. `内容を教えてください。` free text
3. optional contact email

current pageなどは可能な限り自動contextで付与し、userに同じ情報を再入力させない。MVPではscreenshotとmicro-feedbackを含めない。

## 7. Release guardrails

- Option Bの採用は、feedback systemの実装方針であり、今回のUI変更ではない。
- provider、retention、region、access controlを確定するまでproduct codeを変更しない。
- 一件のfeedbackだけで一般UX変更を行わない。
- correctness、accessibility、major task failure、severe misunderstandingは報告数にかかわらず確認対象とする。
- 同一内容はissue clusterにまとめ、occurrence countを保持する。
- Human Field Testは3–5名を確保できた時点で別途実施する。

## 8. Decision

`Recommended UI option = B`

`Recommended label = ご意見・不具合を送る`

`Micro-feedback = MVPでは採用しない`

この設計の終了状態は `UX3-1A FEEDBACK SYSTEM DESIGN READY` であり、Human validation済みを意味しない。
