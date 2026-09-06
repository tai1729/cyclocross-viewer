# UX3 Backlog

These are non-blocking follow-ups intentionally not implemented in UX2-5.

## 1. Exact-device responsive evidence harness

- Problem: The connected browser could not provide exact 390x844/320x568
  emulation, `scrollY`/DOM rect capture, or persistent screenshot files.
- Evidence: UX2-3 and UX2-4 reports carry the same limitation; UX2-5 used AX,
  source contracts, prior measurements, and production smoke instead.
- Severity: P2 (verification/process, not an observed product defect).
- Expected value: repeatable release evidence for narrow devices, keyboard,
  safe-area, and resize behavior.
- Implementation scope: add a supported viewport-capable browser runner and
  a small smoke matrix; do not change product behavior as part of the harness.
- Suggested phase: UX3 QA infrastructure.

## 2. Large-category Results navigation study

- Problem: The current bounded Results region renders all 112 rows and is
  practical for the tested category, but a future very-large category may
  benefit from stronger find/jump affordances.
- Evidence: Production category `KNS-256-001 / M3` contained 112 riders;
  Results remained bounded and status semantics were intact. No blocking
  delay or unusable interaction was observed.
- Severity: P2.
- Expected value: faster rider discovery in unusually large categories.
- Implementation scope: user research followed by a bounded search/jump or
  virtualization decision; preserve native table/status semantics.
- Suggested phase: UX3 research and performance slice.

## 3. Narrow chart tooltip and legend refinement

- Problem: Chart labels and multi-series identification could be refined on
  very narrow screens after real-device observation.
- Evidence: No blocking tooltip or legend failure was observed in the current
  production smoke; chart calculation and existing labels are correct.
- Severity: P3.
- Expected value: easier interpretation on touch devices.
- Implementation scope: chart-only presentation study; no data semantics or
  formula changes.
- Suggested phase: UX3 chart usability.

## 4. Broader assistive-technology certification

- Problem: The current evidence includes AX tree, keyboard/focus smoke, native
  semantics, and automated tests, but not a full screen-reader/device matrix.
- Evidence: The connected tool cannot provide a reliable physical keyboard,
  virtual-keyboard, or screen-reader certification session.
- Severity: P2 (verification scope).
- Expected value: stronger confidence across screen-reader/browser pairs.
- Implementation scope: test NVDA/VoiceOver/TalkBack-style flows at supported
  breakpoints; fix only observed issues.
- Suggested phase: UX3 accessibility QA.

## 5. First-entry pointer focus handoff

- Problem: Clicking the first rider in the browse Results table can leave the
  document focus on `body` after the table unmounts during the query
  transition.
- Evidence: Reproduced in the connected production Chrome smoke after the
  route settled; keyboard row selection, same-workspace rider changes, tab
  changes, and disclosure focus return remained usable.
- Severity: P2.
- Expected value: clearer pointer-to-analysis handoff and a stronger visible
  focus cue on first entry.
- Implementation scope: reproduce with a viewport-capable browser test and
  choose a route-transition-safe focus target without timers or URL changes.
- Suggested phase: UX3 accessibility/interaction follow-up.
