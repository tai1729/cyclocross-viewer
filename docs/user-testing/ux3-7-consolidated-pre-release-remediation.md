# UX3-7 Consolidated Pre-Release Remediation

## 1. Executive Summary

UX3-7 consolidates the Owner Human first-use evidence from P-A-01 with Astra,
Sol, Terra, and the UX3-4/5/6 records. The evidence supports a bounded
remediation of analysis discoverability, rider/comparison identity, chart
visibility, action affordance, and selected-lap explanation. The product code
changes are intentionally local; URL keys, history semantics, data contracts,
metric formulas, sparse-data rules, and status meanings are unchanged.

The release candidate passes 125 automated tests, typecheck, lint, build, and
diff validation. The bounded marker revision now gives fixed riders four and
numeric context riders ten independently unique dash/marker assignments; the
same SVG marker contract is rendered in the shared key and all four chart
series, including crowded mode. The independent final review returned PASS;
the candidate was committed, pushed, deployed, and smoke-tested in
Production. No S0 or release-blocking S1 finding remains.
External Human pre-release validation was not executed because participants
were unavailable; that fact remains an evidence limitation and is not a
release gate.

## 2. Policy Change

- External Human is no longer a release blocker.
- Owner Human evidence, synthetic review, automated checks, and browser
  verification are used for the pre-release gate.
- Post-release actual-user usage and feedback continue the Human validation
  phase. Human validation is not claimed complete here.

## 3. Evidence Sources

### P-A-01

Primary Owner Human source of truth:
`docs/user-testing/ux3-2-participant-post-test-qa-P-A-01.md`.

This is treated as Owner Human, almost-first-use evidence, not as External
Human field-test evidence. It records confusion about initial chart discovery,
results/chart hierarchy, chart size and legend reading, comparison identity,
rider switching, fixed/comparison controls, selected-lap detail, clickable
affordances, terminology, and navigation/search visibility.

### Astra

`docs/user-testing/ux3-2-synthetic-astra-profile-c-01.md`.

### Sol

`docs/user-testing/ux3-2-synthetic-sol-profile-c-01.md`.

### Terra

`docs/user-testing/ux3-2-synthetic-terra-profile-c-01.md`.

### UX3-4

`docs/user-testing/ux3-4-multi-reviewer-synthesis.md`.

### UX3-5

`docs/user-testing/ux3-5-limited-scope-implementation.md`.

### UX3-6

`docs/user-testing/ux3-6-post-implementation-regression-review.md`.

The authoritative design decisions are recorded in `docs/DESIGN.md`,
`docs/IMPLEMENTATION_PLAN.md`, and `docs/SPEC_AUDIT.md`.

## 4. Consolidated Findings

P-A-01 was normalized into 12 observable findings so that overlapping notes
were not counted as separate product problems:

| ID | Normalized observation | Evidence | Decision |
| --- | --- | --- | --- |
| PA-01 | A fresh race opens without a visible analysis path/chart. | Q03, Q46, Q72 | IMPLEMENT |
| PA-02 | Results, rider understanding, and chart priority are not obvious. | Q09, Q16, Q29, Q50, Q79 | IMPLEMENT |
| PA-03 | Chart occupies too little visual weight and whitespace/legend density competes. | Q32, Q58, Q77 | IMPLEMENT |
| PA-04 | Comparison lines and names are hard to map. | Q08, Q51–Q53, Q60 | IMPLEMENT |
| PA-05 | Current rider and rider-switch location require exploration. | Q31, Q60, Q68 | IMPLEMENT |
| PA-06 | Comparison/fixed controls do not predict the result clearly. | Q05, Q35, Q60 | IMPLEMENT |
| PA-07 | Selected-lap values are separated from the action that produces them. | Q34, Q51, Q58–Q59 | IMPLEMENT |
| PA-08 | Clickable controls and resulting state are visually understated. | Q05, Q13, Q27 | IMPLEMENT |
| PA-09 | Fixed/comparison and related terminology is initially ambiguous. | Q28, Q35, Q36 | IMPLEMENT |
| PA-10 | Category/back/list navigation can be hidden after scrolling. | Q12, Q69, Q70 | DEFER: sticky/navigation rewrite risk |
| PA-11 | Rider search/event discovery could require a new search/route feature. | Q45, Q68 | DEFER: insufficient corroboration and scope |
| PA-12 | Metric direction and sign meaning take time to learn. | Q56, Q65 | ALREADY RESOLVED: MR-03 retained |

