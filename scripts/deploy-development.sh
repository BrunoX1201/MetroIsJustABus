#!/usr/bin/env bash
set -euo pipefail

: "${IMAGE_PREFIX:?IMAGE_PREFIX is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"

if [[ ! "$IMAGE_TAG" =~ ^sha-[0-9a-f]{40}$ ]]; then
  echo "IMAGE_TAG must identify a full commit SHA" >&2
  exit 1
fi

state_dir="${XDG_STATE_HOME:-$HOME/.local/state}/metroisjustabus"
state_file="$state_dir/development-image-tag"
mkdir -p "$state_dir"
previous_tag=""
if [[ -f "$state_file" ]]; then
  previous_tag="$(<"$state_file")"
fi

echo "Deploying $IMAGE_PREFIX at $IMAGE_TAG"
if docker compose --profile container pull &&
   docker compose --profile container up -d --no-build --wait &&
   node scripts/smoke.mjs; then
  printf '%s\n' "$IMAGE_TAG" > "$state_file.tmp"
  mv "$state_file.tmp" "$state_file"
  echo "Development deployment verified: $GITHUB_SHA"
else
  echo "Development deployment failed." >&2
  if [[ -n "$previous_tag" && "$previous_tag" != "$IMAGE_TAG" ]]; then
    echo "Restoring previously verified version: $previous_tag" >&2
    export IMAGE_TAG="$previous_tag"
    docker compose --profile container up -d --no-build --wait &&
      node scripts/smoke.mjs || echo "Rollback also failed; manual inspection is required." >&2
  fi
  exit 1
fi
