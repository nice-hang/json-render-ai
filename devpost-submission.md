# Title

json-render-ai — A Shared Low-Code Workspace for Humans and Agents

## One-line Summary

A visual app builder where people edit through a Catalog-driven inspector and browser agents safely restructure the same live json-render canvas through eight native WebMCP tools.

## Problem

Visual builders are designed for mouse and keyboard interaction. An agent trying to help must infer intent from a changing DOM, locate unstable controls, and manipulate state through UI steps that were never designed as a reliable API. The result is brittle automation, hidden partial failures, and poor human oversight—especially for destructive structural edits.

## Solution

json-render-ai gives the builder itself a structured WebMCP editing surface. A browser agent can inspect stable component IDs and issue bounded add, update, move, remove, validate, and undo commands. A human uses the visible component tree and type-driven property inspector. Both paths enter the same serial Command Runtime, validate the same AppSpec, update the same real json-render canvas, and appear in one source-labelled Activity trail.

Deletion demonstrates the human-control model: the first request only returns the exact affected subtree and a revision-bound confirmation token. Cancellation or omission leaves state unchanged. A matching confirmation commits atomically, and snapshot Undo restores the prior state.

## Why This Matters

WebMCP turns agent access from a DOM-guessing problem into a product capability the application can intentionally design. People keep the visual context, confirmation authority, auditability, and recovery controls they need; agents get stable structured tools that are faster and more reliable than clicking through the interface.

The same approach can extend beyond low-code tools to any structured editor—documents, dashboards, workflows, diagrams, and data applications—where human judgment and agent execution should share one state rather than operate in separate worlds.

## How We Used AI

The product is agent-native without embedding a hidden model call. It exposes eight standard `document.modelContext` WebMCP tools so an AI agent running in a compatible browser can discover the application's capabilities and safely act on them. Tool Schemas constrain inputs to the fixed component Catalog, structured results expose actionable failures and changed IDs, and every Agent command is visible and undoable.

The verified native flow lets a browser Agent read the CRM AppSpec, add a forecast Metric, update its value, move it, preview and confirm deletion, validate the result, and undo—all while the human sees the tree, canvas, revision, and Activity update immediately.

## How We Used Codex

Codex was the development collaborator across the full MVP cycle. It translated the acceptance criteria into staged implementation gates; built the AppSpec validator, Catalog, Runtime, json-render adapter, WebMCP adapter, inspector, recovery system, and demo UX; ran focused tests after each slice; diagnosed browser and layout failures; exercised Chrome's native WebMCP testing interface; and maintained reproducible evidence for each stage.

Codex also opened the production preview in a new Codex desktop browser tab, discovered the page's eight native WebMCP tools, and used those tool handles to complete the read/add/update/move/remove/undo/refresh flow without a shim or direct page-script call. It generated and executed three independent native rehearsal contexts, performed the 1280×720 visual check, prepared the deterministic demo script, scanned release artifacts, and drafted the final submission materials. The source history and `docs/evidence/` directory preserve the concrete verification trail rather than relying on a narrative claim.

## Key Features

- Eight validated UI component types with runtime Schemas, defaults, property controls, and real json-render mappings
- Eight discoverable WebMCP tools with exact JSON input Schemas and standard browser registration
- One serial Command Runtime for human and Agent writes
- Atomic structural and property validation with path-level errors
- Live component-tree and canvas synchronization after successful commands
- Revision-bound recursive-delete preview and confirmation
- Twenty-step snapshot Undo
- Fifty-entry, redacted, source-labelled human/Agent Activity
- Last-valid local persistence with invalid JSON, version, and structure recovery
- Deterministic one-click CRM reset and a fixed under-three-minute demo script

## Architecture

Human inspector and WebMCP tools both call the public Command Runtime. The Runtime serializes commands, validates Catalog properties and AppSpec graph invariants, commits a frozen Store snapshot, records bounded history and Activity, and triggers last-valid persistence. The React UI observes Runtime snapshots. One adapter converts the public AppSpec contract into json-render's `root` and `elements` shape; no feature code mutates json-render internals or the Store directly.