## 5. Decision Matrix

### Implement Now

Six bounded implementation workstreams were used:

1. Fresh-entry first graphable rider selection using URL `replace`.
2. Race/result/rider context and comparison-name hierarchy.
3. Named rider/comparison controls and state affordances.
4. One shared line identity key and bounded chart visibility increase.
5. Selected-lap action/result explanation.
6. Terminology scent and existing metric/lap explanatory copy.

These workstreams cover PA-01 through PA-09 and the implementable portions of
MR-04, MR-05, MR-06, and MR-07. The marker completion is included in the
MR-01 workstream: fixed riders have four independent dash/marker assignments,
numeric context has ten, and the shared SVG marker is rendered by the key and
all four chart series.

Normalized P-A-01 decision counts: Implement Now 9, Already Resolved 1,
Deferred 2. Synthetic root-cause findings were consolidated into 5 thematic
groups; MR-10 is merged into the existing metric explanation rather than
treated as a separate implementation.

### Merged

- MR-10 is merged into the existing MR-02 explanation. DNF and lap-down
  definitions are not changed.

### Already Resolved

- MR-02 remains protected by the `周回差` versus result-table `-1周`
  explanation.
- MR-03 remains protected by the visible direction/sign guides.

MR-01's original UX3-5 role/name work and the UX3-7 non-color marker extension
are both implemented; final independent review is the remaining gate.

### Deferred with Specific Reason

- MR-08: browser-history behavior has divided evidence and an established URL
  contract; changing it would create a high-regression state/navigation risk.
- MR-09: event-code search or a new route is not corroborated by enough task
  evidence and would be a new feature rather than a local UX repair.
- MR-11: the missing mobile/External Human run is an evidence gap, not a
  demonstrated product defect. Automated responsive checks continue.
- MR-12: sticky navigation or a broad navigation rewrite would add another
  persistent layer and has higher regression risk than this evidence supports.

None of these decisions uses External Human unavailability as the reason to
stop implementation or release.

## 6. P-A-01 Findings Addressed

Nine of the 12 normalized P-A-01 observations are addressed by the new or
retained UI: initial analysis entry, hierarchy, chart visibility, comparison
identity, rider switching, comparison controls, selected-lap relationship,
action affordance, and terminology. PA-12 is already addressed by MR-03. PA-10
and PA-11 remain deferred for the specific technical/UX reasons above.

The primary flow is now visually ordered as race context → selected rider and
result context → primary chart → comparison identity → lap detail/results.
The fresh race URL receives the first graphable result-position rider only
when no `rider` query key was supplied. Explicit deep links remain
authoritative.

## 7. Synthetic Findings Addressed

Astra, Sol, and Terra were integrated by root cause rather than by a simple
vote. Their common themes were line/name mapping, comparison affordance,
terminology, chart density/visibility, metric direction, and the initial
analysis path. Terra's terminology observations and Sol/Astra's affordance
observations were merged with the Owner Human notes where they described the
same root cause. Synthetic reviewers did not provide External Human evidence;
their role remains synthetic review.

### Finding: initial analysis discovery

- Owner Human: first-use chart discovery was slow and the initial empty state
  felt unfriendly.
- Astra: initial analysis path and control affordance were unclear.
- Sol: analysis should begin with a visible selected rider/chart.
- Terra: no conflicting product finding.
- Current UI: a fresh category selects the first graphable rider through a
  non-history URL replacement.
