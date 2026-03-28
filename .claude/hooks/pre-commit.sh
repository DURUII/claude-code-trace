#!/bin/bash
# Pre-commit hook: check format and lint; block commit if issues found.
# Claude Code will receive the block reason and must fix before retrying.

set -uo pipefail

cd "$CLAUDE_PROJECT_DIR"

STAGED=$(git diff --cached --name-only)

if [ -z "$STAGED" ]; then
  exit 0
fi

ERRORS=""

# --- Format check ---
if ! npm run fmt:check 2>&1; then
  ERRORS="Format issues found. Run: npm run fmt, stage the changes, then retry the commit."
fi

# --- Lint check ---
if ! LINT_OUTPUT=$(npm run lint 2>&1); then
  if [ -n "$ERRORS" ]; then
    ERRORS="$ERRORS\n\nLint errors:\n$LINT_OUTPUT"
  else
    ERRORS="Lint errors found. Fix all issues, then retry the commit.\n\n$LINT_OUTPUT"
  fi
fi

if [ -n "$ERRORS" ]; then
  echo "{\"decision\": \"block\", \"reason\": $(echo -e "$ERRORS" | jq -Rs .)}"
  exit 0
fi

exit 0
