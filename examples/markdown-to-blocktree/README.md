# Markdown to BlockTree Example

This example demonstrates **converting markdown to BlockTree** and rendering it with
`<blocks-renderer>`. It shows the core architecture:

> Markdown as Data → BlockTree → Web Components

There are two key flows in this demo:

1. **Editor → markdownAdapter → BlocksRuntime → `<blocks-renderer>`**

   - The textarea emits markdown.
   - `markdownAdapter.markdownToReplaceDelta` converts it into a single
     `update root` delta.
   - `BlocksRuntime.applyDeltas` updates the canonical `BlockTree`.
   - `<blocks-renderer>` observes `runtime.getTree()` (via an adapter) and
     renders `<blocks-*>` elements.

2. **Markdown → BlockTree → `<blocks-*>` elements**

   - If no `<!-- BLOCKS:... -->` header is present, the markdownAdapter
     synthesizes a BlockTree from the markdown structure (headings, paragraphs,
     code fences, blockquotes) and renders:

   - `element: "heading"` → `<blocks-h1>` … `<blocks-h6>`
   - `element: "paragraph"` → `<blocks-p>`
   - `element: "code"` → `<blocks-code>` wrapping `<pre><code>`
   - `element: "blockquote"` → `<blocks-blockquote>`

If a `<!-- BLOCKS:... -->` header *is* present, that BlockTree is used instead
of synthesizing one, enabling full document-as-data control.

## Run locally

From the monorepo root:

```bash
pnpm install
```

Then, from this directory:

```bash
cd examples/markdown-to-blocktree
pnpm dev
```

Open the printed URL (usually http://localhost:5173) to see the API Example
Markdown and its BlockTree rendered by `<blocks-renderer>`.
