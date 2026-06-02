#!/usr/bin/env bash
set -euo pipefail

UPSTREAM_REMOTE="${UPSTREAM_REMOTE:-upstream}"
UPSTREAM_REPO="${UPSTREAM_REPO:-https://github.com/Developabile/rive-next.git}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-main}"
SYNC_MODE="${SYNC_MODE:-merge}"

if ! git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1; then
  git remote add "$UPSTREAM_REMOTE" "$UPSTREAM_REPO"
fi

git fetch "$UPSTREAM_REMOTE" "$UPSTREAM_BRANCH"

case "$SYNC_MODE" in
  merge)
    git merge --no-ff "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
    ;;
  rebase)
    git rebase "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
    ;;
  *)
    echo "Unsupported SYNC_MODE '$SYNC_MODE'. Use 'merge' or 'rebase'." >&2
    exit 1
    ;;
esac
