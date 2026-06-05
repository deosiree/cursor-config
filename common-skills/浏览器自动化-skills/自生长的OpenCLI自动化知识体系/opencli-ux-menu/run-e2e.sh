#!/usr/bin/env bash
# 端到端：登录（如需）+ 菜单路由路径按项目判重 TC1~TC2。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="$(basename "$SCRIPT_DIR")"
# auto-log: 退出时自动记录实跑结果
trap 'EXIT_CODE=$?; if [[ $EXIT_CODE -eq 0 ]]; then R="PASS"; N="TC1~TC2 通过"; else R="FAIL"; N="exit code=$EXIT_CODE"; fi; bash "${SCRIPT_DIR}/../harvest/log-result.sh" "$R" "$N" "${SKILL_NAME}" 2>/dev/null || true' EXIT

SKIP_LOGIN=0
UX_PROFILE_ARG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile|-p)
      UX_PROFILE_ARG="${2:-}"
      shift 2
      ;;
    --skip-login)
      SKIP_LOGIN=1
      shift
      ;;
    -h|--help)
      echo "用法: $0 [--profile NAME] [--skip-login]"
      echo "  --profile     使用 config/ux-test.config.json 中的 profiles（默认 local-subapp）"
      echo "  --skip-login  跳过登录（local 基座 profile 且 session 已登录时）"
      exit 0
      ;;
    *)
      echo "未知参数: $1" >&2
      exit 1
      ;;
  esac
done

export UX_PROFILE="${UX_PROFILE_ARG:-${UX_PROFILE:-}}"

ARGS=()
[[ -n "$UX_PROFILE_ARG" ]] && ARGS+=(--profile "$UX_PROFILE_ARG")
[[ "$SKIP_LOGIN" -eq 1 ]] && ARGS+=(--skip-login)

bash "${SCRIPT_DIR}/menu-route-dup-check.sh" "${ARGS[@]}"

echo ""
echo "E2E 完成."
