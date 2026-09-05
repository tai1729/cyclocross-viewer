# Specification Audit

Status: CLEAR
Current Change: Phase 2 Slice 1 — arbitrary comparison riders

## Audit scope

Two independent `spec_auditor` agents will inspect `docs/PRODUCT.md`,
`docs/DESIGN.md`, `docs/IMPLEMENTATION_PLAN.md`, the Phase 2 roadmap, relevant
source and tests, and the Phase 1 production baseline. They must report only
implementation-significant ambiguities, contradictions, or missing edge
decisions. They are read-only and must not edit product files.

## Auditor reports

### Auditor A

Questions covered: pinned mode with zero fixed riders, primary/fixed
reconciliation, scope of the five-rider cap, activation control, graphable
primary behavior, clearing/reselecting a primary, deterministic ties, and
observable persistence/reset tests.

Evidence: the prior hook supported only numeric and `all` modes; the existing
graphable gate is separate from the result selector; and existing sorting used
only `finalPosition`.

### Auditor B

Questions covered: controlled state ownership, picker empty states, DNF riders
with valid checkpoints, all-mode compatibility, keyboard/mobile controls, and
the picker/integration interface boundary.

Evidence: `RaceViewer` currently passes the primary setter directly to two
selection surfaces, while graphable candidates are derived separately; the
existing comparison control has no pinned option; and DNF status is not itself
excluded by the current graphable gate.

## Resolution log

All legitimate questions were resolved in `docs/DESIGN.md` and
`docs/IMPLEMENTATION_PLAN.md` before implementation:

1. Zero fixed riders: pinned mode displays the graphable primary alone and an
   add prompt. No graphable primary yields no comparison.
2. The five-series cap is pinned-only: one primary plus at most four fixed
   riders. Numeric modes retain current semantics; `all` retains its existing
   eight-rider guard.
3. The visible mode label is `固定`, between `±5` and `全員`, and opens the
   controlled inline picker.
4. DNF riders with valid checkpoints are graphable candidates; DNF riders
   without valid checkpoints are excluded.
5. RaceViewer owns fixed IDs and removes a newly selected primary from them.
   Other IDs survive primary clearing/reselection locally and are ignored until
   a graphable primary exists. Category changes clear them.
6. The picker distinguishes no matches, no addable riders, and the four-rider
   cap. It exposes add/remove/activate callbacks and does not own state.
7. Equal final positions are ordered by `riderId` after `finalPosition`.
8. Acceptance covers mode persistence, primary reconciliation, category reset,
   invalid/duplicate filtering, cap enforcement, empty states, and narrow
   keyboard/touch use.

STATUS: CLEAR
