# Stage 5 Verification — Submission Release

- Last updated: 2026-09-03 (Asia/Shanghai)
- Latest local artifact source commit: `3ee03a7` on `main`
- Result: `in_progress` — all authorized local preparation passed; external release gates remain closed
- Stage 4 prerequisite: [`2026-09-02-phase-4-verification.md`](2026-09-02-phase-4-verification.md)

## Prepared release artifacts

- Public English README with value proposition, architecture, standard WebMCP registration, install/test/browser/demo instructions, screenshots, limitations, and MIT license.
- MIT `LICENSE` and package license metadata.
- English [`../../devpost-submission.md`](../../devpost-submission.md) draft with no invented public URLs or submission claims.
- Three reproducible native-Chrome screenshots in [`../assets/`](../assets/), plus a [real Codex Agent result](2026-09-03-codex-webmcp-full-page.png).
- Deterministic [`../DEMO_SCRIPT.md`](../DEMO_SCRIPT.md) for an under-three-minute narrated flow.
- Verified private 1280×720 narrated MP4 and reproducible local ZIP; see the latest [local delivery evidence](2026-09-03-local-delivery-verification.md).
- Dated [official submission checklist](2026-09-02-submission-checklist.md) and [AC-01～AC-18 matrix](2026-09-02-mvp-acceptance-matrix.md).

## Clean public-clone gate (G5.1)

The public repository was cloned into a new temporary directory without copying `node_modules`, caches, browser state, or local configuration.

```text
git clone https://github.com/nice-hang/json-render-ai.git
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm test:webmcp:real
pnpm build

CLEAN_CLONE_ELAPSED_SECONDS=24
48 unit/integration tests passed
10 E2E tests passed
3 native WebMCP rehearsals passed: 632ms, 489ms, 507ms
production build passed
```

After the gate, `pnpm dev --host 127.0.0.1` became ready in 74ms and an HTTP request returned the application entry containing `<div id="root"></div>`. This is comfortably inside AC-01's ten-minute requirement.

The release candidate was cloned again after `bc289c4` was pushed. That fresh public clone independently repeated the complete gate above in 24 seconds, including the updated deployable production-test harness.

## Production URL gate prepared (G5.2 preflight)

`playwright.production.config.ts` runs the same native Chrome three-rehearsal specification directly against `PRODUCTION_URL`, without a Playwright `webServer` or application shim. It requires HTTPS for every non-localhost target, preserves deployment subpaths, and writes a separate production report.

The harness itself was focused-tested against a separately started local origin before any public deployment:

```text
missing PRODUCTION_URL                 rejected before browser launch
http://example.com                    rejected before browser launch
http://127.0.0.1:4173                 allowed for harness verification only
local external-origin rehearsals      542ms, 625ms, 508ms; 3/3 passed
```

This proves the release command is executable, but it is not AC-16 evidence. AC-16 still requires an authorized public HTTPS URL and a logged-out run of:

```bash
PRODUCTION_URL=https://verified-public-url.example pnpm test:e2e:production
```

## Repository, license, and safety checks

- The GitHub repository opened in a logged-out public view and GitHub detected the MIT license.
- `pnpm licenses list --prod --json` reported Apache-2.0 for `@json-render/core`/`@json-render/react` and MIT for React, React DOM, Scheduler, and Zod.
- `pnpm audit --prod` reported no known vulnerabilities.
- Tracked-file scans found no credential-like values, private key/environment files, or user-home absolute paths from macOS, Linux, or Windows.
- README images opened from the public repository after commit `8980253` was pushed to `main`.

## Candidate quality gate

Before the clean clone, the same candidate passed:

```text
pnpm install --frozen-lockfile  exit 0
pnpm format                    exit 0
pnpm lint                      exit 0
pnpm typecheck                 exit 0
pnpm test                      exit 0 (7 files, 48 tests)
pnpm test:e2e                  exit 0 (10 tests)
pnpm test:webmcp:real          exit 0 (3 independent native rehearsals)
pnpm test:e2e:production       exit 0 (3 local harness-validation rehearsals; not AC-16)
pnpm capture:screenshots       exit 0 (3 native screenshots)
pnpm build                     exit 0 (139 modules transformed)
```

Production assets were CSS 9.06 kB (2.71 kB gzip) and JavaScript 369.53 kB (111.01 kB gzip).

## Official-rule review (G5.3 partial)

The challenge page, Official Rules, and OpenAI event page were reviewed on 2026-09-02. On 2026-09-03 at 16:02 Asia/Shanghai, the official Devpost data interface was rechecked: the challenge remained `submissions_open`, `submissions_end_at` remained `2026-09-03T20:00:00Z`, and the latest host announcement contained no extension. The deadline is September 3, 2026 at 1:00 PM Pacific Time (September 4 at 04:00 Asia/Shanghai). The live submission form has nine required custom fields, including the live URL, public repository, tested Agent/client, and AI-tool disclosures. The checklist records these alongside the public YouTube video, access-through-judging, eligibility, freeze-after-deadline, and final confirmation requirements.

The local timezone is not evidence of residence. Entrant age, eligible residence/domicile, conflict/support declarations, representative authority, Devpost registration, and acceptance of the Official Rules require the user's explicit confirmation.

## Open gates

| Gate                              | Status                    | Reason / next evidence                                                                                  |
| --------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| G5.1 clean environment            | `passed`                  | Public clone completed the full documented gate and startup in 24 seconds                               |
| G5.2 logged-out production        | `blocked_authorization`   | No public hosting operation has been authorized                                                         |
| G5.3 official checklist           | `partial`                 | Official sources reviewed; entrant confirmations, live URL, and video remain outstanding                |
| G5.4 authorized external writes   | `not_yet_authorized`      | Pushes are authorized and complete; deployment, public video, and Devpost submission are not authorized |
| AC-01～AC-18                      | `15/18 passed`            | AC-16～AC-18 are not marked passed; see the final matrix                                                |
| Public narrated video             | `prepared_local`          | A verified 130.48-second narrated MP4 exists locally; YouTube publication remains unauthorized          |
| Devpost registration/final submit | `needs_user_confirmation` | No authenticated Devpost state or final approval has been provided                                      |

Stage 5 is deliberately not marked `verified`. No application was deployed, no video was published, and nothing was submitted to Devpost while those actions lacked explicit authorization.
