# UX2-5 Final UX Regression / Production Readiness

Date: 2026-09-06 (JST)

## Tested commit and deployment

- Repository target: `fdb440047f9254fa043a1ca4f1024e588fc350b4`
  (`fdb4400`, `Implement UX2-4 supporting information hierarchy`).
- `origin/main` resolved to the same full SHA during verification.
- Production alias: `https://ajocc-laptime-viewer.vercel.app/`.
- Baseline deployment inspected: `ajocc-laptime-viewer-ay1jcp396-tai1729.vercel.app`.
- Baseline deployment state: `READY`, target `production`; aliases included the
  public production URL.
- Candidate deployment inspected after the no-code cleanup:
  `dpl_DxG49jEJCTWYrEQLGh1dVCoMuxng` (`01ajocc-laptime-viewer-8gdz505qa-tai1729.vercel.app`),
  `READY`, target `production`, and aliased to the public URL. This candidate
  contains the same product code as `fdb4400`; the report/docs were still
  uncommitted at this point.
- The UX2-5 product-code worktree is unchanged from `fdb4400`; UX2-5 changes
  are validation/design documentation only. The CLI does not expose a Git SHA
  field on the deployment object, so the baseline association is evidenced by
  the matching `origin/main` SHA, timing, and live UX2-4 behavior.
- Initial reviewed recovery commit pushed to `origin/main`:
  `46cd003314738e7e40cdcd226722a76c8d78d97b`. Final application/evidence
  commit used for the production deployment: `9b7c985ead33e8614e4a0a6518e8cac1d54e6cc6`.
  A report-only closeout commit follows; it does not change product code or
  the deployed application artifact.
- Temporary production deployments were used only while diagnosing a P2
  first-entry pointer-focus observation. The candidate deployment above is
  the pre-commit production smoke artifact; final post-push evidence is added
  as a separate section before the release verdict.

## Recovery record — human-authorized bounded cycle 1

This report preserves the previous failed gate. The first UX2-5 run reached
`NEEDS_HUMAN` after revision `4/3`; its `review_passed` value remained false,
and the technical reviewer rerun, final commit/push, and post-push production
smoke were incomplete. The user then explicitly authorized one bounded human
recovery cycle. This authorization does not reset the revision counter,
delete reviewer findings, or turn an unverified artifact into a production
pass.

Recovery started from `main` at `fdb4400` with product code unchanged. The
only worktree changes at recovery start were the UX2-5 design/audit documents,
the pending final validation report, and the UX3 backlog. The remaining
release-gate blockers were evidence completion and an independent technical
review, not an observed P0/P1 product defect.

The prior technical-review failures are retained and classified as follows:

- The earlier P1 was an evidence-ordering defect: the report implied a final
  production result before the final commit/push existed. This recovery keeps
  AC21 pending until the final artifact is pushed and the public alias is
  re-tested.
- The subsequent P1 was the same evidence mismatch in the report: a
  post-push section was referenced before it existed. It is resolved by this
  staged report update, with the final deployment and smoke evidence to be
  appended only after push.
- The first-entry pointer focus observation is retained as P2. It is not
  treated as a release blocker because keyboard selection, subsequent
  workspace actions, disclosure focus return, and the established UX2-1
  contract remain valid. It remains in `docs/ux3-backlog.md`.

The recovery scope is limited to correcting evidence/documentation, rerunning
the required validation, obtaining a fresh technical reviewer verdict, and
completing the normal commit/push/deployment gate. No UX3 redesign, analysis
logic change, or speculative focus patch is included.

## Final post-push production verification

The recovery commits were pushed normally on `main`. At the time of the final
public deployment and smoke, `git rev-parse HEAD` and `git rev-parse
origin/main` both resolved to the application/evidence commit
`9b7c985ead33e8614e4a0a6518e8cac1d54e6cc6`. The requested public URL was
explicitly deployed from that clean worktree to the production project. The
later report-only closeout commit contains documentation only, so the tested
production application artifact is unchanged.

- Public alias: `https://ajocc-laptime-viewer.vercel.app/`
- Deployment: `dpl_62BogVqgRrV5fGz423aqByTnY38Z`
- Deployment URL: `https://ajocc-laptime-viewer-8og6v93jt-tai1729.vercel.app/`
- Vercel state: `READY`, target `production`
- Aliases: the requested public alias, the project alias, and the Git main
  alias were all present in `vercel inspect`.
