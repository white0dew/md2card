---
name: ideacard
description: Validate or render Markdown card pages with the ideacard headless CLI from a JSON file or stdin, without browser UI automation.
---

# ideacard headless CLI

Use this skill when an agent needs PNG card pages from Markdown. Prefer this CLI over interacting with the editor UI.

## Non-negotiable workflow

- **Do not use browser UI automation**: no clicking the editor, `agent-browser`, Playwright, WebDriver, or custom CDP scripting. Pass JSON to the CLI; it owns its isolated Chromium session for `render`.
- Validate the exact JSON first, then render it.
- Read `.agents/skills/ideacard/visual-config.json` before preparing a card. It is the persisted visual configuration from the editor and intentionally has no article Markdown.
- Without `--input` or `--stdin`, the CLI reads `.agents/skills/ideacard/default-input.json`. It provides a Markdown placeholder; merge the visual configuration into the final CLI input.
- `--input <file.json>` overrides the default file; `--stdin` is reserved for generated input. The two input sources are mutually exclusive.
- The website's `复制 Agent 配置` button exports the same visual-settings shape. It intentionally excludes article Markdown and includes `profile.avatarUrl`, which is the current avatar/cover-image source. Update `visual-config.json` with the copied JSON when changing the persisted default.

## Prerequisites

From the repository root, install project dependencies once:

```bash
pnpm install
```

`validate` is local schema validation only. `render` additionally needs:

1. An ideacard app serving the `/headless` route. The default base URL is `http://127.0.0.1:3000`; start the app if it is not already available:

   ```bash
   pnpm dev
   ```

   Or direct the CLI to an already-running app origin:

   ```bash
   export IDEACARD_URL=http://127.0.0.1:3000
   ```

2. An executable Chromium. The CLI first looks for a cached Playwright Chromium. If that is unavailable, provide its absolute path:

   ```bash
   export IDEACARD_CHROMIUM_PATH=/absolute/path/to/chromium
   ```

## Commands

Only `validate` and `render` are supported. They read the skill default JSON unless `--input <file.json>` or `--stdin` is supplied; only `render` requires `--out <directory>`.

For repeatable local production, keep the Markdown and card parameters in a JSON file:

```bash
pnpm run ideacard validate --input ./card.json
pnpm run ideacard render --input ./card.json --out "$PWD/artifacts/card"
```

`--stdin` remains useful for generated input in a shell pipeline:

```bash
printf '%s\n' '{"markdown":"# A card\n\nValidated before rendering."}' \
  | pnpm run ideacard validate --stdin
```

A successful validation writes JSON such as `{"ok":true,"valid":true,"input":{...}}` to stdout. It does not require the app URL or Chromium.

```bash
mkdir -p artifacts/first-card
printf '%s\n' '{"markdown":"# A card\n\nRendered without editor automation."}' \
  | pnpm run ideacard render --stdin --out "$PWD/artifacts/first-card"
```

For a non-default server or Chromium, set `IDEACARD_URL` and/or `IDEACARD_CHROMIUM_PATH` in the environment of the `render` command.

## JSON stdin schema

All unlisted fields are rejected. `markdown` is the only required top-level field.

| Field | Type and accepted keys | Rules / defaults |
| --- | --- | --- |
| `markdown` | non-empty string | Required Markdown source. |
| `theme` | `"社交图文"`, `"留白文志"`, or `"终端纪要"` | Optional; defaults to `"社交图文"`. |
| `canvas` | object: `preset`, `width`, `height` | `preset` is one of `xiaohongshu`, `portrait`, `social`, `16:9`, `4:3`, `1:1`, or `custom`. Width/height must be finite numbers. Non-`custom` height, when supplied, must match its preset ratio. |
| `profile` | object: `name`, `timeLabel`, `avatar`, `firstPageTopOffset`, `avatarSize` | Text fields are strings. `avatar` is an `asset://<id>` reference; offset is 0–120 and avatar size is 32–96. |
| `assets` | object keyed by asset id | Each value is `{ "mimeType": string, "base64": string }`. See asset rules below. |
| `output` | object: `pixelRatio` | Optional; `pixelRatio` is a finite number from 1 to 3, default 2. |
| `security` | object: `allowHtml`, `remoteImages` | `allowHtml` is boolean and defaults to `false`; if supplied, `remoteImages` may only be `"reject"`. |
| `social` | object: `backgroundColor`, `accentColor`, `fontPreset`, `fontScaleMode`, `fontScale`, `lineHeight` | 社交图文的配色与排版。 |

A complete image input has this shape (replace the sample Base64 with real image data when using another asset):

```json
{
  "markdown": "# Launch\n\n![cover](asset://cover)",
  "theme": "社交图文",
  "canvas": { "preset": "xiaohongshu", "width": 440 },
  "profile": { "name": "IdeaCard", "avatar": "asset://cover" },
  "assets": {
    "cover": {
      "mimeType": "image/png",
      "base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9J5GQAAAAASUVORK5CYII="
    }
  },
  "output": { "pixelRatio": 2 },
  "security": { "allowHtml": false, "remoteImages": "reject" }
}
```

## Asset and HTML safety rules

- Image references in Markdown and permitted raw HTML must use `asset://<id>` and have a matching own property in `assets`.
- Do not use `http:`, `https:`, `file:`, data URLs, local paths, `local-image://`, or `srcset`; remote images are always rejected.
- An asset id starts with an alphanumeric character and may then use alphanumerics, `.`, `_`, or `-` (maximum 128 characters).
- At most 32 assets are allowed. Each decoded asset is at most 10 MiB and must be a valid `image/png`, `image/jpeg`, `image/webp`, `image/gif`, or safe `image/svg+xml` payload.
- Raw HTML is escaped unless `security.allowHtml` is `true`. Even then, event handlers, active elements (for example `script` or `iframe`), `srcset`, and remote/CSS resource references are rejected.

## Render output

`render` creates the output directory, writes one or more PNGs named `page-001.png`, `page-002.png`, and so on, then writes `manifest.json`.

Its stdout reports `ok`, `manifestPath`, and a manifest containing:

- `version: 1`
- normalized `theme` and `canvas`
- `pageCount`
- `pages`, each with `index`, `relativePath`, `absolutePath`, `byteLength`, `width`, and `height`

Treat the manifest and the PNG files as the render result; do not infer success from a browser screen.

## Failure handling

- The CLI writes a structured `{"ok":false,"error":{"message":"..."}}` result to stdout, emits an `ideacard:` diagnostic on stderr, and exits nonzero. Read that message before retrying.
- Use `validate --stdin` first for malformed JSON, missing `markdown`, unknown fields, unsupported theme/preset, invalid dimensions, or bad asset references.
- If render says Chromium was not found, set `IDEACARD_CHROMIUM_PATH` to an executable Chromium file.
- If render cannot load, errors, or times out at `/headless`, ensure the app is running and set `IDEACARD_URL` to the correct reachable app origin. Do not replace this check with UI automation.
- If an image is rejected, supply a supported image payload in `assets` and reference it only as `asset://<id>`.
