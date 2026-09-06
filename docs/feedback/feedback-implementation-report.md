# UX3-1C Feedback Intake Implementation Report

Status: UX3-1C IMPLEMENTATION COMPLETE — PRODUCTION CONFIG REQUIRED

This report documents the UX3-1B-approved Feedback Intake implementation. The
Human Field Test remains a separate activity and was not performed or replaced
by this feature.

## Implemented architecture

The request path is:

`feedback UI -> POST /api/feedback -> provider adapter -> Basin Starter`

The browser never calls Basin directly and no Basin SDK or provider secret is
included in the client bundle. The API route and provider adapter run on the
server. The provider adapter owns form-encoded Basin transport and converts
provider outcomes to accepted, retryable, or rejected results.

## Files changed

- `app/layout.tsx`: global Feedback entry placement.
- `app/feedback/page.tsx`: direct-loadable feedback route.
- `app/api/feedback/route.ts`: JSON endpoint, request limits, honeypot, and
  canonical error handling.
- `components/feedback/FeedbackEntry.tsx`: desktop fixed entry, mobile footer
  entry, and context snapshot.
- `components/feedback/FeedbackForm.tsx`: form, validation, state handling,
  accessibility, disclosure, and return flow.
- `lib/feedback/feedbackSchema.ts`: canonical schema, enums, limits, and
  server/client validation.
- `lib/feedback/context.ts`: allowlisted URL context, normalization, and
  return-path handling.
- `lib/feedback/provider.ts`: Basin adapter boundary and timeout/status mapping.
- `tests/feedbackSchema.test.ts`, `tests/feedbackContext.test.ts`,
  `tests/feedbackApi.test.ts`, `tests/feedbackUi.test.ts`: automated coverage.

## Canonical schema

```ts
type FeedbackSubmission = {
  schemaVersion: 1;
  category:
    | "usability"
    | "understanding"
    | "display"
    | "data"
    | "feature"
    | "other";
  message: string;       // trimmed, 1–4,000 Unicode code points
  contactEmail?: string;  // optional, max 254 characters
  context: FeedbackContext;
};
```

The user-facing category labels are the six UX3-1B labels. Context contains
only the approved route, meet/race/category/rider IDs, fixed rider IDs,
metric, comparison, lap, season/series, bounded viewport, normalized browser
family, and public application version.

## Context builder and forbidden data

`lib/feedback/context.ts` is the dedicated client context boundary. It reads
only known URL keys, normalizes browser family to `Chrome`, `Safari`,
`Firefox`, `Edge`, `Other`, or `Unknown`, clamps viewport dimensions to
240–10,000, and uses a public build/version value with package-version
fallback.

The payload does not include the full URL, raw user-agent, rider name, IP
field, cookies, advertising IDs, persistent anonymous IDs, analytics IDs,
referrer, screenshots, arbitrary local storage, or browser fingerprint data.
Unknown URL keys are ignored. Unknown payload keys are rejected by server
validation.

## Provider and environment variables

The server-only Basin endpoint is configured with:

- `FEEDBACK_BASIN_ENDPOINT`: Basin Starter HTML form endpoint; set separately
  in Vercel Production, Preview, and Development environments.
- `NEXT_PUBLIC_APP_VERSION`: optional public application/deploy version. If it
  is not set, the package version is used.

Do not commit the endpoint token/secret or any provider credentials. The
production build remains usable when `FEEDBACK_BASIN_ENDPOINT` is missing;
submission returns a controlled generic 503 response until configuration is
present. The endpoint value must be configured in each deployment environment
before enabling production feedback submission.

## Privacy and retention

The form discloses anonymous submission, the category/message and minimized
display context, optional reply contact, and the exclusion of tracking IDs,
cookies, advertising IDs, and screenshots. Contact is never required.

The approved retention mechanism is Basin Starter configured to retain raw
feedback/contact data for 90 days. A periodic provider-side deletion or
export-then-delete procedure must be enabled and verified for each environment;
the implementation does not retain a second raw copy. Any minimal de-identified
issue record is limited to resolution plus 30 days and no more than 12 months.
If Basin cannot be configured for this 90-day deletion procedure, release must
stop for privacy revision.

## Honeypot and abuse behavior

The form includes a non-focusable, screen-reader-hidden `website` honeypot.
A nonblank honeypot submission returns a generic accepted response without a
provider call and does not reveal the internal handling. The endpoint applies
strict content type/body-size limits, schema allowlists, bounded strings,
viewport/enumeration checks, an 8-second provider timeout, and per-form
ephemeral `Idempotency-Key` transport. No application-level IP/network store
or CAPTCHA is added for the MVP; Basin spam/domain filtering remains part of
deployment configuration.

## Desktop and mobile placement

Desktop uses a compact fixed entry at bottom/right with safe-area clearance,
visible keyboard focus, and a lower visual weight than analysis controls. It
is hidden on `/feedback` itself.