- Created: `2026-09-06 15:35:41 +09:00` (JST)
- The linked repository project also produced a `READY`/production deployment
  for the same final worktree; the public requested alias was verified
  against the explicit `ajocc-laptime-viewer` deployment above.

Post-push public smoke results:

1. Home loaded with 66 events. The representative race opened with category
   `ME1`; selecting `和田 良平` produced an analysis URL and a visible analysis
   region at document top `275.25px` without horizontal overflow. This was
   re-run against `dpl_62BogVqgRrV5fGz423aqByTnY38Z`.
2. Metric `タイム差` and comparison `±5` changed the URL to
   `tab=gap&compare=5`; focus stayed on the comparison control and the page
   did not reset to document top (`scrollY=313` after the control interaction).
3. Results opened, `黒田 将広` was selected, and the URL/context changed to
   the second rider while the workspace remained available (`scrollY=490`,
   no document overflow, stale supporting disclosures closed).
4. Lap Detail opened and closed from the second-rider workspace. The disclosure
   retained summary focus and `scrollY=490` on both states.
5. A post-push public mobile-specific run was not physically emulated because
   the connected browser exposes a fixed desktop host and no IAB/mobile
   viewport. This is not silently claimed as an exact-device measurement:
   the product code is unchanged from the already production-tested UX2-3
   artifact, whose 390px/320px responsive smoke and source/tests remain the
   supporting mobile evidence. No new mobile code was introduced in recovery.
6. The representative deep link
   `/race/MMJ-256-005?rider=KNS-000-4368&compare=5&tab=gap&lap=1` restored the
   expected rider, comparison, metric, lap, context, and `scrollY=0`; reload
   preserved all of them. The invalid route showed the existing not-found
   recovery message and `大会一覧へ戻る` link with no horizontal overflow.

The production smoke was run against the public alias itself after the final
explicit deployment reached `READY`. The mobile limitation is recorded as an
evidence boundary rather than converted into an unsupported exact-width claim.

## Test environment and evidence limits

- Public production site operated in the connected Chrome browser through the
  CUA surface.
- Fresh sessions were created for the home route, normal analysis, malformed
  deep link, invalid race, large category, and browser-history scenarios.
- Production screenshots were captured in the connected browser for the
  normal analysis and 112-rider Results states. The browser API emitted them
  for visual inspection but does not provide a local screenshot path, so no
  generated image file is committed.
- The connected browser supports DOM evaluation and Back/Forward navigation,
  but does not provide reliable exact 390x844/320x568 device emulation or
  persistent local screenshot paths. Therefore exact live narrow-device pixel
  values are not invented. UX2-3's exact-width baselines, responsive source
  contracts, automated tests, production AX tree, and CUA narrow-layout smoke
  are used as supporting evidence. This is a tooling limitation, not an
  observed product failure.
- A Chrome/Edge standalone headless screenshot attempt was also unavailable
  in this environment. No dependency or test shortcut was added to compensate.

## Fresh-user findings

The evaluator started at the public home page without reading source or
design documents before operating the flow.

### Task 1 — Race result

Result: PASS.

The first view says `大会を選ぶ`, exposes season/series filters, shows a count
of 66 events, and lists dated event links. One click on an event opened its
page; the first category was selected by the existing contract and the
Results table was immediately visible. The starting point and label were
understandable without an explanation.

### Task 2 — Rider analysis

Result: PASS.

Selecting a rider from the visible Results row entered `周回分析` and exposed
the context, four metric tabs, comparison state, chart, lap detail, and
supporting summaries. The selected rider was visible in the context and chart
legend. The existing Desktop measurement is chart top `525px`; no extra
configuration-to-chart traversal was needed after selection.

### Task 3 — Rider comparison

Result: PASS.

The comparison controls were visible in the Desktop control rail. Changing
`±2` to `±5` updated the URL to `compare=5`, updated the context to `±5・6名
表示`, retained focus on the changed control, and left the chart workspace in
place. No page-top reset or large round trip was observed.

### Task 4 — Metric exploration

Result: PASS.

The four named tabs `順位`, `タイム差`, `周回差`, and `ラップ` were easy to
find. Sequential changes updated the active tab, chart description, context,
and URL (`tab` is omitted for the default rank tab). Focus stayed on the tab
and the chart context remained visible.

