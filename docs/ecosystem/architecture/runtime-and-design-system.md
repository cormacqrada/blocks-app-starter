# Blocks Runtime & Parametric Design System

This document describes how the Blocks Runtime, markdown adapter, renderer, and
parametric design system fit together.

## Runtime as OS for Blocks

The runtime is the **operating system** for blocks:

- Owns the canonical `BlockTree`.
- Applies `BlockDelta[]` from adapters (markdown, filesystem, WYSIWYG, network,
  generators).
- Notifies adapters via `RuntimeAdapter.onDeltas`.
- Is the only authority on current block state.

```ts
import { BlocksRuntime, type BlockTree, type BlockDelta } from "@blocks/runtime";

const initialTree: BlockTree = { id: "doc", blocks: [], collections: [] };
const runtime = new BlocksRuntime(initialTree);

runtime.registerAdapter({
  id: "ui",
  onDeltas(deltas, rt) {
    // e.g. push rt.getTree() into a renderer
  }
});
```

## Markdown Adapter

The markdown adapter is a **pure function** that converts markdown into a
`BlockTree` or `BlockDelta[]`:

- `markdownToBlockTree(id, markdown)` – parse headings, paragraphs, code fences,
  and blockquotes into visual blocks.
- `markdownToReplaceDelta(id, markdown)` – convenience function that produces a
  single `update root` delta (`path: "root"`, `block: BlockTree`).

This adapter is used by:

- The web demo (editor → runtime).
- The CLI watcher script (filesystem markdown → BlockTree log).

## Renderer Adapter

`@blocks/renderer` is a **UI adapter**:

- Consumes an `ExecutableDocument` (markdown + BlockTree) or a direct
  `BlockTree` via `setTree(tree: BlockTree)`.
- Renders visual blocks as Web Components:

  - `element: "heading"` → `<blocks-h1>` … `<blocks-h6>`
  - `element: "paragraph"` → `<blocks-p>`
  - `element: "code"` → `<blocks-code>` wrapping `<pre><code>`
  - `element: "blockquote"` → `<blocks-blockquote>`

- Applies theming tokens from a `ThemeBlock` (see below) by mapping token keys
  to CSS custom properties (`color-text` → `--blocks-color-text`, etc.).

## ThemeBlock & Parametric Design System

The parametric design system treats theme as just another data block:

```ts
export interface ThemeBlock extends Block {
  type: "data";
  properties: {
    element: "theme";
    tokens: Record<string, string>; // e.g. { "color-text": "#e5e7eb" }
  } & Record<string, unknown>;
}
```

### Layers

1. **Base Value Collections** (future work)
   - Collections of seeds: brand colors, base spacing, base typography.
2. **Logic Blocks**
   - Pure blocks that take collections and emit derived collections:
     - Palette generators, spacing scales, type scales.
3. **Semantic Theme Assignment**
   - Logic blocks map raw derived values to semantic roles:
     - `text.muted`, `layer.raised`, `spacing.lg`, `typography.body`, etc.
4. **Theme Collection**
   - A `ThemeBlock` encapsulates semantic tokens and is attached to the
     `BlockTree`. `@blocks/renderer` reads it and applies tokens to CSS vars.
5. **Component Style Blocks** (future work)
   - Convert semantic tokens into component style objects, per component.

All these layers remain pure and serializable, forming a DAG of transformations
from base seeds → semantic theme → component styles.

## Web Demo Flow

The web demo in `examples/markdown-to-blocktree` wires the pieces together:

1. Editor → markdown adapter → BlocksRuntime

   - User types markdown in a `<textarea>`.
   - `markdownToReplaceDelta("editor-doc", markdown)` produces a single
     `update root` delta.
   - `BlocksRuntime.applyDeltas` updates the canonical `BlockTree`.

2. Runtime → `<blocks-renderer>`

   - A runtime adapter pushes `runtime.getTree()` into `<blocks-renderer>` via
     `setTree(tree)`. The renderer never owns canonical state; it just observes
     the runtime.

3. ThemeBlock → CSS variables

   - A `ThemeBlock` in the tree provides `tokens: Record<string, string>`.
   - `@blocks/renderer` maps these to CSS variables on the host element
     (`--blocks-<token>`) and uses them in its styles.

This demonstrates the core parametric design system idea: theme and structure
are both expressed as blocks and transformed via pure functions.

## Filesystem Adapter & Network

`scripts/watch-markdown.cjs` shows a filesystem adapter that watches a markdown
file and emits updated BlockTrees using the shared markdown adapter.

To connect this to a browser runtime:

- Run a `BlocksRuntime` instance on the server.
- Wrap it with a **network adapter** that broadcasts `BlockDelta[]` over
  WebSockets.
- Clients apply local deltas (e.g. from an editor) and merge remote deltas
  (with Lamport timestamps or CRDT metadata) via `BlocksRuntime`.
- `<blocks-renderer>` simply re-renders from the merged `BlockTree`.

This architecture naturally supports collaborative editing, conflict marking,
and block-level visual diffs without changing the core block grammar or
adapters.