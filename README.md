# json-render-ai

An agent-native low-code studio built on [json-render](https://github.com/vercel-labs/json-render) and WebMCP.

The project explores a shared application-building workflow where people edit a visual canvas directly while browser agents use structured WebMCP tools to inspect and modify the same json-render specification.

## MVP

- Render a constrained component catalog with json-render
- Expose low-code editing operations as WebMCP tools
- Let agents inspect, add, update, move, and remove components
- Keep human and agent edits synchronized on one canvas
- Validate every structured edit and provide an undo history
- Show a visible activity log for human and agent operations

## Core idea

```text
Human edits ─┐
             ├─→ Studio command runtime ─→ json-render spec ─→ Live canvas
WebMCP tools ─┘
```

The WebMCP tool schemas are grounded in the json-render component catalog, allowing an agent to work only with supported components and validated properties.

## Status

Early MVP development for the WebMCP Challenge.

## License

An open-source license will be added before the first release.