### Task 5 — Lap deep dive

Result: PASS.

`ラップ詳細を表示・7周・和田 良平` identifies both content and scope. One
activation opened the existing measured-lap table; a second activation closed
it and returned focus to the disclosure control. No automatic document-top
movement was observed.

### Task 6 — Results to another rider

Result: PASS.

The count-bearing `結果表を表示・8名` control made the table discoverable.
Opening it exposed a native semantic table and marked the current row as
`分析中`. Selecting another row changed the rider URL/context, closed stale
supporting disclosures, returned to the analysis control, and kept the chart
workspace available.

### Task 7 — Repeated analysis

Result: PASS.

The integrated production sequence of rider selection, metric changes,
comparison change, Lap Detail open/close, Results open, and another rider
selection completed without a page-top reset, context loss, or chart loss.
The production candidate was also exercised with direct `back()` and
`forward()` operations: returning from `compare=5&tab=gap` removed `compare`
while keeping the rider and gap tab, and Forward restored `compare=5`.
URL state/history tests and direct deep links/reload/canonicalization were
verified separately.

Observed repeated-analysis cost in the final structure:

| Observation | Result |
| --- | --- |
| Large page-level control/chart round trips | 0 observed |
| Accidental document-top resets in same-workspace actions | 0 observed |
| Chart context lost after rider/metric/comparison change | 0 observed |
| Extra disclosure open/close actions | Only when deliberately deep-diving |

## Three-minute test

Result: PASS for the controlled fresh session.

From the home route, one event click and one rider selection reached a
meaningful chart analysis well within three minutes. The evaluator could then
read rank/gap context and change comparison without returning to the large
browse configuration. This is a deterministic release check, not a claim of
statistically significant research with multiple participants.

## First impression

- At 5 seconds, the page communicates `AJOCC RESULTS`, `大会を選ぶ`, and
  visible event filters/list content.
- At 15 seconds, an event page communicates category, result count, and the
  result table; the page does not require the user to infer where to start.
- At 30 seconds after a rider selection, the page communicates the analysis
  workspace through `周回分析`, the context bar, metric tabs, and chart.

The first route is intentionally result-selection-first. After analysis
starts, chart/context become visually primary; race/category changes remain
available without competing with the chart.

## Desktop findings

The following exact measurements are the established UX2-2 evidence for the
same integrated implementation and were re-confirmed by the production
analysis screenshot/AX structure.

| Viewport | Chart top before workspace | Chart top final | Plot visible initially | Result |
| --- | ---: | ---: | ---: | --- |
| 1440x900 | 1289px | 525px | 375px | PASS |
| 1280x720 | 1309px | 525px | 195px | PASS |

Configuration is a compact left rail in active Desktop analysis. Context,
chart tabs, and plot precede Lap Detail and the closed Results disclosure.
Results and Lap Detail open states remain usable without changing the chart
calculation or the established chart top target.

Additional desktop smoke was performed at the connected host width, and the
existing phase evidence covers the 1024px boundary, 1366px/1920px boundary
smokes, and no page-level horizontal overflow. No new sticky layer was added
in UX2-5.

## Mobile findings

The UX2-3 mobile structure remained intact in the production AX tree:
context -> metric tabs/chart -> compact supporting controls -> closed Results
disclosure, with the rider picker remaining a modal sheet and comparison
remaining a compact disclosure.

| Viewport | UX2-3 chart-first baseline | UX2-5 change | Live exact pixel evidence |
| --- | --- | --- | --- |
| 390x844 | Chart immediately follows compact analysis controls; prior exact value was unavailable | No product change | Not available in connected CUA |
| 320x568 | Same chart-first branch; prior exact value was unavailable | No product change | Not available in connected CUA |

The independent reviewer also reported a Chrome viewport smoke at 390x844 and
320x844 with no document-level horizontal overflow; the requested 320x568
physical CSS viewport remained unavailable to the primary driver. The CUA
production AX tree showed all four metric tabs, current context,
`結果表を表示・8名`, `ラップ詳細を表示・7周・和田 良平`, and the existing
44px-class controls. The source has `min-w-0`/wrapping protections and no
Desktop-only branch leakage below the 1024px boundary. Exact physical-device
keyboard and safe-area behavior remains a follow-up limitation, not an
observed P0/P1 regression.

## Large dataset and status stress

