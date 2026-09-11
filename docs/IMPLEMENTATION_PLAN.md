# UX3-5 active implementation plan

Status: ACTIVE — re-audit and bounded MR-01 / MR-02 / MR-03 remediation

## Task graph

### UX3-5-SPEC — Evidence-backed design and specification audit

- Status: DONE — re-audited by two independent spec auditors
- Objective: record the UX3-4 source-of-truth findings, exact boundaries,
  acceptance criteria, and verification plan before code changes.
- Files: `docs/DESIGN.md`, `docs/IMPLEMENTATION_PLAN.md`,
  `docs/SPEC_AUDIT.md`.
- Do-not-change: product code, source review evidence, unrelated user changes.
- Acceptance: two independent specification audits complete; every legitimate
  ambiguity is resolved in the project documents; `docs/SPEC_AUDIT.md` ends
  exactly with `STATUS: CLEAR`.
- Verification: document review and `git diff --check`.

### UX3-5-RECHECK — Current-tree overlap and direct regression fixes

- Status: READY
- Objective: compare the committed UX3-5 implementation with the current
  tree, preserve unrelated UX3-7R edits, and correct only direct MR-01–03
  regressions found during the audit.
- Files: only directly affected UX3-5 component/test/report hunks.
- Dependencies: UX3-5-SPEC.
- Do-not-change: UX3-7R-only layout, results, disclosure, or feedback changes;
  UX3-4 evidence; URL/state/data contracts.
- Acceptance: the active guide remains visible at 320px-class widths; all-mode
  aggregation and bounded tooltip rules match the resolved design; no unrelated
  dirty hunk is staged.
- Verification: targeted tests, browser checks, and `git diff --check`.

### UX3-5-CHART-STYLES — MR-01 series identification

- Status: DONE
- Objective: give context series deterministic categorical colors while
  preserving primary/fixed roles and add crowded-mode name/value exposure.
- Files: `lib/chartSeriesStyles.ts`, `components/RoleAwareTooltip.tsx`,
  `components/ChartTabs.tsx`, `tests/chartSeriesStyles.test.ts`.
- Dependencies: UX3-5-SPEC.
- Do-not-change: rider ordering, comparison limits, data transforms, URL state,
  chart formulas, or selection callbacks.
- Acceptance: every unique displayed rider is text-identifiable once in the
  crowded key; bounded non-`all` crowded tooltips expose valid context names;
  `all`/large datasets retain aggregate tooltip safety; context colors are
  deterministic by displayed order; the key wraps on mobile.
- Verification: targeted style tests plus full test/typecheck/lint/build.

### UX3-5-READING-GUIDE — MR-02/MR-03 terminology and direction

- Status: DONE
- Objective: centralize and expose the four metric explanations, including the
  `周回差`/`-1周` distinction and direction/sign semantics.
- Files: `lib/chartReadingGuide.ts`, `components/ChartTabs.tsx`,
  `components/ChartDetailPanel.tsx`, `tests/chartReadingGuide.test.ts`.
- Dependencies: UX3-5-SPEC.
- Do-not-change: numeric calculations, chart axes, step/linear rendering,
  metric URL keys, and lap selection behavior.
- Acceptance: active-tab guides state rank/lap direction and selected-rider
  difference signs; pace explicitly says single-lap time difference and
  distinguishes result `-1周`.
- Verification: guide unit tests plus browser text/interaction checks.

### UX3-5-REPORT — Implementation and regression record

- Status: DONE
- Objective: create `docs/user-testing/ux3-5-limited-scope-implementation.md`
  with MR-01–03 acceptance results, POS-01–05 protection, browser results,
  automated checks, deferred findings, and remaining Human status.
- Files: report only.
- Dependencies: UX3-5-CHART-STYLES, UX3-5-READING-GUIDE, verification.
- Do-not-change: UX3-4 report and all source review files.
- Acceptance: report records no external Human completion and no scope creep.
- Verification: Markdown structure, links, and `git diff --check`.

### UX3-5-VERIFY — Full validation, browser review, commit, and push

- Status: IN_PROGRESS — automated validation and independent review pending
- Objective: run all repository checks, browser verification at requested
  sizes/flows, independent reviewer, then commit and push only UX3-5 changes.
- Dependencies: UX3-5-REPORT.
- Do-not-change: unrelated existing user changes and UX3-4 evidence.
- Acceptance: tests, typecheck, lint, build, browser verification, and reviewer
  PASS; commit message `feat(ux): implement UX3-5 prioritized review fixes`.
- Verification: commands in `docs/DESIGN.md` and browser evidence in report.

## UX3-5 dependency order

```text
UX3-5-SPEC
  -> UX3-5-RECHECK
  -> UX3-5-CHART-STYLES + UX3-5-READING-GUIDE
  -> UX3-5-REPORT
  -> UX3-5-VERIFY -> reviewer -> commit/push
```

---

# UX3-1C historical implementation plan

Status: COMPLETE — code implemented; production provider configuration required

## Task graph

### UX3-1C-SPEC — Specification audit and resolution

- Status: DONE
- Objective: Audit the four UX3-1B source documents and current app against
  the current design entry, identify only implementation-significant
  ambiguity, and record resolutions in `docs/DESIGN.md` and
  `docs/SPEC_AUDIT.md`.
- Scope: documentation only.
- Dependencies: none.
- Do-not-change: product code, tests, provider configuration, Human Field Test
  status, and historical documents.
- Acceptance: two independent `spec_auditor` reports are collected, every
  legitimate question is resolved in project documents, and
  `docs/SPEC_AUDIT.md` ends with exactly `STATUS: CLEAR`.
- Verification: document review and `git diff --check`.

### UX3-1C-SCHEMA — Canonical schema and context boundary

- Status: DONE
- Objective: Implement the canonical `FeedbackSubmission`, bounded validation,
  allowlisted URL context builder, browser normalization, snapshot helpers,
  and unit tests.
- Files: `lib/feedback/feedbackSchema.ts`, `lib/feedback/context.ts`,
  `tests/feedbackSchema.test.ts`, `tests/feedbackContext.test.ts`.
- Dependencies: UX3-1C-SPEC.
- Do-not-change: existing URL/data contracts, chart logic, and provider code.
- Acceptance: all schema/context cases in the user brief pass; forbidden data
  is absent; no new dependency is required.
- Verification: targeted feedback tests and TypeScript.

### UX3-1C-PROVIDER — Server endpoint and Basin adapter

- Status: DONE
- Objective: Implement a server-only POST route with method/content/body
  checks, honeypot, canonical validation, generic failure mapping, and a
  provider-neutral Basin adapter with no secret in client code.
- Files: `app/api/feedback/route.ts`, `lib/feedback/provider.ts`,
  `tests/feedbackApi.test.ts`.
- Dependencies: UX3-1C-SCHEMA.
- Do-not-change: existing data-source and route contracts; no database,
  authentication, CAPTCHA, or new provider SDK.
- Acceptance: valid requests forward only canonical data; invalid,
  honeypot, missing env, 4xx, 5xx, timeout, and malformed responses never
  expose provider details or forward invalid payloads.
- Verification: mocked provider/API tests and TypeScript.

### UX3-1C-UI — Entry, route, form, and navigation preservation

- Status: DONE
- Objective: Implement responsive entry placement, `/feedback` page, form
  states, privacy copy, focus/live-region behavior, temporary context
  snapshot, and exact return URL preservation.
- Files: `app/layout.tsx`, `app/feedback/page.tsx`,
  `components/feedback/FeedbackEntry.tsx`,
  `components/feedback/FeedbackForm.tsx`, and focused feedback UI tests.
- Dependencies: UX3-1C-SCHEMA, UX3-1C-PROVIDER.
- Do-not-change: chart-first analysis workspace, rider sheet, Results,
  Lap Detail, global scroll/focus contracts, and mobile fixed-overlay rules.
