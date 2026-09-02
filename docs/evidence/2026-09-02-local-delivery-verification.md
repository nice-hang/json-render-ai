# Local MVP Delivery Verification

- Date: 2026-09-02 (Asia/Shanghai)
- Source commit inside package: `efb5ecbda47fd9c07f530774be6057e24b781bbf`
- Result: `verified_local_handoff`
- External operations: none — no deployment, public video upload, or Devpost submission

## Delivered files

- `deliverables/json-render-ai-webmcp-mvp-2026-09-02/`
- `deliverables/json-render-ai-webmcp-mvp-2026-09-02.zip`
- `deliverables/json-render-ai-webmcp-mvp-2026-09-02.zip.sha256`

The directory is intentionally ignored by Git. It is the user-owned local artifact, not repository source.

Outer ZIP SHA-256:

```text
09bea440bbb526d09c4048b2c42f99eaebc17861fa3eae129a1c64e241e5afcb
```

Compressed size is 5.2 MB; the extracted package is 5.7 MB.

## Package inventory

- Production Vite build and zero-dependency Node static launcher.
- Git source snapshot fixed to the commit above.
- 1280×720 narrated MP4.
- Three native Chrome screenshots.
- English Devpost draft, demo script, narration source, acceptance matrix, Stage 5 evidence, official checklist, and MIT license.
- Per-file `SHA256SUMS` plus the outer ZIP checksum.

## Native WebMCP recording evidence

`pnpm build:delivery` started the built Vite preview and ran `scripts/record-local-demo.mjs` in Google Chrome with native WebMCP testing enabled. The recording script:

1. discovered exactly the eight registered tools through `document.modelContext.getTools()`;
2. performed human update and native Agent describe/list/add/update/move;
3. showed human deletion cancellation with unchanged state;
4. performed native deletion preview and revision-bound confirmation;
5. performed native Undo and validation;
6. failed on any page error, console error, missing tool, or unexpected result.

No WebMCP shim was injected. Recording captions describe the native call being executed; they do not substitute its result.

The generated MP4 was probed independently:

```text
video codec: H.264
audio codec: AAC
resolution: 1280×720
duration: 130.48 seconds
mean audio volume: -16.1 dB
max audio volume: -1.8 dB
```

This satisfies the local 2–3 minute narrated-video artifact. Public YouTube availability remains intentionally untested.

## Fresh extraction verification

The outer checksum was verified before extraction. The ZIP was extracted into a new temporary directory, where verification proved:

- `unzip -t` found no archive errors;
- every entry in `SHA256SUMS` matched;
- the nested source ZIP passed `unzip -t`;
- `SOURCE_COMMIT` exactly matched the commit above;
- the included server returned the production HTML and hashed JavaScript asset;
- the MP4 contained both video and non-silent audio streams and remained under three minutes.

Finally, the extracted production build was served by its included zero-dependency server and exercised through the direct production-URL native WebMCP lane:

```text
PRODUCTION_URL=http://127.0.0.1:8093 pnpm test:e2e:production
REHEARSAL 1: 395ms, passed
REHEARSAL 2: 387ms, passed
REHEARSAL 3: 358ms, passed
1 test, 3 independent browser contexts, exit 0
```

This test targeted the packaged `app-dist`, not Vite's development server. Localhost is the production harness's documented local-artifact exception; it is not claimed as public AC-16 evidence.

The generated `deliverables/` directory was then present during `format`, `lint`, and `typecheck` checks. ESLint explicitly ignores generated delivery output, so the normal repository gate remains repeatable after packaging.

The final repository regression gate also passed 48 unit/integration tests, 10 ordinary E2E tests, three native local rehearsals (604ms, 591ms, 549ms), and the production build.

## Boundary

This is a complete private local handoff. It does not claim AC-16～AC-18 or the public Stage 5 exit gate: no HTTPS deployment, public YouTube video, entrant eligibility confirmation, Devpost registration, or final submission was performed.