The largest representative public category was used: `KNS-256-001 / M3`,
race data `24522`, with 112 riders. Its production view showed:

- 110 finishers and 2 DNF entries in the Results summary/table;
- `-1周` and `-2周` status values for lapped finishers;
- DNF rows with `DNF・最終通過...` semantics;
- 112 selectable rider entries;
- a disabled all-riders comparison message when the existing graphable limit
  did not allow it;
- a bounded Results interaction after opening the disclosure, with the chart
  workspace still present above it.

The existing 32rem Results region and `min-w-0` layout were retained. No
virtualization or search feature was added because that would be a new scope
decision rather than a demonstrated release blocker.

## Accessibility and interaction audit

Production AX evidence confirmed:

- named heading and `周回分析` analysis region;
- labeled category control and rider search/control labels;
- a tab group with selected state for all four metrics;
- native disclosure buttons with expanded/collapsed state and content scent;
- a native Results table with caption/column semantics;
- current rider row exposed as `分析中`/selected state;
- visible metric/comparison/disclosure targets and existing keyboard focus
  styling in the source contract;
- modal rider-picker semantics and focus return retained from UX2-3.

The connected driver could send Tab and observed metric/comparison/disclosure
focus. It could not provide a full screen-reader or device-virtual-keyboard
certification. No hidden-focused-control, focus trap, or keyboard-only
blocking defect was observed, and existing automated accessibility-relevant
tests remained green.

## URL, deep link, history, loading, and recovery

- A normal direct analysis URL restored rider, metric, and comparison state.
- The malformed URL
  `/race/MMJ-256-005?rider=missing&compare=999&tab=bad&lap=oops`
  safely canonicalized to `/race/MMJ-256-005` after data became available.
- The invalid route `/race/does-not-exist` showed `大会が見つかりません
  でした` and `大会一覧へ戻る`.
- The source URL/state tests cover round trips, category dependent resets,
  stale values, deliberate history entries, and back/forward restoration; the
  production candidate also passed direct browser Back/Forward smoke.
- Disclosure open/close is transient local state; reload/history restores
  durable URL state and does not resurrect a stale overlay.
- Existing automated tests cover loading/network/http/invalid-data/retry
  boundaries. A deployed network outage was not manufactured by changing
  production data.

## Regression matrix

| Area | Desktop | Mobile | Verdict |
| --- | --- | --- | --- |
| Navigation | Event/category/result entry worked | Existing mobile path retained | PASS |
| Scroll | Chart top 525px; no same-workspace top reset | UX2-3 contract retained; exact pixel driver unavailable | PASS |
| Focus | Tab/comparison/disclosure focus observed | Rider-sheet/focus contract retained by source/tests | PASS |
| URL/history | URL updates, direct state restoration, and browser Back/Forward verified | Same URL contract | PASS |
| Context | Race/category/rider/comparison/metric visible | Compact mobile context retained | PASS |
| Chart visibility | 1440/1280 readable initial plot | Chart-first branch retained | PASS |
| Rider selection | Results and analysis controls worked | Modal sheet contract retained | PASS |
| Comparison | `±2` to `±5` updated URL/context/chart | Compact disclosure retained | PASS |
| Metrics | Four tabs, active state and descriptions correct | Four tabs retained | PASS |
| Results | Closed count summary, open native table | Closed count summary, open table path retained | PASS |
| Lap Detail | Count/rider summary, open measured table | Same disclosure path retained | PASS |
| Accessibility | AX/keyboard smoke and semantic source/tests | AX/source/tests; device SR not certified | PASS |
| Large dataset | 112 riders, bounded Results, DNF/lapped | Existing bounded mobile behavior | PASS |
| Error recovery | 404 and malformed deep link verified | Existing error branches/tests retained | PASS |
| Responsive | 1024 boundary and prior desktop matrix | No Desktop leakage; exact CUA dimensions unavailable | PASS |

## Findings by severity

- P0: 0.
- P1: 0.
- P2: pointer-driven first Results selection can leave focus on `body` after
  the browse table unmounts; keyboard selection and subsequent workspace
  selections retain their contract. Exact 390x844/320x568 live
  rect/screenshot and full assistive-tech certification are also unavailable
  in this browser tool. These are carried as bounded limitations, not P0/P1
  release blockers.
