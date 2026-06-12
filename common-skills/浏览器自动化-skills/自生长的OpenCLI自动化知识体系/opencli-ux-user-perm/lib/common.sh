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
OPENCLI_KBS_LIB="$(cd "${LIB_DIR}/../.." && pwd)/lib"
# shellcheck source=../../lib/resolve-opencli-context.sh
source "${OPENCLI_KBS_LIB}/resolve-opencli-context.sh"

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
  ts="$(date +%Y%m%d-%H%M%S 2>/dev/null || echo fail)"
  local shot="${SUITE_ROOT}/screenshots/die-${ts}.png"
  opencli browser "${SESSION:-nebula-ux}" screenshot "$shot" 2>/dev/null || true
  echo "截图: $shot" >&2
  # 同步保存现场状态文本，方便离线排查
  {
    echo "=== FAILURE: ${msg} ==="
    echo "时间: $(date 2>/dev/null || echo unknown)"
    echo "Profile: ${UX_PROFILE:-unknown}"
    echo "Session: ${SESSION:-nebula-ux}"
    oc_plain get url 2>/dev/null || echo "URL: 不可获取"
    oc_plain eval 'document.title' 2>/dev/null || echo "标题: 不可获取"
  } > "${SUITE_ROOT}/screenshots/die-${ts}.txt" 2>/dev/null || true
  echo "现场: screenshots/die-${ts}.txt" >&2
  exit 1
}

#===============================================================================
# OpenCLI 包装（静默 + 错误处理）
#===============================================================================
oc_plain() {
  opencli_oc_args "$@" 2>/dev/null
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
# 登录辅助
#===============================================================================

# 密码登录 Tab + 轮询等待跳离登录页（超时 60s）
# @param $1  超时秒数（可选，默认 60）
# @exit 0-已离开登录页，1-超时
wait_leave_login() {
  local timeout="${1:-60}"
  set +e
  oc_plain click --role tab --name "密码登录" >/dev/null 2>&1 || true
  for _ in $(seq 1 "$timeout"); do
    local url
    url="$(oc_plain get url | tr -d '\r\n')"
    if [[ "$url" != *"/login"* ]]; then
      set -e
      return 0
    fi
    sleep 1
  done
  set -e
  die "登录超时（${timeout}s 内未离开 /login）"
}

#===============================================================================
# 验证码 / MFA 处理
#===============================================================================

# 检测页面中是否有图形验证码
has_captcha_visible() {
  local state
  state="$(oc_plain state 2>/dev/null || true)"
  echo "$state" | grep -q "图形验证码\|请输入图形验证码\|captcha" && return 0
  return 1
}

# 根据配置的 captchaMode 处理验证码
#   auto      — 无验证码则继续；有则报错退出
#   skip      — 跳过验证码检查
#   manual    — 暂停等待人工输入（120s 超时）
#   bind-only — 提示人工绑定后退出
handle_captcha_mode() {
  case "${CAPTCHA_MODE}" in
    auto)
      if has_captcha_visible; then
        die "检测到图形验证码，请将 profile.captchaMode 改为 manual 或 bind-only"
      fi
      ;;
    skip)
      ;;
    manual)
      if has_captcha_visible; then
        echo ""
        echo "请在浏览器中输入图形验证码，完成后按 Enter 继续...（120s 超时）"
        read -r -t 120 _ || die "等待验证码输入超时（120s）"
      fi
      ;;
    bind-only)
      die "captchaMode=bind-only：请手动登录后执行: opencli browser ${SESSION} bind"
      ;;
    *)
      die "未知 captchaMode: ${CAPTCHA_MODE}"
      ;;
  esac
}

#===============================================================================
# JS eval 辅助
#===============================================================================

# 从 opencli eval 输出中提取最后一个 JSON 对象
# stdin：opencli eval 的原始输出
# stdout：最后一个 JSON 对象
# @exit 1 — 未找到 JSON
extract_eval_json() {
  "${PYTHON_BIN:-python}" -c "
import sys, json, re
raw = sys.stdin.read()
# 匹配最内层 {} 或嵌套 {} 的 JSON
matches = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', raw, re.S)
if not matches:
    sys.exit(1)
print(matches[-1])
"
}

# 解析 eval 返回的 JSON 并断言 ok 字段为 true
# stdin：opencli eval 的原始输出
# @exit 0 — JSON 中 ok=true，1 — 解析失败或 ok=false
_parse_eval_json() {
  "${PYTHON_BIN:-python}" -c "
import sys, json, re
raw = sys.stdin.read()
m = re.search(r'\{[^{}]*\}', raw, re.S)
if not m:
    sys.exit(1)
d = json.loads(m.group(0))
sys.exit(0 if d.get('ok') else 1)
"
}
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
