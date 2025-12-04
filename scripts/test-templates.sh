#!/usr/bin/env bash
set -euo pipefail

# Simple smoke test: ensure manifests conform to schema
node schema/validators/validate-schemas.cjs
