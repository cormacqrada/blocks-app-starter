# Shared Pre-commit Hooks

This starter standardizes on **Conventional Commits** for semantic versioning.

## Commit message format

- `feat: ...` – new user-facing functionality (bumps **minor**)
- `fix: ...` – bug fix (bumps **patch**)
- `docs: ...` – documentation changes
- `chore: ...` – maintenance
- `test: ...` – adding or fixing tests

Breaking changes are indicated with `!` (e.g. `feat!: ...`) or a
`BREAKING CHANGE:` footer and bump the **major** version.

Automation can then generate:

- Changelogs and release notes
- SemVer version bumps
- Git tags and GitHub Releases

This repo provides a commit-msg hook via **husky** and **commitlint** that
validates commit messages before they are recorded.
