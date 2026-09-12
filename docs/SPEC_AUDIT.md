# Specification Audit

## UX3-5 specification audit — in progress

Current Change: UX3-5 Limited Scope Implementation

This audit covers only the UX3-5 implementation of MR-01, MR-02, and MR-03
from `docs/user-testing/ux3-4-multi-reviewer-synthesis.md`. It must verify the
exact source evidence, intended UI boundary, semantic-preservation rules,
responsive constraints, regression protection for POS-01 through POS-05, and
the automated/browser validation gate before implementation begins.

Required audit questions:

1. Does the MR-01 series-key/color/tooltip approach improve line-name mapping
   without changing rider ordering, comparison mode, or chart data?
2. Does the MR-02 copy clearly distinguish chart `周回差` (single-lap time
   difference) from result-table `-1周` without changing calculations or
   official semantics?
3. Does the MR-03 guide state the correct direction/sign for rank, cumulative
   gap, single-lap difference, and lap time without changing step/linear chart
   rendering?
4. Are the proposed changes limited to MR-01–03, and are MR-04–12 explicitly
   deferred?
5. Are 320px-class/390px mobile checks regression-only, with no claim that
   Mobile human/synthetic triangulation is complete?
6. Do tests and browser checks cover POS-01–POS-05, URL state, disclosures,
   rider selection, comparison, metrics, lap selection, reload, and
   back/forward without requiring a new dependency or new review participant?

Audit status: IN PROGRESS

## UX3-5 specification audit — resolutions

The two independent auditors raised ambiguities about color assignment,
crowded-mode scope, tooltip size, exact Japanese copy, sign reference, POS
coverage, and browser pass conditions. The Commander resolves them as follows:

1. Crowded means the existing code condition `isAllMode ||
   comparisonRiders.length > 8`. The series key lists unique displayed
   `comparisonRiders` exactly once in supplied order, including the primary,
   with the existing role labels `注目選手`, `固定比較`, and `参考選手`.
2. Context colors use a separate eight-color categorical palette and are
   assigned by current displayed order. This is deterministic across rerenders
   and metric tabs, cycles after palette exhaustion, and is not a persistent
   rider-identity color contract when the comparison set changes.
3. Gap/Pace retain the primary as the zero reference but do not add a primary
   numeric payload. The static key includes the primary; tooltips list only
   valid numeric payload entries. Crowded non-`all` tooltips show individual
   context names for at most twelve displayed riders. `all` and larger views
   retain aggregate context ranges to prevent large-data tooltip overflow.
4. The guide is active-tab-specific and always visible in the chart card. Rank
   uses smaller numeric rank = better and visually higher; gap and pace are
   relative to the selected rider, with positive = comparison rider slower/
   behind and negative = faster/ahead; pace explicitly says single-lap time
   difference and distinguishes result `-1周`; lap uses smaller time = faster
   and visually lower. No signed semantics are added to absolute metrics.
5. Browser checks require no document horizontal overflow, a complete and
   unclipped wrapping key with one name/role per displayed rider, all four
   guide strings, and preservation of existing result/selection/comparison/
   metric/lap/disclosure/reload/back-forward behavior. Tooltip name inspection
   is bounded to the non-`all` twelve-rider case. Exact mobile checks are run
   when the browser tool supports the requested viewport; any tooling limit is
   recorded without claiming Mobile triangulation is complete.
6. POS-01–POS-05 are protected by the existing automated behavior tests and
   browser flow, plus explicit source checks that preserve `stepAfter`,
   `linear`, `connectNulls={false}`, sparse values, URL keys, and disclosure
   branches. No new dependency, participant, review, or deferred finding is
   introduced.

Audit status: RESOLVED

## UX3-5 re-audit resolutions (2026-09-10)

Two independent `spec_auditor` reviews completed. Both identified the same
implementation-significant boundaries: the existing UX3-7R dirty worktree
overlaps UX3-5 components, all-mode has an intentional aggregate safety rule,
the 320px guide must remain visibly available, and the current disclosure/layout
changes belong to UX3-7R rather than this task.

Resolutions:

1. UX3-5 attribution is anchored to committed `eee5570`; `79cf29f` is the
   UX3-4 synthesis baseline and `475485f` is the current HEAD. Existing dirty
   UX3-7R changes remain user-owned, are not reverted or staged, and are
   reported separately. Only a direct MR-01–03 regression in an overlapping
   file may receive a minimal hunk in this task.
2. The static series key is complete for unique displayed riders in ordinary
   and bounded crowded views. The pre-existing `all`/large aggregate context
   item is permitted by the UX3-4 safety boundary; it must show an explicit
   context count, while primary/fixed entries retain individual names. Tooltip
   detail is individual only for non-`all` crowded views with at most twelve
   raw displayed riders; `all`/larger views retain aggregate summaries.
3. Crowded and tooltip thresholds use raw `comparisonRiders.length`. The key
   deduplicates rider IDs in supplied order and the style helper keeps its
   first-entry behavior. No primary rider is synthesized for stale inconsistent
   state; existing URL normalization/comparison-state contracts are relied on.
4. The active tab's reading guide must be visible at the point of use, including
   320px-class regression checks. It may wrap and its text remains the
   accessible description. Inactive tab content may be unmounted; switching to
   each tab must expose that tab's guide. This does not require four guides to
   remain mounted together.
5. UX3-7R's dirty `<details>` chart-detail and macro layout changes are not
   UX3-5 implementation work. They must not be attributed to the UX3-5 commit,
   and no UX3-5 report may claim that the external-human or Mobile evidence gap
   was closed. Disclosure behavior is still included in the regression flow;
   any failure caused solely by the dirty UX3-7R change is recorded as a
   separate blocker rather than silently repaired here.
6. POS-01–POS-05 use observable regression checks: readable result names/
   statuses and top gap; chart-first rank/lap availability; unchanged
   meet/category/result navigation; four-tab operation; and preserved
   comparison count, fixed selection, and selected-rider emphasis. URL/state,
   numeric formulas, chart line semantics, lap/disclosure state, and error
   branches remain compatibility checks.
7. Mobile viewport checks are technical regression evidence only. Lack of exact
   viewport control is recorded as unavailable and never converted into a
   Mobile human/synthetic triangulation or External Human completion claim.

Status: CLEAR

## UX3-7 consolidated remediation audit (2026-09-09)

The current phase is authorized to change product code. The authoritative
evidence files are:

- `docs/user-testing/ux3-2-participant-post-test-qa-P-A-01.md`
- `docs/user-testing/ux3-2-synthetic-astra-profile-c-01.md`
- `docs/user-testing/ux3-2-synthetic-sol-profile-c-01.md`
- `docs/user-testing/ux3-2-synthetic-terra-profile-c-01.md`
- `docs/user-testing/ux3-4-multi-reviewer-synthesis.md`
- `docs/user-testing/ux3-5-limited-scope-implementation.md`
- `docs/user-testing/ux3-6-post-implementation-regression-review.md`

Two independent specification auditors must check the following before code
implementation starts:

1. Whether auto-selecting the first graphable result rider on a race URL with
   no rider query is compatible with the existing URL/history contract and
   category reset behavior.
2. Whether the chart key, context summary, rider controls, and selected-lap
   copy solve the corroborated identity/discoverability findings without
   duplicating information or reducing 320px/390px usability.
3. Whether chart height and order changes preserve the chart-first acceptance
   targets, disclosure semantics, keyboard focus, sparse data, DNF/lapped
   meaning, and POS/MR regression protections.
4. Whether each MR-04–MR-12 decision is based on evidence or a concrete
   technical/UX reason, with no “wait for External Human” reason used as the
   sole implementation blocker.
5. Whether the report can truthfully distinguish Owner Human evidence,
   synthetic evidence, automated/browser evidence, and post-release human
   validation without claiming Human validation complete.

### Resolved decisions

- The default rider is selected only after race data and normalized category
  state load when the raw query has no `rider` key. The first candidate is the
  existing displayed result order (numeric `finalPosition`, stable ties), with
  `dataQuality === "ok"` and at least one valid checkpoint. DNF/lapped riders
  are eligible when graphable. `updateRaceUrlQuery` and
  `router.replace({ scroll: false })` preserve all query keys and history; no
  focus transfer is introduced. Explicit valid, stale, and non-graphable
  rider queries remain under existing normalization/unavailable behavior.
- The shared chart key is rendered once for every active metric and replaces
  duplicate Recharts legends. It contains role/name text and deterministic
  per-rider line-style/weight markers, so color is supplementary. The chart
  series dots consume the same marker contract as the key. “Distinct” means
  independently unique dash patterns and marker shapes within each role, not
  merely unique pairs. Fixed styles provide four assignments in first-seen
  active fixed-rider order; numeric context styles provide ten assignments in
  displayed rider order after primary/fixed classification. These cover the
  existing comparison limits without cycling; the current all-mode limit remains
  unchanged. Normal and active dots, including crowded mode, render the
  assigned marker, with a smaller context marker in crowded mode. The key uses
  the same mapping and dash values and an SVG marker glyph. The primary rider
  keeps its dedicated solid circle style and does not consume fixed or context
  assignment capacity.
