# UX3-2 Human Field Test Plan

Status: `UX3-2 HUMAN FIELD TEST READY`

Preparation date: 2026-09-07

Human Field Test status: `NOT YET EXECUTED`

This document prepares a formative usability test for the public AJOCC Lap
Time Viewer. It does not report participant results, approve a redesign, or
replace the Human Field Test with source review, browser automation, or
Production Feedback.

## 1. Existing materials audit

The following existing materials were reviewed and are reused as the protocol
base:

- [UX3-0 test plan](ux3-test-plan.md): participant profiles, fresh-session
  rules, think-aloud boundaries, timing, task outcome, and no-premature-
  conclusion rules.
- [Moderator script](ux3-moderator-script.md): neutral probes and
  intervention discipline.
- [Participant record template](ux3-participant-record-template.md): no-name
  participant IDs, environment fields, task timing, M0/M1/M2/M3/LEADING,
  `NR`, friction, critical moments, and post-test questions.
- [Observation sheet](ux3-observation-sheet.md): real-time event capture.
- [Results analysis template](ux3-results-analysis-template.md): participant
  matrix, repeated findings, evidence, confidence, and final verdict.
- [Pilot review](ux3-pilot-review.md) and the pilot record: hypotheses only.
  Pilot observations are not formal findings and must not be presented as
  Human Field Test results.
- [UX3 pre-release adversarial review](../ux3-pre-release-adversarial-review.md):
  comparison discoverability, chart interpretation, spatial friction, mobile
  behavior, and interaction predictability remain human-confirmation topics.
- [UX2 final validation](../ux2-5-final-validation-report.md) and the UX2
  Desktop/Mobile workspace reports: the current chart-first, results,
  rider-analysis, URL/history, disclosure, and mobile contracts to observe
  for regression.
- [Feedback Intake specification](../feedback/feedback-intake-spec.md) and
  [Production activation report](../feedback/feedback-production-activation-report.md):
  Feedback is separate from Human Field Test; no feedback submission is part
  of this test.

### Audit conclusion

The historical templates are useful but their task names predate the current
UX3-2 scope. The UX3-2 record below is a versioned extension rather than an
overwrite of historical records. It adds:

- the nine required task scenarios;
- explicit comprehension checks for results, DNF, lap-down, missing data,
  chart axes, metric meaning, and comparison scope;
- first action, misclick, backtrack, hesitation, help, mobile-specific issue,
  and interpretation fields;
- a strict observation/interpretation split;
- fixture provenance and pre-session data recheck;
- S0-S4 severity and CLEAR/MINOR REVISION/NEEDS REVISION/BLOCKING UX ISSUE
  outcome rules.

Use the [UX3-2 participant record template](ux3-2-participant-record-template.md)
for one restricted, off-repository record per participant, and complete the
[UX3-2 test summary template](ux3-2-test-summary-template.md) only after all
planned sessions are finished. Immediately after each session, use the
[UX3-2 participant Post-Test Q&A template](ux3-2-participant-post-test-qa-template.md)
to record the participant's own opinions separately from facilitator
observations.

## 2. Goals and non-goals

### Goals

Determine, with first-use participants, whether they can:

1. explain what the site is for and identify a sensible first action;
2. move from meet to category to results to rider analysis;
3. understand result order, result values, DNF, lap-down, and unavailable or
   missing data without facilitator explanation;
4. read a chart's axes, series, and rider differences;
5. distinguish Rank, Gap, Pace, and Lap views;
6. discover and understand rider comparison and its scope;
7. recover or navigate back without losing the intended analysis context;
8. complete the core path on Desktop and Mobile;
9. identify what information creates value, what is unnecessary, and where
   they hesitate, stop, or form an incorrect mental model.

### Non-goals

- No product code, CSS, chart redesign, copy change, or backlog item is
  implemented during a session or during this preparation.
- No Production Feedback submission, Basin record, analytics event, or test
  data is generated.
- This is not a statistical study and does not claim market-wide usability.
- A participant's preference is not automatically a usability defect.

## 3. Participants

Recruit one participant for each profile as the minimum recommended sample
(three total). Recruiting more is useful, but do not register or identify
participants in this preparation phase.

| Profile | Required background | Primary question |
| --- | --- | --- |
| A — Cycling knowledgeable | Knows road/cyclocross race results or lap data | Do race concepts transfer without product-specific instruction? |
| B — Sports-data app user | Uses Strava, Garmin, sports statistics, or similar; little/no cyclocross knowledge | Do common data-UI conventions transfer? |
| C — General user | Little/no AJOCC, cyclocross, or lap-analysis knowledge | Can a first-time user form a minimally correct model? |