- Acceptance: anonymous category+message submit, optional email, sending /
  success / error / retry, duplicate-click suppression, keyboard-only access,
  screen-reader announcements, and 320/390/desktop placement all work.
- Verification: UI tests, full tests, browser verification.

### UX3-1C-REPORT — Documentation and operational gate

- Status: DONE
- Objective: Create `docs/feedback/feedback-implementation-report.md` with
  architecture, schema, environment setup, privacy, retention procedure,
  browser evidence, reviews, known limitations, and deployment gate.
- Files: `docs/feedback/feedback-implementation-report.md`.
- Dependencies: UX3-1C-UI, UX3-1C-PROVIDER.
- Do-not-change: source-of-truth feedback decision documents except for
  contradiction records if required by audit.
- Acceptance: report distinguishes code-complete from production provider
  configuration and does not claim Human Field Test completion.
- Verification: document review.

### UX3-1C-VERIFY — Required checks, independent review, commit, and push

- Status: DONE
- Objective: Run all required automated/browser/security/privacy/UX checks,
  obtain reviewer PASS, then inspect, commit, and push intended changes.
- Dependencies: UX3-1C-REPORT.
- Do-not-change: secrets, unrelated worktree changes, and remote history.
- Acceptance: all applicable ACs pass, reviewer returns PASS, and normal push
  succeeds; if provider env is absent, final verdict is explicitly
  `UX3-1C IMPLEMENTATION COMPLETE — PRODUCTION CONFIG REQUIRED`.
- Verification: full command matrix plus browser evidence.

### UX3-1C-REV-1 — Honeypot client wiring

- Status: DONE
- Objective: Make the hidden honeypot value mutable to automated bot
  submission while keeping it out of normal keyboard and screen-reader flows,
  and include the actual value in the API request.
- Files: `components/feedback/FeedbackForm.tsx` and focused UI tests only.
- Dependencies: UX3-1C-UI.
- Do-not-change: canonical schema, provider contract, existing analysis UX,
  privacy policy, or Human Field Test status.
- Acceptance: a nonblank honeypot reaches the API as `website` and is accepted
  without a provider call; normal users cannot focus or see the field.
- Verification: focused UI/API tests, full required command matrix, and
  independent reviewer re-run.

## Execution order

```text
UX3-1C-SPEC
  -> UX3-1C-SCHEMA + UX3-1C-PROVIDER
  -> UX3-1C-UI
  -> UX3-1C-REPORT
  -> UX3-1C-VERIFY -> reviewer -> commit/push
```

# Historical implementation plans

Status: COMPLETE
Active implementation plan: None — Phase 2 Slice 8 is complete

Next planning gate: Phase 3 user-demand evidence; no implementation is
approved until a task-based user test or equivalent usage evidence is
available.

## Phase 2 Slice 8 task graph

### P2S8-1 - Pure metadata helpers and tests

- Status: DONE
- Objective: Add total timestamp formatting and safe collector source URL
  helpers with behavior tests.
- Scope: new `lib/raceMetadata.ts`, new `tests/raceMetadata.test.ts`.
- Dependencies: approved Slice 8 design and completed specification audit.
- Do-not-change: upstream types, fetch boundaries, React components, routes,
  and deployment configuration.
- Acceptance: valid JST formatting, invalid/empty timestamp fallback,
  encoded nonblank race IDs, and empty-ID link omission are tested.
- Verification: focused tests and full validation.

### P2S8-2 - Race header provenance and freshness UI

- Status: DONE
- Objective: Add the compact update/source/non-official metadata row to the
  existing race header.
- Scope: `components/RaceHeader.tsx` only.
- Dependencies: P2S8-1.
- Do-not-change: existing header summary, result table, analysis, loading/error,
  not-found, and chart behavior.
- Acceptance: valid and invalid metadata are understandable, the link is
  keyboard accessible and correctly labeled, and the row wraps at narrow
  widths without horizontal overflow.
- Verification: typecheck, lint, build, and browser smoke.

### P2S8-3 - Canonical documentation and closeout

- Status: DONE
- Objective: Record the shipped provenance boundary and verification evidence.
- Scope: `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/IMPLEMENTATION_PLAN.md`,
  `docs/SPEC_AUDIT.md`, and one dated history document.
- Dependencies: P2S8-1, P2S8-2, and verification.
- Do-not-change: historical documents, upstream contracts, and unrelated files.
- Acceptance: docs state that collector data is not claimed as official and
  `docs/SPEC_AUDIT.md` ends with exactly `STATUS: CLEAR`.
- Verification: documentation review and `git diff --check`.

### P2S8-4 - Full verification, independent review, commit, and push

- Status: DONE
- Objective: Run all required checks and browser smoke, obtain reviewer PASS,
  then commit and push the completed slice.
- Scope: tests, typecheck, lint, build, diff hygiene, browser smoke, reviewer,
  commit, and normal push.
- Dependencies: P2S8-3.
- Do-not-change: credentials, deployment configuration, historical docs, and
  unrelated user changes.
- Acceptance: all checks pass, reviewer returns `PASS`, and the commit reaches
  the configured upstream without force-pushing.

## Phase 2 Slice 8 verification evidence

- `npm.cmd test`: 54 tests passed.
- `npx.cmd tsc --noEmit`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed with Next.js 16.3.3/Turbopack.
- `git diff --check`: passed.
- Browser smoke on the local production-like dev page confirmed the JST
  metadata, exact collector GitHub href, visible non-official disclaimer, and
  unchanged not-found screen. The implementation smoke also covered desktop,
  320px, and 390px wrapping; the independent reviewer recorded that fixed
  viewport screenshots were not captured, leaving only a non-blocking visual
  verification risk.
- Independent reviewer result: `PASS`.

## Slice 8 execution order

```text
two spec auditors -> specification resolution -> P2S8-1 -> P2S8-2
  -> P2S8-3 -> P2S8-4
```

## Slice 8 resolved design decisions

- Use the existing `RaceResult.updatedAt`, displayed as collector data update
  time in JST as zero-padded `YYYY/MM/DD HH:mm JST` (no seconds or weekday).
  Never label it official publication time.
- Trim runtime timestamp input and accept parser-compatible finite dates,
  including the collector's UTC ISO 8601 and offset-based values. Render
  `更新日時不明` for empty/whitespace-only, malformed, non-date, and
  out-of-range values.
- Link only to the matching public collector GitHub JSON file. Do not invent
  organizer result URLs or add a new upstream field.
- Always show a text disclaimer that the viewer displays collected data, not an
  official result. Invalid time is explicit unknown text; empty race IDs have
  no link.
- Trim nonblank race IDs before encoding them as one path segment. Use a
  same-tab link labeled `取得元データ (GitHub)` with visible keyboard focus.
- Keep the existing RaceHeader title/category/count row and add only a
  full-width wrapping metadata row inside the sticky header. Render it only
  for an already successful race; loading/error/not-found/analysis-unavailable
  branches and all table/chart/route/fetch/data-contract behavior remain
  unchanged.

## Phase 2 Slice 7 task graph

### P2S7-1 - Pure URL contract and tests

- Status: DONE
- Objective: Add total parsing, normalization, serialization, and query-update
  helpers for Home filters and race analysis state.
- Scope: new `lib/urlState.ts`, new `tests/urlState.test.ts`.
- Dependencies: specification audit clear.
- Do-not-change: React components, upstream types, route structure, data
  fetching, and comparison semantics.
- Acceptance: defaults, allowlists, repeated fixed IDs, dedupe/caps,
  positive-integer laps, invalid fallback, context parameters, and unknown
  query preservation are behavior-tested.
- Verification: focused tests and full validation.

### P2S7-2 - Home URL synchronization