- The context summary shows “注目選手”, comparison mode/count, and comparison
  names (all pinned names, or up to four names plus `ほかN名`). Existing
  selection, fixed-rider, all-mode, and 44px target mechanics remain.
- The selected-lap copy is placed immediately before the existing detail panel:
  `グラフの点をクリックするか、周回セレクターで周回を固定すると、各選手の値を確認できます。ホバーは一時表示です。`
  Measured rows, URL state, hover behavior, and difference semantics are not
  changed.
- The bounded chart frame is `h-72 sm:h-[22rem] lg:h-[30rem]` for all four
  charts and the no-comparison frame. It improves P-A-01 visibility without
  fixed widths, sticky layers, or a broad layout rewrite.
- MR-08, MR-09, MR-11, and MR-12 remain deferred for respectively conflicting
  history evidence/contract risk, uncorroborated feature scope, non-defect
  evidence gap, and sticky/navigation regression risk. MR-10 is merged into
  the existing MR-02 explanation and does not change definitions.
- External Human pre-release validation is recorded as not executed and is not
  a release gate. Post-release human observation is required.

## UX3-7R Specification Audit Resolutions

1. Owner Human P-A-01 is the primary acceptance source. Synthetic reviews may
   corroborate or identify additional low-risk issues, but they cannot cancel
   an Owner finding that remains visible in the screen.
2. The old UX3-7 report and verdict are immutable history. UX3-7R records the
   effectiveness rejection and audits the old implementation rather than
   rewriting it.
3. A P-A-01 negative/improvement answer is tracked as an individual detailed
   record even when several records share one root cause. The acceptance words
   are exactly `CLEARLY CHANGED`, `PARTIALLY CHANGED`, and `NO MATERIAL CHANGE`;
   only `CLEARLY CHANGED` can pass.
4. The approved redesign is a targeted analysis-page restructuring: compact
   race context, an identity/control deck, a full-width primary chart, and
   supporting summary/detail/results below. It is not an application-wide
   rewrite and does not change data or URL contracts.
5. Results remain the authoritative rider-selection table. A prominent
   Results action may be repositioned or restyled, but result rows, selection,
   disclosure semantics, history, deep links, and reload behavior remain.
6. Exact viewport evidence is required at 1440x900, 1280x720, 390x844, and
   320x568. Playwright or an equivalent Chromium context is an approved
   temporary verification tool; it must not become a production dependency.
7. Production-before screenshots may use the current released alias at the
   same race/category/rider/metric/comparison state. After screenshots must
   use the resulting implementation and the same state. All images are
   visually inspected, not accepted by DOM inspection alone.
8. No External Human participant is required for the implementation gate.
   P-A-01 is existing Owner Human evidence; external validation remains a
   post-release continuation and is never claimed complete.

STATUS: CLEAR

## DATA-1 Three-Season Historical Data Expansion — resolved (2026-09-12)

The current change is a cross-repository data-expansion task. The authoritative
design is the DATA-1 section in `docs/DESIGN.md`; this section records auditor
questions and their resolutions before implementation.

Known facts recorded before audit:

- Official source: `https://data.cyclocross.jp/meet` and its race pages.
- Existing collector: sibling repository `02_ajocc-data-collector`, which
  generates `meets.json`, `races.json`, and `data/race-*.json`.
- Viewer baseline: one season (`2025-26`), 66 events, 1,192 category races.
- Target labels exposed by the official selector: `2023-24`, `2024-25`,
  `2025-26`; numeric selector values are acquisition parameters, not viewer
  season IDs.
- Existing dirty collector changes for `--season` and `--meet` are user-owned
  and must be preserved.

### Auditor resolutions

Two independent `spec_auditor` runs identified the same season-resolution,
idempotency, result-only, artifact-schema, status, stable-identity,
failure-gating, fallback, and dirty-work protection risks. They are resolved in
the DATA-1 specification resolutions in `docs/DESIGN.md` and the bounded task
graph in `docs/IMPLEMENTATION_PLAN.md`:

- Official season labels are canonical; selector option values are discovered
  dynamically and explicit mismatches fail.
- Historical reruns skip valid outputs unless `--force` is supplied.
- Result-only races retain valid result rows with empty laps and no inferred
  axis; analysis remains unavailable through existing behavior.
- The existing `finished | dnf` contract is preserved. DNS/DSQ/OTL/unknown
  source rows are excluded rather than misclassified and are counted in the
  inventory diagnostics.
- `inventory.json` and `rider-index.json` are deterministic, versioned,
  collector-owned release artifacts and are staged with race data.
- Missing source rider links receive deterministic race-scoped IDs; names are
  not primary keys.
- Required collection failures make the release command fail while preserving
  successful local outputs for resumable reruns.
- Collector push and raw-source verification precede the viewer push, Vercel
  deployment, and production smoke checks.
- The current dirty collector files are preserved and their task-relevant
  behavior is extended without resetting or deleting user work.

STATUS: CLEAR

## UX3-7R3 final audit closure

The earlier UX3-7R3 draft and the two auditor reports are superseded by the
resolutions recorded in the active UX3-7R3 section of `docs/DESIGN.md`. The
16-row traceability matrix, exact lap metadata validation, collector ownership,
official sequences, zero-gap visibility rule, shared Disclosure ownership,
functional-flow definition, S-level definitions, and final-Production evidence
sequence are now explicit. Implementation is authorized and must keep all
unrelated dirty changes unstaged.

STATUS: CLEAR

## UX3-7R3 final audit closure

The earlier UX3-7R3 draft and the two auditor reports are superseded by the
resolutions recorded in the active UX3-7R3 section of `docs/DESIGN.md`. The
16-row traceability matrix, exact lap metadata validation, collector ownership,
official sequences, zero-gap visibility rule, shared Disclosure ownership,
functional-flow definition, S-level definitions, and final-Production evidence
sequence are now explicit. Implementation is authorized and must keep all
unrelated dirty changes unstaged.

STATUS: CLEAR

## UX3-7R3 resolved audit (implementation authorized)

The two independent auditors returned overlapping questions. The following
resolutions are authoritative for UX3-7R3:

1. The user-provided request is the complete 16-item Owner issue list. The
   traceability matrix and per-ID observable acceptance criteria now live in
   the active UX3-7R3 section of `docs/DESIGN.md`; grouped fixes still require
   individual checks and report rows.
2. Season changes preserve the current series query. Canonicalization removes
   it only when the new season has no matching series. This intentionally
   supersedes the old clear-on-season behavior for B-01 and has a valid and an
   invalid-combination regression test.
3. `raceLapNumbers` is valid only when non-empty, finite, safe positive
   integers are strictly increasing in source order. Gaps and a start at lap 2
   are valid for backward-compatible upstream payloads. The current collector
   emits the complete 1..N sequence from official `距離・周回数` metadata;
   `StartLoop` is not an additional lap. Any malformed field falls back to the
   sorted union of valid measured checkpoints. An official lap with no measured
   rider checkpoint stays on the axis but remains missing in values/details.
4. The collector is the data producer and may be changed in its parser/types,
   parser tests, and only `race-27834.json`, `race-27770.json`, and
   `race-27160.json` for this task. Existing dirty collector workflow and
   collection-script changes are unrelated and must not be staged. The common
   B-02/B-03 root cause includes unsupported `H:MM:SS` result/lap times; the
   fix is generalized clock parsing plus official race-lap metadata (not raw
   table-column count), never a race-ID branch. The official cross-check axes
   are 27834 -> 1..11, 27770 -> 1..11, and 27160 -> 1..8.
5. B-04 requires the chart to receive the same authoritative lap axis used by
   its X axis. `buildGapSeries` therefore requires `lapNumbers` from its caller;
   `GapChart` passes the reconciled `raceLapNumbers` explicitly. This prevents
   the rendered Recharts payload from dropping the first measured P2 point
   even when the pure transform test passes. Separately, the transform must
   retain a finite numeric `0`, and GapChart must give a zero-baseline series
   an explicit readable style (opacity/stroke/marker) so it is not hidden by
   the reference line. The regression tests assert both contracts.
6. UI acceptance is per the 16-row matrix in DESIGN.md. Named screenshots may
   cover related rows, but each row also has a source, browser, or automated
   assertion. Data rows require live official pages when reachable and record
   the expected sequences 27834 -> 1..11, 27770 -> 1..11, and 27160 -> 1..8.
7. The shared Disclosure component owns markup, IDs, aria state, chevron,
   border, and summary interaction. Each caller owns only its content and any
   externally required open state; content remains mounted while collapsed.
   `useId` supplies unique panel IDs. Native summary keyboard behavior is
   preserved and the summary is at least 44px high.
