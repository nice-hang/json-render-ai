# Stage 0 Verification — Contract and Risk

- Date: 2026-09-02 (Asia/Shanghai)
- Baseline commit: `43e725a` on `main`
- Worktree: preserved the pre-existing `README.md` and untracked `docs/` work; Stage 0 files remain uncommitted
- Result: `verified`

## Environment and fixed versions

- Node.js `v22.23.2`
- pnpm `11.20.0`
- Google Chrome `152.0.7977.66`
- `@json-render/core` `0.20.0`
- `@json-render/react` `0.20.0`
- `@mcp-b/webmcp-types` `5.1.0`
- React `19.2.8`, Zod `4.5.4`, Vite `8.2.2`, TypeScript `6.0.3`

`pnpm peers check` returned `No peer dependency issues found`. TypeScript was deliberately fixed at `6.0.3` after the initial `7.0.2` selection exposed an incompatible `typescript-eslint` peer range.

## Contract evidence (G0.3 / AC-02 / AC-08)

The public builder contract lives under `src/core/`:

- AppSpec is versioned and uses the confirmed `rootId` + `nodes` form.
- The Catalog contains exactly `Page`, `Stack`, `Card`, `Text`, `Metric`, `Button`, `Input`, and `Select`.
- Every Catalog entry has a strict runtime props Schema, defaults, inspector field metadata, and allowed child types.
- Validation rejects an unknown type, duplicate/mismatched ID, orphan, cycle, and invalid prop with path-level errors.
- Command and CommandResult contracts are defined independently of UI and protocol adapters.

Focused verification:

```text
pnpm test -- src/core/spec/schema.test.ts src/adapters/json-render/renderer.test.tsx src/adapters/webmcp/describe-app.test.ts
Test Files 3 passed (3)
Tests      9 passed (9)
exit 0
```

## Real json-render evidence (G0.1)

`src/adapters/json-render/adapter.ts` is the only mapping from builder AppSpec to json-render's flat `root` + `elements` spec. `JsonRenderCanvas` uses the real `@json-render/react` `Renderer` inside `JSONUIProvider`; no mock renderer exists in the application.

```text
pnpm test:e2e
json-render spike updates live — passed
WebMCP discovery contract registers on the explicit test surface — passed
2 passed
exit 0
```

The browser test loaded a fresh page, observed `json-render is live`, activated `Update spike text`, and observed `json-render updated live` without reload. It also asserted no `pageerror` or console error.

## Real WebMCP evidence (G0.2 / AC-05 spike)

The production adapter registers `describe_app` directly with standard `document.modelContext.registerTool()` and uses an `AbortSignal` for cleanup. It does not install a fallback or polyfill when WebMCP is unavailable.

The real-browser lane starts the installed Google Chrome 152 with the official local testing features:

```text
--enable-experimental-web-platform-features
--enable-features=WebMCPTesting,DevToolsWebMCPSupport
```

It does not inject or replace `document.modelContext`. It calls native `getTools()`, finds `describe_app`, and calls native `executeTool()`.

```text
pnpm test:webmcp:real
real Chrome discovers and executes describe_app — passed
1 passed
exit 0
```

Observed structured result:

```json
{
  "version": 1,
  "rootId": "page",
  "nodeCount": 3
}
```

The lane also asserted that the descriptor description and input Schema were present and that no page or console errors occurred. An earlier run detected a favicon 404; the page now uses an inline favicon and the repeated native run is clean.

The ordinary Playwright WebMCP test explicitly injects a test-only registration surface. It is contract coverage only and is not counted as real protocol evidence.

## Full Stage 0 quality gate

Run in one sequence after the final fix:

```text
pnpm install --frozen-lockfile  exit 0
pnpm format                    exit 0
pnpm lint                      exit 0
pnpm typecheck                 exit 0
pnpm test                      exit 0 (3 files, 9 tests)
pnpm test:e2e                  exit 0 (2 tests)
pnpm test:webmcp:real          exit 0 (1 native Chrome test)
pnpm build                     exit 0 (126 modules transformed)
```

Production output was generated in `dist/`; the main JavaScript asset was 344.73 kB (104.29 kB gzip).

## Adapter decisions and known limits

- Builder AppSpec remains independent of json-render's wire format; only the json-render adapter knows both shapes.
- The canonical WebMCP surface is `document.modelContext`, not the deprecated navigator testing surface.
- Chrome's current testing interface is experimental and requires Chrome 152+ plus flags for local native verification.
- Stage 0 exposes only the read-only `describe_app` spike. The remaining seven tools and all write behavior belong to Stage 2.
- The Stage 0 UI directly changes its isolated local spike state only to prove renderer liveness. Stage 1 replaces this with the sole AppSpec Store and Command Runtime required by AC-03.

## Exit gate mapping

| Gate                    | Result | Evidence                                                          |
| ----------------------- | ------ | ----------------------------------------------------------------- |
| G0.1 real json-render   | passed | real Renderer integration test + live-update E2E                  |
| G0.2 real WebMCP        | passed | Chrome 152 native `getTools`/`executeTool` lane                   |
| G0.3 runtime validation | passed | five required failure classes with path errors                    |
| Baseline quality        | passed | format, lint, typecheck, unit/integration, E2E, native MCP, build |
| Fresh browser / console | passed | independent Playwright contexts; no page or console errors        |

Stage 1 may enter with the AppSpec, Catalog, command result, json-render adapter, and WebMCP registration boundary fixed by this evidence.
