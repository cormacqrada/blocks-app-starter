#!/usr/bin/env bash
set -euo pipefail

pnpm changeset version
pnpm install
pnpm -r publish --access public