- Status: DONE
- Objective: Restore and write season/series filters from the URL and carry
  valid list context into meet links.
- Scope: `components/MeetSelector.tsx`, `app/page.tsx` only if required by
  the client search-param boundary.
- Dependencies: P2S7-1.
- Do-not-change: meet data fetching, filtering semantics, list ordering, or
  loading/error UI.
- Acceptance: filter changes push canonical URLs, season changes clear series,
  reload/revisit/back-forward restore state, and invalid values are safe.
- Verification: typecheck, lint, build, and browser smoke.

### P2S7-3 - Race URL synchronization and controlled chart state

- Status: DONE
- Objective: Restore and write category, rider, comparison, fixed IDs, active
  tab, and deliberate pinned lap state while preserving existing UI behavior.
- Scope: `components/RaceViewer.tsx`, `components/ChartTabs.tsx`.
- Dependencies: P2S7-1; P2S7-2 is independent and may be complete first.
- Do-not-change: chart formulas, data transforms, route/error behavior,
  comparison hook contracts, or upstream JSON contracts.
- Acceptance: state is shareable and reloadable, category changes clear the
  specified state, back/forward restores meaningful states, hover is not
  serialized, and all existing limits/reconciliation remain authoritative.
- Verification: typecheck, lint, build, and browser smoke.

### P2S7-4 - Canonical documentation and closeout

- Status: DONE
- Objective: Record the shipped URL contract, compatibility behavior, and
  verification evidence in canonical docs and a dated history document.
- Scope: `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/IMPLEMENTATION_PLAN.md`,
  `docs/SPEC_AUDIT.md`, and one new dated history document.
- Dependencies: P2S7-1 through P2S7-3 and verification.
- Do-not-change: historical documents, deployment settings, or unrelated
  worktree files.
- Acceptance: canonical docs match the implementation and
  `docs/SPEC_AUDIT.md` ends with exactly `STATUS: CLEAR`.
- Verification: documentation review and `git diff --check`.

### P2S7-5 - Full verification and independent review

- Status: DONE
- Objective: Run all required checks, browser smoke, bounded revisions, and
  independent review, then commit and push the completed slice.
- Scope: tests, typecheck, lint, build, diff hygiene, browser smoke, reviewer,
  commit, and push.
- Dependencies: P2S7-4.
- Do-not-change: credentials, deployment configuration, historical docs, and
  unrelated user changes.
- Acceptance: all required checks pass, reviewer returns `PASS`, and the
  completed Slice 7 commit is pushed to the configured upstream.

## Phase 2 Slice 7 verification evidence

- Automated checks passed on 2026-09-05: `npm.cmd test` (48/48),
  `npx.cmd tsc --noEmit`, `npm.cmd run lint`, `npm.cmd run build`, and
  `git diff --check`.
- Local browser smoke passed for Home filter URL restoration and context links,
  shareable rider/tab/lap state, category reset, invalid/stale values with
  repeated unknown parameters, normal race data, a 6-rider DNF category, a
  68-rider category, a DNF rider, a lapped finished rider, and not-found.
- Narrow-screen behavior remains covered by the existing Slice 4 responsive
  smoke and unchanged layout boundaries; this slice adds only URL state and
  controlled chart wiring.

## Slice 7 execution order

```text
two spec auditors -> specification resolution -> P2S7-1 and P2S7-2
  -> P2S7-3 -> P2S7-4 -> P2S7-5
```

## Slice 7 resolved design decisions

- Use readable `URLSearchParams` state. Home uses `season` and `series`; race
  uses `category`, `rider`, `compare`, repeated `fixed`, `tab`, and `lap`.
  Race links may carry matching Home season/series as return context.
- Parse synchronously with `useSearchParams`. Resolve category against the
  server-loaded meet before the first race fetch. Do not rewrite Home or
  race-dependent values while their data is loading or in error; normalize
  them after successful data is available.
- Use a two-phase pure helper API: raw parsing is total and data-independent;
  normalization validates against the available meet/race snapshot and
  produces the canonical state. No fetch or React state belongs in the helper.
- Default values are omitted. Known query keys serialize as season, series,
  category, rider, compare, fixed (repeated), tab, lap; unknown repeated pairs
  are preserved in relative order after known keys.
- Every deliberate filter, selection, mode, fixed, tab, and lap action uses
  one `push`; canonical cleanup uses `replace`. Hover never writes the URL.
- Category changes clear rider/fixed/tab/lap and restore comparison `2`.
  Primary changes remove the selected ID from fixed IDs in that same entry.
  Tab changes preserve a valid pinned lap. Pinned mode with no fixed IDs stays
  pinned and keeps the existing no-comparison state.
- Primary IDs may refer to any existing rider, preserving unavailable states;
  fixed IDs must be graphable, non-primary, unique, and capped at four. `all`
  over the existing graphable limit falls back to omitted default `2`.
- A valid lap is normalized against the race axis even without a valid primary.
  An invalid lap is removed and falls back to an unpinned first lap; an empty
  axis removes it and leaves active/pinned state null. Back links carry only
  the first present season/series context values matching the current meet;
  a global series context may omit season, while stale context links to `/`.

## Phase 2 Slice 5 task graph

### P2S5-1 — Pure chart-detail transform and tests

- Status: DONE
- Objective: Return exact per-rider detail for one lap using the existing
  checkpoint/timed-lap validity rules and gap/pace signs.
- Scope: `lib/dataTransform.ts`, `tests/dataTransform.test.ts`.
- Dependencies: specification audit clear.
- Do-not-change: upstream types, route/error behavior, comparison selection,
  existing series builders, and unrelated worktree files.
- Acceptance: rank/checkpoint, lap/timed-lap, cumulative-gap, and pace values
  are sparse; missing/duplicate/invalid values are null; primary difference
  baseline is only emitted when its metric is valid; ranks are same-lap.
- Verification: focused tests and full validation.

### P2S5-2 — Shared detail panel and lap navigation

- Status: DONE
- Objective: Add a stable below-chart panel with native selector,
  previous/next controls, clear pin action, readable values, role labels, and
  mobile-safe wrapping.
- Scope: new `components/ChartDetailPanel.tsx`.
- Dependencies: P2S5-1.
- Do-not-change: chart data builders, route states, or upstream contracts.
- Acceptance: the same panel supports keyboard selection and displays explicit
  `未計測` without relying on color; controls are focus-visible and 44px.
- Verification: typecheck, lint, browser smoke at 320px/390px.

### P2S5-3 — Chart interaction integration

- Status: DONE
- Objective: Connect shared active/pinned lap state to all four charts. Hover
  updates, click/tap pins, and an active-lap marker reinforces the selected
  point while existing tooltips remain intact.
- Scope: `components/ChartTabs.tsx`, `components/RankBumpChart.tsx`,
  `components/GapChart.tsx`, `components/PaceChart.tsx`,
  `components/LapTimeChart.tsx`.
- Dependencies: P2S5-1 and P2S5-2.
- Do-not-change: line types, sparse data, role styles, comparison modes, or
  chart formulas.
- Acceptance: switching tabs preserves valid lap selection, chart hover/tap
  reaches the same panel detail, and no chart interaction removes the
  keyboard path.
- Verification: full validation and browser smoke.

### P2S5-4 — Product documentation and closeout

- Status: DONE
- Objective: Record the persistent chart-detail contract and close the slice.
- Scope: `docs/PRODUCT.md`, `docs/DESIGN.md`,
  `docs/IMPLEMENTATION_PLAN.md`, `docs/SPEC_AUDIT.md`.
- Dependencies: P2S5-1 through P2S5-3 and reviewer PASS.
- Do-not-change: historical docs, deployment settings, or unrelated changes.
- Acceptance: canonical docs describe shipped behavior and
  `docs/SPEC_AUDIT.md` ends exactly with `STATUS: CLEAR`.
