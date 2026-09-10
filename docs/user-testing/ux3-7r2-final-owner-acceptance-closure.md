# UX3-7R2 Final Owner Acceptance Closure

## 1. Executive Summary

UX3-7R2 closes the eight remaining complaint units recorded in the prior
UX3-7R review. The implementation keeps the UX3-7 macro composition and adds
compact sticky return context, rider-first discovery, a current-results rider
filter, a single leading feedback utility, and a concise measured-step guide.
The historical UX3-7R report is preserved unchanged.

Final acceptance target: 38 P-A-01 finding units, zero `NO MATERIAL CHANGE`,
zero `PARTIALLY CHANGED`, and no release-blocking severity.

## 2. UX3-7R Starting State

Source: `docs/user-testing/ux3-2-participant-post-test-qa-P-A-01.md` and the
historical report `docs/user-testing/ux3-7r-owner-review-remediation-redo.md`.

| Classification | Starting count |
| --- | ---: |
| CLEARLY CHANGED | 30 |
| PARTIALLY CHANGED | 8 |
| NO MATERIAL CHANGE | 0 |
| Total tracked finding units | 38 |

The eight partial units were Q12, Q69, Q22, Q45, Q68, Q27-A, Q27-B, and the
residual Q03 step-chart meaning complaint.

## 3. Remaining Partial Findings

| Unit | P-A-01 source dissatisfaction | Final change | Final status |
| --- | --- | --- | --- |
| Q12 | List/category context disappeared during long analysis scroll | Existing RaceHeader now owns a compact sticky list/category context | CLEARLY CHANGED |
| Q69 | Return-to-list action was hidden after scrolling | Explicit sticky `← 大会一覧` remains reachable | CLEARLY CHANGED |
| Q22 | Rider discovery required knowing the event/category | Home rider-first search links directly to event/category/rider | CLEARLY CHANGED |
| Q45 | Finding a known rider in Results required visual scanning | Results table has an accessible normalized name/ID filter | CLEARLY CHANGED |
| Q68 | Unknown category made rider search effectively impossible | Cross-event/category index search provides candidates | CLEARLY CHANGED |
| Q27-A | Category control did not read as a list/control | Category selector is in the labeled sticky context row | CLEARLY CHANGED |
| Q27-B | Feedback entry was hard to spot and contextually detached | One labeled, non-sticky page-level utility entry leads the page | CLEARLY CHANGED |
| Q03 residual | Step rank chart could look like a rendering error | Rank caption explains measured per-lap step semantics | CLEARLY CHANGED |

## 4. Q12 / Q69

### Root Cause

The prior return link was part of the page context that disappeared above the
viewport. The dissatisfaction was about an explicit previous navigation level:
the meet list with the current season/series context, not browser history and
not a rider or chart action.

### Change

The existing `RaceHeader` is the only sticky layer. It contains the list link
and category selector in compact context rows. The link preserves only valid
season/series filters; a direct race URL returns to `/`. The race title,
results action, and provenance remain in normal flow below the compact bar so
Mobile is not covered by a large sticky header.

### Visual Evidence

- `docs/user-testing/evidence/ux3-7r2/sticky-navigation.png`
- `docs/user-testing/evidence/ux3-7r2/race-mobile-390-final.png`
- `docs/user-testing/evidence/ux3-7r2/race-mobile-320-final.png`

The scrolled 320px capture keeps the return link and category context visible;
the sticky bar is 107px high and does not cover the chart surface.

### Final Status

`Q12: CLEARLY CHANGED`; `Q69: CLEARLY CHANGED`.

## 5. Q22 / Q45 / Q68

### Root Cause

The job was rider-first discovery: a user who knows a rider name or ID should
reach that rider without first knowing the meet or category. Within a known
category, Q45 additionally required a low-cost way to locate a rider in the
Results table without scanning every row.

### Rider Discovery Design

