# Codex Agent WebMCP Verification

- Date: 2026-09-03 (Asia/Shanghai)
- Application: `http://127.0.0.1:4173/`
- Client: Codex desktop in-app browser
- Protocol path: the browser's native `webmcp` capability and page-defined tools
- Base commit: `c74c3c9` on `main`
- Result: passed

This run closes the earlier evidence gap between deterministic native-Chrome protocol tests and an actual Codex agent client. No page script, test shim, DOM injection, or direct `document.modelContext` evaluation was used. Codex fetched the page-defined WebMCP tool surface and called the returned tool handles.

## Discovery and read

Codex opened a new in-app browser tab at the local production preview. The browser reported `WebMCP registered` and exposed exactly these eight tools:

1. `describe_app`
2. `list_components`
3. `add_component`
4. `update_component`
5. `move_component`
6. `remove_component`
7. `validate_app`
8. `undo_last_change`

`describe_app` returned the initial 15-node CRM at revision 0. `list_components` returned stable IDs and the expected parent/child structure without changing state.

## Agent mutation flow

All successful writes returned Command Runtime command IDs and `undoAvailable: true`.

| Operation      | Result                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------- |
| Add Card       | Added `card-16` under `metrics-grid`; command `02cee4d0-1a9a-4517-92a1-a907cfdcad4e`          |
| Add Metric     | Added `metric-17` under `card-16`; command `6a829194-6d70-4210-ae78-cc15c4be7843`             |
| Invalid update | Rejected unknown `helper` prop with path `/nodes/metric-17/props`; no changed IDs             |
| Valid update   | Changed the metric to `AI Forecast` / `$540K`; command `0d7a1d1a-ca05-400c-97e0-a391ebb9219d` |
| Move           | Moved `card-16` to index 3 in `metrics-grid`; command `71b60883-43fb-458b-b7f8-10980f944c3d`  |

The visible component tree and real json-render canvas updated immediately. The canvas showed an `Agent forecast` card containing `AI Forecast` and `$540K`.

## Deletion boundary and Undo

The first `remove_component` call returned an affected subtree of `card-16` and `metric-17`, required confirmation, and left revision 4 / 17 nodes unchanged. A call with `rejected-by-user` returned `invalid_confirmation`; revision and node count again remained unchanged.

A fresh preview token then confirmed removal. Command `22109088-7bdf-4e38-93da-81e9b599ac99` removed exactly the two reported nodes, producing revision 5 / 15 nodes. `undo_last_change` restored both nodes at revision 6, and `validate_app` returned `AppSpec is valid`.

## Refresh recovery and visible audit

After a full browser reload, a newly fetched WebMCP handle described 17 persisted nodes. The restored structure contained:

```text
metrics-grid -> revenue-card, deals-card, win-rate-card, card-16
card-16 -> metric-17
```

Two final agent updates changed `$540K` to `$541K` and back to `$540K`. The visible Activity region showed two `agent` / `update` / `success` records, while the canvas showed the final `$540K` value. This verifies live UI synchronization and source-attributed audit entries from real Codex tool calls.

## Artifact

- [Full-page Codex result](2026-09-03-codex-webmcp-full-page.png)

The screenshot was captured from the same in-app browser tab after the real calls. It shows `WebMCP registered`, the 17-node tree, the Agent forecast card, revision 2 after reload, Undo availability, and two Agent Activity entries.