8. S0--S4 use the existing UX3-2 definitions; this release records counts and
   requires S0/S1 zero. The complete functional flow is the exact flow listed
   in the Owner request, including filters, race/category/results/rider/search/
   comparison/metrics/laps/disclosures/reload/deep link/back/forward/error
   recovery. Production After evidence must use the final deployed pushed
   commit; current Production may be used only as contextual Before evidence.
9. The resumed audit uses one fresh independent reviewer pass for the
   implementation gate; three reviewer personas are not required by the
   active plan or Owner request. Exact local viewport and rendered-payload
   evidence is sufficient for that pre-release review, while final After
   screenshots and behavior must be repeated against the pushed Production
   deployment. B-04's explicit required `lapNumbers` contract plus the
   rendered local payload check is the implementation regression gate; its
   Production value remains a release-gate verification.

The audit is clear: implementation may start. The later B-04 render finding
was resolved as a bounded implementation revision: the authoritative axis is
now an explicit required input, and the local browser payload includes P2
lap 2. Any remaining Production verification is a release-gate result, not a
design ambiguity.

STATUS: CLEAR

## UX3-7R3 specification audit draft

The Owner Human's UX3-7R3 issue list is the primary source of truth and
requires all 16 IDs to finish PASS. `docs/inputs/` was checked recursively;
there are no eligible input documents to resolve against the standard docs.
This active audit is not clear until two independent auditors inspect the
new design/plan and relevant source, and any implementation-significant
questions are recorded and resolved below.

Current investigation points requiring auditor confirmation:

- D-01 is the home `RiderDiscovery` form whose current input/button layout uses
  `sm:items-end`; confirm the reported baseline issue and the exact desktop
  control row.
- D-04 applies to both the selected-lap ranking detail's `max-h-24` and the
  results table's internal max-height if either can clip owner-visible rows.
- B-02/B-03 require a collector contract update because the viewer currently
  receives no official total-lap metadata and the two raw target payloads end
  at lap 10 while official pages show 11; the viewer must remain backward
  compatible and must not add synthetic rider laps.
- B-04's current pure gap transform retains numeric zero, so review must
  confirm whether the failure is visual overlap/opacity or an upstream point
  omission and require a test at the exact target race semantics.

STATUS: IN_PROGRESS

## UX3-7R2 Final Owner Acceptance Closure — resolved audit (2026-09-10)

Two independent `spec_auditor` reviews returned questions. The Commander
resolved them as follows; these resolutions are authoritative for
implementation and supersede the earlier UX3-7R2 draft wording while leaving
all historical sections intact.

1. The eight individually tracked units are Q12 return context, Q69 return
   path, Q22 unknown-meet discovery, Q45 result-table search burden, Q68
   unknown-category discovery, Q27-A category affordance, Q27-B feedback
   affordance, and Q03 residual `stepAfter` meaning. Q03's initial chart clause
   and Q27-A remain matrix rows and require final evidence even though the
   existing redesign may already satisfy them.
2. `RaceHeader` is the only sticky layer. The existing list action and category
   selector move into its compact context rows. The list target preserves only
   valid season/series filters; a direct race link targets `/`; browser-back is
   not substituted for the explicit action; analysis query state is not copied.
   Existing category URL/history reset behavior is preserved. At 320px/390px,
   long labels wrap, metadata keeps its current narrow-screen hiding, controls
   are at least 44px, and focus/chart content cannot be covered.
3. Rider discovery is in scope without changing the collector contract. The
   home surface calls `GET /api/riders/search?q=...`. The route scans unique
   race IDs from `meets.json` through a pure injectable index builder, groups
   structurally valid rider records by `riderId`, and links only sources whose
   race ID/category match the meet metadata. It includes both data-quality
   states because the race route already owns the analysis-unavailable state.
4. The discovery contract is exact: normalized query length <2 is HTTP 400 with
   `query-too-short`; all-source failure is HTTP 503 with `source-unavailable`;
   a full scan is HTTP 200 `status: complete`; mixed failures or a 20-second
   budget stop are HTTP 200 `status: partial` with
   `warning: source-scan-incomplete`. The response is `Cache-Control: no-store`.
   Concurrency is 24, completed-index TTL is 10 minutes, result limit is 20,
   and appearance limit is six newest per rider. Partial indexes are not
   retained as complete entries. The client exposes idle, loading, complete,
   partial, empty, retryable, and fatal states.
5. Names and IDs use existing NFKC/whitespace/lowercase normalization; the
   threshold counts normalized Unicode code points. Grouping is strict by
   rider ID, with distinct IDs kept separate. Source order is meet date
   descending then category order. Race links include meet/category/rider and
   the existing season/series return context; the race route revalidates stale
   links.
6. Feedback is one labeled, non-sticky leading page utility action on both
   Desktop and Mobile. The fixed desktop corner and mobile-only footer variants
   are removed. The existing anonymous payload, context snapshot, privacy
   boundary, and return path remain; search text is not added to the payload.
7. `stepAfter`, sparse measured points, and `connectNulls={false}` remain
   authoritative. The visible and accessible rank explanation is exactly:
   `各周回終了時点の実測順位を階段状で示します。線の途中の順位を推定していません。`
   It is required on the rank tab when a chart is rendered.
8. The pre-existing dirty worktree is not reset. Only intended UX3-7 hunks,
   UX3-7R2 code/tests/docs/report/evidence are eligible for staging. The
   feedback activation history, `test-results`, and unrelated UX3-2 inputs are
   explicitly excluded unless a later diff proves direct necessity.
9. Release requires all automated checks, exact viewport evidence, full flow,
   MR/POS regressions, three fresh independent reviewer PASS results, a
   pushed commit, a READY Production deployment referencing that commit, and a
   Production smoke. External Human absence is not a release blocker.
10. The public `RiderDiscoveryMatch` shape is fixed as `riderId`, `name`,
    `dataQuality`, `totalAppearances`, and at most six newest `appearances`.
    Each appearance contains `meetId`, `meetName`, `meetDate`, `season`,
    `series`, `raceId`, `categoryId`, and `categoryName`. URLs are not returned
    by the API; the client constructs them with existing URL encoding rules.

STATUS: CLEAR

## UX3-7R2 Final Owner Acceptance Closure audit (2026-09-10)

The current task uses the following authoritative inputs and does not treat
the prior UX3-7R report as mutable: `docs/PRODUCT.md`, the active UX3-7R2
section of `docs/DESIGN.md`, the active UX3-7R2 section of
`docs/IMPLEMENTATION_PLAN.md`, `docs/user-testing/ux3-2-participant-post-test-qa-P-A-01.md`,
and `docs/user-testing/ux3-7r-owner-review-remediation-redo.md`.

The baseline identifies eight individual complaint units rather than guessing
new IDs: Q12 return context, Q69 return path, Q22 cross-event discovery, Q45
result-table search burden, Q68 category-unknown discovery, Q27's category
affordance complaint, Q27's feedback affordance complaint, and Q03's residual
step-chart meaning complaint. Q03's separate initial-graph complaint and Q27's
category affordance may remain already clearly changed only if final evidence
confirms the source dissatisfaction no longer materially applies; they must
still appear in the 38-unit matrix.

The sticky return solution is constrained to the existing `RaceHeader` layer,
so a second sticky toolbar, viewport-covering mobile header, or scroll-position
contract change is out of scope. The rider solution is a lazy home entry point
and a server Route Handler that scans the existing raw race files into a
warm-runtime TTL index; it does not invent an upstream rider index, add a
database, or fetch all race files on initial home load. Partial source coverage
must be visible to the user and never be reported as a definitive empty result.

Feedback remains the existing anonymous `/feedback` flow with the same context
privacy boundary. Only its entry placement changes. `stepAfter` remains the
authoritative rank rendering because ranks are measured per completed lap;
copy may explain the step, but no interpolation, smoothing, or semantic change
is allowed.

The Q45 result-table search burden is resolved with a local accessible filter
matching normalized rider name or ID. It does not change official rank order,
row selection, or the existing analysis URL contract. Rider discovery collects
all successfully loaded appearances before applying its six-item cap, then
sorts by meet date descending, category order, and stable IDs so concurrent
network completion order cannot omit a newer appearance.

The final review must be fresh and independent for Astra, Sol, and Terra. The
previous NEEDS_REVISION verdict and the prior 30/8/0 conclusion are context for
the Commander and report history only; they must not be supplied as conclusions
to final reviewers. All four exact viewports, tests, typecheck, lint, build,
diff check, protected MR/POS checks, functional flow, and Production smoke are
release gates. External Human availability is not used as a blocker.

STATUS: CLEAR

Current Change: None (last closed change: Phase 2 Slice 8 — data provenance and freshness metadata)

## Last audit - Phase 2 Slice 8

This audit governs the provenance and freshness metadata slice. Auditors must
inspect the current `PRODUCT.md`, `DESIGN.md`, `IMPLEMENTATION_PLAN.md`,
`lib/types.ts`, `lib/dataSource.ts`, `components/RaceHeader.tsx`, the current
race route, and relevant tests.

