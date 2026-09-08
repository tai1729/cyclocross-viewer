# UX3-4 Multi-Reviewer Synthesis

作成日: 2026-09-09 JST

## Executive Summary

本報告は、Astra・Sol・Terraの3件のSynthetic AI Reviewと、Owner Human Review 1件を、同じ一次資料として混同せずに統合した証拠レビューである。外部Human Field Test参加者は0人、Owner Human Reviewは1件、Synthetic AI Reviewは3件である。したがって、これは人間参加者調査の完了報告ではない。

最も再現性が高いのは、順位・ラップを中心とするチャートの価値、リザルト／順位の読みやすさ、指標切替と比較操作の有用性である。一方、多人数比較時の線と選手名の対応、用語と指標方向の理解、分析画面の発見性・情報優先度は複数の証拠で摩擦が示された。Owner Humanはさらに、初期グラフ発見、スクロール負荷、弱い操作 affordance、選択周回表の分離を強く指摘している。

推奨ゲートは **PROCEED WITH LIMITED SCOPE**。十分に三角測量できるチャート識別性・状態表示・短い説明の改善は次の限定的実装候補とする。ただし、大規模なレイアウト／再設計、主観的な情報密度変更、DNF／`-1周`の仕様変更、ブラウザ戻るの変更、Mobileの結論は外部人間検証まで保留する。このゲートはHuman Field Testを完了扱いにしない。

## Evidence Sources

権威ある一次資料は次の4件に限定した。

1. [Astra — UX3-2 Synthetic Review](ux3-2-synthetic-astra-profile-c-01.md)（`SYN-ASTRA-C-01`、Profile C相当、Desktop、CXK-256-004 / ME1、race-27749到達）
2. [Sol — UX3 Synthetic User Review](ux3-2-synthetic-sol-profile-c-01.md)（`SYN-SOL-C-01`、Profile C相当、Desktop、CXK-256-004 / ME1 / race 27749到達）
3. [Terra — UX3-2 Post-Test Q&A](ux3-2-synthetic-terra-profile-c-01.md)（`SYN-TERRA-C-01`、Profile C相当、Desktop、Production／fixture到達。URLは記録なし）
4. [Owner Human Review](ux3-2-participant-post-test-qa-P-A-01.md)（`P-A-01`、Owner Human Review、Desktop。外部参加者ではなく正式UX3-2 participant datasetでもない）

許可された補助資料は、[Q&A template](ux3-2-participant-post-test-qa-template.md)、[Human Field Test plan](ux3-2-human-field-test-plan.md)、[UX3-3 analysis](ux3-3-human-field-test-analysis.md)のみ参照した。過去のUX review、pilot、技術監査は独立証拠として取り込んでいない。

## Evidence Classification

| 区分 | 件数 | 扱い |
| --- | ---: | --- |
| External Human Field Test participants | 0 | 参加者結果として集計しない。statusは常に `BLOCKED — PARTICIPANTS UNAVAILABLE`。 |
| Owner Human Reviews | 1 | 人間の記録として信号を扱うが、外部参加者でも正式UX3-2 participant recordでもない。 |
| Synthetic AI Reviews | 3 | Astra、Sol、Terra。人間参加者数に算入しない。 |
| Formal UX3-2 participant dataset | 0 | 成功率、プロファイル差、正式なS0–S4集計には使わない。 |

表中の記号は次のとおり。`NR` は未回答／未記録、`N/A` は明示的に該当なし、`NOT TESTED` は未実施、`NO EVIDENCE` は当該reviewerにその finding の証拠がない。明示的な「問題なし」は `NO` とし、証拠なしと区別する。

## Evidence Integrity Gate

| Source/reviewer | Reviewer type | Model / Human | Profile | Device | Viewport | Production version / URL | Primary fixture | Completed Core Questions | Optional Questions | Untested areas | NR / N/A notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Astra | Synthetic AI | Astra / low | C-equivalent | Windows / Chrome extension browser | Desktop; primary operations 1440×900; initial default screenshot 2545×1264 pixels; CSS dimensions NR | YES — https://ajocc-laptime-viewer.vercel.app/ | CXK-256-004 / ME1 / race-27749 | 20/20 | 15 substantive; Q80 N/A; other optional NR | Mobile NOT TESTED | browser version NR; task IDs NR; timing NR; additional questions NR; synthetic self-report and no audio recording N/A |
| Sol | Synthetic AI | Sol / low | C-equivalent | Google Chrome Desktop | about 1905×904 | YES; no explicit URL in metadata | CXK-256-004 / ME1 / race 27749 | Q01–Q20 filled | Q27, Q28, Q36, Q41, Q42, Q44, Q46, Q51, Q52, Q53, Q54, Q60, Q61, Q63, Q71 answered; Q79 N/A; Q80 N/A; all other optional NR | Mobile NOT TESTED | interview time NR |
| Terra | Synthetic AI | Terra / low | C-equivalent | real browser environment | Desktop; about 1440×900 | Production reviewed YES; URL not recorded | Primary fixture reached YES; full URL/race ID not recorded | Q01–Q20 count 20 | Source heading says `Optional questions answered (12)`; visible list contains 14 question headings; completion report says 14 — unresolved source inconsistency; do not treat this as a resolved count | Mobile NOT TESTED; category switching untested/NR | interview duration NR |
| Owner Human | Owner Human Review | Human owner; not external participant and not formal dataset | A | PC | NOT RELIABLE / NOT RECORDED (source literal: `TKI-190-0048 ME1`) | NR | NR (do not treat the malformed viewport value as fixture) | Q01–Q20 populated | Q21–Q84 present; many NR; Q80 answer `普通`, follow-up N/A | Mobile NOT TESTED for synthesis because metadata says Desktop and Q80 `普通` conflicts with Q80 follow-up N/A | interview time NR; stale source status: `空テンプレート — Human Field Test未実施` |

このゲートでは、`NR` は値または回答が記録されていないこと、`N/A` は明示的に非該当であること、`NOT TESTED` は当該領域を実施していないことを表す。欠落したメタデータを `PASS` / `NO` に変換しない。

## Limitations

- Synthetic 3件はすべてDesktopのみ。Astra/Solは明示的に `NOT TESTED`、TerraもMobile未実施である。
- Owner Humanのファイル自体は `空テンプレート — Human Field Test未実施` という stale statusを保持し、ビュー​​ポート欄も `TKI-190-0048 ME1` という不正な値である。Q80の「普通」はDesktopメタデータと矛盾し、Q80のfollow-upはN/Aであるため、Mobile証拠には使わない。
- Owner Humanは人間の信号だが、外部参加者ではなく、正式なUX3-2 participant datasetとしての完備した観察・介入・タスク記録ではない。
- TerraのQ01–Q20は標準Q&Aと同じ番号順・意味ではない。以下では内容のcanonical semantic topicで比較するが、Terraの原番号は実際の証拠参照として保持する。これはTerraの元記録を正式なparticipant recordとして再解釈するものではない。
- Astraはイベントコード探索でリンクメタデータの補助を受けており、Sol/Terraは対象を見つけ、Owner Humanの不満はコードではなくseries順序である。このためコード発見を共通 findingにしない。
- DNFと`-1周`について、Syntheticは不確実性を残し、Owner Humanは妥当な解釈を示す。単一の強い仕様変更 claimにはしない。
- ブラウザ戻るの挙動はAstra/Terraで異なる文脈の観察があり、Owner Humanはサイドボタンの戻るを問題視していない。変更を確定しない。

## Reviewer Agreement Matrix

行の定義は「その reviewer の記録が当該 finding を支持するか」。行列セルは `YES`、`NO`、`PARTIAL`、`NOT TESTED`、`NO EVIDENCE` のいずれかだけを使用する。

