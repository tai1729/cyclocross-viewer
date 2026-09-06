# UX3-1D Production Feedback Activation Report

Status: `UX3-1D NEEDS_HUMAN CONFIGURATION`

Activation date: 2026-09-06

This report records the production activation gate for the already-completed
UX3-1C implementation. No product code or feedback contract was changed.
The Human Field Test remains `NOT YET EXECUTED`.

## Source and deployment identity

- Source commit: `8d1e551b1d8eebd40cb7750ec674a38df3fe24dd`
- Branch: `main`
- Repository state: clean; `main` matches `origin/main`
- Target Vercel project: `ajocc-laptime-viewer`
- Production deployment: `dpl_8kRLdye5SR5R7JwkTEPDXRDh4fRw`
- Deployment status: `READY`
- Production alias: `https://ajocc-laptime-viewer.vercel.app/`
- Deployment source commit: `8d1e551b1d8eebd40cb7750ec674a38df3fe24dd`
- Deployed timestamp: 2026-09-06 (Vercel deployment metadata)

The local `.vercel/project.json` points to a separate project named
`01_ajocc-laptime-viewer`; the requested public alias is served by the
`ajocc-laptime-viewer` project above. The target project was inspected directly.

## Configuration status

- `FEEDBACK_BASIN_ENDPOINT` Production variable: **not configured**.
- Target project environment-variable listing: empty.
- Actual Basin endpoint: intentionally not recorded here or in source.
- Basin account/form access: unavailable in the connected environment; the
  Basin site presented Log In/Sign Up rather than an authenticated dashboard.
- Production redeploy after endpoint configuration: not applicable yet.
- Basin Production form status: not verified.
- Basin retention setting: not verified.
- Basin spam/domain settings: not verified.

No endpoint value, credential, token, or private Basin account information was
copied into the repository.

## Required human configuration

1. In Basin Dashboard, create or select a Production form named similarly to
   `AJOCC LapTime Viewer Feedback — Production`.
2. Configure raw feedback/contact retention to **90 days**.
3. Enable the appropriate Basin spam filter and honeypot compatibility. Add a
   production-domain restriction only if it does not block the application
   server endpoint; verify the setting using Basin's documented behavior.
4. Set the resulting form endpoint as the encrypted Vercel Production
   environment variable `FEEDBACK_BASIN_ENDPOINT` for the
   `ajocc-laptime-viewer` project. Do not set it in client/public variables.
5. Redeploy the production project and confirm the new deployment is READY and
   the alias above points to it.
6. Return to this report and record only non-secret evidence such as
   `Basin Production form Data Retention: 90 days — verified YYYY-MM-DD`.

Preview may use a separate staging form if desired. Development should retain
the existing local/mock strategy; do not copy the Production endpoint into
local development by default.

## Pre-smoke and production smoke

Production UI was not treated as an end-to-end success before configuration.
The required one-and-only-one anonymous smoke submission was **not run**:

`[PRODUCTION SMOKE TEST] UX3-1D feedback end-to-end verification.`

Consequently there is no Basin receipt, no production context comparison, no
production app-version confirmation, and no test record to delete. No real
feedback was sent.

The following remain pending until configuration and redeployment:

- desktop entry and analysis regression smoke;
- mobile non-sticky entry and analysis regression smoke;
- `/feedback` anonymous submission with empty email;
- sending/success announcement and return flow;
- Basin receipt/schema/context inspection;
- forbidden-data and empty-email audit;
- smoke-record deletion;
- 90-day retention recheck.

## Existing implementation evidence

UX3-1C already verified the implementation locally and with a local mock
provider: server/provider boundary, canonical validation, minimized context,
forbidden-data exclusions, honeypot, duplicate suppression, success/error UX,
desktop/mobile placement, and automated tests. This is not a substitute for
the pending Production Basin smoke.

The deployed client has no public `FEEDBACK_BASIN_ENDPOINT` value. The client
continues to call only `/api/feedback`; the Basin endpoint is read server-side.

## Acceptance status

- AC1 Basin Production form exists: **BLOCKED — human Basin access required**
- AC2 Retention is 90 days: **BLOCKED — not verified**
- AC3 Production env configured: **FAIL — variable absent**
- AC4 Post-config deployment READY: **BLOCKED — redeploy pending**
- AC5 Alias points to latest configured deployment: **BLOCKED — current READY deployment predates activation**
- AC6 Desktop entry production-usable: **PENDING production smoke**
- AC7 Mobile entry production-usable: **PENDING production smoke**
- AC8 Anonymous production submission: **NOT RUN**
- AC9 Basin receipt: **NOT RUN**
- AC10 Expected fields: **NOT RUN**
- AC11 Context correctness: **NOT RUN**
- AC12 Forbidden payload audit: **NOT RUN against a receipt**
- AC13 Production app version: **NOT RUN against a receipt**
- AC14 Success UX: **PENDING production smoke**
- AC15 Duplicate submit: **PENDING production smoke**
- AC16 Test cleanup: **NOT APPLICABLE — no test submitted**
- AC17 Desktop regression: **PENDING production smoke**
- AC18 Mobile regression: **PENDING production smoke**
- AC19 Secret/client exposure: **PASS for current deployed code; endpoint absent**
- AC20 Human Field Test status preserved: **PASS — NOT YET EXECUTED**

## Final verdict

`UX3-1D NEEDS_HUMAN — BASIN ENDPOINT REQUIRED`
