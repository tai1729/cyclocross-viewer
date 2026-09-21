# Data freshness and resilient collection schedule

## Goal

Reduce the chance that GitHub Actions scheduled collection runs are delayed or
dropped at the start of the hour, and expose the last time the collector
actually published changed data on the viewer's home screen.

## Scope

- Change the generated collection schedule from minute `0` to minute `7`,
  retaining the 09:00–23:00 JST collection window on each race day.
- Add a small collector-owned `site-metadata.json` artifact containing one UTC
  ISO 8601 `updatedAt` value.
- Advance that timestamp only when discovery adds a meet or a collection saves
  at least one race file. A no-op scheduled check does not advance it.
- Fetch the metadata as an optional companion to `meets.json` and show it on
  the home page as `データ更新: YYYY/MM/DD HH:mm JST`.

## Non-goals and compatibility

- Do not change `MeetEntry`, `RaceResult`, rider, lap, error, route, or URL
  contracts.
- Do not add a viewer scraping path, authentication, production dependency, or
  deployment setting.
- Do not make a metadata fetch failure block the existing meet list.
- Do not modify unrelated dirty files, including the existing untracked
  not-found work in the viewer.

## Data flow

```text
calendar dates
  -> updateSchedule.ts
  -> collect.yml cron at minute 7

discover.ts / collect.ts successful data change
  -> site-metadata.json { updatedAt: UTC ISO 8601 }
  -> GitHub raw collector data
  -> viewer fetchSiteMetadata (optional)
  -> useMeetData
  -> home meet list freshness label in JST
```

The metadata is a separate small artifact instead of an `inventory.json`
extension so the home page does not download the large inventory merely to
display one timestamp. Race pages retain their existing per-race `updatedAt`
display.

## Error and rendering behavior

- A valid metadata timestamp is formatted with the existing total JST formatter.
- Missing, invalid, or unavailable metadata shows `更新日時不明` while the
  meet list continues to render normally.
- Collection failures do not advance the timestamp unless another collection
  succeeds in the same run.
- The existing collector failure, validation, loading, error, not-found, and
  responsive behavior remains authoritative.

## Acceptance criteria

1. Generated schedules use minute `7` for every race-day hourly entry.
2. Discovery and collection write metadata only for the approved successful
   change cases, and the workflow stages `site-metadata.json`.
3. Viewer data-source tests accept a valid metadata payload and reject an
   invalid shape.
4. The home page displays the timestamp in JST without making meet-list
   rendering depend on metadata availability.
5. Existing race freshness display and all existing result/analysis behavior
   remain unchanged.
6. Collector tests, viewer tests, type checks, lint, build, and diff checks
   pass.
