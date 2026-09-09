# UX3-6 Post-Implementation Multi-Reviewer Regression Review

## 1. Executive Summary

UX3-5のproduction変更後に、現在のproduction surfaceとrepository HEAD（`eee5570`）をブラウザで再確認した。MR-01（比較線の識別）、MR-02（`周回差`と`-1周`の意味の分離）、MR-03（metricごとの方向・正負のguide）は、利用可能なdesktop evidenceの範囲でいずれも改善を確認できた。POS-01〜POS-05も現在の主要フローで維持されている。

ただし、Owner Humanのpost-implementation reviewは実施しておらず、Astra/Sol/Terraについてもこのreviewのための新しいSynthetic participant sessionは実行していない。以下の3視点は、現在のUI、UX3-4/UX3-5のtraceable evidence、同一フローの独立した観点分析として記録する。新しいparticipant数やHuman validation完了数には算入しない。

新しい重大regressionは確認されなかった。11名比較時のkeyが2行に折り返される残存density concernを`UX3-6-R01`（S3、monitor）として記録する。Exact mobile viewportは引き続き未実施である。

Final gate:

`UX3-6 POST-IMPLEMENTATION REGRESSION REVIEW: LIMITED PASS — HUMAN / MOBILE VALIDATION INCOMPLETE`

推奨は、Primary `C. WAIT FOR EXTERNAL HUMAN EVIDENCE`、Secondary `D. MOBILE-SPECIFIC VERIFICATION REQUIRED`。このreviewを理由に新しいredesignやdeferred findingの実装昇格は行わない。

## 2. Review Scope

- UX3-5で実装されたMR-01〜MR-03の効果確認。
- UX3-4で`Do Not Regress`とされたPOS-01〜POS-05の現行UI確認。
- URL、reload、browser back/forward、disclosure、比較、metric切替を含む主要desktop flowの確認。
- UX3-5変更による新しいregressionの探索。
- Product code、test behavior、CSS、component、review evidence sourceは変更しない。
- 新しいSynthetic participantは生成せず、Owner HumanをExternal Human participantとして扱わない。

## 3. Baseline

- UX3-4: [multi-reviewer synthesis](ux3-4-multi-reviewer-synthesis.md)
- UX3-5: [limited-scope implementation](ux3-5-limited-scope-implementation.md)
- UX3-5 completion baseline: `eee5570 feat(ux): implement UX3-5 prioritized review fixes`
- Current `HEAD`: `eee5570`; `origin/main`: `eee5570`; UX3-5以降の追加production commitは確認されなかった。
- Production surface: `https://ajocc-laptime-viewer.vercel.app/`
- Local surface: current repository HEAD at `http://localhost:3000/`
- production surfaceでは、比較key、`周回差（単周タイム差）` guide、chart detail headingが反映されていることを確認した。Vercel画面からdeployment SHA自体は独立取得できなかった。

### Required source records

- [Owner Human review](ux3-2-participant-post-test-qa-P-A-01.md)
- [Astra Synthetic Profile C review](ux3-2-synthetic-astra-profile-c-01.md)
- [Sol Synthetic Profile C review](ux3-2-synthetic-sol-profile-c-01.md)
- [Terra Synthetic Profile C review](ux3-2-synthetic-terra-profile-c-01.md)

## 4. Reviewer Set

### Owner Human

`Owner Human post-implementation review: NOT EXECUTED`

UX3-4のOwner Human reviewはhistorical corroborating evidenceとして保持するが、今回の現行production再レビューを実施したものとは扱わない。External Human Field Testにも算入しない。

### Astra

`Independent Astra perspective: ANALYZED; new synthetic session: NOT EXECUTED`

現在のproduction/local UI evidenceとUX3-4/UX3-5 source recordsを先に確認したうえで、Astra perspectiveとしてMR/POSを判定した。これは新しいSynthetic participant recordではない。

### Sol

`Independent Sol perspective: ANALYZED; new synthetic session: NOT EXECUTED`

Sol perspectiveとして、semantic clarity、chart reading、state preservationを独立に確認した。これは新しいSynthetic participant recordではない。

