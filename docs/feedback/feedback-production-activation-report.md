# UX3-1D Production Feedback Activation Report

Status: `UX3-1D COMPLETE`

Audit date: 2026-09-07 (Asia/Tokyo)

This is the final audit of the already-completed UX3-1C Feedback Intake. No
product code, feedback schema, privacy boundary, or existing analysis UX was
changed for this activation audit. The Human Field Test remains a separate
activity and is still `NOT YET EXECUTED`.

## Source and deployment identity

- Production source commit: `6bb5b81187c95d0ef98ef72127ad90d911534950`
- Repository latest commit: `6bb5b81187c95d0ef98ef72127ad90d911534950`
- Branch: `main`
- Worktree before this report-only update: clean; this report is the only audit modification.
- `main` and `origin/main`: equal
- Target Vercel project: `ajocc-laptime-viewer`
- Production deployment: `dpl_J27TwUn5qVc8HxTbVyDnN6hjo261`
- Deployment status: `READY` / `PROMOTED`
- Deployment source SHA: `6bb5b81187c95d0ef98ef72127ad90d911534950`
- Deployment created: `2026-09-06T15:16:09Z`
- Deployment ready: `2026-09-06T15:16:53Z`
- Production alias: `https://ajocc-laptime-viewer.vercel.app/`

The local `.vercel/project.json` points to a separate linked project named
`01_ajocc-laptime-viewer`. Vercel state for the requested public alias was
verified against the `ajocc-laptime-viewer` project directly.

## Production configuration

The following items were completed by the deployment operator and are treated
as human-provided production evidence. Basin Dashboard was not reopened or
re-authenticated during this audit, as requested.

- Basin Production form: created or selected and active.
- Basin Data Retention: **90 days**, verified by the deployment operator.
- Basin spam filter: confirmed.
- Basin honeypot compatibility: confirmed.
- Basin domain configuration: confirmed not to block the production server
  endpoint.
- `FEEDBACK_BASIN_ENDPOINT`: present in the target Vercel Production
  environment with `visibility=secret` and `decrypted=false`.
- The endpoint value is intentionally absent from source, documentation,
  logs, and this report.
- Production redeploy: completed.
- Production alias: points to the READY deployment above.

The Vercel environment listing confirmed the key and Production target without
revealing its value. The deployment build metadata also contains the variable
as a server build environment variable; it is not a public environment
variable.

## Production browser verification

No new Production feedback submission was made during this audit. The single
anonymous smoke submission described below was completed by the deployment
operator before this audit and is accepted as evidence.

### Desktop

- Human-completed Production desktop smoke: **PASS**.
- Desktop feedback entry: visible and usable as a secondary action.
- Entry does not replace the chart-first analysis surface or analysis controls.
- `/feedback` route: reachable from the public alias.
- Current public entry inspection: the home page exposes the accessible link
  `ご意見・不具合を送る`.
- Current public form inspection: labels, category control, message control,
  optional contact field, privacy disclosure, submit, and return link render.
- Client-side invalid submit was rechecked: category/message errors appeared,
  focus stayed in the feedback route, and no submission was sent.
- Human-completed desktop analysis regression smoke: **PASS**.

### Mobile

- Human-completed Production mobile smoke: **PASS**.
- The mobile entry remains a normal footer/non-sticky entry; no fixed floating
  feedback button was introduced.
- Human-completed checks reported no rider bottom-sheet, safe-area, browser
  bottom UI, primary-analysis, or horizontal-overflow regression.
- Human-completed mobile analysis regression smoke: **PASS**.

### Anonymous smoke

- Exactly one human-completed Production smoke submission was sent.
- Category and message were valid.
- Contact email was left blank.
- Sending, success announcement, return flow, and no duplicate submission were
  confirmed by the deployment operator.
- The test submission was clearly marked as a smoke test and was deleted from
  Basin after receipt verification.
- No additional smoke or test submission was generated in this audit.

### Failure behavior

- Public client-side validation failure was rechecked without sending data.
- Existing automated provider failure, timeout, malformed-response, missing-env,
  retry, and form-retention tests remain PASS.
- The Production provider was not intentionally broken and no forced failure
  request was sent.

## Basin receipt and privacy audit

The deployment operator confirmed the Basin receipt for the one smoke record.
The following were confirmed in the receipt and/or the human production audit:

- expected canonical fields: `schemaVersion`, `category`, `message`, and
  `context`;
- context matched the actual analysis state used for the smoke submission,
  including available race/category, rider, metric, and comparison values;
- viewport, normalized browser family, and application version were present as
  applicable;
- application version identified the deployed release;
- contact email was absent rather than replaced with a placeholder;
- no full URL, raw user-agent, rider name, cookie, advertising ID, persistent
  anonymous ID, analytics ID, referrer, screenshot, arbitrary local-storage
  data, or browser fingerprint was present in the application payload;
