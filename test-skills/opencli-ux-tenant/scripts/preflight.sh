#!/usr/bin/env bash
#===============================================================================
# 前置环境自检 — 在运行测试前快速诊断环境问题
#
# 检查项：
#   1. OpenCLI 安装 & doctor
#   2. jq / Python 可用性
#   3. 配置文件完整性
#   4. 远程环境连通性（可选 curl）
#   5. profile 配置概览
#
# 用法：
#   bash scripts/preflight.sh                    # 默认 profile=local
#   bash scripts/preflight.sh --profile cloud    # 指定 profile
#   bash scripts/preflight.sh --verbose          # 详细信息
#
# 返回码：0-全部通过，1-有警告，2-有错误
#===============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERBOSE=0
UX_PROFILE_ARG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile|-p) UX_PROFILE_ARG="${2:-}"; shift 2 ;;
    --verbose|-v) VERBOSE=1; shift ;;
    -h|--help)
      echo "用法: bash scripts/preflight.sh [--profile NAME] [--verbose]"
      exit 0 ;;
    *) echo "未知参数: $1"; exit 1 ;;
  esac
done

PASS=0
WARN=0
FAIL=0

check() {
  local status="$1" msg="$2" detail="${3:-}"
  case "$status" in
    pass) echo "  ✅ $msg"; PASS=$((PASS + 1)) ;;
    warn) echo "  ⚠️  $msg"; WARN=$((WARN + 1)); [[ -n "$detail" ]] && echo "      ↳ $detail" ;;
    fail) echo "  ❌ $msg"; FAIL=$((FAIL + 1)); [[ -n "$detail" ]] && echo "      ↳ $detail" ;;
  esac
}

echo ""
echo "=========================================="
echo "  OpenCLI 租户 UX 测试 — 前置自检"
echo "=========================================="
echo ""

# ---- 1. 依赖检查 ----
echo "【依赖检查】"

if command -v opencli >/dev/null 2>&1; then
  check pass "opencli $(opencli --version 2>/dev/null | head -1 || echo '已安装')"
else
  check fail "opencli 未安装" "请运行: npm install -g @jackwener/opencli"
fi

if command -v jq >/dev/null 2>&1; then
  check pass "jq $(jq --version 2>/dev/null || echo '已安装')"
else
  check warn "jq 未安装（降级使用 Python，速度较慢）" "可安装: winget install jqlang.jq 或 apt install jq"
fi

if python3 -c "import sys" >/dev/null 2>&1; then
  check pass "python3 $(python3 --version 2>/dev/null || echo '已安装')"
elif python -c "import sys" >/dev/null 2>&1; then
  check pass "python $(python --version 2>/dev/null || echo '已安装')"
else
  check fail "Python 未安装" "JSON 配置合并需要 Python 或 jq"
fi

# ---- 2. 配置文件检查 ----
echo ""
echo "【配置文件】"

if [[ -f "${SCRIPT_DIR}/config/ux-test.config.json" ]]; then
  check pass "主配置 config/ux-test.config.json 存在"
else
  check fail "主配置 config/ux-test.config.json 缺失"
fi

if [[ -f "${SCRIPT_DIR}/config/ux-test.config.local.json" ]]; then
  check pass "本地覆盖 config/ux-test.config.local.json 存在"
  # 检查是否有 CHANGE_ME
  if grep -q "CHANGE_ME" "${SCRIPT_DIR}/config/ux-test.config.local.json" 2>/dev/null; then
    check warn "本地配置中仍有 CHANGE_ME 占位符" "请替换为真实密码"
  fi
else
  check warn "本地覆盖不存在（远程环境需要）" "cp config/ux-test.config.local.json.example config/ux-test.config.local.json"
fi

# ---- 3. OpenCLI 桥接 ----
echo ""
echo "【浏览器桥接】"

if command -v opencli >/dev/null 2>&1; then
  if opencli doctor >/dev/null 2>&1; then
    check pass "opencli doctor 通过"
  else
    check fail "opencli doctor 未通过" "请运行 opencli doctor 查看详情"
  fi
fi

# ---- 4. Profile 配置（可选） ----
if [[ -n "${UX_PROFILE_ARG:-}" ]]; then
  echo ""
  echo "【Profile: ${UX_PROFILE_ARG}】"

  # 快速读取 profile 配置
  if command -v jq >/dev/null 2>&1; then
    local_file="${SCRIPT_DIR}/config/ux-test.config.local.json"
    main_file="${SCRIPT_DIR}/config/ux-test.config.json"

    profile_data=$(jq -r --arg p "${UX_PROFILE_ARG}" \
      '.profiles[$p] // empty | "baseUrl: \(.baseUrl)\naccount: \(.account)\ncaptchaMode: \(.captchaMode)"' \
      "$main_file" 2>/dev/null || echo "未找到")

    if [[ "$profile_data" == "未找到" ]]; then
      check fail "profile「${UX_PROFILE_ARG}」未找到"
    else
      echo "$profile_data" | while IFS= read -r line; do
        echo "    $line"
      done
      check pass "profile 配置读取成功"

      # 检查是否为远程环境且密码未覆盖
      if [[ -f "$local_file" ]]; then
        pwd_check=$(jq -r --arg p "${UX_PROFILE_ARG}" \
          '.profiles[$p].password // "CHANGE_ME"' \
          "$main_file" 2>/dev/null)
        if [[ "$pwd_check" == "CHANGE_ME" ]]; then
          check warn "远程密码仍为 CHANGE_ME" "请在 config/ux-test.config.local.json 中覆盖"
        fi
      fi
    fi
  fi
fi

# ---- 5. 环境连通性（可选） ----
if [[ -n "${UX_PROFILE_ARG:-}" ]] && command -v curl >/dev/null 2>&1; then
  echo ""
  echo "【网络连通性】"

  base_url=$(jq -r --arg p "${UX_PROFILE_ARG}" '.profiles[$p].baseUrl // empty' \
    "${SCRIPT_DIR}/config/ux-test.config.json" 2>/dev/null || echo "")

  if [[ -n "$base_url" ]] && [[ "$base_url" != "http://localhost"* ]]; then
    if curl -sI --max-time 5 "$base_url" >/dev/null 2>&1; then
      check pass "$base_url 可达"
    else
      check warn "$base_url 不可达" "请确认网络或 VPN"
    fi
  elif [[ -n "$base_url" ]]; then
    check warn "跳过 localhost 连通性检查（需在本地启动）" "请确认 microfb 在 $base_url 已运行"
  fi
fi

# ---- 汇总 ----
echo ""
echo "=========================================="
echo "  结果: $PASS 通过, $WARN 警告, $FAIL 错误"
echo "=========================================="

if [[ "$FAIL" -gt 0 ]]; then
  echo "  请修复上述错误后重试"
  exit 2
elif [[ "$WARN" -gt 0 ]]; then
  echo "  有警告项，建议处理"
  exit 1
else
  echo "  环境正常，可以开始测试"
  exit 0
fi
