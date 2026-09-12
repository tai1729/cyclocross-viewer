# DATA-1 Three-Season Historical Data Expansion

## 1. Executive Summary

DATA-1 expands the source-backed viewer from the current `2025-26` season to
the three most recent Cyclocross seasons: `2023-24`, `2024-25`, and `2025-26`.
The production UI and URL contract remain unchanged. Collector discovery,
normalization, generated inventory/index artifacts, and the viewer's historical
rider-search path were extended.

## 2. Existing Data Architecture

The viewer fetches `meets.json` at runtime, fetches only the selected
`data/race-{raceId}.json` on a race page, and keeps normalization/validation at
the `lib/dataSource.ts` / `lib/dataTransform.ts` boundary. The separate
`cyclocross-data-collector` repository discovers official meet/category links,
fetches race pages, parses them, and writes the normalized JSON contract.

The historical import is therefore a collector expansion, not a second viewer
scraper. The generated rider index is fetched by the existing rider-search API;
the bounded live scan remains a compatibility fallback.

## 3. Source of Truth

The source of truth remains `https://data.cyclocross.jp/meet` and its linked
race pages. The official season selector resolved exactly as follows:

| canonical season | official selector value |
| --- | ---: |
| 2023-24 | 14 |
| 2024-25 | 15 |
| 2025-26 | 16 |

The numeric values are acquisition parameters only. Stored season identifiers
are the official labels, not calendar-year guesses.

## 4. Target Seasons

The target is the current season plus the two immediately preceding source
seasons: `2023-24`, `2024-25`, and `2025-26`.

The official list contained 72, 70, and 69 event links respectively. Six links
(three in `2023-24`, none in `2024-25`, and three in `2025-26`) redirected to
the season list and exposed no race detail. They are retained in
`discovery-failures.json` as non-blocking source limitations and are not shown
as dead event entries in `meets.json`.

## 5. Before Counts

The production collector baseline was:

| metric | before |
| --- | ---: |
| seasons | 1 |
| events | 66 |
| races/categories | 1,192 |

## 6. Historical Inventory

The generated `inventory.json` contains the following final inventory:

| season | events | races | result rows | lap-enabled | result-only | unavailable |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2023-24 | 69 | 1,124 | 18,925 | 1,057 | 37 | 30 |
| 2024-25 | 70 | 1,084 | 18,764 | 1,064 | 4 | 16 |
| 2025-26 | 66 | 1,192 | 18,274 | 1,162 | 6 | 24 |
| total | 205 | 3,400 | 55,963 | 3,283 | 47 | 70 |

Every inventory category carries the season, series, meet/race IDs, date,
category name, result availability, lap availability, result-row count, and
lap-record count. Result-only means accepted result rows exist but no usable
lap checkpoint exists; no lap axis is inferred.

## 7. Data Pipeline Changes

Collector changes:

- dynamic selector resolution and canonical-season/date consistency checks;
- stable-ID deterministic meet/race merging;
- resumable `--season` / `--meet` collection with default skip and explicit
  `--force` refresh;
- bounded five-request concurrency;
- deterministic `inventory.json`, `rider-index.json`, and
  `discovery-failures.json` generation;
- strict artifact validation in CI before generated data is committed.

Viewer changes:

- additive `rider-index.json` data-source boundary;
- validated index-first rider search with the existing bounded scan fallback;
- no initial-page fetch of historical race or lap payloads.

## 8. Normalization Changes

The existing `RaceResult`, `Rider`, and `LapRecord` contracts remain intact.
Historical parser compatibility now covers old lap-table shapes, result-only
pages, missing rider links, unsupported status rows, DNF, lap-down, duplicate
checkpoints, and source pages whose metadata lap count is shorter than their
numbered timing header. In the latter case the numbered source header is kept;
the selected rider is never used to invent the race axis.

Missing `/racer/` links receive deterministic `race-{raceId}-row-{ordinal}`
IDs. DNS/DSQ/OTL/unknown rows are excluded from the existing `finished | dnf`
contract rather than misclassified.

## 9. Historical Compatibility

Validation confirms unique event/race IDs, accepted rider rows, positive lap
numbers, finite cumulative times/ranks, no duplicate rider rows, valid race
axes, and race-axis length not shorter than measured checkpoints. Empty source
result tables are represented as unavailable categories; they are not
converted into fake result rows or parser errors.

The current fixtures `CCS-256-003`, `KNS-256-010`, and `KNS-256-011` were
re-collected with the current parser and retained their official lap axes and
gap inputs.

## 10. Rider Search Integration

`rider-index.json` contains 5,696 stable rider entries with bounded newest
appearances. Direct indexing across normalized race data found 4,856 riders
with at least one historical appearance, including 2,078 historical-only IDs.
Search matches normalized rider names and IDs, then returns the existing
appearance-to-race navigation shape. Stable IDs, not display names, group
entries.

## 11. Season / Series Filtering

The existing Season + Series URL state and filtering logic is unchanged. A
historical regression test covers season-only, series-only, valid season+series,
and invalid season+series canonicalization. Season changes continue to clear
the dependent series selection; clear/reload/back/forward use the existing URL
contract.

## 12. Data Integrity Validation

Strict artifact validation passed with zero required failures. It checked:

- zero duplicate event IDs and zero duplicate race/category IDs;
- duplicate event/category identities are recorded as strict validation
  failures rather than silently merged;
- no duplicate rider result rows;
- valid status, rank, lap-number, cumulative-time, and rank-at-lap shapes;
- strictly increasing positive race lap axes;
- race axes not shorter than measured rider checkpoints;
- deterministic sorted inventory and rider-index output.