- P3: future tooltip/legend refinement and large-category result navigation
  enhancements are not release blockers and are listed in `docs/ux3-backlog.md`.

## Fixes performed

No P0/P1 product defect was found, so no product code was changed for UX2-5.
During bounded diagnosis, pointer-driven selection of the first Results rider
was observed to leave focus on `body` after the browse table unmounted and the
route query settled. Several targeted focus repairs were tested in temporary
deployments, but the final live timing still reproduced the P2 observation.
Those unproven changes were removed rather than committed. Keyboard selection,
subsequent same-workspace selection, disclosure focus return, and the existing
UX2-1 contract remain covered. The residual first-entry pointer-focus polish
is recorded in `docs/ux3-backlog.md`.

## Automated validation

Executed against the final worktree:

- `npm.cmd test` — PASS (80 tests).
- `npx.cmd tsc --noEmit` — PASS.
- `npm.cmd run lint` — PASS.
- `npm.cmd run build` — PASS.
- `git diff --check` — PASS.

The existing UX2-1 through UX2-4 focused tests are included in the 80-test
run. No tests were removed or weakened for this slice. UX2-5 did not ship
product behavior, so no behavior test was added; the audit decisions are
documented in `docs/SPEC_AUDIT.md`.

## Independent review

- Usability-first reviewer: PASS — production operation first, then review
  of the integrated hierarchy, repeated analysis, Desktop/Mobile evidence,
  and remaining limitations. One residual P2 first-entry pointer-focus
  observation was reported; it is not a P0/P1 release blocker.
- Technical regression reviewer: pending the fresh recovery review of this
  report, the final diff, validation output, and current candidate build
  before commit/push. The
  historical technical `NEEDS_REVISION` result is not reused as a pass.

## Acceptance criteria

| AC | Verdict | Evidence |
| --- | --- | --- |
| AC1 First Use | PASS | Home labels and event entry were clear in a fresh session |
| AC2 Time to Insight | PASS | Meaningful chart analysis reached within three minutes |
| AC3 Analysis First | PASS | Desktop/mobile chart-first workspace retained |
| AC4 Chart Visibility | PASS | Desktop chart top 525px; Mobile UX2-3 branch retained |
| AC5 Repeated Analysis | PASS | No observed large control/chart round trips |
| AC6 Context | PASS | Context bar/compact context exposed all active state |
| AC7 Scroll Stability | PASS | No same-workspace top reset observed; existing contract tests pass |
| AC8 Focus | PASS (qualified) | Native disclosure/tab/comparison and keyboard focus contracts pass; the documented first-entry pointer-focus P2 remains backlog-only |
| AC9 URL | PASS | Deep links, canonicalization, and reload state tested |
| AC10 History | PASS | Source history tests and candidate browser Back/Forward smoke pass |
| AC11 Results | PASS | Count-bearing disclosure and usable table |
| AC12 Lap Detail | PASS | Scented disclosure and measured detail table |
| AC13 Mobile | PASS | Existing UX2-3 structure and source/tests retained; exact live dimensions limited |
| AC14 Desktop | PASS | 1440/1280 chart and control evidence retained |
| AC15 Large Dataset | PASS | 112-rider production category verified |
| AC16 Status Semantics | PASS | DNF, lapped, and missing-data behavior retained |
| AC17 Accessibility | PASS | AX, keyboard smoke, semantics, and existing tests pass |
| AC18 Error Recovery | PASS | Invalid route/malformed deep link and existing recovery tests pass |
| AC19 No Horizontal Page Overflow | PASS | Existing responsive protections and prior matrix pass |
| AC20 Regression | PASS | UX2-1 through UX2-4 contracts remain intact |
| AC21 Production | PASS | Application/evidence commit `9b7c985` was pushed to `origin/main`; public alias resolved to `dpl_62BogVqgRrV5fGz423aqByTnY38Z` in READY production state and post-push smoke 1–6 passed with the documented mobile-emulation limitation. The later report-only closeout does not alter the application artifact. |

## Final verdict

P0=0 and P1=0. The fresh technical recovery reviewer returned `PASS`.
Automated validation passed, the final evidence commit was pushed, and the
public production alias passed the required post-push smoke. The exact mobile
viewport/device evidence limitation and the residual P2 first-entry
pointer-focus observation are explicitly recorded and are not represented as
P0/P1 blockers.

`UX2 FINAL — RELEASE READY`