### Terra

`Independent Terra perspective: ANALYZED; new synthetic session: NOT EXECUTED`

Terra perspectiveとして、task completion、information density、navigation regressionを独立に確認した。これは新しいSynthetic participant recordではない。

## 5. MR-01 Regression Review

### MR-01: PASS

Final classification: `CONFIRMED FIXED` for the available desktop evidence.

#### Original problem

多人数比較で、chart lineと選手名・role・注目選手の対応を追跡しにくかった。これはUX3-4でOwner HumanとAstra/Sol/Terraの全4 reviewに再現したTier A / P1 findingだった。

#### Current evidence

- Productionで`±5・11名表示`を選択すると、`比較チャートの線` keyに11名全員のrole/nameが表示された。
- keyには`注目選手 ・ 堀川 範幸`と`参考選手 ・ ...`が明示され、注目選手の強調状態も保持された。
- chart AX treeにも11件のrole/name mappingと、`全 11 名を表示中（注目選手の線のみ強調表示）`が存在した。
- local current HEADで、`compare=5` URL state、metric切替、chart detailを確認した。productionでも同じkeyとstateを確認した。
- chart geometry、comparison人数、primary/fixed state、data semantics、route contractは変更されていない。

#### Residual concern

11名比較ではkeyが2行に折り返され、chart自体も情報量が多い。この残存densityは`UX3-6-R01`として記録するが、mappingが不可能になる、clippingする、またはS1級のregressionになった証拠はない。

#### Perspective result

| Perspective | Result | Basis |
| --- | --- | --- |
| Owner Human | N/E | post-implementation review未実施 |
| Astra | PASS | key、role/name mapping、primary emphasisを確認 |
| Sol | PASS | mappingとcomparison stateの保持を確認 |
| Terra | PASS | task上のline identificationが可能であることを確認 |

Confidence: `HIGH` for desktop implementation behavior; `MEDIUM` for first-time human comprehension because current Owner Human review and exact mobile review are unavailable.

## 6. MR-02 Regression Review

### MR-02: PASS

Final classification: `CONFIRMED FIXED` for the available evidence.

#### Original problem

`周回差`が周回数差のように読め、結果表の`-1周`との区別が初見で不明瞭だった。

#### Current evidence

- Productionのpace tabで、guideが`周回差（単周タイム差）`と表示された。
- guideは、注目選手基準の同じ周の単周タイム差であり、プラス／マイナスの意味を説明し、`結果表の-1周（1周遅れ）とは別の指標`と明示した。
- chart detail headingも`周回差（単周タイム差）の周回詳細`となっている。
- results disclosureでは従来の`-1周`表示とDNF表示が保持され、result semanticsを変更していない。
- 数値計算、lap-down、DNF、race data contractは変更されていない。

#### UI weight check

説明はactive metricの短いguideとdetail headingに限定され、別の大型説明パネルや重複した長文は追加されていない。available desktop surfaceでは、paceのmeaning distinctionを補助しつつ、主要操作を覆うほどのUI負荷は確認されなかった。

#### Perspective result

| Perspective | Result | Basis |
| --- | --- | --- |
| Owner Human | N/E | post-implementation review未実施 |
| Astra | PASS | `周回差`、positive/negative、`-1周`の区別を確認 |
| Sol | PASS | single-lap time differenceとしてのlabelとresult distinctionを確認 |
| Terra | PASS | guideとdetail headingが同じ意味を伝えることを確認 |

Confidence: `HIGH` for semantic labeling; `MEDIUM` for unaided first-time comprehension because no new Human review was executed.

## 7. MR-03 Regression Review

### MR-03: PASS

Final classification: `CONFIRMED FIXED` for the available evidence.

#### Original problem

順位、タイム差、周回差、ラップについて、方向と正負の意味を初見で確定しにくかった。

#### Current evidence

