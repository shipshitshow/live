#!/usr/bin/env bash
set -euo pipefail

REPO_SOURCE="https://github.com/shipshitshow/skills"
DEFAULT_AGENTS=(claude cursor codex openclaw)

usage() {
  cat <<'EOF'
Usage:
  ./skills.sh install [claude|cursor|codex|openclaw ...]
  ./skills.sh list
  ./skills.sh status
  ./skills.sh help

Notes:
  - Uses the official Skills CLI via `npx skills`
  - Installs project-local skills from https://github.com/shipshitshow/skills
  - Limits install targets to Claude, Cursor, Codex, and OpenClaw
  - Project installs use `.agents/skills` as the common folder
EOF
}

die() {
  echo "error: $*" >&2
  exit 1
}

map_agent() {
  case "$1" in
    claude) printf 'claude-code\n' ;;
    cursor) printf 'cursor\n' ;;
    codex) printf 'codex\n' ;;
    openclaw) printf 'openclaw\n' ;;
    *) die "unsupported agent: $1" ;;
  esac
}

resolve_agents() {
  if [ "$#" -eq 0 ]; then
    printf '%s\n' "${DEFAULT_AGENTS[@]}"
    return
  fi

  local agent
  for agent in "$@"; do
    printf '%s\n' "$agent"
  done
}

install_skills() {
  local mapped_agents=()
  local agent
  while IFS= read -r agent; do
    mapped_agents+=("$(map_agent "$agent")")
  done < <(resolve_agents "$@")

  npx -y skills add "$REPO_SOURCE" --skill '*' --agent "${mapped_agents[@]}" -y
}

list_skills() {
  npx -y skills add "$REPO_SOURCE" -l
}

status_skills() {
  npx -y skills ls --json
}

main() {
  local command="${1:-help}"
  shift || true

  case "$command" in
    install)
      install_skills "$@"
      ;;
    list)
      [ "$#" -eq 0 ] || die "list does not take agent arguments"
      list_skills
      ;;
    status)
      [ "$#" -eq 0 ] || die "status does not take agent arguments"
      status_skills
      ;;
    help|-h|--help)
      usage
      ;;
    *)
      die "unknown command: $command"
      ;;
  esac
}

main "$@"
