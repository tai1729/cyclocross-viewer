# UX3-5 Limited Scope Implementation

## 1. Executive Summary

UX3-4で `Fix Now` と判定された `MR-01`、`MR-02`、`MR-03`だけを実装した。変更は、比較線の識別補助、`周回差`の意味と結果表の`-1周`との区別、指標ごとの方向・正負の読み方の可視化に限定している。数値計算、チャートの線種、URL state、選手・カテゴリー・比較操作の契約は変更していない。

External Human Field Testは完了していない。Owner Human Reviewは人間の補助Evidenceとして扱うが、外部participantには算入しない。

## 2. Source

- UX3-4 synthesis: [ux3-4-multi-reviewer-synthesis.md](ux3-4-multi-reviewer-synthesis.md)
- Baseline: `79cf29f` (`docs: synthesize UX3-4 reviewer evidence`)
- Design: [docs/DESIGN.md](../DESIGN.md)
- Implementation plan: [docs/IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)
- Specification audit: [docs/SPEC_AUDIT.md](../SPEC_AUDIT.md)

Evidence source files:

- [Astra Synthetic Profile C review](ux3-2-synthetic-astra-profile-c-01.md)
- [Sol Synthetic Profile C review](ux3-2-synthetic-sol-profile-c-01.md)
- [Terra Synthetic Profile C review](ux3-2-synthetic-terra-profile-c-01.md)
- [Owner Human review](ux3-2-participant-post-test-qa-P-A-01.md)

## 3. Scope

### Implemented

- `MR-01`: crowded comparisonの線・選手名・role対応を補助する静的series key、決定的なcontext色、bounded tooltip names。
- `MR-02`: `周回差（単周タイム差）`という表示と、結果表の`-1周`とは別指標である説明。
- `MR-03`: 順位、タイム差、周回差、ラップの方向・正負をactive tab上で説明。

### Explicitly not implemented

- `Wait for External Human` findings、MR-04〜MR-12の保留項目。
- Mobile triangulation不足を解消するための大規模redesign。
- DNF、lap-down、`-1周`、gap、paceのデータ意味論・数値計算変更。
- URL contract、browser history、category/rider/comparison/metric/lap stateの変更。
- 選択周回表、情報密度、navigation可視性の大規模再配置。

## 0. Pre-implementation acceptance criteria

### MR-01

#### Problem

多人数比較で線と選手名・roleの対応が追いにくい。

#### Evidence

- Human: 多人数時の凡例・選手名対応と一括表示感を指摘。
- Astra: 薄い参考線と凡例の対応追跡に摩擦。
- Sol: 線と名前の対応、比較人数増加時の凡例可読性に摩擦。
- Terra: 凡例と色を往復して線を追う必要。

#### Intended change

Crowded comparisonに、表示中のunique rider全員をrole付きで列挙するwrapping keyを追加し、context lineに決定的なcategorical colorを付与する。12名以下のnon-`all` crowded viewではtooltipにも個別名を出す。

#### Out of scope

線のdata、rider順、比較人数の既定値、chart geometry、URL state、all-modeの巨大tooltip設計。

#### Acceptance criteria

- [x] Crowded viewでprimaryを含む全unique riderの名前とroleが一度ずつtext表示される。
- [x] Context colorはdisplayed orderに基づきrerender・metric tab間で決定的で、palette exhaustion後だけcycleする。
- [x] Tooltipはvalid valueだけを表示し、bounded non-`all` crowded viewでは個別context名、`all`/large viewではaggregate safetyを維持する。
- [x] 既存のprimary強調、fixed比較、sparse data、`connectNulls={false}`を維持する。

### MR-02

#### Problem

`周回差`が周回数差のように読め、結果表の`-1周`と混同し得る。

#### Evidence

- Human: タイム差と周回差の方向理解に時間がかかった。
- Astra: `周回差`を当初lap count differenceと推測。
- Sol: 同じく周回数差の推測から説明で修正。
- Terra: 説明を読んでsingle-lap time differenceとして理解。