The two independent auditors must identify implementation-significant
ambiguity about:

1. whether `updatedAt` is an event time, collector update time, or official
   publication time;
2. whether an official result URL or officialness can be inferred from the
   current upstream shape;
3. exact timestamp timezone/format and malformed-value behavior;
4. exact source URL construction, encoding, external-link accessibility, and
   empty-ID behavior;
5. metadata placement, copy, narrow-width wrapping, keyboard focus, and
   interactions with existing sticky header/error/not-found surfaces;
6. test and browser acceptance coverage without changing upstream contracts.

## Audit status

AUDIT COMPLETE

## Current audit - Phase 2 Slice 7

This audit governs the URL synchronization slice. Auditors must inspect the
current `PRODUCT.md`, `DESIGN.md`, `IMPLEMENTATION_PLAN.md`,
`components/MeetSelector.tsx`, `components/RaceViewer.tsx`,
`components/ChartTabs.tsx`, `hooks/useComparisonRiders.ts`, the race page, and
the relevant tests.

The two independent auditors must identify any implementation-significant
ambiguity about:

1. exact query keys, defaults, encoding, repeated fixed IDs, and return
   context;
2. validation timing and safe fallback for stale category/rider/fixed/lap
   values, including data-quality and no-checkpoint riders;
3. which interactions create browser history entries versus transient state;
4. how external URL navigation reconciles local React state without loops or
   an incorrect race-data fetch;
5. how ChartTabs exposes controlled durable tab/lap state while preserving
   hover, pin, clear, keyboard, sparse-data, and mobile behavior;
6. category/season reset semantics, existing comparison limits, and unknown
   query parameter compatibility;
7. test and browser acceptance coverage for normal, DNF, lapped, invalid,
   loading/error, not-found, and narrow responsive routes.

## Audit status

AUDIT COMPLETE

## Sources inspected

- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/DESIGN.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/2026-09-03-integrated-product-improvement-roadmap.md`
- `lib/dataTransform.ts`
- `lib/types.ts`
- `components/ChartTabs.tsx`
- `components/GapChart.tsx`
- `components/PaceChart.tsx`
- `components/RoleAwareTooltip.tsx`
- `components/RaceViewer.tsx`
- `components/SummaryCard.tsx`
- `lib/dataTransform.ts` (lap semantics and reusable transforms)
- `tests/dataTransform.test.ts`

## Audit scope

Auditors must identify any implementation-significant ambiguity about:

1. cumulative versus per-lap formula and sign wording;
2. whether `gap`/`pace` internal paths or public contracts may be renamed;
3. same-lap rank availability and tooltip behavior for missing values;
4. DNF, lapped, first-lap, and missing-primary behavior;
5. context summaries, all/numeric/pinned modes, and mobile wrapping;
6. boundaries with the deferred lap table and URL synchronization work.

## Commander assumptions pending audit

- The previous user instruction to proceed is treated as approval of the
  proposed Slice 3 boundary: time-difference clarification now, lap table in
  Slice 4.
- Existing transforms already join by `lapNumber` and use the established
  valid-checkpoint/valid-timed-lap rules; Slice 3 must preserve those rules.
- The existing chart paths remain internal implementation details, so
  user-facing labels may change without changing the upstream contract.

## Auditor findings

### Auditor A

- Asked whether the lap axis should be an intersection or the existing union
  and whether missing values should remove a whole point.
- Asked whether primary should be synthesized as `±0`, which rank source is
  valid for per-lap difference, and whether rank may appear without a metric.
- Asked whether rank validity should become stricter than the existing finite
  checkpoint rule, how duplicates affect other riders, whether exports may be
  renamed, how lapped status should appear, and how much tooltip work belongs
  to Slice 4.

### Auditor B

- Independently raised the same union/intersection and primary-tooltip
  questions, plus the need for exact positive/negative copy.
- Asked whether pace rank should use checkpoints or timed laps, how sparse
  DNF/lapped values should be presented, whether numeric context ranks should
  be listed, and whether Slice 4 owns statistics transforms or only table UI.

## Resolutions

1. Retain the existing union lap axis from `getRaceLapNumbers`; omit only the
   affected rider value. A missing primary suppresses all comparison values at
   that lap because a difference cannot be calculated.
2. Preserve the Slice 2 decision that the primary is a zero `ReferenceLine`,
   not a synthesized difference payload or Tooltip row. Comparison rows show
   their metric and same-lap rank when a metric value exists; the rank chart
   remains the source for the primary's rank.
3. Use `getValidCheckpoints` for cumulative-gap rank maps and
   `getValidTimedLaps` for per-lap-difference rank maps. Never render rank-only
   rows. Preserve the existing finite `rankAtLap` validation rule.
4. Duplicate lap numbers invalidate only that rider's record at that lap;
   other riders and the union axis remain available.
5. Preserve `buildGapSeries`, `buildPaceDeltaSeries`, and `GapSeriesPoint`
   signatures/shapes because they are repository-consumed interfaces even
   though they are not upstream contracts.
6. Lapped/DNF chart behavior remains sparse measured data with existing
   result-card status; no new chart status label is added in Slice 3.
7. Slice 4 owns the lap table, fastest/average/max-loss statistics, and their
   transforms. Slice 3's tooltip rank API may be reused but is not expanded
   with lap statistics.
8. Visible copy distinguishes cumulative `タイム差` from per-lap `周回差` and
   explains that positive is behind/slower relative to the selected rider.
9. Numeric/all context riders keep the existing finite current-point metric
   count/min/max summary; their individual ranks are not listed.
10. Keyboard focus remains required for surrounding controls; the existing
    Recharts pointer tooltip is not rearchitected into a keyboard chart
    navigator in this Slice.

## Current Slice 4 audit

The preceding section records the completed Slice 3 audit. The active audit
below governs the lap-detail and summary implementation.

### Audit questions for spec auditors

1. Does the selected-rider row definition exactly match the existing
   `getValidTimedLaps` and duplicate/invalid-data semantics?
2. Are fastest, average, tie-breaking, display rounding, and DNF/lapped
   boundaries explicit enough to implement without guessing?
3. Is the maximum-loss formula and fixed-rider scope consistent with the
   Slice 3 sign convention and comparison modes?
4. Are sparse missing comparison values, no-loss cases, and unavailable/empty
   states specified without inventing zeroes or inferred laps?
5. Can the proposed desktop/mobile table expose the same information at
   320px/390px without conflicting with existing table and focus rules?
6. Are the component boundaries and documentation scope sufficiently bounded
   so URL sync, chart rearchitecture, and upstream contract changes stay out?

### Commander assumptions pending audit

- The user instruction to proceed approves the Slice 4 scope; the detailed
  formulas and responsive presentation are recorded in `docs/DESIGN.md`.
- Lap rows use the selected rider's valid timed laps only. The summary may be
  shown for DNF/lapped riders when measured rows exist, while existing status
  classification remains authoritative.
- Only fixed pinned riders receive table comparison columns. Numeric/all
  comparison detail remains in the existing charts and tooltip.
- Positive displayed lap delta means the fixed rider is slower; positive
  maximum-loss means the selected rider lost time to that fixed rider.

### Auditor findings

- Both auditors identified the same missing definition for a DNF tail. The
  current `Rider` contract has no separate DNF-event lap, so “post-DNF” must
  be grounded in the existing valid checkpoint set.
- Both auditors requested deterministic display precision and a distinction
  between raw-second calculations and rounded UI text.
- Both auditors identified the zero-valid-timed-laps state as distinct from
  zero checkpoints/data-quality failure and requested an explicit UI outcome.
- The UI audit requested one semantic representation across desktop/mobile,
  explicit placement in the existing two-column analysis region, and a rule
  for fully sparse fixed-rider columns.
- The data audit requested rider-local duplicate invalidation, fixed-rider
  tie order, use of the same valid-timed-lap gate for loss calculations, and
  reconciliation of stale pinned IDs.

### Resolutions

1. A DNF lap-detail boundary is the greatest `lapNumber` in
   `getValidCheckpoints(rider)`. `getValidTimedLaps` already derives from that
   set, so malformed records outside the valid checkpoint set are excluded;
   no new status field or collector contract is introduced.
2. All calculations and tie-breaking use original finite seconds. Lap time,
   cumulative time, and average are displayed with `formatSecToClock`; signed
   deltas and maximum loss use `formatGapSec`. Both existing formatters round
   only for display, so raw values decide fastest/loss candidates.
3. When valid checkpoints exist but valid timed laps do not, keep the existing
   status summary and chart analysis. The new summary omits fastest/average,
   and the new table renders a clear “no valid measured laps” empty state.
4. The selected primary row remains whenever its own timed lap is valid. A
   duplicate or invalid fixed-rider lap invalidates only that rider's cell;
   the primary row and other fixed columns remain. Both riders must pass
   `getValidTimedLaps` for a delta or maximum-loss candidate.
5. Fixed columns are rendered for every currently reconciled fixed rider in
   the order supplied to the table, even when all cells are blank. Maximum
   loss ties prefer the earliest `lapNumber`; if tied on the same lap, they
   prefer the fixed-rider order supplied to the table. Stale pinned IDs are
   excluded by existing comparison reconciliation.
6. The table uses one accessible `role="table"` representation and CSS
   responsive grid rows, not duplicated desktop/mobile content. The summary
   follows `SummaryCard` in the left analysis column; the table precedes
   `ChartTabs` in the right column and becomes the corresponding mobile order.
7. Numeric and all modes retain selected-rider fastest/average values but no
   comparison columns; their comparison detail remains in existing charts and
   tooltips. No URL, chart architecture, upstream contract, or dependency
   changes are part of Slice 4.

STATUS: CLEAR

## UX3-1C specification audit — resolved

This section records the active UX3-1C audit. The four UX3-1B decision
documents are authoritative: `docs/feedback/feedback-intake-spec.md`,
`docs/feedback/feedback-ui-options.md`,
`docs/feedback/feedback-provider-decision.md`, and
`docs/ux3-pre-release-adversarial-review.md`. `Human Field Test` remains
`NOT YET EXECUTED` and is outside this implementation.

Two independent `spec_auditor` agents inspected those documents and the
current layout, race viewer, URL-state, test, and build configuration. Their
reports identified implementation-significant questions. The Commander
resolved them in the active UX3-1C section of `docs/DESIGN.md` as follows:

1. The UX3-1C design section is active; older closed design sections remain
   historical records. Human Field Test status is unchanged.
2. Basin receives a server-only form-urlencoded POST with canonical field
   names and JSON-string context. 2xx is accepted; explicit provider failure,
   malformed JSON, timeout, 408/425/429/5xx, and other 4xx are mapped to the
   provider-neutral outcomes documented in DESIGN. Missing endpoint is a
   generic 503 in every environment and never a build failure.
3. Unknown top-level/context keys are rejected with 400. Message/email/ID
   trimming, Unicode code-point limits, bounded ID characters, optional-field
   omission, viewport clamp, and client-drop/server-reject behavior are fixed
   in DESIGN.
4. Honeypot is top-level `website`; nonblank values receive a generic
   accepted response and never reach the provider. No app-level IP/network
   rate-limit store is introduced; Basin filtering, allowed domain, bounded
   validation, honeypot, optional deployment WAF, and client duplicate
   suppression are the baseline.
5. The per-form UUID is a non-persisted `Idempotency-Key` header. It is not a
   strict dedupe store or user identity.
6. The entry stores only canonical context and an allowlisted same-origin
   known-key `returnTo` in fixed-key session storage. The return control uses
   browser history when entry-created, preserving URL and scroll; direct
   `/feedback` visits return to `/`. Success/departure clears the snapshot.
7. Field errors focus the first invalid field and provider errors focus a
   route-local alert; success focuses a live status and replaces the form.
   Desktop fixed entry and mobile non-sticky footer are layout-owned, with
   `/feedback` remaining form-primary. Browser smoke is manual/agent-browser
   evidence without a new browser test dependency.
8. Raw Basin/provider data and exports are deleted at 90 days without P0/P1
   exceptions. Only de-identified minimal issue records may remain until
   resolution +30 days and no longer than 12 months. The report must include
   the Basin 90-day setting and monthly deletion review as a production gate.

The first auditor reported the stale top-level CLOSED/DRAFT wording, Basin
transport, env, retention, unknown-key, honeypot, rate-limit, snapshot,
footer, and browser-evidence questions. The second independently reported the
same transport/env/response/validation/browser/focus/retention questions.
All legitimate questions are now resolved in the authoritative design; no
provider, retention, privacy, or schema decision was redesigned.

STATUS: CLEAR

## UX2-2 Desktop workspace audit — specification resolution (2026-09-06)

The UX2-2 source documents and the current UX2-1 implementation were checked
before implementation. The following decisions resolve the implementation
questions for this bounded Desktop slice:

1. Desktop is `min-width: 1024px` (`lg`). Below that boundary the existing
   mobile/vertical composition remains intact; no UX2-3 sheet, compact mobile
   header, or mobile chart reorder is introduced.
2. `analyze` is derived only from a loaded race with a selected rider. Browse
   remains result-first. In active Desktop analysis, the single existing
   results-table representation is placed in a native `details` disclosure,
   closed by default and named `結果表を表示`; it has no URL/history state.
   Browse and sub-1024px rendering keep the existing full results surface.
3. The active Desktop workspace consists of one compact text context bar,
   followed by a 280–320px control rail and a flexible primary column. The
   primary column renders `ChartTabs` before `LapDetailTable`. Existing chart,
   table, data-quality, DNF, lapped, sparse-lap, and comparison semantics are
   unchanged.
4. The context bar must show race, category, selected rider with position or
   status, comparison mode/count, and active metric as text. Long values wrap;
   no state is color-only. `RaceViewer` owns state and `AnalysisContextBar` is
   presentation-only.
5. `RaceHeader` remains the only sticky surface in UX2-2. The new context bar
   is non-sticky so a second hardcoded or unmeasured sticky offset cannot
   overlap the existing header. UX2-3 may revisit measured mobile stickiness.
6. Same-workspace rider/comparison/metric/lap actions continue through the
   centralized UX2-1 URL writer with `scroll: false`; category and route
   navigation semantics are not changed. No scroll state, query key, or
   history rule is added.
7. The selected rider's browse list must close when a result-row selection
   enters analysis, while search, keyboard operation, bounded internal list
   scrolling, and the stable trigger focus contract remain available.
8. Validation must include existing and new behavior tests, TypeScript, lint,
   production build, diff check, and browser smoke at 1440×900, 1280×720,
   390×844, and 320×568. Desktop screenshots/measurements are evidence; exact
   pixel coordinates are not fixed requirements.

No implementation-blocking ambiguity remains for UX2-2. UX2-3, UX2-4, and UX2-5
remain out of scope and blocked.

## UX2-2 revision resolution — responsive results surface (2026-09-06)

The Desktop results disclosure is presentation-specific. Below `1024px`, the
Desktop `<details>` and summary are not rendered; the existing full results
table is rendered before the analysis workspace so visual and assistive
technology order remain results-first. At or above `1024px`, the same single
table is rendered after the chart-first workspace in a closed-by-default native
disclosure. Only the Desktop disclosure's native toggle updates its local open
preference. A viewport round trip therefore preserves explicit Desktop open
state without making a default-closed disclosure open accidentally, and does
not add URL/history state.

The active analysis children likewise use structural breakpoint branches:
Mobile preserves the existing control rail → lap detail → chart DOM and visual
sequence, while Desktop uses chart tabs → lap detail → control rail in reading
order and grid-places the rail visually left. CSS order is not used as the
Mobile reading-order mechanism.

STATUS: CLEAR

## UX redesign audit v2 — specification resolution (2026-09-05)

The task-based audit was performed against the public site before reading the
repository. Two independent specification auditors then inspected the
canonical documents and the relevant implementation. They identified
implementation-significant ambiguity around chart-first order, control
collapse, per-action scroll/focus, deep links, back/forward, DNF/lapped and
empty states, and 320px/390px accessibility.

The authoritative detailed resolution is
`docs/ux-redesign-spec-v2.md`. Its key decisions are:

- `browse` and `analyze` are derived from the existing rider URL state; no new
  URL key is added.
- Chart-first means context/status and actionable controls remain available,
  but `ChartTabs` precedes `LapDetailTable` and active full results collapse.
- The page remains the only page-level scroll container. Same-race rider,
  comparison, metric/tab, and lap changes preserve the workspace anchor; a
  category/new-route change may go to the top.
- `#race-analysis` targets a focusable workspace heading with a measured sticky
  header offset. Dialog/sheet actions return focus to their opener.
- Desktop uses a 280–320px control rail beside the main chart. Mobile keeps
  context, rider, comparison, and metric in a compact sticky toolbar and moves
  low-frequency lists into bounded accessible sheets.
- Existing URL, data, sparse-lap, DNF, lapped, unavailable, all-mode, pinned,
  loading, error, and not-found contracts remain unchanged.
- Current production coordinates are baseline evidence, not pixel requirements.

No implementation-blocking ambiguity remains for the documented direction.
The remaining choices (existing Base UI vs native dialog primitive and exact
visual tokens) cannot change the resolved state, focus, scroll, content order,
URL, or responsive behavior. This is a preparatory design audit; it does not
claim that the redesign has been validated by real users.

STATUS: CLEAR

## Current audit — Phase 2 Slice 5: accessible mobile chart detail

This audit supersedes the completed Slice 4 audit while the new slice is
active. Auditors must check the current `PRODUCT.md`, `DESIGN.md`,
`IMPLEMENTATION_PLAN.md`, the four chart components, `ChartTabs`,
`RoleAwareTooltip`, and the validity helpers in `lib/dataTransform.ts`.