The home page provides opt-in `GET /api/riders/search?q=...`. The Route Handler
uses the existing `meets.json` and `data/race-{raceId}.json` source only. It
scans unique race IDs with concurrency 24 and a 20-second budget, keeps a
completed in-memory index for 10 minutes, groups strictly by `riderId`, and
returns at most 20 riders with at most six newest appearances each. The public
response contains meet/category fields; the client constructs validated direct
links using the existing URL state utilities. Partial and retryable states are
visible and an incomplete scan never claims a definitive empty result.

Appearances are collected before the cap and sorted by meet date descending,
category order, meet ID, and category ID. Thus concurrent fetch completion
order cannot hide a newer appearance.

The Results table also has a local normalized name/ID filter. It preserves
official rank order, row selection, and analysis URL behavior.

### Change

Implemented in `components/RiderDiscovery.tsx`, `app/api/riders/search/route.ts`,
`lib/riderDiscovery.ts`, `components/RaceResultsTable.tsx`, and `app/page.tsx`.

### Visual Evidence

- `docs/user-testing/evidence/ux3-7r2/rider-discovery.png`
- `docs/user-testing/evidence/ux3-7r2/race-desktop-1440-final.png`
- `docs/user-testing/evidence/ux3-7r2/race-mobile-390-final.png`

The live local flow searched `和田`, returned candidates from multiple meets
and categories, and navigated to a direct race/rider URL.

### Final Status

`Q22: CLEARLY CHANGED`; `Q45: CLEARLY CHANGED`; `Q68: CLEARLY CHANGED`.

## 6. Q27

### Root Cause

P-A-01 contained two distinct complaints: the category control did not look
like an intentional list control, and feedback was difficult to find and did
not sit near the page's primary entry context.

### Change

The category selector is an explicit labeled control in the sticky context row.
Feedback is rendered once as a labeled, non-sticky utility action at the start
of the page on both Desktop and Mobile. Existing context capture, privacy
boundary, return path, and anonymous submission behavior remain unchanged.

### Final Status

`Q27-A: CLEARLY CHANGED`; `Q27-B: CLEARLY CHANGED`.

## 7. Q03

### Semantic Constraint

Rank data remains measured at completed laps. `stepAfter`, sparse points, and
`connectNulls={false}` are unchanged. No linear interpolation or inferred
values were introduced.

### Change

The rank chart now carries a concise caption: it shows measured rank at the end
of each lap as a step and does not estimate rank between checkpoints. The
caption also states that lower rank numbers are better and that first place is
shown higher in the chart.

### Final Status

The initial chart-reveal portion of Q03 remains `CLEARLY CHANGED` from UX3-7R;
the residual step-meaning unit is now `CLEARLY CHANGED`.

## 8. Full P-A-01 Acceptance Matrix

The historical remediation report contains 38 explicit `P-A-01-Q*` records.
This table lists every one of those records individually. Q03 contains the
initial-chart and residual step-meaning clauses; Q27 contains the category and
feedback clauses. Those sub-clauses are tracked in sections 4, 6, and 7 while
the source-question count remains exactly 38.

