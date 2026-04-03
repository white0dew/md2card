# MD2Card Workbench Performance Design

## Goal

Reduce the most visible workbench performance costs without changing the editor, preview, pagination, or export feature set.

## Scope

This design only covers three fixes:

1. Stop persisting editor content to `localStorage` on every keystroke.
2. Reduce pagination measurement overhead and make pagination work cooperatively yield so new input can interrupt old work.
3. Prevent top-level workbench rerenders caused by broad Zustand subscriptions.

## Recommended Approach

- Keep editor typing state local to the editor pane and flush it to the persisted editor store on a short delay plus explicit cleanup points.
- Keep the current DOM-based pagination model, but add two safeguards:
  - cache cloned measurement shells so repeated probe pages do not recreate React roots every time;
  - yield between pagination batches and abort stale work when a newer render starts.
- Narrow `Workbench` to a selector subscription so settings changes do not rerender unrelated panes.

## Alternatives Considered

### Option A: Minimal targeted hardening

- Pros: small write scope, keeps current architecture, lower regression risk.
- Cons: does not fully redesign pagination.

### Option B: Full preview pipeline rewrite

- Pros: potentially larger long-term gains.
- Cons: much higher regression risk, much larger scope, not justified for this pass.

### Option C: Disable live preview updates while typing

- Pros: easiest way to remove typing jank.
- Cons: user-facing behavior regression, not acceptable for this tool.

## Chosen Direction

Use Option A. It directly addresses the three validated hotspots while preserving the existing interaction model.

## Validation

- Add failing tests first for buffered editor persistence, pagination cooperative scheduling/caching hooks, and selector-based workbench subscription.
- Run targeted tests, then the full `pnpm test` suite.
- Run lint on changed files and report any unrelated pre-existing lint failures separately.
- Perform browser testing with a real export flow and verify the downloaded PNG output against the source Markdown.
