#!/usr/bin/env bash
set -euo pipefail

# Install claude-code-trace binary via cargo install.
# Builds the frontend first, then installs the Rust binary to ~/.cargo/bin.

cd "$(dirname "$0")/.."

echo "==> Installing npm dependencies..."
npm install

echo "==> Building frontend..."
npm run build

echo "==> Installing binary via cargo..."
cargo install --path src-tauri

echo ""
echo "✓ Installed! Run:"
echo "  claude-code-trace        # desktop app"
echo "  claude-code-trace --web  # web mode (opens browser)"