#### Intended change

Visible reading guideとchart detail labelに`周回差（単周タイム差）`を使い、result-table `-1周（1周遅れ）`とは別指標であることを同じ画面で明示する。

#### Out of scope

既存のpace series、formatting、lap-down、DNF、result semantics、数値式。

#### Acceptance criteria

- [x] `周回差`のvisible guideがsingle-lap time differenceと明示する。
- [x] guideがpositive/negativeの意味をselected rider基準で説明する。
- [x] guideがresult `-1周（1周遅れ）`とは別指標と明示する。
- [x] 数値とchart dataのsemanticsは変更しない。

### MR-03

#### Problem

指標ごとに「上／下」「正／負」が何を意味するかが初見で即時に分かりにくい。

#### Evidence

- Human: タイム差・周回差で上側が良いか悪いかに摩擦。
- Astra: rank/lap方向とgap/paceのsignを説明依存で確認。
- Sol: metricごとの方向・signの説明を必要とした。
- Terra: rank、lap、differenceの読み方を説明後に確認。

#### Intended change

active chart tabの直下に、rank、cumulative gap、single-lap difference、lap-timeの方向・signをtab-specificに表示する。rankは小さい数値・上が良い、lapは小さい時間・下が速い、differenceはselected riderをzero referenceとして説明する。

#### Out of scope

step/linear rendering、axis domain、primary reference line、色のみの意味変更、metric stateやdata transform。

#### Acceptance criteria

- [x] 4つのtabすべてにactive-tab reading guideがある。
- [x] rank/lapのdirectionとgap/paceのselected-rider基準・positive/negativeが明示される。
- [x] guideが`TabsList`からaccessible descriptionとして参照される。
- [x] 既存のmetric switchingとchart-first構造が維持される。

## 4. MR-01

### Original problem

Tier A / P1の共通finding。Owner HumanとAstra/Sol/Terraの全4レビューで、多人数比較時の線・凡例・選手名の対応追跡に摩擦が記録された。

### Evidence

UX3-4のmatrixはHuman `YES`、Synthetic `3/3`、severity `S2 candidate`、priority `P1`、recommendation `Fix Now`。これはexternal human participantの証拠ではない。

### Root cause

多人数時に参考線が似た視覚表現へ集中し、Rechartsの通常凡例だけではrole/nameとlineの対応が追いにくかった。既存のchart dataとline semantics自体は問題の根因ではない。

### Change

- `lib/chartSeriesStyles.ts`でcontext lineにdisplayed order由来の8色categorical paletteを付与。
- `ChartTabs`にprimaryを含むunique riderのrole/name/line markerを持つwrapping `data-chart-series-key`を追加。
- crowded non-`all`かつ12名以下のtooltipではcontext riderを個別name/valueで表示。
- all-modeまたはlarge datasetはaggregate context summaryを維持し、巨大tooltipを避ける。
- primary/fixedのemphasis、line type、sparse data semantics、既存comparison stateは変更なし。

### Files changed

- `components/ChartTabs.tsx`
- `components/RoleAwareTooltip.tsx`
- `components/RankBumpChart.tsx`
- `components/GapChart.tsx`
- `components/PaceChart.tsx`
- `components/LapTimeChart.tsx`
- `lib/chartSeriesStyles.ts`
- `tests/chartSeriesStyles.test.ts`

### Acceptance criteria

上記のMR-01 criteriaを満たした。Browserでは60名カテゴリーの±5 comparisonで11名を表示し、chart下に11名全員のrole/name keyが出ること、primaryが強調されること、URLが`compare=5`を保持することを確認した。

### Verification result

PASS。Rechartsのcrowded built-in legendは抑制され、static keyがname-to-line mappingのtext referenceとして残る。Accessibility treeでも`比較チャートの線`と11名のrole/nameを確認した。

## 5. MR-02

### Original problem