The two independent auditors identified the following implementation-significant
questions. The Commander resolved them as follows:

1. First-lap fallback: use exactly `raceLapNumbers[0]`; an empty axis has no
   selected lap and the panel is unavailable. This applies to initialization,
   tab changes, and clear-pin.
2. Primary gap/pace detail: always render a display-only primary row first.
   Its value is `±0` only when the required metric is valid; otherwise it is
   `未計測`. It is never added to the Recharts series or tooltip payload.
3. No comparison riders: retain the existing empty chart state and render the
   shared panel with `比較対象なし`; keep lap navigation when an axis exists,
   without implying a zero comparison.
4. Sparse chart click: resolve only a valid Recharts active axis
   index/payload. A valid axis lap pins exactly even if values are missing;
   missing values remain `未計測`. Empty-area events do not change state.
5. Hover/pin: while unpinned, hover updates the active lap and pointer leave
   retains the last active lap. While pinned, hover has no state effect. Clear
   unpins and resets to `raceLapNumbers[0]` when available.
6. Keyboard path: the native lap selector and previous/next buttons are the
   complete keyboard mechanism. They expose labels, edge-disabled states,
   focus-visible styling, and a readable selected-lap/value region; SVG dots
   are not independently focusable.
7. Rider membership: rank/lap use the same displayed rider list as the
   existing chart. Gap/pace use the display-only primary row followed by the
   existing comparison series riders, in reconciled order.
8. DNF/lapped wording: the existing summary card remains authoritative. The
   detail panel uses `未計測` for unavailable values and does not create a
   second status model or infer a post-boundary value.
9. Layout stability: `ChartDetailPanel` uses `min-h-[13rem]` and a bounded
   internally scrolling value list so its outer height is stable per tab/mode;
   the page never gains horizontal overflow.
10. Verification: pure-transform tests cover valid, sparse, duplicate,
    invalid, DNF, lapped, and sign cases. Browser smoke verifies initial,
    hover, chart click/tap, selector, previous/next, pin/clear, tab changes,
    missing values, and 320px/390px overflow/focus behavior. No component-test
    harness is added because this repository has no such dependency; browser
    smoke is the interaction evidence.

STATUS: CLEAR

## Phase 2 Slice 7 audit findings and resolutions

The two independent auditors found no product contradiction, but identified
implementation-significant details that needed explicit resolution in
`docs/DESIGN.md` before coding:

- They requested a per-action retention/reset table. The resolved table now
  defines Home season/series, race category/rider/mode/fixed, chart tab, and
  deliberate lap transitions. Category clears rider/fixed/tab/lap and resets
  comparison `2`; primary selection removes itself from fixed IDs in the same
  history entry; tab preserves a valid pinned lap.
- They requested hydration and fetch timing. The resolved design uses
  synchronous client `useSearchParams`, resolves category against the server
  meet before the first race fetch, and canonicalizes only after mount. Home
  and race-dependent values are not rewritten while their data is loading or
  in error; dependent values hydrate only after the target race succeeds.
- They requested an atomic external-navigation rule. The resolved design
  hides the old race analysis through the existing loading branch, resets
  dependent state during category replacement, and applies only the new URL's
  valid values after the new race response arrives.
- They requested separate rider and fixed eligibility. Existing riders remain
  valid primary selections even with data-quality/no-checkpoint problems;
  fixed IDs must be graphable, non-primary, unique, and within the existing
  four-ID limit. A valid race-axis lap remains canonical even when analysis is
  unavailable; an invalid lap is removed and falls back to an unpinned first
  axis lap, while an empty axis yields null active/pinned state.
- They requested deterministic fixed/query serialization. Duplicate fixed
  values retain the first valid occurrence; the normalized list is capped at
  four. Known keys use the documented order, and unknown repeated pairs remain
  in relative order after them on every URL rewrite.
- They requested explicit mode fallback and return-link behavior. Stale
  `all` becomes omitted default comparison `2` when over the graphable limit;
  `pinned` with no fixed IDs remains pinned and shows the existing empty state.
  The back link carries only first context values present and matching the
  current meet (including a global series without season), otherwise `/`;
  race analysis and unknown keys are not carried to Home.
- They requested malformed-input behavior and a pure API boundary. Query
  helpers are total and treat malformed values as absent; path parsing keeps
  existing not-found semantics. Raw parsing is separate from data-aware
  normalization so helpers do not fetch or own UI state.

The resolved design also makes explicit that every deliberate durable action
uses one `push`, canonical cleanup uses `replace`, and hover never writes the
URL. No new dependency, route, upstream contract, or chart formula is
introduced.

## Phase 2 Slice 8 audit findings and resolutions

The two independent auditors raised the following implementation-significant
questions. The Commander resolved them before implementation:

1. `updatedAt` is collector-data freshness, not event publication time. The
   fixed display format is zero-padded `YYYY/MM/DD HH:mm JST`, with no seconds
   or weekday, produced from `ja-JP` numeric parts in `Asia/Tokyo`.
2. The viewer trims the runtime timestamp value and accepts any value that
   `new Date(value)` parses to a finite instant. This covers the collector's
   UTC ISO 8601 sample and offset-based values. Empty, whitespace-only,
   malformed, non-date, or out-of-range values display `更新日時不明`.
3. A race ID is valid for the source link only when its trimmed value is
   nonblank. The trimmed ID is encoded as one path segment; blank IDs omit the
   link. The upstream `RaceResult.updatedAt: string` contract is unchanged.
4. The source link is same-tab navigation with the visible label
   `取得元データ (GitHub)` and the existing keyboard focus treatment. No
   new-tab attributes or arbitrary data-provided URL are introduced.
5. The existing title/category/count layout remains the first row. The
   metadata is a full-width wrapping second row inside the sticky
   `RaceHeader`; at 320px/390px it must remain readable and avoid page-level
   horizontal overflow.
6. Metadata is rendered only in the successful-race branch where
   `RaceHeader` already renders, including an analysis-unavailable rider.
   Loading, network/http/invalid-data, and not-found surfaces are unchanged.
7. Unit tests cover valid UTC and offset conversion, empty/whitespace and
   malformed values, non-string runtime input, and path-segment encoding.
   Browser smoke covers normal display, exact source href, keyboard focus,
   sticky visibility, not-found preservation, and narrow-width wrapping.

## UX2-1 implementation audit — specification resolution (2026-09-05)

Two independent auditors reviewed the UX2-1 implementation boundary against the
current source and the five required UX documents. The following decisions are
authoritative for this slice:

1. Category changes are navigation transitions even though they keep the same
   route path. They use one `push`, clear rider/fixed/tab/lap, reset compare to
   `2`, show the existing loading branch while the target race loads, and allow
   normal top navigation.
2. Rider changes after analysis has started, comparison/fixed changes, metric/tab
   changes, and deliberate lap changes are same-workspace transitions. They use
   one `push` with `{ scroll: false }`; the existing URL keys and history entry
   semantics remain unchanged.
3. First rider selection from browse retains the existing explicit entry behavior
   and may move into analysis. Canonical cleanup uses `replace` with
   `{ scroll: false }` and never steals focus.
4. The URL remains the only durable state source. No scroll or focus state is
   serialized. Browser back/forward preserves a valid native focus target when
   possible; otherwise a visible current analysis control receives focus with
   `preventScroll`, and category transitions wait until the new race is loaded.
5. The rider picker may reveal its selected row only inside its bounded list.
   In-analysis picker selection returns focus to the stable rider trigger;
   result-table keyboard selection keeps the existing analysis-region focus
   behavior. No new layout, chart/data semantic, route, dependency, or upstream
   contract change is authorized.
6. Automated tests must cover transition classification, router scroll intent,
   URL round trips and category reset, while browser smoke covers same-analysis
   no-top-reset, back/forward state/focus, picker focus, direct URLs, and all four
   required viewport sizes.

STATUS: CLEAR

## UX2-2 Desktop workspace audit — specification resolution (2026-09-06)

The UX2-2 source documents and the current UX2-1 implementation were checked
before implementation. The following decisions resolve the implementation
questions for this bounded Desktop slice:

1. Desktop is `min-width: 1024px` (`lg`). Below that boundary the existing
   mobile/vertical composition remains intact; no UX2-3 sheet, compact mobile
   header, or mobile chart reorder is introduced.
2. `analyze` is derived only from a loaded race with a selected rider. Browse
   remains result-first. In active Desktop analysis, the single existing
   results-table representation is placed in a native `details` disclosure,
   closed by default and named `結果表を表示`; it has no URL/history state.
   Browse and sub-1024px rendering keep the existing full results surface.
3. The active Desktop workspace consists of one compact text context bar,
   followed by a 280–320px control rail and a flexible primary column. The
   primary column renders `ChartTabs` before `LapDetailTable`. Existing chart,
   table, data-quality, DNF, lapped, sparse-lap, and comparison semantics are
   unchanged.