| ID | Finding | Astra | Sol | Terra | Owner Human |
| --- | --- | --- | --- | --- | --- |
| POS-01 | リザルト／順位は読みやすい | YES | YES | YES | YES |
| POS-02 | 順位・ラップ中心のチャートに価値がある | YES | YES | YES | YES |
| POS-03 | 大会／カテゴリー／結果への導線は操作可能 | YES | YES | PARTIAL | YES |
| POS-04 | 指標切替は操作可能 | YES | YES | YES | YES |
| POS-05 | 比較は分析価値を提供する | YES | YES | YES | YES |
| MR-01 | 多人数比較で線と選手名の対応が難しい | YES | YES | YES | YES |
| MR-02 | 周回差の意味が即時に分かりにくい（-1周との区別を要する） | YES | YES | YES | YES |
| MR-03 | 指標ごとの上下方向・正負の理解に説明が必要 | YES | YES | YES | YES |
| MR-04 | AJOCC／ME1／seriesの意味が初見で自明でない | YES | YES | YES | NO EVIDENCE |
| MR-05 | 選手選択・固定・初期分析のaffordanceが弱い | PARTIAL | YES | NO | YES |
| MR-06 | 情報優先度・スクロール・チャート階層に負荷がある | YES | YES | PARTIAL | YES |
| MR-07 | 選択周回の表が分離され、使い方／価値が不明 | NO EVIDENCE | NO EVIDENCE | NO EVIDENCE | YES |
| MR-08 | ブラウザ戻る／状態復帰に注意が必要 | YES | NO EVIDENCE | NO EVIDENCE | NO |
| MR-09 | イベントコードを自然発見できない | YES | NO | NO | NO EVIDENCE |
| MR-10 | DNF／`-1周`の解釈に未解決の差がある | YES | YES | PARTIAL | NO |
| MR-11 | Mobileの人間／Synthetic三角測量が不足 | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
| MR-12 | スクロール後の戻る／カテゴリー操作が隠れる | NO EVIDENCE | NO | NO EVIDENCE | YES |

`NO` は「その reviewer が明示的に問題なしとした」場合にのみ使用した。MR-08ではOwner Human、MR-09ではSol/Terra、MR-12ではSolが該当する。TerraのMR-08はブラウザ戻る／状態復帰をテストしておらず、MR-12はカテゴリー切替が `NR` だったため、いずれも `NO EVIDENCE` とした。Owner HumanのMR-09もイベントコード発見ではなくseries順序を論点としており、`NO EVIDENCE` とした。`NO EVIDENCE` は未回答、未テスト、または当該findingを直接確認していない場合である。

## Finding Class Separation

Findingのクラスは、単純な票数ではなく、独立したreviewer記録が示す同じsemantic signalと、証拠の種類・欠測・競合を分けて扱う。

- **Common repeated negative findings**: MR-01, MR-02, MR-03, MR-05, MR-06, MR-10。ここでcommonとは、少なくとも2件の独立したreviewer recordが同じsemantic signalを支持することを指す。機械的なmajority-voteは行わない。MR-10はSynthetic 2/3の信号であり、Owner Humanの反証的な解釈と競合するため、共通の仕様変更とは扱わない。
- **Human-corroborated negative findings**: MR-01, MR-02, MR-03, MR-05, MR-06, MR-07, MR-12。Human corroborationはOwner Humanの記録を含むが、外部Human Field Test参加者の証拠を意味しない。
- **Synthetic-only findings**: MR-04 (3/3), MR-10 (2/3), MR-08 and MR-09 (1/3)。これらの件数は既存のSynthetic agreement countをそのまま使用する。
- **Model-specific signals**: MR-08 and MR-09 are Astra-only。これらはmodel/session-dependentであり、common fixesではない。MR-05/MR-06 are disagreement patterns, not single-model findings。Synthetic間の部分的一致とOwner Humanの強い信号を、単一モデルの所見に縮約しない。
- **Reviewer conflicts**: browser back/stateはAstra vs Terra/Owner、event-code discoveryはAstra assisted vs Sol/Terra found、DNF/-1周 semanticsはSynthetic uncertainty vs Owner plausible interpretation、scroll-hidden controlsはOwner vs Sol/Terraで対立する。これらは対立を残したまま、未解決の主張として扱う。

Evidence Tierの既存の対応（Tier A–G）は変更しない。Finding classは証拠の性質を分離するための補助分類であり、Tier A–G mapping、severity、priorityの再計算ではない。

## Finding Register

以下は正規化したfindingの登録表である。Evidence欄は、一次資料への相対リンクとQ／sectionを示す。`Agreement`、`Human corroboration`、`Synthetic agreement`は、行列の説明に準じた判定であり、件数の機械的多数決ではない。