- rank guide: 数字が小さいほど上位で、chartでは上にあるほど良い状態であることを説明。
- gap guide: 注目選手を`±0`とする累積タイム差、プラス／マイナスの意味を説明。
- pace guide: 単周タイム差、注目選手基準、プラス／マイナスの意味、`-1周`との違いを説明。
- lap guide: ラップタイムは小さいほど速く、chartでは下にあるほど速い状態であることを説明。
- localでrank/gap/pace/lapのtab switchingを行い、active guideが更新されることを確認した。
- reload後もURL stateが保持され、browser back/forwardで`tab=lap`と`tab=gap`が復元され、対応するguideが表示された。
- `aria-describedby`によるactive guideの関連付けと、既存のmetric switching/chart-first structureが保持されている。

#### Visual noise check

guideはactive chart tab直下の短い補助説明として表示される。available desktop surfaceでは、chartを置き換える大きな説明領域やmetric tabとの重複表示は確認されなかった。ただしexact mobile wrappingは未検証である。

#### Perspective result

| Perspective | Result | Basis |
| --- | --- | --- |
| Owner Human | N/E | post-implementation review未実施 |
| Astra | PASS | direction/sign guideとmetric切替を確認 |
| Sol | PASS | selected-rider referenceと正負の説明を確認 |
| Terra | PASS | rank/lap/differenceの読み方がmetricごとに存在することを確認 |

Confidence: `HIGH` for desktop state behavior; `MEDIUM` for unaided human comprehension and mobile readability.

## 8. POS-01〜POS-05 Regression Review

### POS-01

Original positive finding: 結果表、順位、選手名、完走／DNF／周回遅れの状態が読みやすい。

Current state: production/localでME1 results disclosureを開き、60名の結果、順位、`-1周`、DNF row（`DNF・最終通過37位`）を確認できた。

Regression: `NO`

Evidence: MR-02の説明追加後もresult table semanticsとvisibilityは維持され、`-1周`とDNFが消失・置換されていない。

### POS-02

Original positive finding: 順位・ラップ中心のchart-first structureに分析価値がある。

Current state: result tableから選手分析へ移行し、rank/lap chartとlap detailを表示した。chartが主要分析領域として残っている。

Regression: `NO`

Evidence: MR-03のguideはchartを補助する位置にあり、chart geometryやstep/linear semanticsを変更していない。

### POS-03

Original positive finding: 大会→カテゴリー→結果→選手分析の導線が操作可能である。

Current state: homeから`CXK-256-004`を開き、ME1結果、選手選択、分析画面へ移行した。既存routeとcategory/result entryを保持した。

Regression: `NO`

Evidence: production/localで初期表示、race entry、results、rider analysisを通過し、UX3-5変更によるnavigation rewriteはない。

### POS-04

Original positive finding: 順位、タイム差、周回差、ラップの4 metric tabを操作できる。

Current state: 4 tabを切り替え、active guideとchart detailが対応して更新されることを確認した。

Regression: `NO`

Evidence: metric URL stateとreload/back/forwardを含め、切替操作は維持されている。

### POS-05

Original positive finding: ± comparisonと注目選手の強調には分析価値がある。

Current state: `±5`で11名を表示し、注目選手のrole/nameと強調表示、comparison summaryを確認した。比較選手追加・固定・選択状態のcontractは維持された。

Regression: `NO`

Evidence: static keyはmappingを補強し、comparison操作そのものを置き換えたり壊したりしていない。残存densityはUX3-6-R01として監視する。

## 9. Consensus Matrix

`N/E`は今回のreviewでOwner Human post-implementation reviewが未実施であることを示す。Astra/Sol/Terra列は新規participant sessionの投票ではなく、同じcurrent UI evidenceに対する独立perspective analysisである。

| Item | Owner Human | Astra | Sol | Terra | Final |
| --- | --- | --- | --- | --- | --- |
| MR-01 | N/E | YES | YES | YES | CONFIRMED FIXED |
| MR-02 | N/E | YES | YES | YES | CONFIRMED FIXED |
| MR-03 | N/E | YES | YES | YES | CONFIRMED FIXED |
| POS-01 | N/E | YES | YES | YES | MAINTAINED |
| POS-02 | N/E | YES | YES | YES | MAINTAINED |
| POS-03 | N/E | YES | YES | YES | MAINTAINED |
| POS-04 | N/E | YES | YES | YES | MAINTAINED |
| POS-05 | N/E | YES | YES | YES | MAINTAINED |