- Verification: documentation review and `git diff --check`.

### P2S5-5 — Verification, browser smoke, and independent review

- Status: DONE
- Objective: Run required checks, verify responsive interaction, obtain
  independent PASS, then commit and push only intended changes.
- Scope: tests, typecheck, lint, build, diff hygiene, browser smoke, review,
  bounded revisions, Git handoff.
- Dependencies: P2S5-1 through P2S5-4.
- Do-not-change: credentials, deployment configuration, historical assets, or
  unrelated user changes.
- Acceptance: every required check passes and reviewer returns `PASS`.

Execution order:

```text
two spec auditors -> specification resolution -> P2S5-1
  -> P2S5-2 -> P2S5-3 -> P2S5-4 -> P2S5-5
```

### Resolved design decisions

- The panel is shared by all chart tabs and is always placed immediately
  below the active chart; it is not a second chart or a mobile-only duplicate.
- Hover changes the unpinned active lap. Chart click/tap and panel keyboard
  actions pin the lap. The clear action unpins without changing the data
  semantics.
- Native select plus previous/next buttons is the keyboard/touch mechanism;
  raw SVG dots are not made independently focusable.
- The panel renders comparison riders in the same reconciled order and uses
  the current role labels. All mode may use a vertically scrollable value list.
- `raceLapNumbers[0]` is the only first-lap fallback. An empty axis has no
  selected lap. Chart-level events use only the Recharts active axis
  index/payload; empty-area events are ignored, but a valid axis lap may be
  pinned even when every rider value is missing.
- Gap/pace always render a display-only primary row first. It is `±0` only
  when the primary metric is valid; otherwise it is `未計測` and is never
  added to the chart payload. With no comparison riders the value area says
  `比較対象なし` while the lap controls remain available.
- `ChartDetailPanel` uses `min-h-[13rem]` and a fixed bounded value-list area
  so its outer height remains stable for the same tab/mode. Existing status
  cards remain authoritative for DNF/lapped wording; the panel uses
  `未計測` for unavailable values.
- No URL synchronization is included in this slice.

## Baseline

Phase 2 Slice 1 fixed comparison, Slice 2 role-based chart styling, and Slice
3 time-difference analysis are complete on remote `main`. Slice 4 adds the
measured lap table and compact lap statistics described in `docs/DESIGN.md`.

## Task graph

### P2S3-1 — Difference semantics and regression tests

- Status: DONE
- Objective: Give cumulative and per-lap difference builders explicit,
  tested semantics and same-lap sparse behavior.
- Scope: `lib/dataTransform.ts`, `tests/dataTransform.test.ts`.
- Dependencies: specification audit clear.
- Do-not-change: upstream types/contracts, comparison selection, route/error
  behavior, and unrelated dirty-worktree files.
- Acceptance: sign meaning, same-lap joins over the retained union lap axis,
  valid-timed-lap gate, missing primary/target values, DNF/lapped edges, and
  compatibility are covered.
- Verification: focused tests and full validation.

### P2S3-2 — Same-lap rank detail in shared tooltip

- Status: DONE
- Objective: Extend the existing role-aware tooltip with measured rank detail
  for primary/fixed riders at the hovered lap.
- Scope: `components/RoleAwareTooltip.tsx`, `components/GapChart.tsx`,
  `components/PaceChart.tsx`.
- Dependencies: valid lap-map contract from P2S3-1.
- Do-not-change: context aggregation rules, sparse payload filtering, line
  interpolation, or chart selection state.
- Acceptance: checkpoint ranks are used for cumulative gap, timed-lap ranks
  for per-lap difference, ranks appear only with emitted metric values,
  context remains a current-point metric summary, and the tooltip wraps safely
  on mobile.
- Verification: typecheck, lint, focused tests, and browser smoke.

### P2S3-3 — Difference chart vocabulary and visible sign guidance

- Status: DONE
- Objective: Make the existing difference tabs and supporting copy explain
  cumulative versus per-lap meaning and positive/negative direction.
- Scope: `components/ChartTabs.tsx`, `components/GapChart.tsx`,
  `components/PaceChart.tsx`.
- Dependencies: tooltip API complete.
- Do-not-change: rank/lap chart meaning, role styles, `linear` lines,
  `connectNulls={false}`, or comparison behavior.
- Acceptance: user-facing labels are distinct, selected rider is explicitly
  the zero reference, and sign explanations are visible without relying on
  color.
- Verification: full validation and browser smoke at desktop/mobile widths.

### P2S3-4 — Product documentation and closeout

- Status: DONE
- Objective: Record the implemented difference semantics and Slice 4 boundary
  in canonical product documentation.
- Scope: `docs/PRODUCT.md` and this plan.
- Dependencies: implementation behavior verified.
- Do-not-change: historical docs, release history, deployment settings, or
  unrelated Autobuild files.
- Acceptance: docs describe formulas, signs, sparse behavior, and deferred
  lap-table scope accurately.
- Verification: documentation review and `git diff --check`.

### P2S3-5 — Verification and independent review

- Status: DONE
- Objective: Run required checks, browser smoke, independent review, and
  commit/push only the approved Slice 3 files.
- Scope: tests, typecheck, lint, build, diff hygiene, browser smoke, reviewer,
  bounded revisions, and Git handoff.
- Dependencies: all implementation tasks complete.
- Do-not-change: unrelated worktree changes, credentials, deployment
  configuration, and historical documents.
- Acceptance: every required check passes and reviewer returns `PASS`.

## Execution order

```text
two spec auditors -> specification resolution -> P2S3-1
  -> P2S3-2 -> P2S3-3 -> P2S3-4 -> P2S3-5
```

No parallel worker may edit the same source file as another worker.

## Resolved design decisions

- Slice 3 uses the existing `gap` and `pace` chart paths; it does not add a
  new chart or a lap table.
- User-facing `gap` becomes `タイム差` for cumulative difference, and
  user-facing `pace` becomes `周回差` for per-lap difference.
- Positive cumulative difference means the comparison rider is behind at that
  lap; positive per-lap difference means the comparison rider was slower on
  that lap. The selected rider is always the zero reference.
- The union lap axis is retained, but missing values are omitted per rider.
  Same-lap `rankAtLap` is shown only when the corresponding finite metric
  record exists: checkpoint records for cumulative gap and timed-lap records
  for per-lap difference. Context ranks are not aggregated or inferred.
- Existing `buildGapSeries`, `buildPaceDeltaSeries`, and `GapSeriesPoint`
  exports retain their signatures and sparse shape; semantic clarification
  does not change an external contract.
- DNF/lapped status remains represented by existing result/summary behavior;
  Slice 3 adds no chart status label. Slice 4 owns lap-table/statistics UI and
  reusable lap-statistics transforms, but may consume this tooltip contract.
- Existing role styling, context summaries, sparse values, line types, and
  comparison modes remain unchanged.
- Slice 4 will separately address lap tables and fastest/average/max-loss
  summaries after this semantic layer is stable.

## Phase 2 Slice 4 task graph

### P2S4-1 — Lap transform contract and regression tests

- Status: DONE
- Objective: Add pure, reusable transforms for measured lap rows, fastest
  lap, arithmetic average, and maximum primary loss to a fixed rider.
- Scope: `lib/dataTransform.ts`, `tests/dataTransform.test.ts`.
- Dependencies: specification audit clear; Slice 3 transform semantics.
- Do-not-change: upstream types, existing result classification, chart series
  signatures, comparison state, and missing-data rules.
- Acceptance: valid-timed-lap filtering, earliest tie rules, sparse matching
  comparison deltas, positive loss selection, DNF/lapped, duplicates, and
  missing values are covered by behavior-focused tests.
- Verification: focused tests, full validation.

### P2S4-2 — Compact lap statistics surface

