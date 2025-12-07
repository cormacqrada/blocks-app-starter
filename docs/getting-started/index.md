# Getting Started with Blocks App Starter

Blocks App Starter is the **core starter** and **shared infrastructure** for all Blocks-aware apps in your ecosystem. It defines:

- The core types (`Block`, `Collection`, `BlockTree`) and JSON Schemas in `schema/`.
- The runtime and renderer that execute and visualize BlockTrees.
- The registry and manifests that describe which blocks exist.
- The CI/linting/commit workflows that every app repo should inherit.

If you are new to the conceptual model (blocks, collections, data/logic/visual roles), read `docs/getting-started/blocks.md` first. This page focuses on **using and contributing to this repo**.

## Bootstrapping a new ecosystem app

1. Clone this repository.
2. Install dependencies with `pnpm install`.
3. Build all packages with `pnpm build`.
4. Scaffold a backend example (once the CLI template is wired up):

   ```bash
   pnpm --filter @blocks-ecosystem/cli build
   pnpm exec blocks-app new backend fastapi my-backend
   ```

5. Explore the generated app and the schemas in `schema/`.

## Working on this repo (contributing)

### Prerequisites

- Node.js 20
- `pnpm` via corepack:

  ```bash
  corepack enable
  ```

### Core commands

All commands are run from the repo root:

- Install dependencies:

  ```bash
  pnpm install
  ```

- Build all packages (uses Turbo):

  ```bash
  pnpm build
  ```

- Run tests for all packages:

  ```bash
  pnpm test
  ```

- Run lint tasks (where defined):

  ```bash
  pnpm lint
  ```

- Validate JSON Schemas (also used by CI "Test Templates"):

  ```bash
  pnpm schema:validate
  ```

- Watch markdown → BlockTree (for markdown-driven demos):

  ```bash
  pnpm watch:markdown
  ```

### Commit conventions

This repo uses **Conventional Commits** via `@commitlint/config-conventional`:

- Examples: `feat: add table block`, `fix: update collection schema`, `chore: bump deps`.
- You can lint recent commits locally with:

  ```bash
  pnpm lint:commits
  ```

Husky is installed via the root `prepare` script and may run commit hooks automatically.

### CI automations

On every push/PR, GitHub Actions runs:

- **Test Packages** (`.github/workflows/test-packages.yml`)
  - `pnpm install`
  - `pnpm build`
  - `pnpm test`
- **Test Templates** (`.github/workflows/test-templates.yml`)
  - `pnpm install`
  - `./scripts/test-templates.sh` → `node schema/validators/validate-schemas.cjs`

Keep these green by:

- Ensuring packages build and tests pass before opening a PR.
- Updating schemas and running `pnpm schema:validate` when you change anything under `schema/`.
