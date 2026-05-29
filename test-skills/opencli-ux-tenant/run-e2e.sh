#!/usr/bin/env bash
# 端到端：登录 + 租户创建/删除/校验。

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
      echo "  --profile   使用 config/ux-test.config.json 中的 profiles（默认 local）"
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

# 在父进程一次性锁定租户测试数据，子脚本继承，避免创建/搜索租户名不一致
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"
load_profile "${UX_PROFILE_ARG:-}" || exit 1
log_step "data" "本 run 租户名=${TENANT_NAME} 用户=${OWNER_USER} 手机=${PHONE} 邮箱=${EMAIL}"

if [[ "$SKIP_LOGIN" -eq 0 ]]; then
  bash "${SCRIPT_DIR}/login.sh" "${ARGS[@]}"
else
  require_opencli
  log_step "login" "已跳过（--skip-login）"
fi

bash "${SCRIPT_DIR}/tenant-create-delete.sh" "${ARGS[@]}"

echo ""
echo "E2E 完成."
