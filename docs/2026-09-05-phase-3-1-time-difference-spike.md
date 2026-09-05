# Phase 3-1 spike — Initial chart and time-difference comprehension

Date: 2026-09-05
Status: INVESTIGATION COMPLETE

## Question

Should the current `順位` chart be replaced by `タイム差` as the initial
analysis chart?

## Method

- Inspected the current `ChartTabs` contract and the existing chart semantics.
- Opened the same local race with the same primary rider and `±2` comparison
  in the default `順位` view and the URL-addressable `タイム差` view.
- Used race `27749` (`CXK-256-004`), with winner `XTK-000-1510` as the primary
  and the second- and third-place riders as comparison context.
- Repeated the `タイム差` view with the race's DNF rider
  `CXK-178-0105` to check sparse/partial data behavior.
- Checked the repository for usage telemetry or user-test evidence.

## Findings

### Time difference answers the “where did the gap open?” question directly

For the winner versus the second-place rider, the cumulative difference moved
from about `-21.7s` at lap 1, through `-9.8s` at lap 2 and `+2.7s` at lap 3, to
`+101.6s` at lap 9. Against the third-place rider it moved from about
`-18.8s` to `+112.8s`. The `タイム差` tab exposes this progression with a
visible `±0` reference and a same-lap detail panel, while the `順位` chart
requires the viewer to translate position changes into elapsed time.

### Rank is a stronger default entry point

The `順位` chart remains understandable with one selected rider and no
comparison line. Its visible explanation states that higher is better, and
the detail panel can immediately report the selected rider's measured rank.
The `タイム差` chart needs a primary plus at least one graphable comparison;
otherwise the existing UI has no comparison chart to show.

### DNF data makes a time-difference-first default risky

The DNF example correctly preserves the existing status, reached-lap, and
withdrawal-gap summary, while the time-difference series is only available at
measured common checkpoints. Making this view the default could foreground a
partial chart before the viewer understands that the rider stopped, even
though the current sparse behavior is semantically correct.

### Evidence is not sufficient to change the product default

The repository contains no usage telemetry or completed user-test results.
The local comparison demonstrates that `タイム差` is valuable for a specific
analysis question, but it does not establish that it is the best first view
for the broader audience.

## Task comparison

Two task paths were compared with the same selected winner and `±2` context:

1. For “who was ahead on each lap?”, the default `順位` view is immediately
   available. Its explanation says that higher is better, and the detail
   panel exposes the selected lap's rank for the primary and context riders.
   A `タイム差`-first design would add one tab transition before this answer.
2. For “on which lap did the gap open?”, the `タイム差` view gives the direct
   answer after one tab transition from the current default. Its explanation
   names the cumulative same-lap difference, states the sign meaning, and the
   detail panel shows values such as `-22秒` for the first lap. A
   `タイム差`-first design would save that one transition.

The no-comparison path was also opened with the same primary and `compare=0`.
The existing `タイム差` surface explicitly says `比較できる周回データを持つ
選手がほかにいません。`, while the rank view still has a meaningful single
rider chart. This makes rank the more resilient entry state even though the
tab-switch cost is symmetric for a fully configured comparison.

The DNF path preserved the explicit DNF summary (`到達周回`, `最終通過`, and
`離脱時点の差`) and exposed only common measured checkpoints in the time-gap
view. The sparse result is correct, but it is a poor default explanation until
the viewer has understood the rider's status.

## Recommendation

Keep `順位` as the initial chart. Do not change product code in this spike.
Treat `タイム差` as the deliberate next action for users asking when the
race gap changed; its existing label, sign explanation, `±0` reference, and
detail panel are sufficient to support that action.

Before revisiting the default, run a small task-based comparison with both
views. Measure time-to-answer and interpretation errors for at least these
questions: “who was ahead on each lap?” and “on which lap did the gap open?”
Include a normal finished race, a close race, and a DNF/lapped case. A default
change should require evidence that the benefit for the second question does
not materially harm the first question or the no-comparison/partial-data
entry states.

## Limitations

The spike used local browser accessibility snapshots and existing data
transforms; it did not add telemetry or collect real-user responses. Fixed
320px/390px screenshots were not captured in this read-only probe, so mobile
preference remains unmeasured.

No product code, dependency, route, data contract, or deployment setting was
changed.
