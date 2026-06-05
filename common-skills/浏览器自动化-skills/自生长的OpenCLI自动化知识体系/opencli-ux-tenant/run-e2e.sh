#!/usr/bin/env bash
#===============================================================================
# E2E 入口：登录 + 租户创建/删除/校验全流程
#
# 用法：
#   bash run-e2e.sh                           # local 环境
#   bash run-e2e.sh --profile cloud           # cloud 环境
#   bash run-e2e.sh --profile local --skip-login  # 已登录，只跑租户段
#   bash run-e2e.sh --check                   # 自检模式（不执行测试）
#
# 依赖：opencli browser、config/ux-test.config.json
# 来源：自生长的OpenCLI自动化知识体系/opencli-ux-tenant/
#===============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="$(basename "$SCRIPT_DIR")"
# auto-log: 退出时自动记录实跑结果
trap 'EXIT_CODE=$?; if [[ $EXIT_CODE -eq 0 ]]; then R="PASS"; N="租户全流程通过"; else R="FAIL"; N="exit code=$EXIT_CODE"; fi; bash "${SCRIPT_DIR}/../harvest/log-result.sh" "$R" "$N" "${SKILL_NAME}" 2>/dev/null || true' EXIT

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
    --check|-c)
      # 自检模式：输出配置概览 + 环境诊断，不执行测试
      SHELL_CHECK_MODE=1
      shift
      ;;
    -h|--help)
      echo "用法: $0 [选项]"
      echo ""
      echo "选项:"
      echo "  --profile NAME, -p NAME  使用指定 profile（默认 local，见 config/ux-test.config.json）"
      echo "  --skip-login             跳过登录，复用已有 browser session"
      echo "  --check, -c              自检模式：输出配置概览 + 环境诊断，不执行测试"
      echo "  -h, --help               显示本帮助"
      echo ""
      echo "示例:"
      echo "  bash run-e2e.sh                        # local 全流程"
      echo "  bash run-e2e.sh -p cloud               # cloud 全流程"
      echo "  bash run-e2e.sh -p cloud --skip-login  # cloud 仅租户段"
      echo "  bash run-e2e.sh --check                # 自检"
      exit 0
      ;;
    *)
      echo "未知参数: $1（使用 -h 查看帮助）" >&2
      exit 1
      ;;
  esac
done

export UX_PROFILE="${UX_PROFILE_ARG:-${UX_PROFILE:-}}"

ARGS=()
[[ -n "$UX_PROFILE_ARG" ]] && ARGS+=(--profile "$UX_PROFILE_ARG")

# 加载配置 + 锁定租户数据（子脚本继承 UX_TENANT_NAME 避免创建/搜索不一致）
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"
load_profile "${UX_PROFILE_ARG:-}" || exit 1

# ---- 自检模式：仅输出配置概览和环境诊断 ----
if [[ "${SHELL_CHECK_MODE:-0}" == "1" ]]; then
  echo ""
  echo "=========================================="
  echo "  OpenCLI 租户 UX 测试 — 环境自检"
  echo "=========================================="
  echo ""
  echo "【配置概览】"
  echo "  Profile:       ${UX_PROFILE}"
  echo "  baseUrl:       ${BASE_URL}"
  echo "  登录页:        ${LOGIN_URL}"
  echo "  租户页:        ${TENANT_URL}"
  echo "  账号:          ${ACCOUNT}"
  echo "  captchaMode:   ${CAPTCHA_MODE}"
  echo "  租户名:        ${TENANT_NAME}"
  echo "  用户名:        ${OWNER_USER}"
  echo "  手机:          ${PHONE}"
  echo "  邮箱:          ${EMAIL}"
  echo "  项目:          ${PROJECT_NAME}"
  echo "  Session:       ${SESSION}"
  echo ""
  echo "【环境诊断】"
  echo -n "  opencli:        "
  if command -v opencli >/dev/null 2>&1; then
    echo "已安装 ($(opencli --version 2>/dev/null || echo '?'))"
  else
    echo "未安装"
  fi
  echo -n "  jq:             "
  if command -v jq >/dev/null 2>&1; then
    echo "已安装 ($(jq --version 2>/dev/null || echo '?'))"
  else
    echo "未安装（降级使用 Python）"
  fi
  echo -n "  Python:         "
  if command -v "${UX_PYTHON_BIN:-python}" >/dev/null 2>&1; then
    echo "已安装 ($("$UX_PYTHON_BIN" --version 2>/dev/null || echo '?'))"
  else
    echo "未安装（JSON 合并将失败）"
  fi
  echo -n "  opencli doctor: "
  opencli doctor >/dev/null 2>&1 && echo "通过" || echo "未通过（请运行 opencli doctor 修复）"
  echo ""
  echo "【密码检查】"
  if [[ "${PASSWORD}" == "CHANGE_ME" ]]; then
    echo "  ⚠️  password 仍为 CHANGE_ME！请在 config/ux-test.config.local.json 中覆盖"
  else
    echo "  ✅ password 已配置"
  fi
  echo ""
  echo "=========================================="
  exit 0
fi

log_step "data" "本 run 租户名=${TENANT_NAME} 用户=${OWNER_USER} 手机=${PHONE} 邮箱=${EMAIL}"

# ---- 登录阶段 ----
if [[ "$SKIP_LOGIN" -eq 0 ]]; then
  bash "${SCRIPT_DIR}/login.sh" "${ARGS[@]}"
else
  require_opencli
  log_step "login" "已跳过（--skip-login）"
fi

# ---- 租户全流程 ----
bash "${SCRIPT_DIR}/tenant-create-delete.sh" "${ARGS[@]}"

echo ""
echo "E2E 完成."
