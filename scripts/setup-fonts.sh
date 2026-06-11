#!/usr/bin/env bash
#
# Downloads Pretendard OTF fonts into assets/fonts/.
# Idempotent: skips if files already exist.
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FONT_DIR="$ROOT/assets/fonts"
mkdir -p "$FONT_DIR"

weights=("Regular" "Medium" "SemiBold" "Bold")
need=0
for w in "${weights[@]}"; do
  if [ ! -f "$FONT_DIR/Pretendard-$w.otf" ]; then
    need=1
  fi
done

if [ "$need" -eq 0 ]; then
  echo "✓ Pretendard fonts already present in $FONT_DIR"
  exit 0
fi

VERSION="${PRETENDARD_VERSION:-1.3.9}"
URL="https://github.com/orioncactus/pretendard/releases/download/v${VERSION}/Pretendard-${VERSION}.zip"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "↓ Downloading Pretendard v${VERSION}..."
curl -fsSL "$URL" -o "$TMP_DIR/pretendard.zip"

echo "↓ Extracting..."
unzip -q "$TMP_DIR/pretendard.zip" -d "$TMP_DIR/out"

for w in "${weights[@]}"; do
  src="$(find "$TMP_DIR/out" -name "Pretendard-$w.otf" | head -n 1)"
  if [ -z "$src" ]; then
    echo "✗ Could not find Pretendard-$w.otf in archive" >&2
    exit 1
  fi
  cp "$src" "$FONT_DIR/Pretendard-$w.otf"
  echo "  ✓ Pretendard-$w.otf"
done

echo "✓ Done. Fonts installed in $FONT_DIR"
