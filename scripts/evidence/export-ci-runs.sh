#!/usr/bin/env bash
# Exporta as execuções do GitHub Actions para Documentation/evidence/ci/runs.csv.
# Requer: gh autenticado com acesso ao repositório, e jq.
# Uso: bash scripts/evidence/export-ci-runs.sh [limite]
set -euo pipefail

limit="${1:-500}"
out="Documentation/evidence/ci/runs.csv"
mkdir -p "$(dirname "$out")"

{
  echo "run_id,created_at,updated_at,duration_s,event,branch,head_sha,status,conclusion,title"
  gh run list --limit "$limit" \
    --json databaseId,createdAt,updatedAt,event,headBranch,headSha,status,conclusion,displayTitle |
    jq -r '.[] | [
      .databaseId, .createdAt, .updatedAt,
      ((.updatedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)),
      .event, .headBranch, .headSha[0:7], .status, .conclusion,
      (.displayTitle | gsub("[\r\n]"; " "))
    ] | @csv'
} > "$out"

echo "Escrito $out ($(($(wc -l < "$out") - 1)) execuções)"
