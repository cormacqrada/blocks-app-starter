# Blocks Ecosystem Architecture

- **Markdown as Data**: Markdown is the source of truth for documents.
- **Executable Blocks**: Documents map to block trees that can be executed.
- **Live Runtime**: Runtimes interpret block trees and render UI.
- **Two-Way Serialization**: Markdown ⇄ BlockTree via a serialization engine.

Core components:

- `@blocks/core`: core abstractions (blocks, collections, trees, ThemeBlock).
- `@blocks/runtime`: execution, serialization helpers, and the BlocksRuntime OS
  with adapters and markdownAdapter.
- `@blocks/renderer`: Web Components adapter that renders BlockTrees as
  `<blocks-*>` elements with token-based theming.
- `@blocks/cli`: scaffolding and workflows.
- `schema/`: JSON Schemas (blocks, collections, manifest).
