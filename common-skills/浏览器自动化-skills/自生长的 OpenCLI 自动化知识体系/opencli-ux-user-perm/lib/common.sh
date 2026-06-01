#!/usr/bin/env bash
#===============================================================================
# OpenCLI 用户管理 UX 自动化 — 公共函数库
# 功能：OpenCLI 包装、断言、日志、失败自动截屏
#
# 来源：自生长的OpenCLI自动化知识体系/opencli-ux-user-perm/
# 注意：本文件由 login.sh / run-e2e.sh 等 source 加载
#===============================================================================

LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/config.sh
source "${LIB_DIR}/config.sh"

set -euo pipefail

#===============================================================================
# 依赖检查
#===============================================================================
require_cmd() {
  local cmd="$1"
  local hint="${2:-}"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "缺少命令: $cmd ${hint}" >&2
    exit 1
  fi
}

require_opencli() {
  require_cmd opencli "请安装: npm install -g @jackwener/opencli"
  opencli doctor >/dev/null 2>&1 || {
    echo "opencli doctor 未通过，请先修复浏览器桥接" >&2
    opencli doctor
    exit 1
  }
}

#===============================================================================
# 日志与错误处理
#===============================================================================
log_step() {
  echo ""
  echo "==> [$1] $2"
}

die() {
  local msg="$*"
  echo ""
  echo "❌ 失败: $msg" >&2
  mkdir -p "${SUITE_ROOT}/screenshots"
  local ts
  ts="$(date +%Y%m%d-%H%M%S)"
  local shot="${SUITE_ROOT}/screenshots/die-${ts}.png"
  opencli browser "${SESSION:-nebula-ux}" screenshot "$shot" 2>/dev/null || true
  echo "截图: $shot" >&2
  exit 1
}

#===============================================================================
# OpenCLI 包装（静默 + 错误处理）
#===============================================================================
oc_plain() {
  opencli browser "${SESSION:-nebula-ux}" "$@" 2>/dev/null
}

# 断言已离开登录页（即登录成功）
assert_logged_in() {
  local url
  url="$(oc_plain get url 2>/dev/null | tr -d '\r\n' || true)"
  if [[ "$url" == *"/login"* ]]; then
    die "仍在登录页，登录可能失败: $url"
  fi
  echo "✅ 已登录: $url"
}

#===============================================================================
# JS eval 辅助
#===============================================================================
eval_script_raw() {
  local script_path="$1"
  if [[ ! -f "$script_path" ]]; then
    die "脚本不存在: $script_path"
  fi
  local js
  js="$(cat "$script_path")"
  oc_plain eval "$js"
}

eval_script() {
  local script_path="$1"
  local label="${2:-执行脚本}"
  local result
  log_step "exec" "$label: $(basename "$script_path")"
  result="$(eval_script_raw "$script_path")" || die "脚本执行失败: $(basename "$script_path")"
  echo "$result"
}
