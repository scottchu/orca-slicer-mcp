#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

required_files=(
  "README.md"
  "AGENTS.md"
  "PROJECT_STATE.md"
  "NEXT_AGENT.md"
  "docs/continuity.md"
  "docs/environment.md"
  "docs/requirements.md"
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

for requirement in SESSION-001 OBS-001 CTRL-001 SAFE-001 DATA-001; do
  if ! grep -Fq "$requirement" docs/requirements.md; then
    echo "docs/requirements.md is missing core requirement: $requirement" >&2
    exit 1
  fi
done

if ! grep -Fq 'pull_request_required = true' .github/repository-policy.toml; then
  echo "repository policy must require pull requests by default" >&2
  exit 1
fi

if ! grep -Fq 'server_enforcement_claimed = false' .github/repository-policy.toml; then
  echo "repository policy must not claim unverified server enforcement" >&2
  exit 1
fi

echo "repository contract: ok"
