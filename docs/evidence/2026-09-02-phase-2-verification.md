# Stage 2 Verification — WebMCP Agent Editing

- Date: 2026-09-02 (Asia/Shanghai)
- Baseline commit: `43e725a` on `main`; Stage 0–2 baseline will be committed after this gate
- Result: `verified`
- Stage 1 prerequisite: [`2026-09-02-phase-1-verification.md`](2026-09-02-phase-1-verification.md)

## Delivered behavior

- The standard `document.modelContext` surface registers exactly `describe_app`, `list_components`, `add_component`, `update_component`, `move_component`, `remove_component`, `validate_app`, and `undo_last_change`.
- All write tools dispatch to the same serial Command Runtime used by the human inspector; no tool edits DOM, Store, or json-render state directly.
- Move preserves a single parent and rejects root moves, cycles, unknown IDs, invalid parents, and out-of-range positions atomically.
- Remove first returns an affected-subtree preview and revision-bound confirmation token without changing state. Only the matching second call commits deletion.
- Undo restores the latest committed pre-state. Tool results include a unique `commandId` and `changedNodeIds`.
- Human and Agent changes update the same component tree and real json-render canvas without reload, with both sources visible in Activity.

## Focused core and adapter verification

```text
pnpm test -- src/adapters/webmcp/tools.test.ts src/core/runtime/runtime.test.ts
Test Files 6 passed (6)
Tests      35 passed (35)
exit 0
```

Coverage includes:

- exact names, descriptions, JSON Schemas, standard registration, and AbortSignal disposal for all eight tools;
- ten repeated describe/list reads with deep-equal AppSpec and identical Runtime snapshot;
- Agent add, update, move, remove preview, confirmed remove, and undo through one Runtime;
- unknown IDs and invalid properties rejected with path-level errors and deep-equal state;
- root moves, cycles, invalid parents, orphaning, and bounds failures;
- incorrect and expired confirmation tokens, recursive subtree impact, and state-preserving unconfirmed removal;
- undo after add, update, move, and remove.

## Browser adapter contract

```text
pnpm test:e2e
human vertical slice updates tree and real canvas within 500ms — passed
WebMCP adapter contract reads the same current runtime state — passed
2 passed
exit 0
```

The adapter-contract lane explicitly injects a test `modelContext`. It verifies registration shape and application integration but is not counted as native WebMCP evidence.

## Native Chrome WebMCP evidence (AC-03–AC-09)

```text
pnpm test:webmcp:real
real Chrome discovers and executes the complete shared editing flow — passed
1 passed
exit 0
```

Chrome 152 was launched with `WebMCPTesting`, `DevToolsWebMCPSupport`, and experimental web-platform features. No page script installed a shim. The test used native `document.modelContext.getTools()` and `executeTool()` to:

1. Discover exactly the eight required tools and inspect their descriptions and input Schemas.
2. Observe a human update to `crm-intro` at revision 1.
3. Read the 15-node AppSpec with describe/list.
4. Add an Agent forecast Metric and observe it in both tree and real json-render canvas.
5. Update its value to `$530K` and observe the canvas.
6. Move it to index 0 and verify the shared component order.
7. Preview deletion and verify the UI remains unchanged.
8. Confirm deletion and verify the UI removes it.
9. Undo deletion and verify the UI restores it.
10. Validate the final AppSpec and observe both `human` and `agent` activity entries.

The same run asserted no page or console errors.

## Runtime boundary check

```text
rg "store/internal|createInternalAppSpecStore|setSpec" src/features src/adapters src/App.tsx src/app-runtime.ts
no matches

rg "runtime.dispatch" src/features src/adapters/webmcp/tools.ts
human commands: Inspector.tsx
agent commands: tools.ts
```

Only the Runtime imports the internal Store. Both human and WebMCP entry points depend on the public Runtime API.

## Full Stage 2 quality gate

Final sequence against one worktree state:

```text
pnpm install --frozen-lockfile  exit 0
pnpm format                    exit 0
pnpm lint                      exit 0
pnpm typecheck                 exit 0
pnpm test                      exit 0 (6 files, 35 tests)
pnpm test:e2e                  exit 0 (2 tests)
pnpm test:webmcp:real          exit 0 (1 native Chrome test)
pnpm build                     exit 0 (137 modules transformed)
```

Production assets: CSS 7.47 kB (2.36 kB gzip), JavaScript 363.06 kB (109.17 kB gzip).

## Exit mapping

| Acceptance slice           | Result | Evidence                                                           |
| -------------------------- | ------ | ------------------------------------------------------------------ |
| AC-03 shared Runtime       | passed | boundary scan + alternating native Chrome flow                     |
| AC-04 live canvas/tree     | passed | human and Agent mutations observed without reload                  |
| AC-05 eight-tool discovery | passed | native Chrome exact-name and metadata assertions                   |
| AC-06 read-only tools      | passed | ten-call adapter test + native describe/list                       |
| AC-07 write tools          | passed | native add/update/move/remove plus tree/canvas assertions          |
| AC-08 atomic validation    | passed | invariant and deep-equality failure tests                          |
| AC-09 confirmation         | passed | token preview/confirm tests + native unchanged-before-confirm flow |
| G2.1 Runtime-only tools    | passed | import boundary scan and adapter contract tests                    |
| G2.2 confirmed removal     | passed | core, adapter, and native Chrome evidence                          |
| G2.3 safe move             | passed | root/cycle/parent/index invariant tests                            |

Stage 3 may add explicit human confirmation controls, bounded audit/history, multi-step undo UX, and refresh persistence without changing this shared Runtime boundary.
