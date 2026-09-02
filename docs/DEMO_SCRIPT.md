# WebMCP Challenge CRM Demo Script

Target duration: 2–3 minutes. Recording baseline: 1280×720 or larger. Run locally with the native Chrome WebMCP flags described in the README; do not use the adapter shim as protocol evidence.

## Reset and orient — 0:00–0:20

1. Click **Reset demo**.
2. Point out the four visible regions: Components, Canvas, Properties, and Activity.
3. Confirm the header shows `Revision 0`, `Undo (0)`, and `WebMCP registered`.

Visible result: the deterministic 15-node Northstar CRM fixture, empty Activity, and disabled Undo.

## Human edit — 0:20–0:40

1. Select `Text crm-intro` in Components.
2. Change Content to `Human prepared this CRM for the agent.`
3. Click **Save properties**.

Visible result: the Canvas changes immediately, revision becomes 1, and Activity shows a successful `human update`.

## Agent discovery and editing — 0:40–1:35

Ask the browser Agent to discover the page tools, then invoke these exact calls in order:

```json
{"tool":"describe_app","input":{}}
{"tool":"list_components","input":{}}
{"tool":"add_component","input":{"parentId":"metrics-grid","componentType":"Metric","props":{"label":"Agent forecast","value":"$525K"}}}
{"tool":"update_component","input":{"nodeId":"metric-16","props":{"value":"$530K"}}}
{"tool":"move_component","input":{"nodeId":"metric-16","newParentId":"metrics-grid","index":0}}
```

Visible result: exactly eight tools are discoverable; Agent forecast appears in the tree and Canvas, changes to `$530K`, moves to the first metrics position, and each successful operation appears with source `agent`.

## Reject, confirm, and undo deletion — 1:35–2:20

1. Select `Metric metric-16`, click **Delete**, show the one-component impact, and click **Cancel**.
2. Point out that the component and Canvas remain unchanged.
3. Ask the Agent to call `remove_component` for `metric-16` without a token. Show the confirmation result and unchanged UI.
4. Ask the Agent to call `remove_component` again with the returned `confirmationToken`.
5. Ask the Agent to call `undo_last_change`.
6. Finish with `validate_app`.

Visible result: cancellation and the first Agent removal call preserve state; confirmed removal deletes only the target; Undo restores it; validation succeeds; Activity clearly distinguishes human and Agent operations.

## Rehearsal command

The native Chrome lane runs this entire sequence in three independent browser contexts and prints each measured duration:

```bash
pnpm test:webmcp:real
```

Success requires 3/3 runs, each under 180 seconds, no page or console errors, exact eight-tool discovery, and no test shim.