Tier A / P1の共通finding。`周回差`の名称だけでは単周タイム差が即時に分からず、result-tableの`-1周`との区別が必要だった。

### Evidence

Owner Human、Astra、Sol、Terraが全員このsemantic frictionを示した。Owner HumanはSyntheticと同じ混同を直接証明したものではなく、方向理解に時間がかかった人間Evidenceとして扱った。

### Root cause

metric labelが短い`周回差`だけで、単周タイム差とresult statusの境界を同一画面で明示していなかった。

### Change

- `lib/chartReadingGuide.ts`にpace/周回差のcanonical explanationを追加。
- `ChartDetailPanel.tsx`のpace detail labelを`周回差（単周タイム差）`へ変更。
- guideに`-1周（1周遅れ）`とは別指標であることを明示。

### Files changed

- `components/ChartDetailPanel.tsx`
- `components/ChartTabs.tsx`
- `lib/chartReadingGuide.ts`
- `tests/chartReadingGuide.test.ts`

### Acceptance criteria

上記のMR-02 criteriaを満たした。Browserではpace tabのguideとdetail headingに明示的な単周タイム差表現が出て、結果表には従来どおり`-1周`が残ることを確認した。

### Verification result

PASS。`-1周`のresult display、DNF表示、pace chartのnumeric payloadは変更していない。

## 6. MR-03

### Original problem

Tier A / P1の共通finding。rank、gap、pace、lapで方向・正負の意味が初見で追いにくかった。

### Evidence

Owner HumanとAstra/Sol/Terraが、説明なしではmetric direction/signを確定しにくい、または説明を読んで理解したと記録した。

### Root cause

chart descriptionは存在したが、active metricの意味を短く比較できる共通reading guideとしてtab直下にまとまっていなかった。

### Change

- `lib/chartReadingGuide.ts`で4 metricのlabel/textを一元化。
- `ChartTabs.tsx`でactive tabのguideをvisibleかつ`aria-describedby`参照可能な位置に表示。
- chart rendering（rank `stepAfter`、time `linear`、axis、reference line）は維持。

### Files changed

- `components/ChartTabs.tsx`
- `lib/chartReadingGuide.ts`
- `tests/chartReadingGuide.test.ts`

### Acceptance criteria

上記のMR-03 criteriaを満たした。Browserではrank、gap、pace、lapを切り替え、それぞれのguideの方向・基準文が更新されることを確認した。

### Verification result

PASS。metric URL key、tab switching、lap selection、chart detail、reference semanticsに変更はない。

## 7. Do Not Regress Verification

### POS-01

結果表の順位、選手名、結果、完走/DNF表示は変更していない。BrowserでME1の結果表を開き、60名、`-1周`、DNF行が従来どおり読めることを確認した。Unit/full testもPASS。

### POS-02

chart-firstの周回分析構造と順位・ラップの価値を維持した。Browserで選手選択後にchartへ到達し、rank/lap chartと周回詳細が表示されることを確認した。

### POS-03

大会一覧→大会→カテゴリー→リザルト→分析のrouteと導線を変更していない。Browserで一覧から`CXK-256-004`を開き、ME1、結果、選手分析へ進めることを確認した。URL contractも維持した。

### POS-04

順位、タイム差、周回差、ラップの4 tabを操作でき、active guideだけが切り替わることを確認した。metric stateのURL serializationとreload後の復元も確認した。

### POS-05

±5 comparisonで11名を表示し、比較の人数・selected rider・primary emphasisが維持されることを確認した。comparison valueを高めるための識別keyを追加したが、comparison selection contractは変更していない。

## 8. Desktop Verification

Browser verificationはChromeの実ページで実施した。Browser surfaceの論理viewportはツールから固定値として取得できず、実測screenshotは約2545×1264だったため、指定サイズへの厳密なresize結果とは表現しない。

### 1440×900

指定値へのviewport設定は、利用可能なbrowser control surfaceにresize APIがなく未実施。代わりに同じ実ページ・同じresponsive CSSで、desktop chart flow、crowded key、4 metric guides、disclosure、reload、back/forwardを確認した。