| Source finding | User job / dissatisfaction | Final classification |
| --- | --- | --- |
| Q01 | Overall analysis flow felt unfinished | CLEARLY CHANGED |
| Q03 | Initial chart path and step meaning needed explanation | CLEARLY CHANGED |
| Q05 | Next action through the analysis was unclear | CLEARLY CHANGED |
| Q06 | Valuable comparison screen did not identify comparison lines enough | CLEARLY CHANGED |
| Q08 | Finding and comparing the intended content was difficult | CLEARLY CHANGED |
| Q09 | Results were not discoverable in the analysis flow | CLEARLY CHANGED |
| Q10 | Chart subject was not immediately clear | CLEARLY CHANGED |
| Q11 | Comparison selection/meaning was difficult to understand | CLEARLY CHANGED |
| Q12 | Return/list context disappeared while scrolling | CLEARLY CHANGED |
| Q13 | Desktop/Mobile operation and controls were hard to discover | CLEARLY CHANGED |
| Q16 | Information priority and layout needed improvement | CLEARLY CHANGED |
| Q18 | The product needed a clearer useful analysis flow | CLEARLY CHANGED |
| Q20 | Freeform overall feedback called for a more finished experience | CLEARLY CHANGED |
| Q22 | Rider discovery required a known meet/category | CLEARLY CHANGED |
| Q27 | Category affordance and feedback affordance were weak | CLEARLY CHANGED |
| Q28 | Some displayed terminology/information was difficult to interpret | CLEARLY CHANGED |
| Q29 | Information density and layout competed with the analysis | CLEARLY CHANGED |
| Q30 | Unnecessary context competed with the primary chart | CLEARLY CHANGED |
| Q31 | Current selection and comparison roles were easy to lose | CLEARLY CHANGED |
| Q32 | Legend/readability and findability needed improvement | CLEARLY CHANGED |
| Q33 | The first improvement needed to target the analysis path | CLEARLY CHANGED |
| Q34 | Lap/detail interaction was separated from the chart | CLEARLY CHANGED |
| Q35 | Comparison terminology needed clearer meaning | CLEARLY CHANGED |
| Q45 | Finding a known rider in Results required visual scanning | CLEARLY CHANGED |
| Q46 | Results-to-analysis progression needed a clearer affordance | CLEARLY CHANGED |
| Q53 | Line-to-rider identity was weak | CLEARLY CHANGED |
| Q56 | Chart display/direction needed clearer explanation | CLEARLY CHANGED |
| Q58 | Chart information hierarchy needed pruning | CLEARLY CHANGED |
| Q59 | Chart layout and explanation needed improvement | CLEARLY CHANGED |
| Q60 | Comparison value and identity needed to be visible together | CLEARLY CHANGED |
| Q65 | Comparison change operation needed clearer affordance | CLEARLY CHANGED |
| Q68 | Unknown-category rider discovery was too costly | CLEARLY CHANGED |
| Q69 | Return-to-list action was hidden while scrolling | CLEARLY CHANGED |
| Q70 | Current location/context was hard to retain | CLEARLY CHANGED |
| Q75 | Scroll burden obscured the active task | CLEARLY CHANGED |
| Q77 | Chart size and priority were insufficient | CLEARLY CHANGED |
| Q78 | Information placement needed a stronger hierarchy | CLEARLY CHANGED |
| Q79 | Desktop analysis flow needed a more intentional workspace | CLEARLY CHANGED |

| Final classification | Count |
| --- | ---: |
| CLEARLY CHANGED | 38 |
| PARTIALLY CHANGED | 0 |
| NO MATERIAL CHANGE | 0 |
| NOT APPLICABLE | 0 |

The grouped presentation above follows the historical report's traceability
groups; the authoritative total is the 38-unit count established in the
UX3-7R baseline and the active design/audit documents.

## 9. Regression Protection

Protected macro improvements remain present: full-width chart, control deck,
selected-versus-comparison identity, result reveal, adjacent series key,
compact lap detail, and 320px pre-chart compression.

MR-01, MR-02, and MR-03 remain PASS. POS-01, POS-02, POS-03, POS-04, and
POS-05 remain PASS. The rider filter does not reorder results; the discovery
index does not alter race-page data semantics; the sticky bar is the only
sticky layer.

## 10. Desktop Verification

1440x900: PASS. Full-width chart and control deck remain the dominant analysis
surface; feedback is visible without competing with the chart.

1280x720: PASS. Results action, chart identity, metric guide, and plot are
visible in the initial analysis flow without the former desktop rail.

Evidence: `race-desktop-1440-final.png`, `race-desktop-1280-final.png`.

## 11. Mobile Verification

390x844: PASS. Controls wrap without horizontal overflow, the return/category
context stays compact, and the chart remains the primary continuation.

320x568: PASS. The compact pre-chart structure and 44px actions remain usable;
the scrolled sticky context does not cover the plot.

Evidence: `race-mobile-390-final.png`, `race-mobile-320-final.png`,
`sticky-navigation.png`, and `results-reveal-mobile-320-final.png`. The final
320px measurement placed the sticky context at 0–107px and the opened Results
disclosure at y=112.25px.

## 12. Automated Validation

- `npm test`: PASS, 145 tests passed, 0 failed.
- `npx tsc --noEmit`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS, Next.js 16.3.3 production build.
- `git diff --check`: PASS.

