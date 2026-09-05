# Phase 1 Production Acceptance — 2026-09-05

## Release evidence

- Repository: `tai1729/cyclocross-viewer`
- Remote branch: `main`
- Release commit: `bab760bea87c2dfc126b70559e375a721b68dd5a`
- Production URL: <https://ajocc-laptime-viewer.vercel.app/>
- Vercel project: `ajocc-laptime-viewer`
- Vercel deployment: `dpl_9UGWgdgNXK3ypRX2J9XhkqNCrzyz`
- Deployment state: `READY`
- Deployment target: `production`
- Deployment `githubCommitSha`: `bab760bea87c2dfc126b70559e375a721b68dd5a`
- Deployment aliases include `ajocc-laptime-viewer.vercel.app` and `cyclocross-viewer.vercel.app`.

The release was pushed from the clean temporary clone supplied for this task. The release tree contains only the reviewed product changes in `components/RaceViewer.tsx` and `tests/dataTransform.test.ts`; local Autobuild files, task documents, and runtime state were not included in the release commit.

## Production acceptance matrix

All checks below were performed against the production URL after the release deployment reached `READY`. Browser console error/warning output was empty for the inspected cases.

| Case | URL / category | Evidence | Result |
| --- | --- | --- | --- |
| Home | `/` | Season/series controls, `66大会`, and dated meet links are visible. | PASS |
| Normal | `/race/MMJ-256-005`, `ME1` | Results table has four columns, 8 finishers, selectable riders, analysis region, and chart tab structure. | PASS |
| DNF | `/race/JPN-256-002`, `ME` | 15 riders (`完走14 / DNF 1`); DNF row shows `—`, `2周目まで`, and `DNF・最終通過15位`; the internal final position is not displayed as official rank. | PASS |
| Small | `/race/JPN-256-002`, `WJ` | Category selector switched to WJ; 3 finishers, results, rider selection, and empty analysis state render without breakage. | PASS |
| Large | `/race/CHB-256-007`, `ME1` | 98 riders (`完走95 / DNF 3`); after selecting a rider, `全員` is disabled with the 8-rider explanation and the analysis skip link is present. | PASS |
| Not found | `/race/DOES-NOT-EXIST` | Dedicated `大会が見つかりませんでした` message and `大会一覧へ戻る` link are visible. | PASS |
| Responsive | Home and normal race at 320px and 390px; desktop default | No page-level horizontal overflow; primary information renders; visible primary controls meet the 44px height target. | PASS |

## Closeout

- Local validation and independent reviewer result were already PASS before release.
- P1C-6 Production deployment: DONE.
- P1C-7 Production acceptance and closeout: DONE.
- Phase 1 blockers: 0.
- Phase 2 readiness: READY. Phase 2 work remains a separate design and specification-audit task.

This document is a dated acceptance record. Earlier review documents remain unchanged as historical evidence.
