# MD2Card Workbench Large-Screen Layout Design

## Goal

Make the workbench fit fullscreen desktop usage so the preview column can show the default `440px` card without being squeezed by the current three-column layout.

## Scope

This design only covers desktop workbench layout behavior:

1. Replace the current always-three-column `xl` layout with a staged desktop layout.
2. Keep the editor and preview as the primary first-row surfaces on large screens.
3. Move the settings sidebar below the primary workspace until the viewport is wide enough for a true three-column layout.
4. Ensure the preview area has enough horizontal room to display the default short-card canvas without clipping inside the pane.

## Recommended Approach

- Keep the single-column mobile/tablet layout unchanged.
- Introduce a two-stage desktop layout in `components/workbench/workbench.tsx`:
  - `xl` to below `2xl`: use a two-column top row for editor and preview, with the settings sidebar spanning the full width beneath them.
  - `2xl` and above: restore a three-column layout with editor, preview, and sidebar side by side.
- Increase the workbench container width budget so fullscreen desktop windows are not artificially capped too early.
- Give the preview pane a layout that centers the rendered card and preserves enough usable width for the default `440px` preview card on desktop.
- Keep export behavior, canvas sizing, theme rendering, and pagination logic unchanged.

## Alternatives Considered

### Option A: Staged desktop layout

- Pros: directly fixes the preview squeeze on common laptop and desktop widths, preserves all existing controls, minimal behavioral risk.
- Cons: requires a small layout reflow between `xl` and `2xl`.

### Option B: Keep three columns and rebalance widths

- Pros: smaller structural diff.
- Cons: still fragile in the `1280px` to `1600px` range, because the preview pane competes with a fixed `320px` sidebar and card width remains content-driven.

### Option C: Keep layout and scale preview cards down visually

- Pros: lowest layout change.
- Cons: misleading preview, because the on-screen card no longer matches the actual canvas size users configure and export.

## Chosen Direction

Use Option A. The preview should remain a faithful representation of the configured canvas size, so the desktop layout needs to adapt around the card instead of shrinking the card to fit.

## Layout Details

### Breakpoints

- `< xl`: keep the current stacked layout.
- `xl` to `< 2xl`: render editor and preview as the primary workspace in two columns, with settings below spanning both columns.
- `>= 2xl`: render editor, preview, and settings in three columns.

### Width Strategy

- Increase the outer workbench max width beyond the current `1680px` cap.
- Keep the sidebar fixed-width only in the `2xl` three-column layout.
- Give the preview column more room than it gets today at `xl`.

### Preview Pane Behavior

- Preserve the existing card dimensions from settings.
- Center preview content horizontally within the pane.
- Keep overflow behavior controlled by the existing `hideOverflow` setting only for content clipping, not for pane-level accidental squeezing.

## Testing

- Add failing tests first for the large-screen workbench layout classes and preview alignment behavior.
- Run targeted tests for the changed workbench/preview files.
- Run the full `pnpm test` suite.
- Run lint on the changed files.
- Use a real browser session to verify:
  - fullscreen desktop layout at large widths;
  - the preview pane shows the full default `440px` card without pane-level clipping;
  - an actual PNG export still works and the downloaded PNG content matches the source Markdown.

## Non-Goals

- No redesign of mobile layout.
- No changes to export scaling logic.
- No changes to card theme styling.
- No changes to pagination rules beyond what existing layout containers require.