| ID | Title | Category | Evidence（path + Q/section） | Evidence Tier | Agreement | Human corroboration | Synthetic agreement | Severity candidate | Confidence | Human validation need | Disposition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POS-01 | リザルト／順位の基本可読性 | Results | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q06/Q09; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q06/Q09/Q44; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q04/T-Q17; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q09/Q44/Q48 | Tier A | YES | YES | YES | S3 candidate | 高め | 表の細部と状態理解を外部人間で確認 | 維持 |
| POS-02 | 順位・ラップ中心のチャート価値 | Chart / product value | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q02/Q07/Q14/Q17; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q02/Q14/Q17; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q07/T-Q20; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q06/Q14/Q17 | Tier A | YES | YES | YES | S3 candidate | 高め | 価値と優先順位を外部人間で再確認 | 維持 |
| POS-03 | 大会／カテゴリー／結果への導線 | Navigation | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q12/E06; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q12/Q71; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q14/T-Q15/T-Q71; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q02/Q66/Q67/Q71 | Tier B | PARTIAL | YES | YES | S3 candidate | 中 | スクロール時の可視性を外部人間で確認 | 維持、可視性のみ追試 |
| POS-04 | 指標切替は操作可能 | Chart operation | [Astra](ux3-2-synthetic-astra-profile-c-01.md) E04/Q54; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q02/Q10/Q54; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q08/T-Q09/T-Q10; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q54 | Tier A | YES | YES | YES | S3 candidate | 高め | 操作成功と意味理解を分けて確認 | 維持 |
| POS-05 | 比較は分析価値を提供する | Comparison | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q02/Q11/Q14/Q17; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q02/Q07/Q11/Q17; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q20/T-Q60–Q63; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q11/Q14/Q17 | Tier A | YES | YES | YES | S3 candidate | 高め | 多人数時の価値と負荷を外部人間で確認 | 維持 |
| MR-01 | 多人数比較の線・凡例・選手名の対応 | Chart / comparison | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q03/Q16/Q53/Q63; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q03/Q16/Q53/Q63; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q12/T-Q63; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q06/Q08/Q32/Q53 | Tier A | YES | YES | YES | S2 candidate / P1 | 高め | Mobileと外部人間の再現性を確認 | 限定的なlabel／legend改善 |
| MR-02 | 周回差の意味が即時に分かりにくい（-1周との区別を要する） | Terminology / semantics | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q09/Q18/Q31/Q41/Q54; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q03/Q09/Q18/Q28/Q41/Q54; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q08/T-Q09/T-Q18; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q56 (time/周回差 directional friction), Q41 (plausible -1周 interpretation) | Tier A | YES | YES | YES | S2 candidate / P1 | 中〜高 | 公式定義の理解を外部人間で確認 | 数値意味を変えず説明改善候補 |
| MR-03 | 指標ごとの方向・正負 | Chart / semantics | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q10/Q54; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q10/Q52/Q54; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q07–Q10/T-Q52; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q10/Q52/Q56 | Tier A | YES | YES | YES | S2 candidate / P1 | 中〜高 | 説明なしの初見理解を外部人間で確認 | 短い方向説明を候補化 |
| MR-04 | AJOCC／ME1／seriesの初見語彙 | Terminology | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q01/Q04/Q18/Q36; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q04/Q28/Q36; [Terra](ux3-2-synthetic-terra-profile-c-01.md) First impression/T-Q35/T-Q36; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q36 | Tier D | PARTIAL | NO EVIDENCE | YES | S3 candidate / P3 | 中 | 一般ユーザーの外部検証が必要 | 共通障害にせず説明候補 |
| MR-05 | 初期分析・選手選択・固定の発見性 | Affordance / navigation | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q05/E05; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q05/Q27; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q05/T-Q27; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q03/Q05/Q27/Q35/Q46 | Tier C | PARTIAL | YES | PARTIAL | S2–S3 candidate / P2 | 中 | 初期表示とselected stateを外部人間で確認 | 状態説明・affordanceの小変更のみ |
| MR-06 | 情報優先度、スクロール、チャート階層 | Layout / information hierarchy | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q13/Q79; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q13; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q13/T-Q33; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q03/Q09/Q16/Q29/Q75/Q77–Q79 | Tier B | PARTIAL | YES | YES | S2–S3 candidate / P2 | 中 | 大規模変更前に外部人間で優先度を確認 | 大規模再設計は保留 |
| MR-07 | 選択周回の表の分離 | Chart detail / layout | [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q34/Q53/Q83、最も分かりにくかったもの; Synthetic 3件は該当証拠なし | Tier F | PARTIAL | YES | NO EVIDENCE | S3 candidate / P3 | 低〜中 | 外部人間で再現性と必要性を確認 | 削除・再配置を保留 |
| MR-08 | ブラウザ戻る／状態復帰の注意 | Navigation / state | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q12/E06; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q14; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q12/Q69 | Tier G | PARTIAL | NO | PARTIAL | S3 candidate / P3 | 低 | 履歴期待値を外部人間で確認 | 監視、変更しない |
| MR-09 | イベントコードの自然発見 | Discovery | [Astra](ux3-2-synthetic-astra-profile-c-01.md) E01/Q05/Q08/Q66; [Sol](ux3-2-synthetic-sol-profile-c-01.md) session observations; [Terra](ux3-2-synthetic-terra-profile-c-01.md) First impression/T-Q02; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q08 | Tier G | PARTIAL | NO | NO | S3 candidate / P3 | 低（low-confidence candidate） | 実目的探索でのみ確認 | 共通findingにしない |
| MR-10 | DNF／`-1周`の解釈差 | Results / semantics | [Astra](ux3-2-synthetic-astra-profile-c-01.md) Q09/Q41/Q42; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q09/Q41/Q42; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q17/T-Q18; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q41/Q42/Q47 | Tier E | PARTIAL | NO | YES | S3 candidate / P3 | 低（low-confidence candidate） | 公式意味の理解を外部人間で確認 | 定義変更を保留 |
| MR-11 | Mobileの人間／Synthetic三角測量不足 | Evidence gap | [Astra](ux3-2-synthetic-astra-profile-c-01.md) metadata/Q13/Q80; [Sol](ux3-2-synthetic-sol-profile-c-01.md) metadata/Q13/Q80; [Terra](ux3-2-synthetic-terra-profile-c-01.md) Metadata/T-Q13/Mobile-only; [Owner](ux3-2-participant-post-test-qa-P-A-01.md) metadata/Q80 | not applicable/evidence gap | NOT TESTED | NO EVIDENCE | NOT TESTED | 未付与 | なし | 外部Human Field Testが必須 | claimを出さない |
| MR-12 | スクロール後の戻る／カテゴリー操作が隠れる | Navigation / visibility | [Owner](ux3-2-participant-post-test-qa-P-A-01.md) Q12/Q69/Q71; [Sol](ux3-2-synthetic-sol-profile-c-01.md) Q12/Q71; [Terra](ux3-2-synthetic-terra-profile-c-01.md) T-Q14/T-Q71; Astraは同信号なし | Tier F | PARTIAL | YES | NO | S3 candidate / P3 | 低〜中 | Desktop scroll状態を外部人間で確認 | 競合のため変更を保留 |

## Positive Findings

### POS-01 — リザルト／順位の基本可読性

Astraは順位・名前・結果・状態を簡潔で読みやすいとし、Solは順位とトップ差を確認しやすいとした。Terraも順位、氏名、時間差、完走／DNFを読み取っている。Owner Humanも表自体は問題なく、列追加は不要と回答している。これは「表のすべての意味が理解された」という主張ではなく、基本的な順位情報の読みやすさに限定した肯定である。

### POS-02 — チャート先行のプロダクト価値

4記録すべてで、順位変動・ラップ・選手間の推移をチャートで見る価値が示された。特に順位とラップはOwner Humanが残したい機能とし、Astra/Sol/Terraも選手選択後の周回比較を価値としている。Owner Humanがレイアウトに不満を持っていても、チャート価値そのものへの反対ではない。

### POS-03 — レース／カテゴリー／結果の基本導線

Astraは一覧からME1、結果、分析、ME2、別大会へ進み、SolはME2切替と一覧復帰、Terraは目的大会の一覧リンクと別大会移動、Owner Humanは大会・カテゴリー選択を確認した。Terraは目的ME1が初期選択だったためカテゴリー変更そのものは `NR`。Owner Humanはスクロール後に戻る／カテゴリー操作が隠れると報告しており、導線が存在することと常に見つけやすいことは分ける。

### POS-04 — 指標切替

Astra/Sol/Terra/Owner Humanの全記録で、順位・タイム差・周回差・ラップ（または標準語彙の対応指標）の切替操作自体は可能または「はい」と記録された。操作成功は意味理解の完全な成功を意味しない。MR-02/MR-03を併記する。

### POS-05 — 比較の有用性

注目選手の前後比較と固定比較は、複数記録で「便利」「面白い」「価値がある」とされた。Astraは固定した2本の線、Solは±と固定、Terraは近い順位との比較、Owner Humanは比較機能を有用とした。一方、多人数時の識別性はMR-01として別に扱う。

## Negative Findings

### MR-01 — 多人数比較時の線・凡例・選手名の対応

Astra/Solは薄い参考線同士が重なり凡例との対応を追いにくいとし、Terraも名前は凡例に残るが、線を追うには凡例と色を往復するとした。Owner Humanも「他の選手のタイムがひとくくり」「凡例が小さい」「選択中の周回表も見づらい」としている。4記録で信号は一致するが、実際の外部人間の再現性・Mobile再現性は未確認である。

### MR-02 — 周回差の意味が即時に分かりにくい（-1周との区別を要する）

Astra/Solは`周回差`を最初に周回数の差と推測し、Terraは説明を読んで単周タイム差と理解した。Owner HumanのQ56はタイム差と`周回差`の方向・理解に時間がかかったとし、Q41では`-1周`をラップ／足切りと解釈している。これは`周回差`のメトリック摩擦を裏付ける実信号だが、Owner HumanがSyntheticと同じ「周回差を`-1周`と混同」したことの証明ではない。これは用語を一括で直すfindingではなく、結果表の周回遅れ表示と分析チャートの単周タイム差を別々に説明する候補である。競技上の定義を変更する証拠ではない。周回差の摩擦をfindingとして定義しているため、Tier・集計カウントは変更しない。

### MR-03 — 指標ごとの方向・正負

Astra/Sol/Terraは、順位の「上ほど良い」とラップの「下ほど速い」、またはタイム差の正負を説明文で確認している。Owner Humanもタイム差・周回差で上側の線が良いのか悪いのか理解に時間がかかったとした。説明文が存在することと、初見で即時に読めることを区別する。

### MR-04 — AJOCC／ME1／seriesの初見語彙

3 Synthetic記録はAJOCCの正式な意味、ME1のレベル／対象者、seriesの意味を推測している。Owner Humanは`ajocc`をサイト名、ME1をカテゴリーのレース結果として解釈しており、この特定の語彙については明示的な問題信号がない（ただし「注目選手」「参考選手」「固定」は別の用語摩擦としてMR-05に含める）。したがって、初見一般ユーザーへの説明候補ではあるが、全reviewer共通の障害とはしない。

### MR-05 — 初期分析・選手選択・固定の発見性

Solは選手名が普通の文字に見え、`固定`の意味も開くまで曖昧だった。Owner Humanは選手選択後に初めてグラフが現れること、選択中の選手が分かりにくいこと、`比較対象の固定`が初回は不明だったことを強く報告した。Astraは選手名・固定を操作できたが、固定候補を見るために下へスクロールしており、部分的な摩擦がある。Terraは説明文により導線を理解し、明示的な問題なしである。共通の最小候補は、初期状態・選択状態・固定操作を短い文と非色の状態表示で説明することに限る。

### MR-06 — 情報優先度、スクロール、チャート階層

Astraは1440×900でチャート下部・凡例にスクロールが必要、Solは長い結果表の下位／DNF確認に移動が必要とした。Owner Humanはグラフ表示までの導線、表の位置、空白、チャートの大きさ、情報優先度、スクロール量を強く問題視した。Terraは操作可能性を評価しつつ、選手選択後に結果表が隠れることを少し意外とした。これは密度や大幅な配置変更を即断する証拠ではなく、限定的な優先度表示の検証候補である。

### MR-07 — 選択周回の表の分離

Owner Humanだけが、グラフ下の選択中周回表を最後まで使い方が分からず、分離されていること、表を不要と感じることを明示した（Q34/Q53/Q83、最も分かりにくかったもの）。Synthetic 3件にはこの finding の証拠がない。人間信号としては重要だが、共通問題・即時削除・大幅な再配置の根拠にはしない。

### MR-08 / MR-09 / MR-10 / MR-12 — 競合・非共通の信号

- ブラウザ戻るはAstraで固定追加前の状態に戻り予想外、TerraとOwner Humanは明確なサイト内リンク／サイドボタンで問題なし。Solは該当証拠なし。監視項目であり、共通修正にしない。
- イベントコード発見はAstraのみがリンクメタデータの補助を受けた。Sol/Terraは対象を発見し、Owner Humanの論点はseries順序である。共通findingにしない。
- DNF／`-1周`はSyntheticの不確実性とOwner Humanのもっともらしい理解が衝突する。表示の意味を強く変更せず、人間検証で定義理解を確認する。
- スクロール後の戻る／カテゴリー操作が隠れるという信号はOwner Humanにあり、Sol/Terraの「見つけやすい」と対立する。Astraには同じ明示記録がない。

## Core Q01–Q20 Comparison

標準Q&AのQ01–Q20はcanonical semantic topicで比較した。Terra欄の`T-Qxx`はTerraファイルの実際の番号であり、標準Q&Aの番号と同じ意味だとは扱わない。Terraの原記録番号は保持され、正式なparticipant recordに再解釈されない。

| Canonical topic | Astra | Sol | Terra（実際のsource番号） | Owner Human |
| --- | --- | --- | --- | --- |
| Q01 全体印象 | 結果から分析へ進めるが用語説明が必要（Q01） | 一続きで分かりやすいが専門用語に慣れが必要（Q01） | 大会探索中心の内容（T-Q01、標準Q01の回答とはしない） | ある程度分析できるが改善余地（Q01） |
| Q02 最も良かった点 | 固定比較（Q02） | 結果から4指標・比較へ（Q02） | 目的大会が日付順で見つかる（T-Q02） | 大会選択（Q02） |
| Q03 最も使いにくい点 | 薄い参考線（Q03） | 多人数線、周回差（Q03） | 目的大会／ME1の発見は肯定（T-Q03） | 初期グラフ、折れ線、配置（Q03） |
| Q04 サイトの目的 | 大会結果、分析までは初見不明（Q04） | 大会結果と理解（Q04） | 結果表の理解に相当する内容（T-Q04） | ラップタイム可視化（Q04） |
| Q05 次の操作 | 行・選手・指標は分かるがコードは補助必要（Q05） | 選手名が操作対象に見えにくい（Q05） | 選手横の操作と説明で分析へ（T-Q05） | 大会選択は明確、分析操作は不明瞭（Q05） |
| Q06 分かりやすい画面／機能 | 順位・選手名の表（Q06） | 大会一覧・表（Q06） | 注目選手・比較・指標表示（T-Q06） | 順位とラップのグラフ（Q06） |
| Q07 便利な点 | ラップサマリー（Q07） | ±／固定比較（Q07） | 順位推移と軸説明（T-Q07） | 上下選手切替（Q07） |
| Q08 迷い／探しにくさ | コード、±の意味（Q08） | 選手名、固定、DNFの位置（Q08） | タイム差の正負は説明依存（T-Q08） | series順、比較が表の下、操作箇所（Q08） |
| Q09 リザルト | 簡潔、`-1周`の理由は不明（Q09） | 読みやすい、DNFとの差は推測（Q09） | 結果・順位・状態を読める（T-Q04相当の内容） | 表は問題なし、選択後に下へ隠れる（Q09） |
| Q10 最初のチャート | 周回と順位推移（Q10） | 周回×指標、太線が注目選手（Q10） | ラップの実測時間（T-Q10） | 選手比較と理解（Q10） |
| Q11 比較の理解 | 前後／固定の順位・タイム比較（Q11） | 前後または固定の推移（Q11） | 比較対象と前後人数（T-Q11） | 選手同士、全員も希望（Q11） |
| Q12 戻る／別大会・カテゴリー | 一覧・カテゴリーは分かるがbrowser backは意外（Q12） | 一覧／カテゴリーとも分かる（Q12） | 一覧へ戻り別大会（T-Q14/T-Q15） | 戻る／カテゴリーがスクロールで隠れる（Q12） |
| Q13 Desktop／Mobile | Desktop良、Mobile未実施（Q13） | Desktop良、表の内部scroll（Q13） | Desktop操作可、Mobile未実施（T-Q13） | PC操作は可、affordanceが弱い（Q13） |
| Q14 有用な場面 | 周ごとの差の振り返り（Q14） | レース後の推移確認（Q14） | 同一選手と近順位の比較（T-Q20） | 順位変動・ラップを一目で確認（Q14） |
| Q15 再利用 | 知っている選手なら（Q15） | 自分／応援選手なら（Q15） | 明示回答はNR | Excel整形より楽（Q15） |
| Q16 一つ直すなら | 参考線と名前（Q16） | 線と名前（Q16） | 明示回答はNR | レース結果レイアウト（Q16） |
| Q17 残す機能 | 指定選手ラップ比較（Q17） | 周回推移チャート（Q17） | 明示回答はNR | 順位とラップのグラフ（Q17） |
| Q18 もっと使いたい条件 | 用語説明、コード検索（Q18） | 用語説明、線選択（Q18） | 明示回答はNR | 洗練されたUI（Q18） |
| Q19 言い忘れ | 特になし（Q19） | 非公式表示への確認（Q19） | 明示回答はNR | 回答欄空欄（NR扱い）（Q19） |
| Q20 その他 | 入口は使いやすいが初見語彙に推測（Q20） | 落ち着いた見た目、用語と線識別（Q20） | 順位・差・ラップを比較できる価値（T-Q20） | 中身8/10、使い勝手4/10（Q20） |

## Terminology Findings

用語問題は次の3つに分離する。

1. **競技・分類語**: AJOCC、ME1、series。Synthetic 3件で初見の推測が必要。Owner Humanは大意を解釈できたため、共通障害ではなく説明改善候補。
2. **結果状態語**: `DNF`、`-1周`。DNFは4記録とも途中終了の大意が得られたが、`-1周`と完走・足切りの関係は確信度が分かれる。定義変更はしない。
3. **分析指標語**: `タイム差`、`周回差`、`ラップ`、`Pace`。`周回差`は単周タイム差としての意味と、結果表の周回差との近さが摩擦を生む。`Pace`や方向は短い説明が必要という信号であり、指標の数値意味そのものを変更する提案ではない。

| Term | classification | evidence summary | disposition |
| --- | --- | --- | --- |
| AJOCC | REPEATED CONFUSION | Astra、Sol、Terraで正式な意味の推測・確認が必要だった。Owner Humanはサイト名と解釈した。 | 略称の短い説明候補。意味やデータ契約は変更しない。 |
| ME1 | REPEATED CONFUSION | Synthetic 3件でカテゴリーやレベルを推測した。Owner Humanもカテゴリーのレース結果として解釈した。 | カテゴリー文脈の短い説明候補。 |
| series | REPEATED CONFUSION | Astra、Sol、Terraで初見の意味について推測・確認が必要だった。Owner Humanはseries順序を論点にしたが、seriesの意味理解を直接確認した記録はない。 | 短い説明候補。series順序や大会コードの仕様は変更しない。 |
| Category/カテゴリー | SOME FRICTION | 大会・カテゴリーの入口は操作できたが、Owner Humanはスクロール後の可視性を問題視し、Terraの切替は `NOT TESTED` / `NR`。 | 導線の可視性を再確認する。カテゴリー切替の実施済みとは扱わない。 |
| 注目選手 | SOME FRICTION | 主線の意味は説明後に理解できたが、Solは選手名が操作対象に見えにくく、Owner Humanは選択中の状態を把握しにくかった。 | 選択中状態を非色でも示す小変更候補。 |
| タイム差 | SOME FRICTION | Terraは説明を読んで注目選手を基準に理解し、Astra/Solは基準・正負の説明に依存した。Owner Humanもタイム差の方向理解に時間がかかった。 | 数値定義を変えず、基準と方向を短く説明する。 |
| 周回差 | REPEATED CONFUSION | Astra/Solは周回数の差を予想し、説明で単周タイム差と理解した。Terraも名称だけでは迷い、Owner Humanはタイム差・周回差の方向理解に時間がかかった。 | 結果表の `-1周` とチャートの周回差を区別して説明する。 |
| 固定 | SOME FRICTION | Solは開くまで意味が曖昧で、Owner Humanは比較対象の固定の意味と操作に迷った。Astra/Terraは固定比較を操作または理解した。 | 固定対象と現在状態を非色でも示す小変更候補。 |
| 参考選手 | SOME FRICTION | Astra/Solは参考選手の薄い線と選手名の対応を人数増加時に追いにくいとした。Owner Humanも「注目選手と参考選手」が初回分からないとした。Terraにこの用語を直接確認した記録はない。 | 色だけに依存せず、線・名前・役割の対応を補助する。 |
| Position/順位 | SOME FRICTION | 結果表の基本的な順位は読みやすい一方、チャートの上下方向と「上ほど良い」の文脈には説明が必要だった。 | 基本可読性は維持し、方向説明を補う。 |
| Lap | CLEAR | 関連記録では横軸の周回と、1周の単位としてのラップを認識できた。 | CLEARは基本的な軸・単位認識を指す。すべてのチャート解釈が成功したという意味ではない。 |
| Gap | SOME FRICTION | トップとの差として読める記録がある一方、タイム差の方向・正負は説明依存だった。 | 数値定義を変えず、基準と方向を短く説明する。 |
| Pace | SOME FRICTION | Owner Humanには速度系指標への不確実さがあり、直接的な証拠は限定的である。Syntheticでも指標方向の説明依存がある。 | 強い共通findingにはせず、既存の説明を補う候補とする。 |
| DNF | SOME FRICTION | Syntheticは途中終了の大意を得たが正式語や離脱時点の確信に差があり、Owner Humanは妥当な解釈を示した。 | 定義を変更せず、表示状態と離脱時点を説明する。 |
| -1周 | SOME FRICTION | Syntheticは周回遅れの表示と周回差の意味を区別するのに説明を要し、Owner Humanの解釈は妥当だがSyntheticと一致しない。 | `DNF`・周回差との区別を補助する。 |
| comparison | SOME FRICTION | ±範囲と固定比較の操作・価値は確認されたが、多人数時の線・凡例・選手名の対応には摩擦がある。 | 比較操作は維持し、識別補助だけを候補化する。 |

## Results Findings

結果は単純な賛成票ではなく、次の重みで読む。複数記録で同じ客観的観察があるか、主タスクに影響するか、操作成功と意味理解が分かれているか、reviewerの種類、欠測・競合があるかを考慮した。

| area | classification | cross-review summary | positive/negative disposition |
| --- | --- | --- | --- |
| ranking visibility | CLEAR | 4記録で順位・選手名・結果状態の基本表示を読めた。 | positive: 基本結果の可読性を維持する。細部の意味理解は別扱いにする。 |
| rider discovery | SOME FRICTION | Astra/Terraは対象を見つけたが、Solは選手名が操作対象に見えにくく、Owner Humanも選択箇所に迷った。 | negative: 選択 affordance と状態表示を小さく改善する候補。 |
| analysis entry | SOME FRICTION | 選手選択で分析へ進めたが、Owner Humanは初期グラフの出現条件を理解しにくく、Syntheticにも説明依存があった。 | negative: 初期状態と「選手名を選ぶ」導線を補助する。 |
| DNF | SOME FRICTION | SyntheticはDNFを途中終了と読めたが、略語・最終通過・`-1周`との関係に不確実さがあり、Owner Humanの解釈は妥当だった。 | negative: 定義変更ではなく表示説明を確認する。 |
| lap-down indication | SOME FRICTION | `-1周`自体は周回遅れと推測できるが、完走・DNF・分析の`周回差`との区別に説明が必要だった。 | negative: 結果表とチャートの量を分けて説明する。 |
| information density | SOME FRICTION | Owner Humanの負荷が強く、Astra/Solにも下部チャート・凡例・長い表へのスクロール信号があり、Terraは部分的だった。 | negative: 大規模再設計は保留し、優先度の小変更だけ候補化する。 |
| useful information | CLEAR | 順位推移、ラップ、比較、選手間の差は4記録で有用性が示された。 | positive: chart-firstと比較の価値を維持する。 |
| unnecessary information | NO EVIDENCE | 不要情報についてcross-reviewerで一致した証拠はない。Owner Humanだけが選択周回表の必要性・分離に懸念を示した。 | negative: Owner-only concernとして保持し、削除・再配置は外部人間確認まで保留する。 |

## Chart Findings

チャートに関する総合結果は「価値は明確、読解補助が不足」である。

- **維持**: 順位推移、ラップ、タイム差、周回単位の分析、注目選手の強調。
- **再現した摩擦**: 薄い参考線、凡例と線の対応、人数増加時の追跡、指標ごとの上下方向。
- **Owner固有の強い摩擦**: 初期選択なしではグラフが出ない、順位グラフの折れ、凡例の小ささ、選択周回表の分離。
- **安全な候補**: 選手名と線の対応を色だけに依存しない短いラベル・選択状態・凡例強調で補う。数値意味、step／linearの表現、初期比較人数はこの報告だけでは変更しない。

| area | classification | operation success | semantic understanding / disposition |
| --- | --- | --- | --- |
| initial chart comprehension | SOME FRICTION | 最初のチャートには到達できた。 | 軸と主線は読めるが、指標ごとの方向・正負は説明依存だった。 |
| X-axis | CLEAR | 横軸の確認操作・表示確認はできた。 | 周回軸として基本認識できた。 |
| Y-axis | SOME FRICTION | 指標切替後の縦軸を確認できた。 | 順位・秒差・ラップの意味と上下方向は説明が必要だった。 |
| Position | SOME FRICTION | 順位チャートは操作・閲覧できた。 | 「上ほど良い」の方向とグラフ文脈に説明が必要だった。 |
| Gap | SOME FRICTION | Gap相当の指標へ切り替えられた。 | 基準選手が0であること、正負の方向は即時に自明ではなかった。 |
| Pace | SOME FRICTION | Pace相当の指標を操作できた記録はある。 | Owner uncertaintyとlimited direct evidenceがあり、強い結論にはしない。 |
| Lap | CLEAR | Lap相当の指標へ切り替え、横軸と単位を確認できた。 | CLEARは基本的な軸・単位認識であり、全チャート解釈の成功ではない。 |
| rider identification | SOME FRICTION | 注目選手・固定選手の操作自体は可能だった。 | 参考線と選手名の対応は人数増加時に追いにくかった。 |
| line distinction | REPEATED CONFUSION | 太線・固定線は区別できた。 | ±比較の薄い線同士と凡例の対応が複数記録で難しかった。 |
| metric switching | SOME FRICTION | 4指標の切替操作は4記録で成功した。 | 操作成功と意味理解は別で、`周回差`・方向・正負には説明が必要だった。 |
| comparison readability | REPEATED CONFUSION | 比較範囲・固定の変更は操作できた。 | 多人数比較の線・凡例・選手名の対応が複数記録で問題になった。 |
| chart size | SOME FRICTION | Desktopでチャートを閲覧できた。 | Owner Humanは大きさ・配置を強く問題視し、Astra/Solも下部確認にscrollを要した。 |
| visual hierarchy | SOME FRICTION | 主要チャートと操作領域には到達できた。 | Owner Humanの初期グラフ・情報優先度・空白への懸念と、Syntheticの部分的scroll負荷がある。 |

## Comparison Findings

比較は「操作できる／価値がある」と「読み解きやすい」が分かれる。±0〜±5と固定の操作は全体に可能で、注目選手と近い順位・任意選手を比較する価値も一致した。一方、6〜8名程度の比較ではSynthetic 3件とOwner Humanのすべてが、線・色・凡例の追跡負荷または一括表示感を示した。

Owner Humanの「全員も見たい」は要望として記録するが、既存の全員許可条件や可読性を変える根拠にはしない。まず、現在選択中の選手、比較範囲、固定対象を常に視認できるかを確認する。

| area | classification | cross-review summary | disposition |
| --- | --- | --- | --- |
| discoverability | SOME FRICTION | ±比較と固定の入口はSyntheticで発見・操作できた。Owner Humanは初回に選手選択・固定の入口でためらった。 | positive/operable: 操作可能性は維持し、Ownerの初期 hesitationだけをaffordance改善の根拠にする。 |
| meaning | SOME FRICTION | 比較が選択選手の前後・固定選手の推移を示すことは理解されたが、比較人数と線の意味には説明・追跡負荷がある。 | negative: 比較範囲・固定対象を明示する。 |
| rider selection | SOME FRICTION | 選択・固定は操作できたが、選手名が操作対象に見えにくい記録と選択中状態が不明瞭な記録がある。 | negative: 非色のselected stateと短い説明を候補化する。 |
| number of riders | CLEAR | ±0〜±5の範囲変更は操作でき、表示人数の変化も確認できた。 | positive: ± scopeの既存挙動を維持する。「全員」はOwnerのpreferenceであり、要件化しない。 |
| line readability | SOME FRICTION | 固定選手・注目選手は追える一方、6〜8名の参考線と凡例の対応は複数記録で難しかった。 | negative: label／legendの識別補助に限定する。 |
| usefulness | CLEAR | 前後比較・固定比較で順位変動やラップ差を振り返る価値が4記録で示された。 | positive: 比較の分析価値を維持する。 |
| desired comparisons | CLEAR | Owner Humanは全員表示も希望し、Syntheticは前後・固定比較を有用とした。 | positive: これは表明されたgoalの記録であり、全員表示をproduct requirementにはしない。 |

## Navigation Findings

大会一覧→大会→カテゴリー→リザルト→選手分析の主経路は、Synthetic 3件とOwner Humanで操作可能だった。Sol/Astraは別カテゴリーまたは別大会移動も実施し、Terraは別大会移動を実施したが、初期ME1のためカテゴリー切替実施は`NR`。Owner Humanは大会・カテゴリー選択を直感的としつつ、スクロール後に一覧戻りとカテゴリーリストが隠れるとした。

イベントコード発見は共通問題ではない。Astraの補助付き探索、Sol/Terraの発見、Owner Humanのseries順序問題を統合して「コード検索が必要」とはしない。ブラウザ戻るもサイト内戻るリンクと状態復帰を分け、仕様変更を急がない。

| area | classification | evidence | conflict/limitation | disposition |
| --- | --- | --- | --- | --- |
| Race discovery | SOME FRICTION | 日付・大会名からの一覧探索はSol/Terra/Ownerで可能。 | Astraはイベントコードの自然発見に失敗しリンク情報にassistされた。 | コード検索を共通findingにせず、実目的探索で再確認する。 |
| Category discovery | SOME FRICTION | 上部カテゴリー入口はAstra/Sol/Ownerで確認できた。 | Terraのcategory switchingは `NOT TESTED` / `NR`。Ownerはscroll後の可視性を問題視した。 | 可視性を確認する。未実施を成功とは扱わない。 |
| Rider discovery | SOME FRICTION | 結果表から選手を選ぶ操作は可能だった。 | Sol/Ownerに選手名・操作対象の初期 hesitationがある。 | selected stateと操作 affordanceを補助する。 |
| Analysis entry | SOME FRICTION | 選手選択後に分析へ到達できた。 | Ownerは初期グラフの出現条件を発見しにくく、説明依存の記録もある。 | 入口の短い説明と状態表示を候補化する。 |
| Back | SOME FRICTION | サイト内の大会一覧リンクはSol/Terra/Ownerで確認された。 | browser back/stateはAstra vs Terra/Ownerの文脈が異なり、状態復帰の期待値が衝突する。 | 監視し、仕様変更は外部人間確認まで保留する。 |
| Current location | SOME FRICTION | 一覧・カテゴリー・分析の現在位置を示す導線は存在する。 | Ownerはscroll後に戻る／カテゴリー操作が隠れるとした。 | sticky/layoutの大変更は保留し、可視性を確認する。 |
| Race/category switching | SOME FRICTION | Sol/Astraはカテゴリーまたは別大会切替、Terraは別大会移動を確認した。 | Terraのcategory switchingは `NOT TESTED` / `NR`。Ownerは操作がscroll-hiddenになるとした。 | 実施済み範囲を越えてCLEARにせず、category switchingは未テストとして保持する。 |

## Desktop Findings

Desktopは4記録すべてに何らかの操作証拠がある。左右配置・一覧性・押しやすさを肯定するSynthetic記録がある一方、Astra/Solは下部チャート、凡例、長い結果表へのスクロールを記録した。Owner Humanは空白の無駄、結果表とチャートの優先度、選択後の配置、弱いコントラストを強く問題視した。Terraは導線と説明を評価し、選択後に結果表が隠れる点だけ意外とした。

Desktopについての限定的な結論は、既存の主要情報は到達可能だが、分析に入った後の視認優先度と比較識別を改善する余地がある、である。大きなカード再配置や密度の主観的最適化はこの証拠だけでは承認しない。

## Mobile Evidence Gap

Mobileは **人間／Syntheticの三角測量が未完了**。Astra、Sol、TerraはMobileを明示的に未実施。Owner HumanのメタデータはDesktopであり、Q80の「普通」は内部不整合があり、follow-upもN/Aである。したがって、Q80をMobileの「問題なし」や人間Mobile証拠として扱わない。

320px／390pxのタップ、縦積み、チャート到達、凡例、横overflow、固定操作、戻る導線について、外部人間検証なしにPASS／FAILや優先度を付与しない。

## Severity Summary

この報告では正式UX3-2 participant datasetが0件のため、S0–S4の正式集計は行わない。以下は実装判断用の **severity candidate** であり、確定severityではない。

Completion ReportのS0–S4 countsは、この報告のprimary candidate severityを一度ずつ数えた結果であり、正式participant severityの集計ではない。

- MR-01: `S2 candidate` — 主分析の比較読解に影響。4記録で一致するがMobile未検証。
- MR-02/MR-03: `S2 candidate` — 意味理解に影響。数値定義は保持し、人間確認が必要。
- MR-05/MR-06: `S2–S3 candidate` — 発見性・操作負荷。Owner強、Syntheticは部分的。
- MR-07/MR-08/MR-12: `S3 candidate` — 単一記録／競合／観察条件差が大きい。
- MR-09/MR-10: `S3 candidate` — P3を維持する低信頼の候補findingであり、単一記録／競合／観察条件差が大きい。
- MR-11: severity未付与 — Mobile未実施という証拠ギャップであり、製品欠陥ではない。

## Evidence Tier Summary

この報告では、HumanはOwner Human review、SyntheticはAstra／Sol／Terraの3件を指す。Tierはnegative findingの証拠構成を表し、positive findingにも同じ語彙を補助的に付与するが、positive findingはnegative evidence countを増やさない。

| Tier | 定義 | 本報告でのfinding |
| --- | --- | --- |
| Tier A | Human + 3/3 Synthetic | MR-01／MR-02／MR-03; POS-01／POS-02／POS-04／POS-05 |
| Tier B | Human + 2/3 Synthetic | MR-06; POS-03（positive findingとして別集計） |
| Tier C | Human + 1/3 Synthetic | MR-05 |
| Tier D | 3/3 Synthetic only | MR-04 |
| Tier E | 2/3 Synthetic only | MR-10 |
| Tier F | Human only | MR-07／MR-12 |
| Tier G | 1/3 Synthetic only | MR-08／MR-09 |
| not applicable/evidence gap | Tierを付与しない証拠ギャップ | MR-11 |

Finding RegisterのEvidence Tier列をこの分類の正本とする。Tierは証拠の構成であり、severityやpriorityの機械的な順位ではない。

### Counting rule

Counts use negative MR findings with an explicit Evidence Tier and priority. MR-11 is an evidence gap and is excluded from severity and priority counts. Where a finding has a severity range or multiple signals, the primary candidate severity is used once to avoid double counting. Positive findings are counted separately and do not inflate negative evidence counts.

## P0–P3 Priorities

| Priority | この報告での扱い |
| --- | --- |
| P0 | 製品UIのP0はなし。プロセス上の最優先は外部Human Field Testが0件でBLOCKEDであること。これを製品欠陥のP0とは呼ばない。 |
| P1 | MR-01の線／選手識別、MR-02/MR-03の短い説明・方向表示。限定的で可逆な改善候補。 |
| P2 | MR-05の初期分析・固定・選択状態のaffordance、MR-06の小さな優先度調整。OwnerとSyntheticの差を外部人間で確認しながら進める。 |
| P3 | MR-07の選択周回表、MR-08のbrowser back、MR-09のイベントコード、MR-10のDNF／`-1周`仕様変更、MR-12のsticky／大幅レイアウト。追試まで保留。 |

## Fix Now

次の限定的実装作業なら、現在の証拠に対して過剰ではない。

1. 比較チャートで、選手名・選択中状態・参考線の対応を凡例と非色の状態表示で明確にする。
2. `周回差`、`タイム差`、`ラップ`の関係と、順位／ラップの方向を短い補助説明で同じ画面上に保つ。既存の数値意味は変更しない。
3. 選手選択・固定・比較範囲の現在状態を、選択済み表示と短い説明で明示する。主要操作の順序や公開routeは変えない。

これらは実装を承認する最終仕様ではなく、UX3-4が提案するP1相当のbounded scopeである。実装前に既存設計・受入条件との整合と、人間検証計画を確認する。

## Small Safe Improvements

- 結果表から分析へ進む説明を、選手名が操作対象であることと一緒に短く表示する。
- 凡例の文字サイズ・間隔・選択状態を改善し、色だけに頼らない太字・枠・ラベルを使う。
- `DNF`、`-1周`、`周回差`の説明は、定義を変えずに用語の直後または既存説明位置で補助する。
- 現在の比較人数、注目選手、固定選手を一つの視認可能なsummaryにまとめる。
- 変更後はDesktopで、結果の読みやすさ、chart-first価値、指標切替、比較の有用性を再確認する。

## Wait for External Human

以下は外部Human Field Test参加者で確認するまで待つ。

- Mobile 320px／390pxの操作、スクロール、チャート、凡例、横overflow。
- Owner Humanだけが強く指摘した初期グラフ発見、レイアウト密度、選択周回表の削除／移動。
- DNF／`-1周`の正式な理解と、用語説明が誤解を減らすか。
- ブラウザ戻るの履歴・固定比較状態の期待値。
- series順序と大会コードの発見性を、実際の目的探索タスクで確認すること。

## Do Not Change

- 外部人間数を1と数えたり、Owner Humanをformal participantに変換したりしない。
- `BLOCKED — PARTICIPANTS UNAVAILABLE` を解除しない。
- TerraのQ番号を標準Q&A番号として書き換えない。
- DNF、`-1周`、`周回差`の数値意味やデータ契約を、今回の曖昧さだけで変更しない。
- イベントコード発見を共通問題として、検索UIやroute契約を追加しない。
- 単一Owner信号だけで選択周回表を削除しない。
- Mobileの「普通」からMobile PASSを主張しない。

## Do Not Regress

- 読みやすい結果表、順位、名前、状態、トップ差。
- 順位・ラップを中心にしたチャート価値と、レース後の振り返り。
- 大会一覧→カテゴリー→リザルト→分析の基本導線。
- 順位・タイム差・周回差・ラップの切替操作。
- ±比較と固定比較の有用性、および選択中の注目選手の強調。
- Desktopで左右に操作とチャートを見られる利点。
- 主要route、upstream契約、既存のエラー／not-found／再試行導線。

## Recommended Implementation Scope

次の実装は、**チャート識別性・分析状態の明示・既存説明の局所改善**に限定する。各行はFinding Registerの証拠分類と対応し、scope boundaryを越える変更は今回の実装対象にしない。

ここで `Next implementation required: YES` は、限定された次の実装／仕様化フェーズを開始できることを示すだけであり、このsynthesis自体が製品コード変更を認可するものではない。製品コードを変更する場合は、承認済みのdesignとimplementation planを別途用意する必要がある。

### Must Fix

| Finding ID | Evidence tier | Human corroboration | Synthetic agreement | Severity | Priority | Expected UX impact | Scope boundary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MR-01 | Tier A | YES | 3/3 | S2 candidate | P1 | 線・凡例・選手名の対応を追跡しやすくする | 凡例・label・非色の選択状態に限定。チャート構造・比較人数の既定値は変更しない |
| MR-02 | Tier A | YES | 3/3 | S2 candidate | P1 | `周回差`の意味を即時に理解しやすくし、`-1周`との区別を補助する | 既存の数値定義を変えず、同一画面の短い説明だけを改善 |
| MR-03 | Tier A | YES | 3/3 | S2 candidate | P1 | 指標ごとの方向・正負を初見で理解しやすくする | 方向説明・補助labelに限定。step／linear表現とデータ契約は変更しない |

### Should Fix

| Finding ID | Evidence tier | Human corroboration | Synthetic agreement | Severity | Priority | Expected UX impact | Scope boundary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MR-05（限定部分） | Tier C | YES | 1/3 | S2 candidate | P2 | 選択中・固定・比較範囲の現在状態を発見しやすくする | state affordanceと短い説明の小変更のみ。ページ全体の導線・初期分析設計は変更しない |

### Could Improve

| Finding ID | Evidence tier | Human corroboration | Synthetic agreement | Severity | Priority | Expected UX impact | Scope boundary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MR-04 | Tier D | NO EVIDENCE | 3/3 | S3 candidate | P3 | AJOCC／ME1／seriesの初見理解を補助する | 一般的な用語説明候補に限定。共通障害とせず、route・分類仕様は変更しない |

### Wait for External Human

| Finding ID | Evidence tier | Human corroboration | Synthetic agreement | Severity | Priority | Expected UX impact | Scope boundary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MR-06（広範なlayout部分） | Tier B | YES | 2/3 | S2 candidate | P2 | 情報密度・優先度の判断材料を得る | 大規模再配置・主観的密度変更は保留。外部Human Field Test後に別設計 |
| MR-07 | Tier F | YES | 0/3 evidence | S3 candidate | P3 | 選択周回表の必要性と配置を確認する | 削除・再配置は保留。単一Owner signalだけで変更しない |
| MR-08 | Tier G | NO | 1/3 | S3 candidate | P3 | browser backと状態復帰の期待値を確認する | 履歴・route挙動は変更しない |
| MR-09 | Tier G | NO | 1/3 | S3 candidate | P3 | イベントコードの発見性を実目的探索で確認する | 検索UI・route契約は追加しない |
| MR-10 | Tier E | NO | 2/3 | S3 candidate | P3 | DNF／`-1周`の意味理解を確認する | 定義・数値意味は変更しない |
| MR-11 | not applicable/evidence gap | NO EVIDENCE | NOT TESTED | N/A（evidence gap） | Hold / no priority | Mobile claimの有無を判断できるようにする | MobileのPASS／FAILやseverityを付与しない。外部Human Field Test必須 |
| MR-12 | Tier F | YES | 0/3 evidence | S3 candidate | P3 | スクロール後の戻る／カテゴリー操作の可視性を確認する | sticky・大幅layout変更は保留 |

### Preserve

| Finding ID | Evidence tier | Human corroboration | Synthetic agreement | Severity | Priority | Expected UX impact | Scope boundary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POS-01 | Tier A | YES | 3/3 | S3 candidate | Preserve | 結果表・順位の可読性を維持する | 結果表、順位、名前、状態、トップ差を壊さない |
| POS-02 | Tier A | YES | 3/3 | S3 candidate | Preserve | 順位・ラップ中心のchart-first価値を維持する | 主要チャートとレース後の振り返りを維持 |
| POS-03 | Tier B | YES | 2/3 | S3 candidate | Preserve | 大会→カテゴリー→結果の導線を維持する | 基本routeと導線を変更しない。可視性検証は別途 |
| POS-04 | Tier A | YES | 3/3 | S3 candidate | Preserve | 指標切替の操作可能性を維持する | 順位・タイム差・周回差・ラップの切替を維持 |
| POS-05 | Tier A | YES | 3/3 | S3 candidate | Preserve | 比較の分析価値と注目選手の強調を維持する | ±比較・固定比較・選択中表示を壊さない |

## Final Phase Gate

**PROCEED WITH LIMITED SCOPE**

理由は、MR-01〜MR-03がSynthetic複数件とOwner Humanで三角測量され、chart-first価値・結果可読性・比較／指標切替を維持しながら局所改善できるためである。ただし、外部Human Field Test参加者は0で、Human Field Testは **BLOCKED — PARTICIPANTS UNAVAILABLE** のまま。大規模変更、主観的密度変更、Mobile claim、競合するnavigation／DNF解釈は実装承認の対象外である。

Completion Reportの `Next implementation required: YES` は、限定された次の実装／仕様化フェーズを開始してよいという意味に限る。このsynthesis自体は製品コード変更を承認しない。コード変更には承認済みのdesign／implementation planが必要であり、最終ゲートは引き続き **PROCEED WITH LIMITED SCOPE** である。

## Completion Report（32 fields）

The counting rule above applies: count negative MR findings with explicit tier/priority, exclude MR-11 from severity/priority counts, and use the primary candidate severity once to avoid double counting.

| # | Requested field | Result |
| ---: | --- | --- |
| 1 | External Human participants | 0 |
| 2 | Owner Human reviews | 1 |
| 3 | Synthetic reviews | 3 |
| 4 | Models | Astra / Sol / Terra |
| 5 | Analyzed review file paths | `docs/user-testing/ux3-2-synthetic-astra-profile-c-01.md`; `docs/user-testing/ux3-2-synthetic-sol-profile-c-01.md`; `docs/user-testing/ux3-2-synthetic-terra-profile-c-01.md`; `docs/user-testing/ux3-2-participant-post-test-qa-P-A-01.md` |
| 6 | Common findings count | 6 (MR-01/MR-02/MR-03/MR-05/MR-06/MR-10) |
| 7 | Human-corroborated findings count | 7 (MR-01/MR-02/MR-03/MR-05/MR-06/MR-07/MR-12) |
| 8 | 3/3 Synthetic-only count | 1 (MR-04) |
| 9 | 2/3 Synthetic-only count | 1 (MR-10) |
| 10 | Human-only count | 2 (MR-07/MR-12) |
| 11 | 1/3 Synthetic-only count | 2 (MR-08/MR-09) |
| 12 | Positive finding count | 5 (POS-01/POS-02/POS-03/POS-04/POS-05) |
| 13 | S0 count | 0 |
| 14 | S1 count | 0 |
| 15 | S2 count | 5 (MR-01/MR-02/MR-03/MR-05/MR-06) |
| 16 | S3 count | 6 (MR-04/MR-07/MR-08/MR-09/MR-10/MR-12) |
| 17 | S4 count | 0 |
| 18 | P0 count | 0 |
| 19 | P1 count | 3 (MR-01/MR-02/MR-03) |
| 20 | P2 count | 2 (MR-05/MR-06) |
| 21 | P3 count | 6 (MR-04/MR-07/MR-08/MR-09/MR-10/MR-12) |
| 22 | Fix Now count | 3 (MR-01/MR-02/MR-03) |
| 23 | Wait for External Human count | 7 held findings (MR-06/MR-07/MR-08/MR-09/MR-10/MR-11/MR-12) |
| 24 | Highest-priority findings | MR-01/MR-02/MR-03 (P1) |
| 25 | Do-not-regress findings | POS-01/POS-02/POS-03/POS-04/POS-05 |
| 26 | Mobile evidence status | Mobile human/synthetic triangulation incomplete. |
| 27 | Report path | `docs/user-testing/ux3-4-multi-reviewer-synthesis.md` |
| 28 | Product code changes | none |
| 29 | External Human Field Test | `BLOCKED — PARTICIPANTS UNAVAILABLE` |
| 30 | Next implementation required | YES |
| 31 | Final Phase Gate | `PROCEED WITH LIMITED SCOPE` |
| 32 | Recommended next phase | Implement only MR-01/MR-02/MR-03; consider the limited MR-05 state-affordance improvement; hold MR-06–MR-12 until the External Human Field Test. |
