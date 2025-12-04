# Blocks App Starter

Hybrid ecosystem starter for the **Blocks Project**:

This repo is the **core starter** for a family of Blocks-aware apps that live in their own repositories. It provides:

- **Templates** for backend, frontend, and mobile apps.
- **Core packages** (`@blocks/*`) with shared abstractions, runtime, CLI, types, and config.
- **Schemas** that define the grammar of blocks and collections.
- **Shared assets** for linting, CI, Docker, and commit workflows.
- **Examples** that act as self-demonstrating, self-editable docs.

See `docs/getting-started/` for how to bootstrap a new ecosystem app.


The Blocks Starter Repo is the meta-repo that defines the shared operational DNA for the entire Blocks ecosystem.

Its purpose:

Make app creation fast, cheap, and high-quality

Provide CI, linting, testing, security scanning, and documentation out-of-the-box

Allow apps to use any backend or frontend stack while adhering to consistent engineering standards

Key Idea: Focus is on how you build, not what you build.

Quick Start Example
blocks-starter new backend fastapi my-app


Instantly generates a new repo with all CI, linting, testing, and security infrastructure.