Mobile uses a normal document footer entry, never a fixed or sticky control.
The global layout reserves bottom space and the form uses 44px-class controls.
The feedback route is direct-loadable, explains the application context, and
provides a clear return link. An entry-created route stores a minimized
allowlisted snapshot in session storage and uses browser history on return so
race/rider/query and scroll state are not unnecessarily discarded. Direct
loads return to `/`.

## Validation and failure behavior

Both client and server validate schema version, category enum, trimmed
message, optional email, context allowlist, ID pattern/length, four-rider
maximum, viewport bounds, and all enum values. Invalid payloads never reach the
provider. Empty/whitespace messages and malformed emails are associated with
their fields and focus moves to the first invalid field.

Sending disables the form and exposes text loading status. Double clicks are
blocked. Provider/network/configuration failures use a generic error, keep all
entered fields, preserve category/message/contact, and allow manual retry.
Provider status/body details are not exposed to the client. Success replaces
the form with a polite live status announcement and a return action, preventing
duplicate resubmission.

## Validation performed

- `npm.cmd test` — PASS (101 tests).
- `npx.cmd tsc --noEmit` — PASS.
- `npm.cmd run lint` — PASS.
- `npm.cmd run build` — PASS.
- `git diff --check` — PASS.
- Schema/context/API/UI tests include the UX3-1B invalid, privacy, provider,
  honeypot, retry, and duplicate-submit cases.

## Browser verification

Local browser verification used the running development server and a local
mock provider only; no real Basin submission was made.

- Desktop 1440×900, 1280×720, and 1024×768: entry visible with bottom/right
  clearance; no document overflow; feedback route usable.
- Desktop analysis route: entry opened `/feedback`, return preserved
  `/race/MMJ-256-005?rider=KNS-000-4368` in the live check.
- Desktop empty submit focused the category field; provider failure focused the
  generic alert and retained entered fields.
- Local mock provider returned success; success live status received focus and
  the form was replaced by the completion state.
- Mobile 390×844 and 320×568: no fixed feedback button, footer entry static,
  form controls usable, no horizontal overflow, invalid/error retry behavior
  verified.
- Effective CSS viewports corresponding to 125% and 150% browser zoom were
  checked for 1440×900 and 1280×720. At the 150% equivalents the layout
  correctly switches to the non-sticky mobile entry.

## Security, privacy, and UX review

Independent reviewer result: `PASS`.

- Security review: `PASS`. Basin remains server-only; validation, provider
  error mapping, honeypot behavior, URL/context allowlisting, and email
  handling were checked. No secret or provider endpoint is present in client
  output.
- Privacy review: `PASS` for the implementation and documented operational
  gate. The allowlist, forbidden-data exclusions, disclosure, optional contact,
  and 90-day deletion procedure are consistent. Actual provider retention
  configuration remains a deployment requirement.
- Independent UX review: `PASS`. Desktop placement is secondary, mobile entry
  is non-sticky, the direct route is usable, error/retry retains input, success
  is announced, focus is local to the feedback route, and no overflow was
  observed at the required viewports.

## Known limitations and deployment requirements

- `FEEDBACK_BASIN_ENDPOINT` is not configured in this local environment, so
  production receipt and deletion cannot be claimed here.
- A deployment operator must configure Basin Starter retention/deletion for
  the 90-day policy and verify the endpoint separately in Production, Preview,
  and Development.
- The local success check used a local mock provider and is not production
  smoke verification.
- Human Field Test analysis remains `NOT YET EXECUTED`.

## Acceptance matrix and final status

- AC1 Desktop secondary entry: PASS
- AC2 Mobile non-obstructing entry: PASS
- AC3 Anonymous feedback: PASS
- AC4 Category + message submission: PASS
- AC5 Optional contact: PASS
- AC6 Allowlisted auto-context: PASS
- AC7 Forbidden data excluded: PASS
- AC8 Server-side validation: PASS
- AC9 Provider secret isolation: PASS
- AC10 Provider adapter boundary: PASS
- AC11 Honeypot and reasonable abuse baseline: PASS
- AC12 Duplicate-submit suppression: PASS
- AC13 Failure retains input: PASS
- AC14 Manual retry: PASS
- AC15 Accessible success/error state: PASS
- AC16 Desktop regression checks: PASS
- AC17 Mobile regression checks: PASS
- AC18 Automated tests: PASS
- AC19 Security review: PASS
- AC20 Privacy review: PASS
- AC21 Retention policy: PASS for the documented 90-day operational
  mechanism; provider configuration and deletion evidence are pending.

Production configuration status: `FEEDBACK_BASIN_ENDPOINT` is not available
in this environment. Production smoke was not run and no real Basin submission
was made. The local mock-provider success flow and missing-provider failure
flow both passed. Configure separate Development, Preview, and Production
values and verify Basin retention/deletion before enabling production intake.

Final verdict:

`UX3-1C IMPLEMENTATION COMPLETE — PRODUCTION CONFIG REQUIRED`