Do not screen or record names, email addresses, phone numbers, employer,
account handles, exact birth date, or other direct identifiers. Use
`P-A-01`, `P-B-01`, and `P-C-01` (or equivalent random Participant IDs).
Record only the minimum background category needed for profile assignment.

## 4. Test environment

### Production

- URL: `https://ajocc-laptime-viewer.vercel.app/`
- Use a fresh browser profile or cleared session state for each participant.
- Do not log in, install an extension, submit feedback, or alter Production
  data.
- Read-only fixture source: the application's public collector data. Recheck
  the fixture immediately before each session.

### Desktop

- Primary: 1440x900 or 1280x720.
- Optional narrow Desktop check: 1024x768.
- Use a current mainstream browser and record browser family/version, not a
  participant identity.
- Observe keyboard/focus only when the participant naturally uses a keyboard;
  do not turn the session into a scripted accessibility audit.

### Mobile

- Primary: real smartphone around 390x844, portrait.
- Include a 320px-class viewport or device when available.
- Record device class, browser, orientation, touch use, scroll burden,
  bottom-sheet behavior, chart interaction, comparison controls, and return
  behavior.
- If only a responsive emulator is available, record that limitation; do not
  call it equivalent to a real-device test.

### Session length

Target 35–45 minutes:

- 3 minutes consent, privacy boundary, and think-aloud instruction;
- 25–32 minutes task work;
- 5–10 minutes post-test interview and debrief.

Stop or shorten the session if the participant becomes uncomfortable, asks to
stop, discloses sensitive information, or the Production service is not
usable.

## 5. Moderator rules and intervention

The participant controls the mouse/touch/keyboard. The moderator observes,
keeps time, and records the participant's words. Do not name controls,
correct an interpretation, or demonstrate an operation before the task is
complete.

Allowed neutral probes, used at most once before escalation:

- 「今、何を探していますか？」
- 「何が起こると思いましたか？」
- 「この表示をどう理解しましたか？」
- 「次に何をしますか？」
- 「そう考えた理由を教えてください。」
- 「今の状態を言葉にすると、どうなっていますか？」

Intervention codes:

- `M0`: no intervention;
- `M1`: neutral think-aloud reminder or neutral probe;
- `M2`: neutral restatement of the task goal, without naming a control;
- `M3`: recovery from a technical problem, not direct task instruction;
- `LEADING`: the moderator names a control, location, answer, or operation.

Clean success excludes `M2`, `M3`, and `LEADING`. A direct instruction
must be recorded as `LEADING`, not hidden as success.

### Stopping and escalation rule

1. Stop immediately for privacy/safety discomfort, accidental disclosure of
   direct identifiers, an unexpected account/login request, or a Production
   data mutation prompt.
2. If the participant has made no progress for about 60 seconds, use one M1
   probe. After another 60 seconds, use M2 to restate the goal and record the
   task as partial unless the participant recovers independently.
3. Use M3 only for a technical failure such as an unavailable Production
   response. Record the technical issue separately from usability.
4. If the task remains blocked after the timebox, mark fail/NR as appropriate,
   do not reveal the answer, and continue only if the participant wants to.
5. Stop the session if the participant opts out, if two privacy/safety events
   occur, or if three tasks require LEADING intervention.

## 6. Task protocol

Give only the text in the participant prompt. Fixture IDs, expected concepts,
and probe choices remain facilitator-only.

### Task 1 — First impression (90 seconds)

Participant prompt:

> このURLを開いて、最初の90秒は自由に見てください。まだ操作は
> しないでください。これは何をするサイトだと思いますか？最初に何を
> すればよいと思いますか？

Observe purpose comprehension, first visual target, confidence, and intended
first action. Do not explain the product.

### Task 2 — Find a race (4 minutes)

Participant prompt:

> 「GALFER presents 茨城シクロクロス第4戦 取手ステージ」の結果を
> 見つけてください。

Observe season/series/meet discovery, category discovery, wrong turns,
backtracking, and whether the participant recognizes when the requested race
has been reached.

### Task 3 — Understand results (4 minutes)

Participant prompt:

> ME1の結果を見て、誰が上位か説明してください。次に、
> 「武笠 展大」と「石井 信明」の結果や状態を、表示されている範囲で
> 説明してください。分からない部分は分からないと言ってください。

Observe interpretation of rank, time/gap, 完走, `-1周`, DNF, and missing or
non-official status. Do not supply the meaning of a status.

### Task 4 — Open rider analysis (3 minutes)

Participant prompt:

> 結果表から「野嵜 然新」の周回分析を開いてください。どの操作を
> したか、理由も教えてください。

Observe whether the participant understands how a result row connects to
analysis and whether the analysis region is found without control naming.

### Task 5 — Read a chart (4 minutes)

Participant prompt:

> 表示されているグラフを1つ選び、何を表していると思うかを説明して
> ください。横軸、縦軸、線や選手間の違いも説明してください。

Observe chart type recognition, axes, series identity, step/linear reading,
missing points, and table-to-chart association. Do not tell the participant
which chart semantics are expected.

### Task 6 — Change metric (5 minutes)

Participant prompt:

> 別の表示内容に切り替えて、少なくとも3種類を見比べてください。
> それぞれ何が違うと思うか説明してください。

Observe discovery and understanding of Rank, Gap, Pace, and Lap. Record which
views were actually used and whether the participant confuses per-lap values,
cumulative gap, and rank.

### Task 7 — Compare riders (5 minutes)

Participant prompt:

> 野嵜 然新と別の選手を比べてください。比較できる状態になったと
> 思った理由、表示されている選手数や範囲の意味も説明してください。

Observe comparison discovery, rider selection, visible count/range, fixed
selection versus presets/all, visual identification, and whether the table
and chart are associated.

### Task 8 — Recover and navigate back (3 minutes)

Participant prompt:

> 別のカテゴリー、または別の大会の結果へ移動してください。その後、
> 先ほどの画面に戻るならどうするか説明してください。

Observe category/meet switching, browser/app back expectations, URL/history
understanding, and whether race/rider/metric/comparison state is unnecessarily
lost.

### Task 9 — Mobile core path (8–10 minutes)

Use the same fixture on a Mobile participant/device. Do not provide the
control names.

Participant prompt:

> スマートフォンで、先ほどの結果を探し、カテゴリー、結果、選手の
> 分析まで進んでください。その後、表示内容を別のものに切り替えて
> ください。操作しづらい点があれば、そのまま説明してください。

Observe meet/category/result/rider/metric path, touch target discovery,
scroll and text readability, chart interaction, comparison switch, bottom
sheet/disclosure, safe-area/browser UI interference, horizontal overflow, and
return behavior.

## 7. Observation framework

Record facts during the session and interpretation after the task. Every task
must support:

- completion: `success / partial / fail / NR`;
- exact start/end or `approx.` duration;
- first action;
- misclick/wrong turn;
- backtrack/browser back;
- interaction hesitation and separate reading/analysis pause;
- help and intervention code;
- participant quote;
- observed confusion;
- incorrect interpretation;
- unexpected behavior;
- Mobile-specific issue;
- initial severity candidate;
- facilitator notes.

### Observation versus interpretation

Use two separate entries:

**Observation:** 「参加者は『全員』を3回押してから比較選手を探した。」

**Interpretation:** 「『全員』が比較人数設定だと認識されていない可能性。」

Do not convert a suspected cause into an observed fact. Mark uncertain causes
as hypotheses and preserve the participant's exact words where possible.

### Measurement conventions

- `Interaction hesitation`: approximately three seconds of stopping plus
  control search, cursor wandering, exploratory scroll, or hesitation speech.
- `Reading / analysis pause`: natural time to read a table/chart/value; do not
  count it as hesitation.
- `Misclick`: an unintended activation or selection, not merely a deliberate
  experiment.
- `Backtrack`: returning to a previous page/section after losing the route or
  changing direction.
- If a value cannot be observed, record `NR`; never infer it.

## 8. Severity framework

Use the following post-task candidate severity; final severity is assigned only
after cross-participant review.

- **S0 — Blocker:** a major task cannot be completed, or a privacy/safety
  failure occurs.
- **S1 — Serious:** major misunderstanding, severe interaction difficulty, or
  failure of a core task for one participant with high impact.
- **S2 — Moderate:** hesitation, wrong turn, or misunderstanding that the
  participant eventually resolves independently.
- **S3 — Minor:** small copy, readability, spacing, or interaction friction.
- **S4 — Preference:** personal preference without clear usability evidence.

Do not treat a single S2/S3 observation as a confirmed product defect without
evidence and confidence. A repeated S1 or any S0 requires immediate review
before continuing normal UX work.

## 9. Success criteria and verdict rules

The study is successful as evidence collection when all three profiles have
completed, or explicitly stopped, the same core task set and each record has
timing, completion, intervention, observation, interpretation, and quote
fields either filled or marked `NR`.

Do not call the product CLEAR simply because participants finish. Use:

- task completion and clean-success rate;
- M2/M3/LEADING assistance;
- interpretation accuracy for the protected concepts;
- repeated confusion across participants;
- S0–S4 severity;
- differences between Profiles A, B, and C;
- Desktop/Mobile differences.

Verdict rules after all recommended sessions:

- **CLEAR:** no S0/S1; no repeated high-impact misunderstanding; each core
  task (2–8) is clean success for at least 2 of 3 participants; no participant
  fails the same core task; key concept accuracy is at least 2 of 3.
- **MINOR REVISION:** no S0/S1; only isolated S3/S4 or isolated S2 friction;
  all core tasks remain independently completable.
- **NEEDS REVISION:** any repeated S2, any S1, a profile-specific core-task
  failure, or interpretation accuracy below 2 of 3 for a key concept.
- **BLOCKING UX ISSUE:** any S0, a privacy/safety failure, a Production
  integrity failure, or the same core task is failed by at least 2
  participants.

If fewer than three profiles are tested, report `INCOMPLETE — sample not
complete`; do not substitute a verdict based on the partial sample.

## 10. Privacy and data handling

- Use Participant ID only. Do not record direct identifiers.
- Do not send feedback, analytics, screenshots, recordings, or arbitrary
  local-storage data through the product.
- Recording is `none` by default. Any screen/audio capture requires separate
  consent and must not contain direct identifiers.
- Store notes in a restricted, facilitator-controlled location; do not commit
  participant records, recordings, or raw notes to the public repository.
- Do not quote a participant in a way that identifies them. Use
  `P-A-01`-style IDs.
- Record a retention/deletion date for any temporary notes or recordings.
- A participant may skip any question or stop without explanation.

## 11. Production fixture selection

Fixture verification date: 2026-09-07. The fixture was checked read-only
against the Production UI and the public collector data source. It may change;
recheck counts and labels immediately before each session.

### Primary fixture

- Meet: `CXK-256-004`
- Public meet route: `https://ajocc-laptime-viewer.vercel.app/race/CXK-256-004`
- Event: `GALFER presents 茨城シクロクロス第4戦 取手ステージ`
- Category: `ME1`
- Race ID: `27749`
- Observed size: 60 riders; 59 finished; 1 DNF
- Observed lap structure: leader 9 laps; multiple finished riders displayed
  `-1周`; one DNF displayed with its last recorded lap
- Facilitator-only target rider: `XTK-000-1510` / 野嵜 然新 (1st, finished)
- Facilitator-only comparison rider: `TCX-000-1011` / 久保田 冬吾 (2nd, finished)
- Facilitator-only lap-down rider: `CXK-156-0054` / 武笠 展大
- Facilitator-only DNF rider: `CXK-178-0105` / 石井 信明
- Why suitable: large result set, clear leader, same-lap finishers,
  lap-down statuses, DNF, multiple comparison candidates, and enough rows to
  observe result-table navigation and mobile scroll burden.

### Backup fixture

- Meet: `TCX-256-005`
- Event: `東北CXシリーズ#5福島空港ラウンド`
- Category: `ME1`
- Race ID: `27788`
- Verification snapshot: 45 riders; 44 finished; 1 DNF; leader 8 laps; several
  finished riders one lap down.
- Use only if the primary fixture is unavailable or materially changes. Record
  the actual fixture used in every participant record.

If the fixture is unavailable, do not silently substitute a different race.
Mark the technical issue, obtain facilitator approval, and record the backup
fixture and reason.

## 12. Dry-run audit

Preparation-only dry run completed without a participant:

- Tasks begin with purpose and outcome, not control names.
- Task 1 provides only the Production URL and no explanation.
- Tasks 2–9 use participant-facing goals; fixture IDs and expected semantics
  remain facilitator-only.
- Moderator probes do not reveal the answer or named control.
- Timeboxes and escalation rules are explicit.
- Primary fixture exists in Production and exposes the required result/status
  states as of the verification date.
- The record structure supports both Desktop and Mobile and separates facts
  from hypotheses.
- No participant registration, feedback submission, or Product code change was
  performed.

Dry-run result: **PASS — protocol ready for human scheduling**.

## 13. Required human actions

1. Recruit or schedule at least one participant for Profiles A, B, and C.
2. Assign Participant IDs without collecting direct identifiers.
3. Recheck the primary fixture immediately before each session.
4. Run sessions with the moderator script and the UX3-2 record template.
5. Complete the summary template only after all sessions are finished.
6. Review repeated findings, severity, evidence, and profile/device
   differences before proposing any product change.

## 14. Readiness verdict

`UX3-2 HUMAN FIELD TEST READY`

Human Field Test remains `NOT YET EXECUTED`.