- Status: DONE
- Objective: Render fastest-lap, average-lap, and pinned maximum-loss
  summaries using the transform contract.
- Scope: new `components/LapSummaryCard.tsx`, `components/RaceViewer.tsx`.
- Dependencies: P2S4-1.
- Do-not-change: existing `SummaryCard` status meanings, comparison controls,
  chart selection, or route/error states.
- Acceptance: selected rider statistics appear only with valid measured laps;
  fixed-mode loss identifies rider/lap; numeric/all modes omit the loss item;
  empty and unavailable states remain understandable.
- Verification: typecheck, lint, browser smoke at desktop/mobile widths.

### P2S4-3 — Responsive measured lap table

- Status: DONE
- Objective: Add an accessible numeric table that exposes selected-lap
  metrics and optional fixed-rider per-lap differences.
- Scope: new `components/LapDetailTable.tsx`, `components/RaceViewer.tsx`.
- Dependencies: P2S4-1; P2S4-2 may share the same integration edit.
- Do-not-change: existing chart data, tooltip behavior, or result table
  layout outside the analysis region.
- Acceptance: desktop columns and mobile labeled rows show identical measured
  values; pinned columns are sparse; long labels wrap; no page overflow; no
  color-only meaning.
- Verification: typecheck, lint, production build, browser smoke at 320px,
  390px, and desktop widths.

### P2S4-4 — Canonical documentation and closeout

- Status: DONE
- Objective: Record the Slice 4 behavior and closeout evidence in the
  canonical product documents without rewriting historical records.
- Scope: `docs/DESIGN.md`, `docs/PRODUCT.md`,
  `docs/IMPLEMENTATION_PLAN.md`, `docs/SPEC_AUDIT.md`.
- Dependencies: P2S4-1 through P2S4-3 verified.
- Do-not-change: historical docs, release/deployment settings, and unrelated
  worktree files.
- Acceptance: formulas, sparse behavior, responsive presentation, and
  validation evidence match the implementation; `SPEC_AUDIT.md` ends with
  exactly `STATUS: CLEAR`.
- Verification: documentation review and `git diff --check`.

### P2S4-5 — Verification and independent review

- Status: DONE
- Objective: Run required checks, browser smoke, independent review, and the
  normal commit/push handoff for Slice 4.
- Scope: tests, typecheck, lint, build, diff hygiene, browser smoke, bounded
  revisions, reviewer, commit, and push.
- Dependencies: P2S4-4.
- Do-not-change: credentials, deployment configuration, historical documents,
  and unrelated user changes.
- Acceptance: all required checks pass, reviewer returns `PASS`, and the
  completed Slice 4 commit is pushed to the configured upstream.

## Slice 4 execution order

```text
two spec auditors -> specification resolution -> P2S4-1
  -> P2S4-2 -> P2S4-3 -> P2S4-4 -> P2S4-5
```

## Slice 4 resolved design decisions

- The lap table is selected-rider-first and uses `getValidTimedLaps`; it does
  not synthesize missing laps or convert checkpoint-only records to timed
  rows.
- Fastest is the minimum measured lap with earliest-lap tie breaking. Average
  is the arithmetic mean of all measured timed laps.
- Only pinned fixed riders receive comparison columns. Their displayed delta
  keeps the existing `fixed - primary` sign convention; maximum loss uses
  `primary - fixed` and requires a positive result.
- A DNF or lapped rider can show the valid measured rows before the boundary,
  while the existing result summary remains the status authority.
- Mobile uses stacked labeled rows rather than requiring horizontal scrolling.
- The DNF boundary is the greatest lap number in the rider's valid checkpoint
  set; malformed records outside that set are ignored rather than treated as
  a new status event.
- Lap/cumulative/average values use `formatSecToClock`, and signed deltas and
  losses use `formatGapSec`; all calculations and tie-breaking use raw finite
  seconds before display rounding.
- When checkpoints exist but no valid timed laps exist, charts and the
  existing status card remain available and the new table shows an explicit
  empty state with no fastest/average values.
- Every reconciled fixed rider receives a sparse table column in rendered
  comparison order, including an all-blank column when no matching lap exists;
  stale IDs are excluded by the existing comparison reconciliation. Maximum
  loss ties prefer the earliest `lapNumber`; if tied on the same lap, they
  prefer the fixed-rider order supplied to the table.
- The table uses one `role="table"` DOM representation that switches to a
  labeled grid layout on narrow screens. The summary is placed after
  `SummaryCard` on the left; the table is above charts on the right.

## UX redesign audit v2 — implementation plan

This plan is the bounded follow-up to the documentation-only audit in
`docs/ux-redesign-spec-v2.md`. UX2-1 and UX2-2 are complete and UX2-3 is the
active implementation slice. UX2-4 and UX2-5 remain gated by their stated
dependencies.

### UX2-1 — Workspace state and scroll intent

- Status: DONE (2026-09-05; reviewer PASS)
- Objective: Derive `browse`/`analyze` from the existing rider URL state and
  separate same-analysis scroll-preserving actions from category/new-route
  navigation.
- Scope: `components/RaceViewer.tsx`, workspace wrapper, focus/scroll intent;
  preserve `lib/urlState.ts` contract.
- Dependencies: UX redesign spec v2; no new dependency.
- Do not change: upstream types, data semantics, chart formulas, error/not-found
  boundaries, or public routes.
- Acceptance: rider/comparison/tab/lap actions do not force page top; category
  change clears dependents and may start at top; direct/deep-link and
  back/forward behavior follows the state table.
- Verification: focused tests, typecheck, browser scroll/focus smoke.

### UX2-2 — Chart-first workspace composition

- Status: DONE (2026-09-06; reviewer PASS)
- Objective: Make the active workspace render context/status, `ChartTabs`, then
  `LapDetailTable`, with full results collapsed to an explicit on-demand surface.
- Scope: `RaceViewer.tsx`, new `AnalysisContextBar.tsx`,
  `RiderSelector.tsx`, Desktop-only result summary disclosure, Desktop ordering
  and workspace containers; preserve `ChartTabs.tsx` and `LapDetailTable.tsx`
  value/data behavior.
- Dependencies: UX2-1.
- Do not change: chart data, chart tabs, sparse values, DNF/lapped meaning, or
  detail-table value contracts.
- Acceptance: valid active rider shows context, chart tabs, and a meaningful
  plot frame in the initial 1440×900 and 1280×720 Desktop viewport; full
  results remain keyboard-reachable through an explicit disclosure; UX2-1 and
  pre-UX2-3 mobile behavior remain intact.
- Verification: existing tests, build, browser smoke at 1440×900/1280×720.

#### UX2-2 resolved implementation tasks

1. Add a presentation-only `AnalysisContextBar` with text labels for all
   active context values; keep `RaceViewer` as the state owner.
2. Add a Desktop-only native results disclosure after the active workspace;
   preserve the full browse/mobile result surface and its existing bounded
   list scroll.
3. Render the Desktop active workspace with a 280–320px visual-left control
   rail and a primary chart column; keep `ChartTabs` before `LapDetailTable` in
   the primary reading order.
4. Close the full rider list when browse selection enters analysis while
   retaining search, keyboard targets, and UX2-1 trigger focus behavior.
5. Verify at `lg` boundary and 1440×900/1280×720/390×844/320×568 without
   modifying URL keys, history semantics, chart/data transforms, or mobile
   sheet/header behavior.

### UX2-3 — Responsive compact controls

- Status: DONE (2026-09-06; independent reviewer PASS)
- Objective: Make active Mobile analysis chart-first while keeping current
  context visible and moving low-frequency rider selection into an accessible
  native bottom sheet and comparison choices into a native disclosure.