The final artifact rebuild was byte-idempotent: a second strict generation
left both generated artifact hashes unchanged.

## 13. Representative Fixtures

The representative set covers at least two events per season and includes
normal, large-field, multi-lap, DNF, and lap-down cases:

- `2023-24`: KNS-234-011 / race `20238` (CM1, 100 riders, DNF/lap-down,
  six laps); CCM-234-005 / race `18454` (UCI-Men Elite, result-only,
  98 riders, nine-lap source race).
- `2024-25`: CHB-245-006 / race `23351` (ME1, 102 riders, DNF/lap-down,
  nine laps); TKI-245-004 / race `22518` (CK2, result-only, 18 riders,
  one-lap source race).
- `2025-26`: CCS-256-003 / race `27834` (E1, 24 riders, eleven laps);
  KNS-256-011 / race `27160` (E1, 35 riders, eight laps, DNF/lap-down
  coverage).

## 14. Official Source Cross-check

For each representative race, official category, accepted result-row count,
winner, top three names, and source lap count matched the normalized output.
Examples include `20238` (杉原 貴弘, 100, 6 laps), `18454` (織田 聖, 98,
9 laps), `23351` (織田 聖, 102, 9 laps), `22518` (佐野 真麻, 18, 1 lap),
`27834` (渡辺 佑樹, 24, 11 laps), and `27160` (村田 憲治, 35, 8 laps).

## 15. Current-Season Regression

The current season was fully re-collected with the updated parser. The three
required fixtures and repository regression fixtures pass, including official
lap-axis handling and the P2 gap source values.

## 16. Performance

The home page still fetches only `meets.json`; the race page still fetches only
the selected race JSON. Historical lap data is not embedded in the viewer
bundle. Rider search now fetches the generated index server-side and returns
only the bounded result set, with a ten-minute in-process cache and bounded
fallback scan. The raw rider index is approximately 8.4 MB and is not sent to
the browser as an initial page payload.

## 17. Automated Tests

Collector: 41 tests pass, including selector resolution, discovery failures,
old parser shapes, result-only pages, missing links, DNF/lap-down, stale lap
metadata, artifacts, idempotency behavior, and integrity failures.

Viewer: 164 tests pass, including the full existing suite plus historical
rider-index and season/series regression coverage. No existing test was
deleted, skipped, or disabled.

## 18. Browser Verification

Local browser verification passed for the expanded home list (205 events),
the three season options, season-only filtering (2023-24: 69 events), and
season + series filtering (2023-24 + 関西: 14 events). The following local
representative routes loaded without a not-found or application error:

- `/race/KNS-234-011` (2023-24, CM1, results and lap analysis)
- `/race/CHB-245-006` (2024-25, ME1, results and lap analysis)
- `/race/CCS-256-003` (2025-26, E1, results and lap analysis)
- `/race/CCM-234-005` (2023-24, UCI-Men Elite, result-only; 98 rows show
  `周回記録なし` safely)

Production smoke passed for the same three season representatives and the
result-only route. The historical rider search for `織田 聖` completed and
returned appearances across 2023-24, 2024-25, and 2025-26. A historical URL
with a rider query survived reload and kept its results and analysis state.
On the 2025-26 `CCS-256-003` route, the chart tabs were present, the `ラップ`
metric was selected successfully, and the lap selector/comparison controls
were rendered.
The connected browser reported 1920x855; its automation surface did not
expose exact viewport emulation for 1440x900 and 390x844, so those exact
viewport sizes remain a tooling limitation rather than an unverified product
failure. No layout changes were made in DATA-1.

## 19. After Counts

| metric | after |
| --- | ---: |
| available seasons | 3 |
| available events | 205 |
| available races/categories | 3,400 |
| result rows available | 55,963 |
| lap-enabled races | 3,283 |
| result-only races | 47 |
| indexed riders | 5,696 |

Compared with baseline, DATA-1 adds 2 seasons, 139 available events, and
2,208 races/categories. Historical-only volume is 37,689 result rows, 2,121
lap-enabled races, and 41 result-only races.

## 20. Remaining Data Limitations

Six official event links have no race detail page and remain documented in
`discovery-failures.json`. Forty-seven races are result-only and intentionally
have no lap analysis. The source's legacy metadata sometimes disagrees with
the numbered timing header; the parser preserves the numbered source header
without deriving values from a rider. Unsupported source statuses remain
outside the viewer's existing `finished | dnf` contract. The collector carries
additive `excludedRowsByStatus` diagnostics when parser output provides them;
legacy stored races without that field are not assigned invented counts.

## 21. Production Deployment

The collector was committed and pushed as `22770c0`
(`feat(data): add three seasons of historical race data`). Raw GitHub checks
returned HTTP 200 and valid JSON for `meets.json`, `inventory.json`,
`rider-index.json`, and a representative race artifact.

The viewer implementation was committed and pushed as `e5d8ebe`
(`feat(data): support historical rider discovery`). Vercel production
deployment `dpl_FxyyNPZLq8UAKMjmkjZYytYg3ZCN` is Ready and aliases
`https://ajocc-laptime-viewer.vercel.app/`. Production smoke covered the
2023-24, 2024-25, and 2025-26 representatives above, the result-only race,
historical rider search, and historical URL reload.

## 22. Final Verdict

DATA-1:
PASS — THREE-SEASON HISTORICAL DATA EXPANSION RELEASED

UX3-8: NOT STARTED