4. The context bar must show race, category, selected rider with position or
   status, comparison mode/count, and active metric as text. Long values wrap;
   no state is color-only. `RaceViewer` owns state and `AnalysisContextBar` is
   presentation-only.
5. `RaceHeader` remains the only sticky surface in UX2-2. The new context bar
   is non-sticky so a second hardcoded or unmeasured sticky offset cannot
   overlap the existing header. UX2-3 may revisit measured mobile stickiness.
6. Same-workspace rider/comparison/metric/lap actions continue through the
   centralized UX2-1 URL writer with `scroll: false`; category and route
   navigation semantics are not changed. No scroll state, query key, or
   history rule is added.
7. The selected rider's browse list must close when a result-row selection
   enters analysis, while search, keyboard operation, bounded internal list
   scrolling, and the stable trigger focus contract remain available.
8. Validation must include existing and new behavior tests, TypeScript, lint,
   production build, diff check, and browser smoke at 1440×900, 1280×720,
   390×844, and 320×568. Desktop screenshots/measurements are evidence; exact
   pixel coordinates are not fixed requirements.

No implementation-blocking ambiguity remains for UX2-2. UX2-3 was then
audited separately before implementation.

## UX2-3 Mobile workspace audit — specification resolution (2026-09-06)

Two independent `spec_auditor` reviews identified the following legitimate
ambiguities. The Commander resolved them in `docs/DESIGN.md`,
`docs/IMPLEMENTATION_PLAN.md`, `docs/ux-redesign-spec-v2.md`, and
`docs/ux-spec-audit-v2.md`:

1. Browse keeps the existing full results table before analysis. Active Mobile
   moves the same single table after the chart-first workspace into a native
   closed-by-default `details` disclosure named `結果表を表示`. Its open state
   is local only and does not enter URL/history; UX2-4 owns deeper table/lap
   disclosure redesign.
2. Active Mobile DOM/visual order is compact context → compact rider and
   comparison controls → `ChartTabs`/chart → existing summary cards → existing
   `LapDetailTable` → results disclosure. Desktop UX2-2 order and grid are
   unchanged; CSS order is not the Mobile reading-order mechanism.
3. Rider change uses a native modal `<dialog>` bottom sheet with `showModal`,
   labeled title, initial search focus, Escape/explicit close/backdrop close,
   one-selection close, opener focus return with `preventScroll`, bounded list
   scroll, overscroll containment, and bottom safe-area padding. Search resets
   on close and selected-row visibility is restored on reopen.
4. Comparison is an inline native `details` with current mode/count in its
   summary. It remains open after mode changes; pinned IDs, all-mode guard,
   existing callbacks, and 44px targets remain unchanged. Focus falls back to
   its summary only when a removed control disappears.
5. Sheet/disclosure open state is local and creates no history entry. Browser
   Back/Forward continues URL traversal; URL changes close transient sheet UI
   and use the existing visible-control focus fallback. First result-row rider
   entry preserves UX2-1 behavior; in-analysis changes preserve `scroll:false`.
6. `ChartTabs` remains immediately after the Mobile action row with existing
   metric semantics. If 320px requires it, only the tab strip may scroll
   internally; page horizontal overflow and accidental two-row controls are
   prohibited.
7. No additional sticky Mobile toolbar is added. `RaceHeader` remains the only
   sticky layer. Long values wrap, sheet height is capped at `min(70dvh,32rem)`
   with safe-area padding, and resize/hydration changes presentation only.
8. Loading/error/not-found/unavailable/no-checkpoint/DNF/lapped/missing-lap,
   large-data, URL, history, and data/chart semantics remain unchanged. An
   unavailable rider keeps its context/alert but has no chart/lap detail.

No implementation-blocking ambiguity remains for UX2-3.

STATUS: CLEAR

## UX2-4 Results / Lap Detail / supporting information audit (2026-09-06)

This is the active audit for the bounded UX2-4 implementation. The source of
truth is `docs/ux-redesign-spec-v2.md` plus the completed UX2-1/2/3 reports.
Two independent `spec_auditor` agents must inspect those documents and the
current Results/Lap Detail integration before implementation. They must answer:

1. Whether Results should remain one existing table and what its closed summary
   must expose for information scent and current-rider discovery.
2. Whether Lap Detail is closed by default on Desktop/Mobile, how its lap count
   is derived without changing data semantics, and how no-measured-lap, DNF,
   lapped, missing, and duplicate states are named.
3. Whether Results/Lap Detail disclosure state is URL/history state or local
   presentation state, including rider/category changes, Back/Forward, reload,
   and responsive resize.
4. How active Results row selection returns to analysis without violating the
   UX2-1 `scroll: false` rider contract or turning an explicit action into an
   accidental page-top reset.
5. Whether native `details` semantics provide sufficient keyboard/focus
   behavior, and whether existing table accessibility, bounded scrolling, and
   320px/390px overflow remain intact.
6. Whether the proposed component ownership is bounded enough to avoid chart,
   data-transform, URL, dependency, or UX2-5 scope expansion.

### UX2-4 resolutions

1. The Results summary count is `race.riders.length`, the full rendered table
   set including unavailable result rows; it is not a graphable-only count.
2. Lap Detail remains openable with zero valid measured rows and exposes the
   existing empty state. Its `N周` is exactly
   `getMeasuredLapRows(primaryRider).length`; no highest-lap or inferred DNF
   count is used.
3. Existing context/SummaryCard/table output remains authoritative for
   DNF/lapped/missing/duplicate meaning. The disclosure summary adds no second
   status model.
4. Disclosure state is local-only: fresh reload starts closed; same-mount
   rider/comparison/metric/lap transitions and resize preserve the preference;
   browse or category transitions close it synchronously and cannot display
   stale data.
5. Native summary retains focus on ordinary open/close. No programmatic focus
   to a table heading is added. Existing UX2-1 reconciliation covers
   URL-driven unmounts.
6. `RaceViewer` owns active Results row close, rider URL push, conditional
   workspace reveal, and focus. It calls `scrollIntoView` only when the
   analysis region has no viewport intersection; an already visible workspace
   is not moved. `RaceResultsTable` only invokes its callback.
7. Results keeps its native `<table>` and Lap Detail keeps its existing ARIA
   `role="table"` representation; no duplicate table or semantic conversion is
   included in this slice.
8. Implementation ownership is bounded: presentation helper/component/tests,
   one RaceViewer integration task, then report/browser/validation/review. No
   chart/data/URL/dependency or UX2-5 implementation is included.

## Current audit — UX2-5 final UX regression and production readiness (2026-09-06)

This is the release-gate audit for the final integrated verification. The
implementation scope is verification and documentation first; product-code
changes are permitted only for observed P0/P1 regressions, accessibility
failures, responsive failures, interaction bugs, or a small low-risk blocking
hierarchy fix. No new UX structure, analysis feature, data-model change, or
chart-calculation change is authorized.

### UX2-5 audit findings and resolutions

1. The UX2-5 user request is the authoritative definition of AC1–AC21 and
   Task 1–7 for this slice. The older v2 audit's Tasks 1–5 and acceptance
   criteria remain historical context; they do not silently omit the final
   slice's AC16–AC21. Each AC is reported individually as PASS, FAIL, or
   BLOCKED with evidence. `RELEASE READY` requires AC1–AC21 PASS, zero P0/P1,
   required automated checks PASS, both independent reviews PASS, and final
   production verification PASS.
2. P0 means unusable flow, data/status correctness regression, or severe
   accessibility/security regression. P1 means a major-task blocker or a
   regression in an established UX2-1–UX2-4 contract. P0 and P1 findings must
   be fixed or the verdict is `NEEDS REVISION`; a tooling limitation is not
   relabeled as a product PASS and is recorded separately as evidence scope.
   Small, low-risk P2 findings may be fixed; larger P2/P3 findings are
   backlog-only in `docs/ux3-backlog.md`.
3. The release environment is the public alias
   `https://ajocc-laptime-viewer.vercel.app/`. A production verdict requires
   that alias to resolve to the tested final commit or an artifact-equivalent
   deployment, with deployment readiness, alias, timestamp, and repository
   commit evidence recorded. Local or preview-only evidence cannot substitute
   for the production gate. Here “first use” means a fresh browser session
   with no prior app state; the evaluator may receive only the task wording,
   not the implementation or UX reports. A three-minute result is a
   deterministic task criterion, not a claim of statistically significant
   user research; a larger participant study remains future research.
4. The later UX2-4 resolution is authoritative for disclosure focus: native
   `details`/`summary` keeps focus on the toggle during ordinary open/close;
   no programmatic jump to a heading or table header is required. The older
   generic focus-to-heading wording is superseded for Results and Lap Detail.
   When content is explicitly selected from Results, the existing UX2-1
   rider-navigation contract applies: the URL/state changes with the
   established focus fallback and `scroll:false` behavior where applicable.
