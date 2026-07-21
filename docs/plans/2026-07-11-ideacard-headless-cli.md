# IdeaCard Headless CLI MVP

## Goal

Provide a local agent CLI that renders the existing Markdown, React pagination, theme card, and DOM-to-PNG pipeline without opening or automating the workbench UI.

## Contract

Use the package script:

```bash
pnpm --silent ideacard validate --stdin
pnpm --silent ideacard render --stdin --out /absolute/output-directory
```

Each invocation reads one JSON request from stdin and writes one JSON result to stdout. Human-readable diagnostics are written only to stderr. `render` writes `page-001.png`, subsequent pages, and `manifest.json`; every manifest page includes `absolutePath`, `relativePath`, `width`, `height`, and `byteLength` from the written PNG.

```json
{
  "markdown": "# A card\n\nContinuous Markdown.",
  "theme": "社交图文",
  "canvas": { "preset": "xiaohongshu", "width": 440 },
  "profile": {
    "name": "Author",
    "timeLabel": "07/11",
    "avatar": "asset://avatar"
  },
  "assets": {
    "avatar": { "mimeType": "image/png", "base64": "..." }
  },
  "output": { "pixelRatio": 2 },
  "security": { "allowHtml": false, "remoteImages": "reject" }
}
```

`canvas.preset` accepts the existing design presets. Non-custom canvases preserve the preset ratio and export at the existing recommended social dimensions before the configured pixel ratio. `profile` is used by the social theme without reading Zustand, IndexedDB, or localStorage.

## Security Boundaries

- `markdown` is required and the request schema rejects unsupported fields.
- Raw HTML is escaped unless `security.allowHtml` is explicitly `true`.
- Every Markdown or raw-HTML image must be an `asset://name` reference backed by `assets[name]`; `local-image://`, relative paths, data URLs, and remote URLs are rejected before rendering.
- Assets are image-only, signature-checked, capped at 32 entries and 10 MiB each. SVGs reject scripts, foreign objects, and external resource URLs.
- The headless browser has a temporary profile and is stopped after each command. It never reads or writes workbench persistence.

## Implementation Status

- Completed: request validation, explicit asset resolution, raw HTML default security, headless-only React route, social-profile context that bypasses persisted state, local Chromium CDP launcher, real DOM PNG export, and PNG manifest generation.
- Completed: schema/security tests and an opt-in integration test using `tests/fixtures/headless-continuous.md`. Set `IDEACARD_TEST_URL` to run the real browser test against a local server.
- Completed: Chromium teardown now requests `Browser.close`, waits through forced termination when necessary, and removes the temporary profile recursively with bounded retries without allowing cleanup to replace a render result or error.
- Verification result (2026-07-11): schema tests, all repository Node-loader tests (36/36), ESLint, and package-script `validate` passed. This execution sandbox rejects process port binding and Chromium socket setup with `EPERM`, so a live Next server, actual PNG render, PNG metadata/signature inspection, and original-workbench screenshot could not be produced here. Exact commands, exit codes, and the remaining blocker are recorded in `/tmp/ideacard-codex-report.md`.