- Root cause: the product required a result-table action before exposing the
  primary analysis.
- Decision: IMPLEMENT.
- Reason: direct Owner Human evidence and low-risk reversible presentation
  change.

### Finding: comparison identity and line mapping

- Owner Human: chart lines and the lower detail surface did not make identity
  obvious.
- Astra: line/name mapping required stronger identity support.
- Sol: comparison names and roles should be visible at the point of use.
- Terra: chart comparison identity was also difficult to infer.
- Current UI: one visible shared key lists role and rider name with the same
  SVG marker and dash mapping used by each chart series; built-in duplicate
  legends are removed.
- Root cause: line identity was encoded in a small or duplicated legend and
  color was doing too much work.
- Decision: IMPLEMENT/MERGED with MR-01.
- Reason: 4-way corroboration and low data risk.

### Finding: rider and comparison controls

- Owner Human: rider switching and fixed/comparison controls took exploration.
- Astra: affordance and selected-state explanation were partial.
- Sol: controls should name the action and outcome.
- Terra: fixed/compare terminology was initially unclear.
- Current UI: `注目選手`, `比較する選手`, comparison count, comparison names,
  explicit add/remove labels, and readable selected-state context.
- Root cause: action, current subject, and resulting relationship were not
  named together.
- Decision: IMPLEMENT.
- Reason: corroborated and bounded to existing controls.

### Finding: chart visibility and selected-lap relationship

- Owner Human: chart was small, legend crowded, and selected-lap values were
  separated from the action.
- Astra: chart hierarchy and density were improvement candidates.
- Sol: chart should carry more visual weight and explain interaction.
- Terra: no conflicting change requiring a redesign.
- Current UI: chart frames are `h-72 sm:h-[22rem] lg:h-[30rem]`; the exact
  interaction/result copy appears before the existing measured detail panel.
- Root cause: supporting controls and detail surfaces competed with the main
  visual and the click/hover/pin relationship was implicit.
- Decision: IMPLEMENT bounded portion of MR-06/MR-07.
- Reason: clear benefit with no data or layout rewrite.

### Finding: terminology and metric semantics

- Owner Human: `固定`, metric direction, and chart/table relationships took
  time to interpret.
- Astra: metric direction and status terminology needed explicit guidance.
- Sol: direction/sign explanations were useful.
- Terra: AJOCC/ME1 and `周回差` terminology were not immediately obvious.
- Current UI: existing MR-02/MR-03 guides remain, comparison labels are named,
  and the selected-lap relationship is explicit.
- Root cause: domain terms and action labels lacked nearby explanations.
- Decision: IMPLEMENT/MERGE MR-02/MR-03/MR-04/MR-10 without changing semantics.
- Reason: explanation is safe; new status definitions or taxonomy are not.

### Detailed finding records