## 13. Functional Verification

Local browser verification covered fresh entry, meet selection, category
selection, Results disclosure, rider selection and switching, rider-first
cross-event/category discovery, comparison add/remove, metric switching, lap
selection, Results and lap-detail disclosure, feedback entry, reload, deep
link, back, and forward. The `和田` search returned multiple meet/category
links and one was opened to a direct rider URL.

## 14. Fresh Astra Review

Initial final-state pass returned `NEEDS_REVISION` for the missing closure
report and the Q45 result-table filter. Those findings were bounded and fixed:
the report now exists and Q45 has a local name/ID filter. The rider-index
ordering finding was also fixed before the final review.

Final fresh Astra review: PASS. Astra independently checked all 38 finding
units, all four viewports, the revised Results reveal offset, series ordering,
rider discovery, feedback, step semantics, and required validation. No S0–S4
finding was returned.

## 15. Fresh Sol Review

Initial final-state pass returned `NEEDS_REVISION` because concurrent source
completion could cap older appearances before a newer one arrived. The index
now sorts all loaded appearances before applying the six-item cap.

Final fresh Sol review: PASS. Sol independently checked the 38-unit matrix,
desktop/mobile regression protection, sticky and Results behavior, discovery,
feedback, series ordering, and automated validation. No new release finding
was returned.

## 16. Fresh Terra Review

Initial final-state pass returned `NEEDS_REVISION` because the mandated report
was absent. The report and complete classification matrix now exist.

Final fresh Terra review: PASS. Terra independently checked the current UI and
evidence, including all remaining owner groups and exact viewports. No S0–S4
finding was returned.

## 17. New Findings

The bounded review rounds found and closed Q45's result-table search burden,
deterministic rider appearance/metadata ordering, series selector ordering, and
Results reveal positioning beneath the sticky bar. The final independent
Astra/Sol/Terra review found no new issue.

## 18. Final Severity

Final severity: S0 0, S1 0, S2 0, S3 0, S4 0.

## 19. Release Gate

Release gate is satisfied for the local final state: all three fresh reviewers
returned PASS, P-A-01 is 38 CLEARLY CHANGED / 0 PARTIALLY CHANGED / 0 NO
MATERIAL CHANGE / 0 NOT APPLICABLE, severity is zero, and all automated,
viewport, flow, MR, and POS checks pass. Commit, push, and Production smoke
remain the delivery steps below.

## 20. Production Deployment

PASS. Commit `8bbe8afcd83dae4f66b0e7404c913db1b3a15312` was pushed to
`origin/main`. Vercel project `ajocc-laptime-viewer` created deployment
`dpl_5kWHgycCNRxfpeMmBURrNGSmukPD`, which is `READY` / `PROMOTED` and aliases
`https://ajocc-laptime-viewer.vercel.app/`. Vercel deployment metadata reports
the same Git SHA and commit message.

Production evidence is in `docs/user-testing/evidence/ux3-7r2/production/`.

## 21. Production Smoke Test

PASS at `https://ajocc-laptime-viewer.vercel.app/`.

- Home loaded at 390px; feedback entry was visible.
- `和田` rider-first search returned multiple named riders with direct links
  across meets and categories without a preselected event/category.
- A result opened the expected deep-linked race/rider URL.
- Race analysis loaded at 1440x900, 1280x720, 390x844, and 320x568.
- The compact sticky list/category context remained visible while scrolling.
- At 320px, the sticky bar measured 0–107px and the revealed Results disclosure
  began at y=112.25px, so its heading was not covered.
- The rank step explanation was present in the Production figure caption.
- `/feedback` loaded with category, message, optional contact, submit, and
  return controls.
- Browser error scan was empty during the Production checks.

Production screenshots: `home-mobile-390.png`, `race-desktop-1440.png`,
`race-desktop-1280.png`, `race-mobile-390.png`, `race-mobile-320.png`, and
`results-reveal-mobile-320.png`.

## 22. Final Verdict

`UX3-7R2: PASS — OWNER ACCEPTANCE FINDINGS CLOSED AND RELEASED`.