- provider/hosting network metadata was treated as separate from the
  application-controlled payload audit.

Retention evidence is the operator confirmation that the Basin Production form
is configured for 90 days. This matches the UX3-1B policy for raw feedback and
contact data. The application does not create a second raw copy; any future
minimal issue record remains subject to the separately documented resolution
plus 30 days / maximum 12 months policy.

## Secret and client exposure audit

The source boundary remains:

`FeedbackForm -> POST /api/feedback -> server provider adapter -> Basin`

Code-level checks confirmed that `FEEDBACK_BASIN_ENDPOINT` is read only by
`lib/feedback/provider.ts` through `process.env`. The client form posts only
to `/api/feedback`; it does not import or reference the Basin endpoint.

Production exposure checks performed on `/` and `/feedback` found:

- HTML endpoint/provider string matches: `0`;
- downloaded public JavaScript bundle endpoint/provider string matches: `0`;
- Vercel environment visibility: `secret` / `decrypted=false`;
- public endpoint value: not exposed.

The canonical schema and context builder continue to enforce the allowlist,
bounded IDs, fixed-rider maximum, viewport bounds, normalized browser family,
application-version limit, and forbidden-data exclusions. Automated tests
continue to cover unknown context keys, rider-name exclusion, full URL/raw-UA
exclusion, cookies, malformed schema, validation mismatch, honeypot, provider
error mapping, and retry behavior.

## Acceptance criteria

| AC | Result | Evidence |
| --- | --- | --- |
| AC1 Production Basin form exists | **PASS** | Human-completed Basin configuration evidence |
| AC2 Basin retention is 90 days | **PASS** | Human-completed retention verification |
| AC3 `FEEDBACK_BASIN_ENDPOINT` is configured in Production | **PASS** | Vercel target project env listing: secret, Production target |
| AC4 Configuration deployment is READY | **PASS** | `dpl_J27TwUn5qVc8HxTbVyDnN6hjo261`, READY/PROMOTED |
| AC5 Production alias points to latest deployment | **PASS** | Alias inspection points to the deployment above |
| AC6 Desktop feedback entry usable | **PASS** | Human desktop smoke plus public entry inspection |
| AC7 Mobile feedback entry usable | **PASS** | Human mobile smoke plus non-sticky source contract |
| AC8 Anonymous Production submission succeeds | **PASS** | One human-completed smoke with blank email |
| AC9 Basin receives the submission | **PASS** | Human receipt verification |
| AC10 Expected schema fields present | **PASS** | Human receipt verification and canonical schema |
| AC11 Context matches actual UI state | **PASS** | Human state-to-receipt comparison |
| AC12 Forbidden application payload data absent | **PASS** | Human receipt audit plus code/test audit |
| AC13 Application version is correct | **PASS** | Human receipt/version comparison |
| AC14 Success UX works | **PASS** | Human smoke success announcement and return flow |
| AC15 Duplicate submission absent | **PASS** | One smoke record, client suppression, automated duplicate tests |
| AC16 Smoke record deleted | **PASS** | Human-confirmed Basin deletion |
| AC17 Desktop UX regression absent | **PASS** | Human desktop regression smoke |
| AC18 Mobile UX regression absent | **PASS** | Human mobile regression smoke |
| AC19 Secret/client exposure absent | **PASS** | Vercel secret config, source boundary, HTML/bundle scan |
| AC20 Human Field Test status preserved | **PASS** | Explicitly remains `NOT YET EXECUTED`; it is a separate activity |

Human Field Test is not a UX3-1D blocker. The governing feedback specification
explicitly separates Production Feedback from Human Field Test and states that
Feedback is not a substitute for that test. UX3-1D activation therefore does
not claim Human Field Test completion.

## Validation

Executed against the clean repository at
`6bb5b81187c95d0ef98ef72127ad90d911534950`:

- `npm test`: **PASS** — 101 tests passed.
- `npx tsc --noEmit`: **PASS**.
- `npm run lint`: **PASS**.
- `npm run build`: **PASS** — Next.js production build completed.
- `git diff --check`: **PASS**.
- Public `/` and `/feedback` responses: **HTTP 200**.
- Production HTML and public JavaScript endpoint exposure scan: **PASS**.
- Vercel deployment/env/alias inspection: **PASS**.

## Known limitations

- Basin Dashboard was not reopened during this audit; retention, spam, and
  deletion evidence are accepted from the completed human operation as
  requested.
- No new Production submission was made during this audit.
- Human Field Test analysis remains `NOT YET EXECUTED`.

## Final verdict

`UX3-1D COMPLETE`