## Testing Instructions

Requirements: Node.js 22.12+, pnpm 11.20+, and Google Chrome 149+ for native WebMCP testing (Chrome 152 verified).

```bash
git clone https://github.com/nice-hang/json-render-ai.git
cd json-render-ai
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm test:webmcp:real
pnpm build
```

`pnpm test:webmcp:real` launches Chrome with the official testing feature enabled. It does not inject a page shim. The test discovers the exact eight native tools and runs the complete competition flow in three independent 1280×720 browser contexts.

For a guided manual run, use `pnpm dev`, open `http://127.0.0.1:4173`, and follow `docs/DEMO_SCRIPT.md`.

## Public Demo Link

**TODO — external deployment requires final authorization.**

## Public Repository Link

https://github.com/nice-hang/json-render-ai

## Demo Video

The private local handoff contains a narrated 1280×720 MP4 at `demo/json-render-ai-webmcp-demo.mp4`. It runs for 2 minutes 10 seconds and shows the real native WebMCP flow. A public YouTube upload and logged-out public-video check remain intentionally unexecuted and require separate authorization.

## Screenshot Shot List

1. `docs/assets/workspace-overview.png` — deterministic 15-node CRM, all four workspace regions, and native WebMCP registered.
2. `docs/assets/delete-confirmation.png` — visible stable target, five-component recursive impact, Cancel, and Confirm delete.
3. `docs/assets/shared-activity.png` — human-updated CRM, Agent-created `$530K` forecast, and source-labelled human/Agent Activity.
4. `docs/evidence/2026-09-03-codex-webmcp-full-page.png` — the result of a real Codex desktop Agent session, including the added forecast card and visible Agent Activity.

The first three are generated reproducibly with `pnpm capture:screenshots` in a native Chrome WebMCP session. The fourth is captured from the documented real Codex Agent run. The timed, word-for-word English voice-over is in `docs/VIDEO_NARRATION.md`.

## Submission Readiness Notes

- Repository: public and pushed to `main`; the Stage 5 local release-readiness evidence is committed.
- License: the MIT file is public and GitHub license detection was verified logged out.
- Local quality gates: Stage 0–4 and the Stage 5 clean-clone gate passed, including 48 unit/integration tests, 10 ordinary E2E tests, three native WebMCP rehearsals, and production build.
- Native demo: three consecutive independent local Chrome runs passed with zero page/console errors.
- Codex Agent: a real Codex desktop browser session discovered all eight page tools and completed the full mutation, confirmation, Undo, refresh, and visible-audit flow.
- Official deadline checked on 2026-09-02: September 3, 2026 at 1:00 p.m. Pacific Time.
- Local video: narrated 1280×720 MP4 prepared and verified in the private handoff.
- External gaps: public live URL and public YouTube URL.
- Human gates: entrant eligibility/residence, Devpost registration, ownership/support declarations, official-rule agreement, final material review, deployment, publication, and submit authorization.

## Known Limitations

- WebMCP is experimental; unsupported browsers show an explicit unavailable state.
- Persistence is browser-local; Undo and Activity are intentionally session-local.
- The component Catalog is deliberately fixed to eight types; arbitrary patches, executable code, cloud collaboration, and free-form drag-and-drop are outside this MVP.
- The CRM is deterministic demonstration data rather than a connected backend.
- A public deployment has not yet been created or claimed.

## TODO Official Form Fields

- Confirm entrant/team display name and member list.
- Confirm the entrant or authorized representative satisfies the official residence, age, employment/conflict, and organization eligibility rules.
- Confirm Devpost registration for The WebMCP Challenge.
- Add and re-verify the public live application URL.
- Add and re-verify the public YouTube video URL.
- Confirm ownership, third-party-license compliance, originality/new-work dates, and absence of prohibited financial or preferential support.
- Review and explicitly agree to the current Official Rules before any submission action.
- Confirm the final title and one-line summary.
