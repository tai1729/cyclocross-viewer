# Phase 2 Slice 8 — Data provenance and freshness

Date: 2026-09-05
Status: CLOSED

## Outcome

Race pages now make the origin and freshness boundary visible without claiming
that collected data is an official organizer result. The existing upstream
RaceResult contract remains unchanged.

## Delivered

- Added a total helper for fixed `YYYY/MM/DD HH:mm JST` formatting from
  `updatedAt`, with an explicit `更新日時不明` fallback.
- Added safe public collector-file URL construction using a trimmed,
  encoded race ID as one path segment.
- Added a sticky RaceHeader metadata row with update time, `取得元データ
  (GitHub)` same-tab link, and `公式リザルトではありません` notice.
- Added behavior tests for UTC and offset timestamps, invalid runtime values,
  blank IDs, and special-character/path-segment encoding.

## Compatibility boundary

No fetch endpoint, route, upstream type, data validation, result table, chart,
loading/error/not-found surface, or dependency was changed. Metadata is shown
only in the existing successful-race header.

## Verification

- 54 automated tests passed.
- TypeScript, lint, production build, and `git diff --check` passed.
- Local browser smoke confirmed normal metadata, the exact collector GitHub
  href, keyboard-focus styling, and the unchanged not-found surface. The
  implementation smoke report covered desktop/320px/390px wrapping; fixed
  viewport screenshots were not captured by the independent reviewer and are
  recorded as a non-blocking visual risk.
- Independent reviewer: `PASS`.

The release commit is the commit that adds this closeout record and the
corresponding implementation changes.