| Finding | Owner Human | Astra | Sol | Terra | Current UI | Root cause | Decision | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PA-01 initial analysis | Q03/Q46: no obvious initial chart path | Partial concern | Support visible first analysis | No conflict | First graphable rider auto-selected only with no rider query | Analysis required a separate result action | IMPLEMENT | Direct evidence; low-risk replace |
| PA-02 hierarchy | Q09/Q16/Q29/Q50/Q79: chart/result priority unclear | Supports chart-first | Supports chart-first | No conflicting rewrite | Context → chart → comparison → detail/disclosure | Existing information was poorly sequenced | IMPLEMENT | Local change on existing UX2 structure |
| PA-03 chart size/density | Q32/Q58/Q77: chart/legend small | Priority candidate | More chart weight | No full redesign evidence | `h-72 sm:h-[22rem] lg:h-[30rem]`, one key | Chart height and duplicate legends competed | IMPLEMENT | Clear benefit, bounded responsive change |
| PA-04 line identity | Q08/Q51–Q53/Q60: line mapping hard | YES | YES | YES | One role/name key plus non-color marker | Legend/color did too much work | IMPLEMENT/MERGE MR-01 | Strong corroboration; no data change |
| PA-05 rider switching | Q31/Q60/Q68: current rider/switch location unclear | Partial | YES | No conflict | `注目選手`, current status, named change control | Subject and action were under-specified | IMPLEMENT MR-05 | Existing mechanics retained |
| PA-06 comparison affordance | Q05/Q35/Q60: fixed/compare result unclear | Partial/YES | YES | YES terminology scent | `比較する選手`, count, names, add/remove labels | Action did not state relationship/result | IMPLEMENT MR-05 | Corroborated, bounded to controls |
| PA-07 selected lap | Q34/Q51/Q58–Q59: detail separated | Supports guidance | Supports nearby guidance | No delete requirement | Exact click/select/pin versus hover copy before detail | Action/result relationship was implicit | IMPLEMENT MR-07 | Copy-only, measured semantics retained |
| PA-08 action affordance | Q05/Q13/Q27: clickable affordance weak | Supports state | Supports labels | No conflict | Semantic buttons, labels, active state, 44px classes | Interactive/static content looked similar | IMPLEMENT | Clear low-risk defect |
| PA-09 terminology | Q28/Q35/Q36: fixed/domain terms unclear | Candidate | Nearby explanation | Independent terminology friction | `比較する選手`/`固定比較` plus existing metric guide | Terms lacked action context | IMPLEMENT MR-04 / MERGE MR-10 | No taxonomy or status change |
| PA-10 hidden navigation | Q12/Q69/Q70: category/back/list hidden after scroll | No sufficient corroboration | No release-critical confirmation | No usable rewrite evidence | Existing non-sticky navigation retained | Possible scroll issue, not critical failure | DEFER MR-12 | Sticky rewrite risk; evidence divided |
| PA-11 search/event discovery | Q45/Q68: discovery effort | Speculative event search | No corroborated feature need | No route evidence | Existing rider search/category filters retained | New IA/search feature required | DEFER MR-09 | Insufficient evidence and larger scope |
| PA-12 metric direction | Q56/Q65: direction/sign took time | YES | YES | YES | MR-02/MR-03 guides retained | Meaning was not always local | ALREADY RESOLVED MR-03 | Existing fix; semantic change risky |

The table distinguishes Owner Human evidence from synthetic evidence and
records a concrete reason for every deferred finding.

## 8. Implementation

### Finding → root cause → change → files

| Finding/root cause | Change | Files |
| --- | --- | --- |
| No clear initial analysis entry | Select first graphable rider only when no `rider` query exists; `router.replace({scroll:false})` preserves query/history | `components/RaceViewer.tsx`, `lib/raceDefaultAnalysis.ts` |
| Selected rider/control identity | Named `注目選手` control, helper text, change affordance, context status | `components/RiderSelector.tsx`, `components/AnalysisContextBar.tsx`, `components/RaceViewer.tsx` |
| Comparison state/name identity | Named `比較する選手`, count, compact names, explicit add/remove labels | `components/AnalysisContextBar.tsx`, `components/ComparisonAdjuster.tsx`, `components/ComparisonRiderPicker.tsx`, `components/MobileComparisonDisclosure.tsx` |
| Lines and legends difficult to map | One shared role/name/static key per visible chart; remove Recharts legends | `components/ChartTabs.tsx`, `components/RankBumpChart.tsx`, `components/GapChart.tsx`, `components/PaceChart.tsx`, `components/LapTimeChart.tsx` |
| Same-role chart identity still depended on color | Four fixed and ten numeric-context dash/marker assignments, shared SVG dots in key and all charts, including crowded mode | `lib/chartSeriesStyles.ts`, `components/SeriesMarkerDot.tsx`, `components/ChartTabs.tsx`, four chart components |
| Chart too small / interaction implicit | Bounded chart height increase and exact selected-lap interaction copy | `components/ChartTabs.tsx`, four chart components |
| Fresh home flow lacks analysis cue | Microcopy connects meet choice to analysis | `components/MeetSelector.tsx` |
| Regression coverage | First-graphable, context, chart-key, mobile-label tests | `tests/raceDefaultAnalysis.test.ts`, `tests/analysisContextBar.test.ts`, `tests/chartTabs.test.ts`, `tests/mobileComparisonDisclosure.test.ts`, `tests/mobileControlPresentation.test.ts` |

