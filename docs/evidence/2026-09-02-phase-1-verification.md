# Stage 1 Verification — Runtime Vertical Slice

- Date: 2026-09-02 (Asia/Shanghai)
- Baseline commit: `43e725a` on `main`; Stage 0/1 work remains uncommitted
- Result: `verified`
- Stage 0 prerequisite: [`2026-09-02-phase-0-verification.md`](2026-09-02-phase-0-verification.md)

## Delivered behavior

- A frozen AppSpec Store owns the only mutable application specification.
- A serial Command Runtime validates and atomically commits `validate`, `add`, and `update`.
- Failed commands leave AppSpec, revision, and history depth unchanged.
- Successful writes create one pre-state history entry, one revision, and one activity entry.
- CRM and blank templates both pass full AppSpec validation; CRM contains all eight Catalog types.
- The studio presents Components, the real json-render Canvas, Properties, and Activity.
- A human can select `Text crm-intro`, update its content, and add a Metric to `metrics-grid`; both changes update tree, canvas, selection, revision, and log without reload.
- The Stage 0 `describe_app` adapter reads the current Runtime Store and returns the 15-node CRM state in real Chrome.

## Focused core and component verification

```text
pnpm test -- src/core/runtime src/templates src/features/studio
Test Files 5 passed (5)
Tests      21 passed (21)
exit 0
```

Coverage includes:

- one notification and one commit for a successful update;
- two concurrent commands serialized into two valid revisions;
- Catalog defaults on add;
- unknown ID, invalid type, invalid property, unknown property, and out-of-bounds index rejected atomically;
- frozen snapshots reject consumer mutation;
- read-only validation does not change state/history;
- CRM/blank fixture validation and all-eight-type assertion;
- React integration for human update + add through the same runtime.

## Browser vertical slice (AC-03 / AC-04)

```text
pnpm test:e2e
human vertical slice updates tree and real canvas within 500ms — passed
WebMCP adapter contract reads the same current runtime state — passed
2 passed
exit 0
```

The main browser test performed the planned sequence:

1. Identified all four studio regions.
2. Selected `Text crm-intro` in the component tree.
3. Changed Content and submitted `Save text`.
4. Observed the new text in the real json-render canvas within the 500ms assertion.
5. Added a Forecast Metric through Quick add.
6. Observed both the new Metric tree node and canvas content within the 500ms assertion.
7. Observed `human` in the activity log.
8. Asserted no page or console errors.

The invalid-property tests deep-compare state before and after rejection, with revision/history remaining zero.

## Real WebMCP regression

```text
pnpm test:webmcp:real
real Chrome discovers and executes describe_app — passed
1 passed
exit 0
```

Chrome 152 used native `document.modelContext.getTools()` and `executeTool()` with no shim. The result described `rootId: "crm-page"` and `nodeCount: 15`, proving the adapter reads the same runtime-backed CRM state shown by the human UI.

## Runtime boundary check

```text
rg "store/internal|createInternalAppSpecStore|setSpec|direct nodes assignment" src/features src/adapters src/App.tsx src/app-runtime.ts
no matches

rg "runtime.dispatch" src/features
Inspector.tsx: human update
Inspector.tsx: human add
```

Only `src/core/runtime/runtime.ts` imports the internal Store factory. The UI and WebMCP adapter receive the public runtime API/read function and cannot commit Store state directly. The canvas consumes only the runtime snapshot.

## Full Stage 1 quality gate

Final sequence against one worktree state:

```text
pnpm install --frozen-lockfile  exit 0
pnpm format                    exit 0
pnpm lint                      exit 0
pnpm typecheck                 exit 0
pnpm test                      exit 0 (5 files, 21 tests)
pnpm test:e2e                  exit 0 (2 tests)
pnpm test:webmcp:real          exit 0 (1 native Chrome test)
pnpm build                     exit 0 (137 modules transformed)
```

Production assets: CSS 7.47 kB (2.36 kB gzip), JavaScript 356.50 kB (107.67 kB gzip).

## Exit mapping

| Acceptance slice            | Result             | Evidence                                                    |
| --------------------------- | ------------------ | ----------------------------------------------------------- |
| AC-01 install/start/build   | passed for Stage 1 | frozen install and production build                         |
| AC-02 eight-type Catalog    | passed             | strict schemas/defaults/fields/render mapping + CRM fixture |
| AC-03 shared command entry  | passed             | Store boundary scan + UI integration + real WebMCP read     |
| AC-04 live canvas/tree      | passed             | two browser mutations with <500ms assertions                |
| G1.1 Store only via Runtime | passed             | internal Store import isolated to runtime                   |
| G1.2 atomic failure         | passed             | five deep-equality failure cases                            |
| G1.3 templates valid        | passed             | CRM/blank validation tests                                  |

Stage 2 may add move/remove/undo commands and expose the complete eight-tool WebMCP surface without changing the Stage 1 Store ownership boundary.
