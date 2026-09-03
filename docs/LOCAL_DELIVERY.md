# Local MVP Delivery

This package is the private, local handoff of the WebMCP Challenge MVP. It does not deploy, publish a video, register an entrant, or submit anything to Devpost.

## Package contents

- `app-dist/` — production Vite build.
- `START_LOCAL.command` — zero-dependency local static server for the production build.
- `tools/serve-static.mjs` — the Node.js server used by the launcher.
- `source/` — source snapshot archive and exact source commit.
- `demo/json-render-ai-webmcp-demo.mp4` — 1280×720 narrated local demo.
- `screenshots/` — three native Chrome submission screenshots plus the real Codex Agent result.
- `submission/` — English Devpost draft, demo script, narration, acceptance matrix, Stage 5 and Codex Agent evidence, and official checklist.
- `SHA256SUMS` — integrity hashes for every handoff file except the checksum file itself.

## Open the production build

Requirements: Node.js 22.12 or later.

1. Double-click `START_LOCAL.command`, or run `./START_LOCAL.command` in Terminal.
2. Open `http://127.0.0.1:8080`.
3. Stop the server with `Control-C`.

Ordinary Chrome may show `WebMCP unavailable`. For native WebMCP, enable `chrome://flags/#enable-webmcp-testing`, restart Chrome, and open the same address. The source snapshot also contains the automated `pnpm test:webmcp:real` lane.

## Verify integrity

From the package directory:

```bash
shasum -a 256 -c SHA256SUMS
```

The outer ZIP has a sibling `.sha256` file so it can be verified before extraction.

## External gates intentionally not executed

- No public HTTPS deployment.
- No public YouTube upload.
- No Devpost submission or rules agreement.
- Entrant eligibility and account state remain for the human entrant to confirm.

These omissions preserve the user's requested local-only boundary. They remain open competition AC-16～AC-18 rather than being represented as passed.