このmatrixはExternal Human Field Testのparticipant datasetではなく、実装後のcurrent UIに対するregression evidence matrixである。

## 10. New Findings

### UX3-6-R01 — 11名比較時のkeyとchartの残存density

- Classification: `RESIDUAL CONCERN`, not a confirmed new S1/S2 regression.
- Severity: `S3 — Minor`.
- Confidence: `MEDIUM`.
- Evidence: production/localの`±5・11名表示`で、role/name keyが2行に折り返される。AX treeでは全11名がtextとして利用可能で、available desktop surfaceではclippingやhorizontal overflowは確認されなかった。
- Impact: mappingは可能になったが、多人数比較ではinitial scanが軽くない。
- Relationship to MR-01: MR-01のfailureではなく、Fix後も残る既存information-density risk。keyを削除したり、比較人数やchart semanticsを変更したりする根拠にはしない。
- Disposition: `MONITOR`; external Human and exact mobile evidenceが得られるまで大規模な再配置は行わない。

その他に、UX3-5変更によるS0/S1/S2級の新規finding、説明の重複、URL/deep-link破壊、back/forward破壊、disclosure破壊、keyboard/accessibilityの明確なregressionは確認されなかった。

## 11. Severity Summary

UX3-6で新たに記録したfindingのみを集計する。

| Severity | Count | Finding |
| --- | ---: | --- |
| S0 — Critical | 0 | — |
| S1 — Major | 0 | — |
| S2 — Moderate | 0 | — |
| S3 — Minor | 1 | UX3-6-R01 |
| S4 — Cosmetic | 0 | — |

## 12. Desktop Verification

Exact viewport resize APIが利用できないため、1440×900、1280×720、1024×768の各サイズを厳密に再現したとは記録しない。available desktop browser surface（実測画面は約2545×1264）でproductionとlocalを確認した。

| Flow | Result | Evidence |
| --- | --- | --- |
| 初期表示 | PASS | production/local home and meet list |
| 大会・カテゴリー選択 | PASS | `CXK-256-004` / ME1 entry |
| リザルト確認 | PASS | 60名、`-1周`、DNF row |
| 選手分析への移行 | PASS | resultsから`堀川 範幸`を選択 |
| 選手切替 | PASS | rider URL stateを保持して切替 |
| 比較選手追加 | PASS | `±5・11名表示`、key、primary emphasis |
| metric切替 | PASS | rank/gap/pace/lapと対応guide |
| lap interaction | PASS | lap tab、lap selection、lap detail |
| results disclosure | PASS | `結果表を表示・60名` |
| lap detail disclosure | PASS | `ラップ詳細を表示・9周・堀川 範幸` |
| URL state | PASS | `rider`、`compare=5`、`tab` |
| reload | PASS | metric/rider/comparison state restored |
| browser back/forward | PASS | lap/gap state and guide restored |

Desktop exact-size status: `INCOMPLETE`（flow evidenceはPASS、exact viewport evidenceは未取得）。

## 13. Mobile Validation Limitation

`Exact 390×844 / 320px viewport verification: NOT EXECUTED`

今回のbrowser control surfaceではexact viewportを設定できず、iframe/data URLによる代替probeもbrowser policyで実行できなかった。したがって、以下を記録する。

- `Mobile exact viewport validation: INCOMPLETE`
- `Mobile human/synthetic triangulation incomplete`
- `Mobile validated`、`Mobile UX PASS`、`Responsive validation complete`とは記録しない。

MR-01〜MR-03のdesktop変更がmobileでどうwrapするかは未確定であり、UX3-6-R01もmobile findingへ拡張しない。

## 14. Deferred Findings Reassessment

UX3-5時点のremaining deferred findingsは9件（MR-04〜MR-12）。今回の結果では、いずれも実装対象へ昇格しない。

