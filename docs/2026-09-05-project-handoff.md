# AJOCC Lap Time Viewer — Project handoff

Date: 2026-09-05
Status: HANDOFF COMPLETE

This document preserves the current project state and the decision boundary
for the next session. The canonical product and design documents remain the
source of truth; this is a dated handoff record.

## Current completion

- Phase 1 production release is complete. The verified release is
  `bab760bea87c2dfc126b70559e375a721b68dd5a` at
  `https://ajocc-laptime-viewer.vercel.app/`; its Vercel production deployment
  was READY and reported the same `githubCommitSha`.
- Phase 2 Slices 1–8 are complete and pushed to `origin/main`.
- The latest completed feature/spike commit before this handoff is
  `16f9b8fe21a7e457176ee95fbee90730593fd135`; this handoff update is the next
  documentation-only commit.
- The worktree was clean at handoff.
- Phase 3-1 was completed as a read-only spike plus task comparison. No
  product code, dependency, route, data contract, or deployment setting was
  changed by the spike.

## Delivered product boundaries

- Home filters season and series; race pages preserve URL-addressable
  category, rider, comparison, fixed-rider, chart-tab, and deliberate lap
  state.
- Race analysis supports rank, cumulative time difference, per-lap difference,
  and measured lap views with sparse-data, DNF, lapped, duplicate, and
  unavailable-data semantics preserved.
- Chart detail is available below the active chart with hover/tap/keyboard
  paths, visible status/sign explanations, and narrow-screen-safe layout.
- Race headers show collector freshness as `YYYY/MM/DD HH:mm JST`, a public
  GitHub collector-file link, and the explicit non-official-result notice.
- Public routes, upstream JSON contracts, error kinds, not-found behavior, and
  the no-scraping viewer/data-source boundary remain unchanged.

## Verification and review history

- Slice 8 passed `npm.cmd test` (54 tests), `npx.cmd tsc --noEmit`,
  `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`; the
  independent reviewer returned `PASS`.
- Browser checks covered normal race metadata, the exact source href, the
  unchanged not-found screen, and the implementation's 320px/390px wrapping
  smoke. Fixed viewport screenshots were not captured by the independent
  reviewer; this remains a non-blocking visual verification limitation.
- Phase 3-1 used race `27749` (`CXK-256-004`) with the winner and ±2 context,
  and also checked the DNF rider and the no-comparison state. For the winner,
  second-place cumulative gap changed from approximately `-21.7s` at lap 1 to
  `+101.6s` at lap 9; the third-place gap changed from `-18.8s` to
  `+112.8s`.
- The task comparison found that `タイム差` is the direct view for “when did
  the gap open?”, while `順位` is the more resilient entry for “who was ahead
  each lap?”, no-comparison states, and partial DNF data.

## Current decision

Keep `順位` as the initial chart. Treat `タイム差` as the deliberate next
analysis action. Do not start a Phase 3 chart-default implementation from the
current evidence: the repository has no usage telemetry or real-user test
results.

## Next-session options

The options below are ordered by evidence value and product risk.

### Option A — Recommended: small task-based user test

Test the current rank-first flow against a time-difference-first prototype or
scripted alternate view. Use normal finished, close, and DNF/lapped examples.
Measure time-to-answer and interpretation errors for “who was ahead on each
lap?” and “on which lap did the gap open?”. This can decide whether a default
change is warranted without committing to an experiment in production.

### Option B — Add privacy-reviewed usage evidence

If real user testing is unavailable, design minimal, privacy-conscious
measurement for chart-tab selection and comparison-state usage. This requires
an explicit product/privacy decision, instrumentation design, and a separate
implementation/review cycle. Do not add analytics implicitly.

### Option C — Explore Phase 3-2 group distribution

Prototype median/interquartile context for large “all riders” views only if
users show a need for group-level race shape. Preserve individual measured
series and compare comprehension against the current context lines.

### Option D — Explore Phase 3-3 similar-pace recommendations

Investigate candidate selection by measured pace only after evidence shows
that final-position-neighbor comparison is insufficient. This is more
speculative and should follow, not precede, Options A or B.

### Option E — Operational follow-up

Verify that the latest `origin/main` is deployed to the intended Vercel
production project and repeat the public smoke matrix if a deployment is
requested. This is release maintenance, not a new product feature.

## Start condition for the next implementation

Create a fresh autobuild state only after selecting a concrete Phase 3
objective and approving its design. The next implementation must pass the
normal specification audit, required tests/typecheck/lint/build, independent
review, and normal commit/push workflow.
