#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."   # raíz del repo

LOCK="package-lock.json"
OUT="flatpak/generated-sources.json"

if ! command -v flatpak-node-generator >/dev/null 2>&1; then
  echo "ERROR: no flatpak-node-generator." >&2
  echo "pip install --user flatpak-node-generator" >&2
  exit 1
fi

echo "$OUT from $LOCK ..."
flatpak-node-generator npm "$LOCK" \
  --electron-node-headers \
  --output "$OUT"

echo "Done. Commit $OUT alongside the manifest."
