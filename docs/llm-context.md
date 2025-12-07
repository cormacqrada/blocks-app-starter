# Blocks Ecosystem – LLM Context Overview

This document is a high-level map of the Blocks Ecosystem codebase and concepts, optimized for language models consuming this repository as context.

## Core Concepts

- **Block**: Smallest executable unit. JSON object with:
  - `id: string`
  - `type: "data" | "logic" | "visual"`
  - `version: string`
  - `properties: Record<string, unknown>` (block-specific config)
  - `inputs: BlockRef[]`, `outputs: BlockRef[]`
  - `schema: "blocks.schema.json"`
- **Collection**: Named list providing contextual data for blocks.
  - `name: string`
  - `kind?: "user" | "system"` (origin)
  - `items: unknown[]`
  - `relationships: Record<string, unknown>`
  - `version: string`
  - `schema: "collection.schema.json"`
- **BlockTree**: Executable document.
  - `id: string`
  - `blocks: Block[]`
  - `collections: Collection[]`

## JSON Schemas (`schema/`)

- `blocks.schema.json`
  - JSON Schema for individual `Block` instances.
  - Constrains `type` to `"data" | "logic" | "visual"`.
- `collection.schema.json`
  - JSON Schema for `Collection` (including optional `kind: "user" | "system"`).
- `manifest.schema.json`
  - Describes a manifest that bundles blocks + collections for an app/template.
- `validators/validate-schemas.cjs`
  - Uses Ajv 2020 + `ajv-formats` to compile the above schemas for CI.

## Packages Overview (`packages/`)

- `@blocks-ecosystem/core` (`packages/core`)
  - Type definitions for `Block`, `Collection`, `BlockTree`.
  - Specialized blocks:
    - Theme & tokens: `ThemeBlock`, `TokenCollection`, `ApplyTokenCollectionBlock`.
    - Layout: `DashboardBlock`, `DashboardPanelBlock`.
    - Canvas/node graph: `CanvasBlock`, `NodeBlock`, `EdgeBlock`, `NodePortDefinition`.
    - Controls: `SelectBlock`, `RangeBlock`, `SwitchBlock`.
    - Logic: `TypeScaleBlock`, `DagToUiBlock`.
    - Visual data: `TableBlock` (renders a `Collection` in tabular form).
  - Registry metadata:
    - `src/blocks.manifest.ts`: `CORE_BLOCK_MANIFEST` declaring core visual blocks.
    - `src/registrySource.ts`: `CORE_REGISTRY_SOURCE` used by the global registry.

- `@blocks-ecosystem/runtime` (`packages/runtime`)
  - `BlocksRuntime`: owns canonical `BlockTree`, applies `BlockDelta[]`, notifies adapters.
  - Markdown adapter: `markdownAdapter.ts` parses Markdown → `BlockTree`.
  - Execution helpers: `executeBlockTree` (currently applies type scale logic).

- `@blocks-ecosystem/renderer` (`packages/renderer`)
  - Web Components that render `BlockTree` instances:
    - `<blocks-renderer>`: main entry; can take Markdown or `BlockTree` via `setTree`.
    - `<blocks-canvas>` / `<blocks-node>` / edges for canvas DAGs.
    - `<blocks-dashboard>` / `<blocks-dashboard-panel>` for dashboard layouts.
  - `renderVisualLayout(tree)` → iterates `Block` with `type === "visual"`.
  - `renderVisualBlock(block, tree?)` → maps `properties.element` to DOM:
    - `heading`, `paragraph`, `code`, `blockquote`, `input`, `textarea`, `button`.
    - `table`: reads a `Collection` from `tree.collections` and renders an HTML table.
  - Internal `ensure*Styles` functions attach scoped CSS for typography, controls, canvas, nodes, dashboard, and table.

- `@blocks-ecosystem/registry` (`packages/registry`)
  - Types:
    - `BlockKind = "data" | "logic" | "visual"` (same partition as core/schema).
    - `BlockManifestEntry`: per-block metadata (label, description, element, kind, defaultProps, propSchema, runtime ref, capabilities, `schemaRef`).
    - `BlockManifest`: bundle of `BlockManifestEntry[]` per package.
    - `RegistrySource`: wraps a `BlockManifest` with `id` and `trustTier` (`"core" | "commons" | "thirdParty"`).
    - `BlockRegistryEntry`, `BlockRegistry`.
  - Functions:
    - `loadBlockRegistry({ sources, minTrust, conflictResolver })`.
    - `listBlocks(registry, filter?)` by `kind`/trust.
    - `getBlockById(registry, id)`.

## Examples (`examples/`)

- `examples/live-edit-blocks-inline`
  - Notion-style inline editor backed by `BlocksRuntime`.
  - Uses `examples/live-edit-blocks-inline/src/blockRegistry.ts` as an adapter over the global registry:
    - Imports `CORE_REGISTRY_SOURCE` from core and `loadBlockRegistry` from `@blocks-ecosystem/registry`.
    - Exposes `BLOCK_REGISTRY`, `createBlockFromRegistry`, and `findRegistryDefByElement` for local editor components.

## Key Architectural Docs (`docs/`)

- `docs/getting-started/blocks.md`
  - Conceptual overview: blocks, collections, data/logic/visual roles, block graphs as DAGs, markdown ↔ BlockTree.
- `docs/ecosystem/architecture/overview.md`
  - High-level architecture and package responsibilities (core, runtime, renderer, cli, schema).
- `docs/ecosystem/architecture/runtime-and-design-system.md`
  - Details of `BlocksRuntime`, markdown adapter, renderer adapter, and parametric design system.
- `docs/guides/api-example.md`
  - Self-demonstrating API example doc with an embedded `<!-- BLOCKS:{...} -->` BlockTree comment.

## LLM Usage Hints

- To reason about **what blocks exist** and how to present them in UIs, inspect:
  - `packages/registry/src/types.ts`
  - `packages/core/src/blocks.manifest.ts`
  - Any future `blocks.manifest.ts` in other packages (e.g. commons).
- To reason about **runtime behavior**, inspect:
  - `packages/runtime/src/index.ts`
  - `packages/runtime/src/markdownAdapter.ts`
  - `packages/runtime/src/typeScaleLogic.ts`.
- To reason about **rendering and design system**, inspect:
  - `packages/renderer/src/blocks-renderer.ts`
  - `packages/renderer/src/blocks-canvas.ts`
  - `packages/renderer/src/blocks-node.ts`
  - `packages/renderer/src/blocks-dashboard*.ts`.
- To validate or propose new block/collection shapes, align with:
  - `schema/blocks.schema.json`
  - `schema/collection.schema.json`
  - `schema/manifest.schema.json`.

This document should be kept in sync when:
- New block kinds or core block types are added.
- The registry or manifest formats change.
- The directory layout or package names change.