### 1280×720

指定値へのviewport設定は未実施。desktop surfaceでの同じacceptance checksはPASS。ページ全体のhorizontal overflowを誘発する新しいfixed-width elementは追加していない。

### Optional 1024×768

未実施。今回の変更は既存の`min-w-0`、`flex-wrap`、responsive chart containerを利用し、desktop layoutの再設計を行っていない。

## 9. Mobile Regression Check

### 390×844

このbrowser toolではviewportを390pxへ変更できず、data URL/iframeによる代替probeはbrowser security policyにより拒否された。したがって、390×844の実ブラウザtriangulation完了とは記録しない。

コード上はseries keyを`min-w-0 flex-wrap`、rider nameを`break-words`、TabsListを`min-w-0`としており、今回の変更でmobile fixed-width elementやhorizontal scroll requirementを追加していない。既存のmobile regression contractはautomated validationで維持を確認した。

### 320px class

同じ理由でexact 320px browser captureは未実施。Mobile human/synthetic triangulationは引き続きincompleteであり、mobile redesignやmobile PASS claimは行わない。

## 10. Functional Regression

- URL state: rider、`compare=5`、`tab=lap/gap`を確認。PASS。
- Browser back/forward: gapからlapへ戻る／進むとstateが復元。PASS。
- Rider selection: 結果表・選手変更から選手を選べる。PASS。
- Comparison: ±5で11名表示、全員比較制約、primary/fixed/context roleを維持。PASS。
- Metrics: rank/gap/pace/lapのtab switchingとguide更新。PASS。
- Lap: 周回selector、前後周回操作、周回詳細。PASS。
- Results disclosure: 60名結果表を開閉。PASS。
- Lap-detail disclosure: 9周のlap detailを開閉。PASS。
- Result semantics: 完走、`-1周`、DNF・最終通過の表示を確認。PASS。

## 11. Automated Validation

- `npm test` — PASS, 108 tests.
- `npx tsc --noEmit` — PASS.
- `npm run lint` — PASS.
- `npm run build` — PASS.
- `git diff --check` — PASS.
- Source evidence files — preserved; no UX3-2 review file was edited.
- Product scope — only MR-01/MR-02/MR-03 UI and their tests/docs changed; unrelated user changes remain unstaged.

## 12. Findings Discovered During Implementation

1. Initial live browser inspection showed that the crowded context required an explicit text key rather than relying on a long visual legend. The implementation keeps the key as the authoritative text mapping and suppresses the crowded built-in legend.
2. The available browser automation surface does not expose exact viewport resizing. The attempted indirect iframe/data-URL probe was rejected by browser security policy, so no unsupported mobile PASS claim was added.
3. No new product-data or route issue was discovered.

## 13. Deferred Findings

The following remain deferred from UX3-4: MR-04 through MR-12, including owner-only layout/selection-detail concerns, DNF/`-1周` semantic validation, browser-history disagreement, event-code discovery, category/navigation visibility, and the Mobile evidence gap. No new synthetic or browser review participant was added.

## 14. Remaining Human Validation Requirement

Owner Human Review is corroborating evidence only. External Human Field Test remains:

`BLOCKED — PARTICIPANTS UNAVAILABLE`

External Human participants: `0`.

Mobile status: `Mobile human/synthetic triangulation incomplete`.

The limited implementation is evidence-backed, but this report does not claim external-user validation complete.

## 15. Final Verdict

`UX3-5 LIMITED SCOPE IMPLEMENTATION: PASS`

MR-01, MR-02, and MR-03 are implemented within the approved scope. Automated validation and the available live-browser functional verification passed. Exact 1440×900, 1280×720, 1024×768, 390×844, and 320px browser viewport captures were unavailable through the current browser control surface; this limitation is recorded rather than converted into a false mobile validation claim. Large redesigns and all deferred findings remain out of scope.
