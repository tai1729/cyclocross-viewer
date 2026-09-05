# Specification Audit

Status: CLEAR
Current Change: Phase 2 Slice 2 — role-based chart styling

## Audit scope

Two independent `spec_auditor` agents will inspect `docs/PRODUCT.md`,
`docs/DESIGN.md`, `docs/IMPLEMENTATION_PLAN.md`, the roadmap, current chart
components, style helpers, tests, and the Phase 2 Slice 1 baseline. They must
report only implementation-significant ambiguities or regressions. They are
read-only and must not edit product files.

## Auditor reports

### Auditor A

Questions covered: primary treatment in gap/pace, per-chart tooltip fields,
all-mode legend behavior, fixed color ordering, inactive stored IDs, shared
context style values, and missing-data semantics.

### Auditor B

Questions covered: primary-only pinned behavior, typed tooltip boundaries,
context summary definition, crowd predicates, non-color accessibility cues,
mobile tooltip sizing, and four-chart compatibility.

## Resolution log

All legitimate questions were resolved in `docs/DESIGN.md` and
`docs/IMPLEMENTATION_PLAN.md` before implementation:

1. Gap/pace retain the existing zero `ReferenceLine` for the primary. It is
   labeled as the primary and is not synthesized into the tooltip payload.
2. Rank/lap tooltips show present primary/fixed values with role labels. Gap,
   pace, and rank/lap context values are summarized at the hovered point as
   count plus min–max in chart units; missing/null values are omitted.
3. All mode always suppresses legends. Other modes suppress legends when
   displayed rider count exceeds eight; pinned mode with five or fewer may show
   its role-labeled legend.
4. Fixed colors use filtered `pinnedRiderIds` insertion order. IDs remain
   stored outside pinned mode, are context while inactive, and are recolored by
   current filtered order when pinned resumes.
5. Shared role values are primary `#292722`, width 3.5, opacity 1; fixed width
   2.5, opacity 0.95 using the existing accessible palette; context `#77736b`,
   width 1.5, opacity 0.5, dash `5 4`. Context dots are hidden under the
   shared crowd predicate; primary/fixed dots remain where supported.
6. Tooltips use only sparse finite values at the hovered lap. No interpolation,
   placeholder numeric value, or cross-gap summary is added. Tooltip cards wrap
   long names within a viewport-safe width.
7. Pinned primary-only mode keeps rank/lap primary charts and the existing
   gap/pace comparison-empty state; the picker remains available.
8. The shared tooltip accepts a normalized payload plus a chart-owned unit
   formatter and role map; inactive/empty/unknown entries render nothing.

STATUS: CLEAR