No data contract, transform, dependency, route, URL-key, metric formula, or
production configuration was changed.

## 9. MR-01〜MR-03 Regression

- MR-01: PASS. The shared role/name key and every chart series use the same
  non-color marker/dash contract; four fixed and ten numeric-context styles are
  independently unique without supported-cardinality cycling.
- MR-02: PASS. `周回差` remains distinct from result-table `-1周`; numeric
  formulas and measured-only behavior are unchanged.
- MR-03: PASS. Rank, cumulative gap, single-lap difference, and lap-time
  direction/sign guides remain visible at the metric point of use.

## 10. POS-01〜POS-05 Regression

- POS-01 results clarity: PASS; the existing results table and disclosure
  remain reachable.
- POS-02 chart value: PASS; fresh entry now exposes the chart and its visible
  key with a larger bounded frame.
- POS-03 navigation path: PASS; meet/category/race path and return link remain.
- POS-04 metric switching: PASS; all four tabs remain operable and retain URL
  state.
- POS-05 comparison value: PASS; controls/count/names and non-color chart line
  identity remain available through the shared key and plotted markers.

## 11. Desktop Verification

Exact target viewport control was unavailable in the connected browser.
Available browser approximation: PASS at 1920×911.

Measured local analysis page:

- chart frame: 1433×480 CSS pixels;
- chart top: y=525, context top: y=275, vertical distance 250px;
- chart width is 74.6% of the available 1920px viewport and height is 52.7%
  of the viewport;
- visible chart identity keys: 1;
- duplicate Recharts legends: 0;
- document horizontal overflow: none.

Responsive code inspection confirms the target breakpoint classes for
1440×900, 1280×720, and 1024×768: full-width chart containers, `min-w-0`,
wrapping keys, and no new fixed/sticky surface. Exact 1440×900, 1280×720, and
1024×768 screenshots were not available in this browser.

## 12. Mobile Verification

- Exact 390×844: NOT VERIFIED; viewport override is unavailable.
- Exact 320px width class: NOT VERIFIED; viewport override is unavailable.
- Responsive code inspection: PASS for `h-72`, `w-full`, `min-w-0`, wrapping
  names, `break-words`, and existing `min-h-11`/44px-class controls.
- Available browser approximation: PASS for no document overflow and visible
  selected-rider/comparison semantics at the available desktop viewport.
- Risk: MEDIUM, because exact mobile visual evidence remains incomplete. No
  S0/S1 issue was found and automated mobile presentation tests pass, so this
  is not a release blocker. Post-release Human validation must include exact
  mobile observations.

## 13. Functional Regression

Local browser verification PASS:

1. race selection and result access;
2. category control rendered and category context retained;
3. fresh first graphable rider selection;
4. rider switching;
5. comparison mode switch;
6. comparison add and remove;
7. metric switching;
8. lap selector and selected-lap hint;
9. Results disclosure;
10. Lap Detail disclosure;
11. URL state and reload;
12. deep link with rider/tab/lap;
13. browser back and forward.

Observed deep-link example:
`/race/MMJ-256-005?rider=KNS-000-4368&tab=lap&lap=3` restored 和田 良平,
ラップ, and 周回3.

## 14. Accessibility

- Semantic native tabs, buttons, comboboxes, selects, and `details/summary`
  disclosures remain present.
- Tab selection retains `role="tab"` and `aria-selected` semantics.
- Rider and comparison actions expose action/result labels, including add,
  remove, change, and selected states.
- Existing visible focus rings and native keyboard targets remain; mobile
  controls retain 44px-class sizing in automated tests.
