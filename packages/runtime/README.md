# @blocks/runtime – Blocks Runtime OS

The **Blocks Runtime** is the "operating system" for blocks.
It owns the **canonical Block Tree**, executes block lifecycles, renders UI
(via adapters like `@blocks/renderer`), and emits/consumes **deltas** that
keep external representations in sync.

## Core Terms

- **Block** – unit of UI/behavior. Has `id`, `type`, `props`, `state`,
  `children`, and metadata.
- **Block Tree** – canonical, serializable tree of blocks representing page
  structure and execution order.
- **Runtime** – authoritative engine that holds the Block Tree, executes block
  lifecycle, renders UI, and emits/consumes deltas.
- **Adapter** – translator between an external format (Markdown, JSON,
  filesystem, API, etc.) and the Block Tree.

In code, this starter exposes:

- `BlocksRuntime` – holds a `BlockTree` and applies `BlockDelta[]` via
  `applyDeltas`.
- `RuntimeAdapter` – interface that can observe deltas and synchronize
  external systems.
- Serialization helpers: `serializeToMarkdown` / `deserializeFromMarkdown` for
  one concrete adapter (Markdown).

## Renderer Flows

The `@blocks/renderer` Web Components package is a **UI adapter** that consumes
an `ExecutableDocument` and renders it as custom elements:

1. **Markdown as Data → BlockTree → `<blocks-*>` elements**

   - Input: markdown string, optionally with a `<!-- BLOCKS:... -->` header.
   - If the header is present, it defines the BlockTree.
   - If absent, the renderer synthesizes a BlockTree from the markdown AST
     (headings, paragraphs, code fences, blockquotes).
   - Visual blocks are then rendered as:

     - `element: "heading"` → `<blocks-h1>` … `<blocks-h6>`
     - `element: "paragraph"` → `<blocks-p>`
     - `element: "code"` → `<blocks-code>` wrapping `<pre><code>`
     - `element: "blockquote"` → `<blocks-blockquote>`

2. **External source → Adapter → Runtime → Renderer**

   - A filesystem adapter watches a markdown file:
     - File changes → adapter parses markdown → computes AST diff
       vs previous → emits `BlockDelta[]`.
   - `BlocksRuntime.applyDeltas` updates the canonical BlockTree.
   - UI adapters (like `@blocks/renderer`) re-render based on the new tree.

3. **In-app live Markdown editor (two-way)**

   - User types in a markdown editor.
   - Editor (or `<blocks-renderer>`) parses text (debounced) → AST diff →
     `BlockDelta[]` → `BlocksRuntime.applyDeltas`.
   - Runtime re-renders and can emit deltas to a file adapter, which may
     persist changes back to disk (immediate or on save).

4. **WYSIWYG block editing**

   - WYSIWYG operations (reorder blocks, edit props) produce block-level
     `BlockDelta[]`.
   - Runtime applies them and emits events.
   - A markdown adapter can compute the reverse mapping
     (block → AST nodes → text patch) to keep textual markdown in sync.

5. **Programmatic updates (generators)**

   - A generator script emits `BlockDelta[]` to create/update many blocks.
   - Runtime applies them; UI adapters incrementally re-render.

## Future Work

This starter intentionally keeps the runtime light:

- `applyDeltas` does not yet mutate the `BlockTree`; it only notifies
  adapters.
- Conflict detection/merging (e.g. concurrent edits from file + live editor)
  is not implemented but can be modeled via higher-level `BlockDelta` events.

The architecture is designed so additional adapters (filesystem, HTTP APIs,
JSON manifests) can reuse the same runtime and BlockTree grammar while
specialized renderers (web components, native, mobile) stay focused on UI.