- Scope: `RaceViewer.tsx`, `RiderSelector.tsx`, `ChartTabs.tsx`, a Mobile
  comparison disclosure/presentation helper, responsive workspace styles,
  focused tests, and UX2-3 report documentation.
- Dependencies: UX2-2; coordinate with UX2-2 without parallel edits to the
  same integration file.
- Do not change: URL keys/history semantics, chart/data/result calculations,
  graphable/all limit, four fixed-rider limit, Desktop UX2-2 branch, or page
  scroll ownership.
- Acceptance: browse remains results-first; active Mobile is context → compact
  controls → chart → existing supporting content → one closed results
  disclosure; rider sheet and comparison disclosure preserve focus/scroll,
  keyboard, long-name, safe-area, and virtual-keyboard behavior at 390px/320px.
- Verification: full tests, new presentation/sheet tests, typecheck, lint,
  production build, diff check, keyboard/touch browser smoke, screenshots at
  both mobile sizes, and Desktop regression smoke.

#### UX2-3 resolved implementation tasks

1. Extend the presentation classifier so browse remains full-result-first,
   active Mobile mounts one closed results disclosure after the workspace, and
   active Desktop remains the UX2-2 disclosure branch.
2. Add the compact Mobile context/action row and native modal rider sheet;
   reuse existing rider search/filter/selection semantics and return focus to
   the trigger without URL or scroll workarounds.
3. Add the native Mobile comparison disclosure while preserving existing
   comparison callbacks, pinned IDs, all-mode guard, labels, and 44px targets.
4. Render active Mobile chart-first with explicit DOM order; keep existing
   SummaryCard, LapSummaryCard, LapDetailTable, error, and unavailable meaning.
5. Verify the 1024px boundary, 390px/320px overflow and keyboard states,
   repeated analysis, UX2-1, and UX2-2 Desktop regressions.

### UX2-4 — Results / Lap Detail / supporting information hierarchy

- Status: DONE (2026-09-06; independent reviewer PASS)
- Objective: Apply progressive disclosure to supporting Results and Lap Detail
  while keeping chart/context primary and preserving all existing information.
- Scope: `components/RaceViewer.tsx`, new presentation-only Lap Detail
  disclosure, pure supporting-label helper/tests, UX2-4 report, and browser
  verification. No data-transform or URL-writer changes.
- Dependencies: UX2-2, UX2-3.
- Do not change: chart calculations, `LapDetailTable` values/semantics,
  `RaceResultsTable` data/status semantics, URL keys/history, existing error
  kinds, upstream/collector contract, mobile rider/comparison architecture,
  or production dependencies.
- Acceptance: active Results and Lap Detail are discoverable closed disclosures;
  existing tables remain fully usable when open; no chart competition, page-top
  reset, table/status/accessibility regression, or page horizontal overflow.
- Verification: full tests plus focused UX2-4 tests, typecheck, lint, build,
  diff check, CUA browser smoke at Desktop/Mobile targets, and independent
  reviewer PASS.

#### UX2-4 implementation task graph

1. **UX2-4-A — Presentation primitive and labels** — DONE. Own
   `components/LapDetailDisclosure.tsx`, `lib/supportingPresentation.ts`, and
   focused tests. Depend on the resolved disclosure contract. Do not edit
   `RaceViewer.tsx` or data transforms.
2. **UX2-4-B — RaceViewer integration** — DONE. Own only
   `components/RaceViewer.tsx`; wire controlled local disclosure state,
   count-bearing Results summaries, and explicit Results rider return behavior.
   Do not change URL helpers or chart/table internals.
3. **UX2-4-C — Documentation and verification** — DONE. Own
   `docs/ux2-4-information-hierarchy-report.md` and verification evidence;
   run required checks and browser matrix. Do not change product code.

### UX2-5 — Full verification, user test, review, and closeout

- Status: COMPLETE (2026-09-06 recovery closeout)
- Objective: Run the integrated fresh-user, production, responsive,
  accessibility, URL/history, recovery, and regression gate for UX2-1–UX2-4.
- Scope: tests/typecheck/lint/build, `git diff --check`, public production
  smoke, task metrics, bounded P0/P1 fixes only, independent usability and
  technical review, final report, and UX3 backlog handoff.
- Dependencies: UX2-4.
- Acceptance: all required checks pass, reviewer returns PASS, and Task 1–5
  show improved Time to Insight without regression of existing semantics.
- Verification: project required commands plus the v2 user-test protocol.

Final acceptance override: AC1–AC21 from the UX2-5 task brief are individually
reported. `RELEASE READY` requires all 21 PASS, zero P0/P1 findings, required
automated checks PASS, both independent reviewers PASS, and final production
verification PASS.

#### UX2-5 bounded task graph

1. **UX2-5-A — Specification audit and resolution** — DONE. Two independent
   auditors reviewed the source-of-truth documents and current implementation;
   decisions are recorded in `docs/SPEC_AUDIT.md`, which ends in
   `STATUS: CLEAR`. Recovery resolutions preserve the historical
   `revision_cycles=4/3` state, reuse the unchanged usability PASS, require a
   fresh technical PASS, and define the post-push evidence required for AC21.
2. **UX2-5-B — Integrated production and fresh-user verification** — DONE.
   Operate the public alias and collect task, accessibility, responsive,
   recovery, URL/history, and regression evidence. Product-code changes are
   allowed only for observed P0/P1 or small low-risk blocking defects.
3. **UX2-5-C — Final evidence and backlog** — IN PROGRESS. Write
   `docs/ux2-5-final-validation-report.md` and, for non-blocking future work,
   `docs/ux3-backlog.md`; preserve historical reports. The human-authorized
   recovery is a single bounded continuation and does not reset revision
   history.
4. **UX2-5-D — Required validation and independent review** — READY. Run the
   project checks and obtain the recorded usability-first PASS plus a fresh
   technical reviewer PASS before commit/push. The post-push public smoke is
   then required for AC21.

Recovery closeout supersedes the intermediate graph labels above: UX2-5-C
and UX2-5-D are DONE after the final report, validation, technical review,
commit/push, and public production smoke. The historical intermediate labels
are retained as an audit trail rather than rewritten.

#### UX2-5 no-change boundary

No UX2-5 implementation may add a feature, route, URL key, dependency, data
field, chart formula, or UX3-scale layout. The existing Vercel production
deployment is verified separately from local checks; unavailable browser
instrumentation is recorded as a limitation, not silently substituted with
an assertion.

### Future execution order

```text
UX2-1 -> UX2-2 -> UX2-3 -> UX2-4 -> UX2-5
```

## UX3-7 — Consolidated pre-release remediation

Status: IN PROGRESS. This plan supersedes the historical UX3-6 recommendation
to wait for External Human evidence. Participants remain zero and the fact is
recorded, but it is not a release blocker.

### Task graph

1. **UX3-7-S — specification audit and resolution** — DONE. Read the
   P-A-01 source, Astra/Sol/Terra source records, UX3-4/5/6 reports, and the
   current UI. Two independent `spec_auditor` agents must identify only
   implementation-significant ambiguity. Resolve all legitimate questions in
   `docs/DESIGN.md`, this plan, and `docs/SPEC_AUDIT.md`.
2. **UX3-7-A — analysis entry and control affordance** — DONE. Own
   `components/RaceViewer.tsx`, `components/AnalysisContextBar.tsx`,
   `components/RiderSelector.tsx`, `components/ComparisonAdjuster.tsx`,
   `components/ComparisonRiderPicker.tsx`, and their focused tests. Add the
   first graphable rider URL-replace default only when the raw URL lacks a
   `rider` key; sort by displayed final position and require valid graph data.
   Preserve explicit stale/non-graphable rider behavior, unknown query keys,
   history, focus, comparison limits, and metric semantics. Add named controls
   and compact comparison names without duplicating controls.