5. URL-owned state is validated by direct deep links, reload/canonicalization,
   and source-level URL/history tests. Transient disclosure state, focus,
   scroll, hover, and tooltip state remain local and are not expected to be
   restored by reload or browser history. Browser Back/Forward must restore
   durable URL state without preserving a stale transient overlay. Invalid
   routes and malformed known query values must retain the existing safe
   error/canonicalization behavior.
6. The required responsive boundary is the pair `1023px` (Mobile
   presentation) and `1024px` (Desktop presentation), plus a resize smoke
   where tooling allows. The presentation split is not a new state contract;
   it must preserve URL state, focus safety, and no page overflow. Exact
   390px/320px measurements and screenshots are preferred evidence. If the
   connected browser cannot emulate those dimensions, the report must state
   the limitation and use existing responsive tests/source evidence rather
   than inventing measurements; this evidence limitation alone is not a
   product P0/P1.
7. Accessibility release evidence consists of visible keyboard focus,
   logical tab order, native disclosure/table/tab/dialog semantics, selected
   and current-state announcements in the accessibility tree, usable 44px
   mobile targets, and no focused hidden controls. A full assistive-technology
   certification is outside this bounded slice unless a blocking defect is
   observed; any unverified high-risk assistive-technology behavior is listed
   as a limitation/backlog item.
8. The large-data gate uses the largest representative public category that
   is available in the tested data, with approximately 98 riders as the
   target and 60 riders as the minimum fallback when no 98-rider category is
   available. The pass condition is practical access to chart, picker, and
   bounded Results/Lap Detail without page overflow, status loss, or a
   blocking interaction delay; no performance threshold or virtualization
   feature is introduced by UX2-5.
9. Error/recovery evidence covers the existing not-found route, malformed
   deep-link canonicalization, and the existing loading/network/http/
   invalid-data/retry automated tests. A production network outage is not
   manufactured by altering deployed data or code; if it cannot be safely
   reproduced, the existing tested error boundary and its recovery controls
   are recorded as the evidence. No stale success content may be claimed as
   an error pass.
10. The final review uses two independent `reviewer` passes where available:
    the first operates the public build before reading source (usability),
    and the second checks source, tests, contracts, and evidence (technical).
    Either reviewer returning `NEEDS_REVISION` enters the bounded revision
    loop. No UX3 redesign is implemented during this slice.

### UX2-5 human recovery resolutions (2026-09-06)

11. The user-authorized recovery preserves `revision_cycles=4` and
    `max_revision_cycles=3` exactly as historical state. The additive recovery
    record identifies this as cycle 1; no hook-owned counter or prior failure
    record is reset or fabricated.
12. The prior usability-first `PASS` is reusable for this recovery because the
    product code is unchanged from the reviewed candidate. A new technical
    reviewer must independently inspect the final report, final diff, tests,
    and current candidate build before commit/push. The recovery does not
    reuse the prior technical `NEEDS_REVISION` verdict; post-push production
    smoke remains the separate AC21 gate.
13. AC21 is `PASS` only after the final commit SHA is pushed to `origin/main`,
    the public alias resolves to a `READY` production deployment with its ID,
    URL, alias, and timestamp recorded, and the post-push smoke covers the
    required home-to-chart flow, metric/comparison changes, Results rider
    selection, Lap Detail open/close, a mobile smoke, and a representative
    deep link. Prior pre-push evidence cannot satisfy AC21 by itself.
14. AC8 remains a qualified `PASS`: the established keyboard focus contract,
    native disclosure focus, tab/comparison focus, and no-hidden-focus checks
    pass. The first-entry pointer selection leaving `body` is a recorded P2
    limitation, not a P0/P1 release blocker; it remains explicitly visible in
    the final report and UX3 backlog rather than being called fixed.
15. Closeout commits the intended UX2-5 documentation files on the current
    `main` branch and pushes normal history to `origin/main`; no product code,
    tests, dependencies, or deployment configuration are changed by the
    recovery.

STATUS: CLEAR

## UX3-0.5 final Pilot evaluation audit (2026-09-06)

This bounded documentation change evaluates the existing
`docs/user-testing/pilot-participant-01.md`. It does not authorize product
code, CSS, component, chart logic, application configuration, or a full
participant-record redesign.

Two independent specification auditors reviewed the current Pilot record and
the UX3 test plan, moderator script, participant record template, observation
sheet, results-analysis template, and prior Pilot review. The following
resolutions are authoritative for this review:

1. The Pilot record's Task 1–6 values `5 / 5 / 3 / 5 / 3 / 10` are treated as
   approximate minutes because the current record describes them as estimated
   minutes. They sum to approximately 31 minutes. This is an approximate
   recorded-task duration, not a precise timestamp reconstruction and not a
   conversion to seconds.
2. `Pilot actual duration` remains `UNKNOWN` / `NOT RECORDED` because exact
   session start/end, Task 0, introduction, and post-test interview duration
   are absent. The recorded task duration is still evaluated as `TOO LONG`
   against the former 10–15 minute target.
3. In the final review, evidence status is separate from task outcome:
   `EVALUABLE` means the stated goal or useful qualitative evidence is directly
   supported; `PARTIALLY EVALUABLE` means a useful signal exists but completion,
   timing, or protocol evidence is incomplete; `NOT RECORDED` is used only for
   an absent field. Missing fields do not make the entire Pilot
   `NOT EVALUABLE`.
4. `success / partial / fail / NR` remains the protocol's outcome vocabulary.
   Pilot outcomes may be reported as `likely success (inferred/provisional)`
   or `likely partial (inferred/provisional)` only when the record supports
   that interpretation. They are not clean-success counts.
5. Every Pilot-only product signal requires main-test confirmation, written
   literally as `REQUIRED`. A signal may be preserved as a hypothesis, but no
   product change or formal UX3 finding follows from this one-person Pilot.
6. The Pilot participant is excluded from formal main-test participant counts,
   repetition counts, and severity aggregation. `seen once` is usable for
   protocol validation and a preliminary UX signal, but weak as first-use
   discoverability evidence. Main-test recruitment should prefer `never used`.
7. Recording burden is classified as `HIGH (operational recording risk)` for
   the current form. The revised minimum is considered operationally adequate
   when it can be captured without delaying the participant; no claim is made
   about the unmeasured burden of the revised form.
8. Main-test hesitation requires both an approximately three-second stop and
   behavioral evidence: control search, cursor wandering, exploratory scroll,
   or a hesitation utterance. A reading/analysis pause is recorded separately
   and is not counted as interaction hesitation. Unknown cases remain `NR`.
9. One task-level intervention code is recorded (`M0`, `M1`, `M2`, `M3`, or
   `LEADING`). Reasons and timestamps for M2/M3/LEADING go in the event notes.
   The Pilot's unselected `NR` / placeholder intervention field remains
   `NOT RECORDED`.
10. The main-test plan remains Task 0–6 in the existing order and wording.
    Task 6 keeps a 60–90 second box. The realistic participant-facing session
    target is 15–25 minutes including introduction, Task 0–6, and interview;
    post-session classification is excluded from participant wait time.
11. The final readiness verdict is `UX3-0.5 READY FOR HUMAN FIELD TEST`.
    Exact timestamps, viewport precision, first-click verdicts, intervention
    level, and complete friction logs are measurement limitations, not gates
    that block the field test. The one-question-at-a-time capture approach is
    a future protocol improvement candidate only.

## UX3-7R Specification Audit Resolutions

1. Owner Human P-A-01 is the primary acceptance source. Synthetic reviews may
   corroborate or identify additional low-risk issues, but they cannot cancel
   an Owner finding that remains visible in the screen.
2. The old UX3-7 report and verdict are immutable history. UX3-7R records the
   effectiveness rejection and audits the old implementation rather than
   rewriting it.
3. A P-A-01 negative/improvement answer is tracked as an individual detailed
   record even when several records share one root cause. The acceptance words
   are exactly `CLEARLY CHANGED`, `PARTIALLY CHANGED`, and `NO MATERIAL CHANGE`;
   only `CLEARLY CHANGED` can pass.
4. The approved redesign is a targeted analysis-page restructuring: compact
   race context, an identity/control deck, a full-width primary chart, and
   supporting summary/detail/results below. It is not an application-wide
   rewrite and does not change data or URL contracts.
5. Results remain the authoritative rider-selection table. A prominent
   Results action may be repositioned or restyled, but result rows, selection,
   disclosure semantics, history, deep links, and reload behavior remain.
6. Exact viewport evidence is required at 1440x900, 1280x720, 390x844, and
   320x568. Playwright or an equivalent Chromium context is an approved
   temporary verification tool; it must not become a production dependency.
7. Production-before screenshots may use the current released alias at the
   same race/category/rider/metric/comparison state. After screenshots must
   use the resulting implementation and the same state. All images are
   visually inspected, not accepted by DOM inspection alone.
8. No External Human participant is required for the implementation gate.
   P-A-01 is existing Owner Human evidence; external validation remains a
   post-release continuation and is never claimed complete.

STATUS: CLEAR
