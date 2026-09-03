# Vercel Production Verification

- Date: 2026-09-03 (Asia/Shanghai)
- URL: https://json-render-ai.vercel.app/
- Initial deployment source: `main@60da699`
- Result: `passed`

## Deployment

The user explicitly authorized Vercel deployment. Vercel imported `nice-hang/json-render-ai`, detected the Vite preset, deployed the public `main` branch, and reported the production deployment as `Ready`. The application requires no login.

## Public-origin native WebMCP

The production Playwright configuration targeted the HTTPS URL directly. It did not start a local server or inject a WebMCP shim.

```text
PRODUCTION_URL=https://json-render-ai.vercel.app pnpm test:e2e:production
REHEARSAL 1: 2283ms, passed
REHEARSAL 2: 1698ms, passed
REHEARSAL 3: 1637ms, passed
1 test passed; exit 0
```

Each independent browser context discovered exactly the eight documented native tools and completed the CRM read/add/update/move/delete-preview/reject/confirm/undo/validate flow. All three runs were far below the three-minute limit.

## Real Codex production client

A new Codex in-app browser tab opened the public URL and advertised the native `webmcp` capability. Codex fetched these page-defined tools from the Vercel origin:

```text
describe_app, list_components, add_component, update_component,
move_component, remove_component, validate_app, undo_last_change
```

Codex then called `describe_app` and `list_components`. The responses reported version 1, revision 0, root `crm-page`, and the expected 15 stable CRM component IDs. The calls did not modify the application.

The visible page showed `WebMCP registered`, the four workspace regions, and the real json-render CRM canvas. Chrome and the Codex in-app browser both reported zero console errors.

## Boundary

This evidence satisfies AC-16. It does not publish the local narrated video or submit anything to Devpost. Those actions remain separately unauthorized.
