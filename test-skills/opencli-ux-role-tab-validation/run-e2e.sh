#!/usr/bin/env bash
# 端到端：登录 + 角色 Tab 校验跳转 TC1~TC4。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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
      echo "  --profile     使用 config/ux-test.config.json 中的 profiles（默认 local）"
      echo "  --skip-login  跳过登录，复用已有 browser session Cookie"
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

bash "${SCRIPT_DIR}/role-tab-validation.sh" "${ARGS[@]}"

echo ""
echo "E2E 完成."