- The shared chart key and plotted dots provide text role/name identity plus
  deterministic non-color dash-pattern/marker differences. Crowded mode keeps
  assigned context markers at a smaller size, and the same mapping is used by
  all four charts. No color-only meaning or duplicate legend remains.
- `SeriesMarkerDot` directly guards missing/non-finite coordinates and is
  covered for every supported SVG marker, visual props, and custom size.
- No new color-only meaning, input, dependency, or ARIA rewrite was added.

## 15. Automated Validation

- `npm test`: PASS — 125 tests, 125 passed, 0 failed.
- `npx tsc --noEmit`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS — Next.js 16.3.3 production build.
- `git diff --check`: PASS.

The baseline recorded 108 tests; the release candidate has 125, so the count
did not decrease.

## 16. Remaining Known Issues

- Exact mobile 390×844 and 320px viewport evidence remains to be collected.
- MR-08 history interpretation remains intentionally unchanged.
- MR-09 event-code search/route remains out of scope.
- MR-12 sticky navigation remains out of scope.
- External Human pre-release field test remains unexecuted.

These are recorded limitations, not hidden defects or release-blocking
External Human gates.

## 17. Release Risk Assessment

Post-remediation remaining finding counts:

| Severity | Remaining | Notes |
| --- | ---: | --- |
| S0 | 0 | No critical issue. |
| S1 | 0 | No unresolved release-blocking user-impact issue. |
| S2 | 0 | The marker/dash contract is rendered by the key and all four chart series. |
| S3 | 4 | Exact mobile evidence gap, MR-08, MR-09, MR-12; all have specific bounded reasons. |
| S4 | 0 | None tracked as a remaining finding. |

Release gate: PASS. S0 and S1 are zero; the former S2 marker issue is
remediated, directly tested, and independently reviewed.

## 18. Production Release

Production release status: RELEASED. Commit `30ee798a2dbc82f828fc0f28837c9663ee9bbd39`
was pushed to `origin/main`; the intended production URL is
`https://ajocc-laptime-viewer.vercel.app/`.

The repository has `origin/main` configured. No deployment configuration was
changed in UX3-7; production promotion is expected to follow the repository's
normal main-push workflow.

Vercel reports deployment `dpl_HJB4ASjKa2Ykb7PDJq61xdFwawW2` as `READY`,
target `production`, with the same commit SHA, and the alias
`ajocc-laptime-viewer.vercel.app` mapped to it. Production smoke covered page
load, race/results, explicit rider deep link, metric switching, comparison
add/remove, lap detail and Results disclosures, URL state, and reload. The
fresh no-query first-rider behavior was also confirmed on the deployment URL;
the connected browser's cached alias session opened the browse state until an
explicit rider deep link was used, so that cache variance is recorded rather
than treated as completed fresh-entry evidence on the alias.

The pre-existing user-owned modification in
`docs/feedback/feedback-production-activation-report.md` and the pre-existing
UX3-2/UX3-3 untracked field-test records are explicitly outside UX3-7. They
will remain untouched and unstaged; the UX3-7 commit will contain only the
intended remediation, validation, design, plan, audit, and UX3-7 report files.

## 19. Post-Release Human Validation

External Human pre-release validation: **NOT EXECUTED — PARTICIPANTS
UNAVAILABLE**.

Release blocking: **NO**.

Post-release Human validation: **REQUIRED / CONTINUES**. UX3-8 should collect
actual-user feedback, reproduce production usability problems, and prioritize
real reports and regressions over additional unbounded synthetic review.

## 20. Final Verdict

Final verdict:

```text
UX3-7:
RELEASED — POST-RELEASE HUMAN VALIDATION CONTINUES
```

Reason: the former S2 chart-marker issue is implemented, automated/browser
validation is green, reviewer returned PASS, and the pushed Production
deployment is READY. External Human participant availability is not a blocker,
and Human validation is not claimed complete.