| Finding | UX3-6 status | Reason |
| --- | --- | --- |
| MR-04 | still deferred | 3/3 Synthetic-only terminology signal。今回の実装後も外部Human evidenceはない。 |
| MR-05 | still deferred | mixed/discoverability signal。MR-01〜03の修正後も初期分析・state affordanceのscopeを決める追加根拠はない。 |
| MR-06 | still deferred; external Human waiting | information density/layoutの広範な判断。今回のR01を大規模layout変更へ昇格させない。 |
| MR-07 | still deferred; external Human waiting | Owner-onlyの選択周回表の必要性・配置。 |
| MR-08 | still deferred; external Human waiting | browser back/state期待値の競合。今回のback/forward確認だけでは仕様変更根拠にならない。 |
| MR-09 | still deferred; external Human waiting | event code discoverabilityの低信頼signal。 |
| MR-10 | still deferred; external Human waiting | DNF/`-1周` semanticsの追加validationが必要。MR-02は単周タイム差との区別だけを扱い、定義変更はしていない。 |
| MR-11 | still deferred; external Human waiting | Mobile evidence gapでありproduct defectのPASS/FAILではない。 |
| MR-12 | still deferred; external Human waiting | sticky/大幅layout変更は外部Human確認なしに開始しない。 |

Status changes: `evidence strengthened: none`; `evidence weakened: none`; `obsolete after MR-01〜03: none`; `duplicated by another finding: none`。

## 15. External Human Validation Status

`External Human Field Test: BLOCKED — PARTICIPANTS UNAVAILABLE`

- External Human participants: `0`
- Historical Owner Human reviews: `1`（External participantではない）
- Historical Synthetic reviews: `3`（Astra / Sol / Terra、人間参加者ではない）
- UX3-6 Owner Human post-implementation review: `NOT EXECUTED`
- Human validation complete claim: `NOT MADE`

このreviewはUX3-5変更のdesktop behavior evidenceを追加したが、External Human datasetを作成したものではない。

## 16. Product Code Change Check

- UX3-6ではProduct codeを変更していない。
- UX3-5のproduct changesはbaseline commit `eee5570`に含まれる。今回のworktreeで`app/`、`components/`、`hooks/`、`lib/`、`tests/`、`public/`、`package.json`、lockfileを編集していない。
- UX3-4/UX3-5 source review filesは削除・上書きしていない。
- このphaseで追加する変更は本reportのみであり、既存のunrelated user changesはstage、discard、編集しない。

## 17. Recommendation

Primary: `C. WAIT FOR EXTERNAL HUMAN EVIDENCE`

Secondary: `D. MOBILE-SPECIFIC VERIFICATION REQUIRED`

MR-01〜MR-03はdesktop evidence上は安定化したため、直ちに再実装する必要はない。一方、Owner Human post-reviewとexact mobile evidenceがない状態で、MR-06〜MR-12やUX3-6-R01に対する大規模layout、sticky、semantic、navigation redesignを開始する根拠は不足している。

## 18. Final Phase Gate

`UX3-6 POST-IMPLEMENTATION REGRESSION REVIEW: LIMITED PASS — HUMAN / MOBILE VALIDATION INCOMPLETE`

Rationale:

- MR-01、MR-02、MR-03: current desktop evidenceで`CONFIRMED FIXED`。
- POS-01〜POS-05: current desktop flowでregression `NO`。
- S0/S1: `0`。新しい重大regressionなし。
- Product code changes in UX3-6: `none`。
- Review evidence: source links、current production/local flow、URL/disclosure/back-forward evidenceをtraceableに記録。
- Owner Human post-implementation review: `NOT EXECUTED`。
- Exact mobile validation: `INCOMPLETE`。
- External Human Field Test: `BLOCKED — PARTICIPANTS UNAVAILABLE`。

この判定はfailureではなく、利用可能な証拠の範囲でUX3-5を安定化済みとしつつ、Human/Mobileの未検証をPASSへ変換しないためのlimited gateである。
