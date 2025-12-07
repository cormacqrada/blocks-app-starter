# Blocks App Starter

Blocks App Starter is the **meta-repo** and **core starter** for a family of Blocks-aware apps that live in their own repositories.

At a high level:

- Applications are expressed as **BlockTrees** (graphs of `data` / `logic` / `visual` blocks plus `Collection`s).
- Markdown, JSON, and live UIs are just different views over the same BlockTree.
- This repo defines the **shared grammar, runtime, renderer, and workflows** that every Blocks ecosystem app should use.

It provides:

- **Core packages** (`@blocks-ecosystem/*`) with shared abstractions, runtime, renderer, CLI, types, and config.
- **Schemas** that define the grammar of blocks, collections, and manifests.
- **Templates** for backend/frontend apps (in `templates/`).
- **Shared assets** for linting, CI, Docker, and commit workflows (in `shared/` and `.github/workflows/`).
- **Examples** that act as self-demonstrating, self-editable docs (in `examples/`).

See `docs/getting-started/` for how to bootstrap a new ecosystem app and work on this repo day-to-day.