3. **UX3-7-B — chart identity and visibility** — DONE. Own
   `components/ChartTabs.tsx`, `RankBumpChart.tsx`, `GapChart.tsx`,
   `PaceChart.tsx`, `LapTimeChart.tsx`, `ChartDetailPanel.tsx`, and chart
   tests. Replace duplicate built-in legends with the shared accessible key,
   clarify selected-lap action/result copy, remove duplicate built-in legends,
   and set chart frames to `h-72 sm:h-[22rem] lg:h-[30rem]`. Do not alter
   chart data, metrics, tooltip semantics, or transforms.
   The shared series-style contract must also provide four distinct fixed and
   ten distinct numeric-context dash/marker assignments, and all four chart
   components must render the assigned marker shape in their dots. The primary
   rider keeps its dedicated solid circle style and does not consume fixed or
   context assignment capacity; fixed styles follow active-ID order and context
   styles follow displayed rider order after role classification.
4. **UX3-7-C — integration tests and report** — DONE. Own new or
   updated focused tests and `docs/user-testing/ux3-7-consolidated-pre-release-remediation.md`.
   Include the full decision matrix, source traceability, validation evidence,
   remaining severity counts, production smoke, and post-release human plan.
5. **UX3-7-V — required validation and browser verification** — IN PROGRESS.
   Run tests, typecheck, lint, build, diff check, local browser flow,
   responsive approximations/exact viewports where available, and
   accessibility checks. Start the independent `reviewer` only after all pass.
6. **UX3-7-R — bounded revision** — BLOCKED by reviewer. Convert each valid
   reviewer finding into a bounded implementer task, revalidate, and review
   again, with at most three cycles.
7. **UX3-7-P — commit, push, and production smoke** — BLOCKED by PASS. Stage
   only intended UX3-7 changes, commit normal history, push the configured
   upstream, verify the production deployment and smoke test, then mark the
   loop `DONE`.

### Boundaries and commands

No task may edit data contracts, collector behavior, production credentials,
deployment configuration, unrelated user changes, or historical UX3 source
files. The required commands are `npm test`, `npx tsc --noEmit`,
`npm run lint`, `npm run build`, and `git diff --check`; browser verification
uses the local dev server and the production alias when reachable.

## UX3-7R Owner Review Remediation REDO

The previous UX3-7 verdict remains historical. This plan treats the original
P-A-01 record as the primary acceptance source and requires visible screen
change, not implementation counts.

### Task graph

1. **UX3-7R-A — source and false-positive audit — READY**
   - Read the complete P-A-01 record and extract every negative or improvement
     answer with its exact question ID and answer.
   - Audit `28683845d05a43db5b61366dff5cfcc3a6959b31..30ee798a2dbc82f828fc0f28837c9663ee9bbd39`.
   - Reconcile Astra, Sol, Terra, UX3-4, UX3-5, UX3-6, and the old UX3-7
     report without overwriting historical docs.
   - Output: detailed finding inventory and design decisions in the UX3-7R
     report and current design/audit docs.

2. **UX3-7R-B — macro analysis layout — READY after A**
   - Restructure active analysis so the compact control/identity deck precedes
     a full-width primary chart, with summary/detail/results below.
   - Keep all state transitions, URL serialization, disclosures, and semantic
     data unchanged.

3. **UX3-7R-C — interaction and visual hierarchy polish — READY after A**
   - Make `MAIN RIDER`, change action, comparison identity, metric, series key,
     and Results action visually scannable in the new structure.
   - Preserve keyboard semantics and minimum target sizing.

4. **UX3-7R-D — behavior tests and exact viewport evidence — READY after B/C**
   - Add/update tests for observable structure and preserve regression tests.
   - Capture same-state Production-before and local/Production-after screenshots
     at all four exact viewport sizes using a temporary Playwright script or
     existing E2E tooling; visually inspect every pair.

5. **UX3-7R-E — fresh independent review — BLOCKED until D passes**
   - Run one fresh independent reviewer pass against the current screens and
     implementation, not prior verdicts. Multiple reviewer personas are not a
     UX3-7R3 release requirement.
   - Review P-A-01 acceptance matrix, regression protection, accessibility,
     and release risk.

6. **UX3-7R-F — validation, report, commit/push, Production — BLOCKED until E**
   - Run all required commands, write the new report, commit only intended
     UX3-7R changes, push normally, verify deployment and repeat smoke/visual
     checks against the production URL.

### Boundaries

Do not change the old UX3-7 report, unrelated user files, external data
contracts, deployment configuration, dependencies, or the product's URL and
metric semantics. A P-A-01 issue may not be deferred for lack of External
Human evidence. It may only remain unresolved with a concrete technical or
product-direction reason documented in the new report.

### Resolved implementation decisions

- Remove the active-analysis desktop two-column rail from the primary layout.
  Use a compact, full-width control/identity deck followed by the chart stage,
  then supporting detail and Results disclosure/table.
- Keep current rider and comparison summaries visible at all breakpoints;
  detailed pickers may remain in existing dialog/disclosure surfaces.
- Keep Results closed by default in analysis, but expose its action in the
  initial race/analysis context. The existing table remains the only result
  selection authority and no disclosure state is serialized in the URL.
- Use the explicit Before state: released Production alias, `MMJ-256-005`,
  `rider=KNS-000-4368`, rank tab, default `±2`, and no lap pin. Capture the
  same state at all required exact viewport sizes.
- Treat any P-A-01 complaint that remains materially visible as a failure;
  functional PASS, code change, or fresh synthetic PASS cannot override it.

## UX3-7R2 Final Owner Acceptance Closure

This is the active bounded implementation plan. Existing UX3-7R changes and
the old UX3-7R report/evidence are preserved as user-owned history. The plan
uses the source and decisions in the active UX3-7R2 section of `docs/DESIGN.md`.

### Task graph

1. **UX3-7R2-S — specification audit and resolution — IN_PROGRESS**
   - Spawn two independent `spec_auditor` agents.
   - Audit PRODUCT, DESIGN, this plan, SPEC_AUDIT, P-A-01, the UX3-7R report,
     and the current navigation/data/feedback/chart sources.
   - Resolve every implementation-significant question in the documents and
     finish SPEC_AUDIT with exactly `STATUS: CLEAR`.

2. **UX3-7R2-N — single sticky context navigation — BLOCKED until S**
   - Scope: `RaceHeader`, `RaceViewer`, navigation tests/docs.
   - Move the existing list link and category selector into the existing
     sticky header; preserve URL/history and mobile height constraints.
   - Do not alter chart/control-deck layout or add another sticky layer.

3. **UX3-7R2-D — rider-first discovery — BLOCKED until S**
   - Scope: `app/page.tsx`, new discovery component/route/helper/tests, and
     data-source-compatible docs.
   - Add opt-in cross-meet/category name/ID search backed by the existing raw
     race JSONs, bounded concurrency, warm-runtime TTL cache, explicit loading,
     empty, incomplete, and retryable error states, and direct deep links.
   - Do not change collector contracts, add a database, or fetch on initial
     page load.

4. **UX3-7R2-F — feedback placement and step explanation — BLOCKED until S**
   - Scope: feedback entry/layout, chart reading guide, focused tests/docs.
   - Make feedback discoverable on both Desktop and Mobile without a sticky
     obstruction; explain rank step semantics concisely without changing data.

5. **UX3-7R2-V — integration, exact viewport evidence, and functional flow —
   BLOCKED until N/D/F
   - Run test, typecheck, lint, build, diff check, and browser verification at
     1440×900, 1280×720, 390×844, and 320×568.
   - Save only new final evidence under `docs/user-testing/evidence/ux3-7r2/`.
   - Recheck the 30 protected CLEARLY CHANGED units, MR-01–03, POS-01–05, and
     all requested navigation, analysis, discovery, feedback, and URL flows.

