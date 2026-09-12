# AJOCC LapTime Viewer — Public Release

## Release Status

PUBLIC RELEASED

## Release Date

2026-09-12

## Production

https://ajocc-laptime-viewer.vercel.app/

## Release Summary

AJOCC LapTime ViewerをProductionへ正式公開した。

主な公開機能：

- 大会 / Season / Series選択
- レース結果表示
- 選手分析
- ラップタイムチャート
- 順位
- 周回差
- 単周タイム差
- ペース
- 選手比較
- rider-first横断検索
- Season + Series複合filter
- Historical race data
- Desktop / Mobile対応

## Validation

- Production deployment: PASS
- Production smoke test: PASS
- Tests: PASS
- Typecheck: PASS
- Lint: PASS
- Build: PASS

Production smokeでは、トップページ、205大会、Season + Series filter、
rider-first検索、results、analysis、chart、comparisonを確認した。
Historical dataは各対象seasonから以下を確認した：

- `KNS-234-011` — 2023-24
- `CHB-245-006` — 2024-25
- `CCS-256-003` — 2025-26

## Historical Data Expansion

Public Releaseには、`2023-24`、`2024-25`、`2025-26`の直近3 Cyclocross
seasonsが含まれる。各代表raceで大会、category/race、result、rider、
chartを確認した。result-only historical raceも安全に表示される。

## Release Evidence

The final documentation commit, public release tag, final main SHA, and the
READY Production deployment source SHA are recorded after the documentation
push and final production smoke.

## UX Status

Release-blocking UX issues: 0

External Human pre-release testは参加者不足により実施していないが、
release blockerとはしていない。

今後はProduction上で得られる実利用・feedbackを
Post-Release改善へ使用する。

## Final Status

AJOCC LapTime Viewer is publicly available in Production.
