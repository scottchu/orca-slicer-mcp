#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

required_files=(
  "README.md"
  "AGENTS.md"
  "PROJECT_STATE.md"
  "NEXT_AGENT.md"
  "docs/architecture.md"
  "docs/continuity.md"
  "docs/environment.md"
  "docs/requirements.md"
  "docs/roadmap.md"
  "docs/iterations/CURRENT"
  "docs/decisions/README.md"
  ".github/pull_request_template.md"
  ".github/repository-policy.toml"
)

for required_file in "${required_files[@]}"; do
  if [[ ! -s "$required_file" ]]; then
    echo "missing or empty required file: $required_file" >&2
    exit 1
  fi
done

current_iteration="$(tr -d '\r\n' < docs/iterations/CURRENT)"
if [[ -z "$current_iteration" || "$current_iteration" == */* || "$current_iteration" == "." || "$current_iteration" == ".." ]]; then
  echo "invalid active iteration name: $current_iteration" >&2
  exit 1
fi

iteration_root="docs/iterations/$current_iteration"
for iteration_file in BRIEF.md VALIDATION.md HANDOFF.md; do
  if [[ ! -s "$iteration_root/$iteration_file" ]]; then
    echo "missing or empty active iteration file: $iteration_root/$iteration_file" >&2
    exit 1
  fi
done

active_count=0
active_brief=""
for brief in docs/iterations/*/BRIEF.md; do
  if grep -Fxq -- '- Status: active' "$brief"; then
    active_count=$((active_count + 1))
    active_brief="$brief"
  fi
done

if [[ "$active_count" -ne 1 || "$active_brief" != "$iteration_root/BRIEF.md" ]]; then
  echo "exactly the CURRENT iteration must have Status: active" >&2
  exit 1
fi

for heading in "## Baseline" "## Active iteration" "## Acceptance state" "## Next action"; do
  if ! grep -Fq "$heading" PROJECT_STATE.md; then
    echo "PROJECT_STATE.md is missing heading: $heading" >&2
    exit 1
  fi
done

for phrase in "Static/software" "Protocol/simulator" "Real printer" "User outcome"; do
  if ! grep -Fqi "$phrase" PROJECT_STATE.md; then
    echo "PROJECT_STATE.md is missing acceptance layer: $phrase" >&2
    exit 1
  fi
done

for requirement in PREP-001 ORCA-001 HANDOFF-001 SESSION-001 OBS-001 CTRL-001 SAFE-001 DATA-001; do
  if ! grep -Fq "$requirement" docs/requirements.md; then
    echo "docs/requirements.md is missing core requirement: $requirement" >&2
    exit 1
  fi
done

for phrase in "Orca Preparation" "Printer Operations" "peer subsystems"; do
  if ! grep -Fqi "$phrase" README.md; then
    echo "README.md is missing product-boundary phrase: $phrase" >&2
    exit 1
  fi
done

if ! grep -Fq '0003-two-peer-subsystems.md' docs/decisions/README.md; then
  echo "decision index is missing the active product-boundary ADR" >&2
  exit 1
fi

if ! grep -Fq 'pull_request_required = true' .github/repository-policy.toml; then
  echo "repository policy must require pull requests by default" >&2
  exit 1
fi

if ! grep -Fq 'server_enforcement_claimed = false' .github/repository-policy.toml; then
  echo "repository policy must not claim unverified server enforcement" >&2
  exit 1
fi

plugin_app_root="plugins/u1-print-studio/app"
if [[ -d "$plugin_app_root" ]]; then
  if ! command -v bun >/dev/null 2>&1; then
    echo "bun is required to validate the U1 Print Studio app" >&2
    exit 1
  fi
  (
    cd "$plugin_app_root"
    bun run ui:check
    bun run ui:test
    (cd ui && bun run verify:live-fans)
    bun run ui:verify
    bun run check
    bun test src/*.test.ts
  )
fi

uv run --no-project scripts/test_u1_service.py
uv run --no-project scripts/test_u1_ship.py

echo "repository contract: ok"