6. **UX3-7R2-R — fresh independent final review — BLOCKED until V**
   - Spawn independent `reviewer` agents named Astra, Sol, and Terra without
     giving them the prior classification or verdict.
   - Each returns only `PASS` or `NEEDS_REVISION`, plus required findings and
     severity. S0/S1 and release-blocking S2 findings require bounded fixes.

7. **UX3-7R2-P — commit, push, Production, smoke — BLOCKED until R PASS**
   - Stage only intended UX3-7/UX3-7R2 code, tests, docs, and evidence.
   - Commit, push normal history, confirm the Vercel Production deployment
     points to the pushed SHA, and run Production smoke including discovery,
     sticky navigation, feedback, step explanation, and core analysis.

### UX3-7R2 revision 1 resolution

- The Q45 result-table search burden is closed with a local normalized
  name/ID filter in `RaceResultsTable`; rank order and row selection remain
  unchanged.
- Rider discovery appearances are collected without an early cap, then sorted
  by meet date descending, category order, and stable IDs before the six-item
  public cap. Network completion order cannot hide a newer appearance.
- Sticky navigation keeps only the compact return/category context rows fixed;
  race title, results, and provenance remain in normal flow to protect the
  narrow viewport.
- Series options are ordered by a local deterministic north-to-south sequence
  after season filtering, with `全日本` first and `もみじ` grouped in the
  中国 region. Raw series values and URL state remain unchanged; unknown
  values remain visible after the known sequence in code-point order.

### Verification commands

`npm test`; `npx tsc --noEmit`; `npm run lint`; `npm run build`; and
`git diff --check`. Browser verification must also cover the exact viewport
set and the complete flow from the UX3-7R2 request.

### Resolved specification details

- The eight units are Q12, Q69, Q22, Q45, Q68, Q27-A category affordance,
  Q27-B feedback affordance, and Q03 step meaning. Q03's initial-chart clause
  and Q27-A can be marked already `CLEARLY CHANGED` only with final evidence;
  they remain in the 38-unit matrix.
- Sticky navigation is a replacement inside the existing `RaceHeader`, not a
  second layer. It exposes `listHref` with only season/series context and the
  existing category selector; direct race links return to `/` and race query
  state is not copied to the list.
- Rider discovery uses a pure index-builder seam plus a Route Handler. The
  normalized query threshold is two Unicode code points; IDs and names use the
  existing NFKC/whitespace/lowercase normalization. The index is grouped by
  rider ID, scans unique race IDs with concurrency 24 and a 20-second budget,
  caches only a completed index for 10 minutes, returns 20 riders and six
  newest appearances per rider, and exposes complete/partial/503 contracts as
  written in DESIGN.md. Both data-quality states are searchable; the existing
  race page remains authoritative for analysis availability.
- The feedback action is rendered once as a non-sticky leading page utility;
  fixed desktop and mobile-footer variants are removed. Existing privacy,
  context snapshot, and return-path behavior remains.
- `stepAfter` and sparse measured values remain unchanged. The exact rank guide
  sentence is visible on the rank tab and present in its figure description.
- Existing dirty files are handled by patch-level staging. Unrelated feedback
  history, `test-results`, and unrelated UX3-2 input records are excluded.
- `RiderDiscoveryMatch` is public and exact: `riderId`, `name`, `dataQuality`,
  `totalAppearances`, and up to six newest `appearances` containing `meetId`,
  `meetName`, `meetDate`, `season`, `series`, `raceId`, `categoryId`, and
   `categoryName`. The response contains fields, not URLs; the client builds
   encoded links with the existing URL utilities.

### UX3-7R2 current closure status

The implementation, report, evidence, and automated validation tasks are
complete. The first independent final review round found and closed three
bounded issues: the Q45 current-results filter, deterministic newest
appearance ordering, and deterministic newest-appearance rider metadata. A
fresh final review round and the Production release gate remain the only open
tasks.

## UX3-7R3 bounded implementation plan

This plan is active for the Owner Human's 16 mandatory issues. Each issue is
tracked in the final report as `TODO` -> `IMPLEMENTED` -> `VERIFIED` and must
finish `PASS`. No UX3-8 work is allowed in this plan.

### Task graph

1. **UX3-7R3-S — specification audit — READY**
   - Two independent `spec_auditor` agents inspect PRODUCT.md, the active
     UX3-7R3 design section, this plan, SPEC_AUDIT.md, and relevant source.
   - They report only implementation-significant ambiguities or missed
     existing contracts; they do not edit code.

2. **UX3-7R3-DATA — official lap metadata and gap regression — BLOCKED until S**
   - Owner: viewer `lib/types.ts`, `lib/dataSource.ts`, `lib/dataTransform.ts`,
     `components/GapChart.tsx`, data tests; collector `lib/types.ts`,
     `lib/parseRaceHtml.ts`, parser tests, and only the two regenerated target
     JSON payloads if required.
   - Add optional validated `raceLapNumbers` from the official lap-table
     header, prefer it in the viewer without fabricating rider laps, preserve
     exact finite zero gap values, and add B-02/B-03/B-04 plus generalized
     DNF/lap-down and zero-value tests. For B-04, the source-backed
     KNS-256-011 P2 measured-lap gaps are the nonzero sequence `+0.9, +16,
     +20.6, +24.1, +27.5, +23.9, +4.9`; this target sequence is distinct from
     the generalized exact-zero regression. The viewer regression must also
     inspect the actual `GapChart`-generated Recharts `LineChart.props.data`
     payload, including P2 at lap 2.
   - Do not edit UI disclosure files, home routing, unrelated collector dirty
     files, or use race-ID conditionals.

3. **UX3-7R3-HOME — filters, scroll, and search alignment — BLOCKED until S**
   - Owner: `components/MeetSelector.tsx`, `components/RiderDiscovery.tsx`,
     and focused URL/UI regression tests.
   - Preserve season and series together, add `{ scroll: false }` to home
     query navigation, and align the rider-search form at desktop widths.
   - Do not edit race analysis/disclosure components or data transforms.

4. **UX3-7R3-DISCLOSURE — shared disclosure and analysis UI — BLOCKED until S**
   - Owner: new `components/Disclosure.tsx` plus
     `ChartDetailPanel.tsx`, `LapDetailDisclosure.tsx`,
     `RaceResultsTable.tsx`, `MobileComparisonDisclosure.tsx`,
     `AnalysisControlDeck.tsx`, `ComparisonRiderPicker.tsx`,
     `RiderSelector.tsx`, and `ChartTabs.tsx`.
   - Implement D-02 through D-10 and M-02 using the approved shared disclosure
     language, remove internal table scroll and obsolete skip/title UI, and
     preserve chart/result semantics and selected comparison state.
   - Do not edit home routing or data-source/transform files.

5. **UX3-7R3-INTEGRATION — report/evidence/verification — BLOCKED until
   DATA, HOME, and DISCLOSURE**
   - Reconcile code and tests, create the mandatory report and exact-viewport
     evidence, run the complete functional flow and data regressions, and
     record all 16 individual results plus MR/POS/S0--S4.

6. **UX3-7R3-REVIEW — independent release review — BLOCKED until
   INTEGRATION**
   - Spawn a fresh named `reviewer` and require a line-by-line review of all
     16 Owner IDs against DESIGN.md, actual implementation, automated tests,
     and evidence. `NEEDS_REVISION` creates bounded revision tasks and repeats
     validation/review within the protocol limit.

7. **UX3-7R3-RELEASE — commit, push, deploy, Production verification —
   BLOCKED until REVIEW PASS**
   - Inspect status/diff and stage only intended changes; commit and push normal
     history. Confirm Vercel deployment, run Production smoke including the
     required URLs/viewports, update the report/evidence, then commit/push the
     release evidence update if needed. Only then set the loop phase to DONE.
