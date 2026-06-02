#!/usr/bin/env bash
# ═══════════════════════════════════════════════
# OpenCLI 自动化脚本模板
# 生成自 common-skills/浏览器自动化-skills/OpenCLI/template/
# 脚本名: __SCRIPT_NAME__
# 自生长元数据（请填充）:
#   SESSION_ORIGIN="__SESSION_ORIGIN__"   # 产自此 OpenCLI session
#   CREATED_DATE="__CREATED_DATE__"        # 创建日期
#   SOURCE_PROMPT="__SOURCE_PROMPT__"      # 触发此脚本的用户请求原文
# ═══════════════════════════════════════════════

set -euo pipefail

# ══════════════════════════════
# 配置区 — 按需修改
# ══════════════════════════════

SESSION="nebula-ux"              # OpenCLI browser session 名（跨 skill 复用）
BASE_URL="http://localhost:8080" # 目标系统地址
LOGIN_PATH="/login"              # 登录页路径
TARGET_PATH="/some/page"         # 目标操作页路径

ACCOUNT="admin@system.local"
PASSWORD="123456"

# profile 模式: local | cloud | t-cloud
PROFILE="local"

# captcha 模式: auto | manual | bind-only
CAPTCHA_MODE="auto"

# 截图目录
SCREENSHOT_DIR="./screenshots"
mkdir -p "$SCREENSHOT_DIR"

# ══════════════════════════════
# 工具函数（可直接复用）
# ══════════════════════════════

log_step() {
  echo ""
  echo "==> [$1] $2"
}

die() {
  echo "ERROR: $*" >&2
  exit 1
}

oc() {
  opencli browser "$SESSION" "$@" 2>&1
}

# 带自动重试的 oc — 网络抖动/SPA 渲染延迟时自动重试
# 用法: oc_with_retry click --role button --name "确定"
#       oc_with_retry 3 2 "wait text "加载完成" --timeout 5000"
oc_with_retry() {
  local max_retry="${RETRY_MAX:-2}"
  local delay="${RETRY_DELAY:-2}"
  local attempt=1

  # 如果第一个参数是数字，视为 max_retry
  if [[ "$1" =~ ^[0-9]+$ ]]; then
    max_retry="$1"; shift
  fi
  # 如果新第一个参数是数字，视为 delay
  if [[ "$1" =~ ^[0-9]+$ ]]; then
    delay="$1"; shift
  fi

  while [[ $attempt -le "$max_retry" ]]; do
    local output
    output="$(opencli browser "$SESSION" "$@" 2>&1)" && {
      echo "$output"
      return 0
    }
    echo "  [重试 ${attempt}/${max_retry}] $*" >&2
    sleep "$delay"
    attempt=$((attempt + 1))
  done

  # 最后一次失败，输出错误并返回非零
  opencli browser "$SESSION" "$@" 2>&1
  return $?
}

# 结构化断言：eval JS + JSON 输出 + 字段检查
# 用法: assert_eval "JS表达式" "字段名" "期望值"
# 示例: assert_eval "JSON.stringify({exists:!!document.querySelector('.el-dialog')})" "exists" "true"
assert_eval() {
  local js="$1"
  local field="$2"
  local expected="$3"
  local label="${4:-assert}"

  local raw
  raw="$(oc eval "$js" 2>/dev/null || echo "{}")"

  local actual
  actual="$(python3 -c "
import sys, json
try:
    d = json.loads('$raw')
    print(d.get('$field', ''))
except:
    print('JSON_ERROR')
" 2>/dev/null || echo "PARSE_ERROR")"

  if [[ "$actual" != "$expected" ]]; then
    echo "断言失败 [${label}]: 期望 ${field}=${expected}, 实际=${actual}" >&2
    echo "  raw: ${raw}" >&2
    screenshot "fail-${label}"
    return 1
  fi
  echo "断言通过 [${label}]: ${field}=${actual}"
  return 0
}

require_opencli() {
  if ! command -v opencli >/dev/null 2>&1; then
    die "请安装 opencli: npm install -g @jackwener/opencli"
  fi
  opencli doctor >/dev/null 2>&1 || {
    echo "opencli doctor 未通过，请修复浏览器桥接" >&2
    opencli doctor
    exit 1
  }
}

screenshot() {
  local name="${1:-debug}"
  oc screenshot "${SCREENSHOT_DIR}/${name}.png" >/dev/null 2>&1 || true
  echo "  截图: ${SCREENSHOT_DIR}/${name}.png"
}

# eval JS 并返回结构化 JSON
eval_json() {
  local js="$1"
  oc eval "$js" 2>/dev/null || echo "{}"
}

# 从 eval JSON 中提取字段（需要 Python）
extract_json_field() {
  local json="$1"
  local field="$2"
  python3 -c "import sys,json; print(json.loads('$json').get('$field',''))" 2>/dev/null || echo ""
}

# 自动登录（支持三种验证码模式）
auto_login() {
  log_step "login" "打开登录页 ${BASE_URL}${LOGIN_PATH}"
  oc open "${BASE_URL}${LOGIN_PATH}"
  sleep 2

  # 填写账号密码
  oc fill --role textbox --name "账号" "$ACCOUNT" >/dev/null 2>&1 || true
  oc fill --role textbox --name "密码" "$PASSWORD" >/dev/null 2>&1 || true

  # 验证码处理
  case "$CAPTCHA_MODE" in
    auto)
      # 直接尝试登录，如果有验证码会失败
      oc click --role button --name "登录" >/dev/null 2>&1 || true
      ;;
    manual)
      echo "请在浏览器中输入图形验证码，完成后按 Enter..."
      read -r _
      oc click --role button --name "登录" >/dev/null 2>&1 || true
      ;;
    bind-only)
      echo "请手动登录后执行: opencli browser ${SESSION} bind"
      exit 0
      ;;
  esac

  # 等待跳离登录页
  sleep 3
  local current_url
  current_url="$(oc get url 2>/dev/null | tr -d '\r\n' || echo "")"
  if [[ "$current_url" == *"/login"* ]]; then
    screenshot "login-failed"
    die "登录失败，当前仍在登录页: ${current_url}"
  fi
  log_step "login" "登录成功: ${current_url}"
}

# 清理 — 关闭 session（可选）
cleanup() {
  log_step "cleanup" "清理 session ${SESSION}"
  # 可以执行退出登录等操作
  # oc eval "localStorage.clear();" >/dev/null 2>&1 || true
}

# ══════════════════════════════
# 参数解析（--skip-login 支持）
# ══════════════════════════════

SKIP_LOGIN=0
EXTRA_ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-login) SKIP_LOGIN=1; shift ;;
    --profile|-p) PROFILE="${2:-local}"; shift 2 ;;
    *) EXTRA_ARGS+=("$1"); shift ;;
  esac
done

# ══════════════════════════════
# 主流程
# ══════════════════════════════

main() {
  log_step "init" "脚本: __SCRIPT_NAME__, profile: ${PROFILE}"

  require_opencli

  # 1. 登录 (或跳过)
  if [[ "$SKIP_LOGIN" -eq 1 ]]; then
    log_step "login" "跳过登录 (--skip-login)"
  else
    auto_login
  fi

  # 2. 导航到目标页面
  log_step "nav" "打开目标页面 ${BASE_URL}${TARGET_PATH}"
  oc open "${BASE_URL}${TARGET_PATH}"
  oc wait text "页面特征文本" --timeout 20000 || {
    screenshot "nav-failed"
    die "导航超时"
  }

  # ─── 在此填写你的操作步骤 ───

  log_step "action" "执行操作: <<<替换为你的操作描述>>>"

  # 示例操作：点击按钮
  # oc click --role button --name "新增" || {
  #   oc eval "document.querySelector('.el-button--primary').click();"
  # }

  # 示例操作：填写表单
  # oc fill --role textbox --name "名称" "测试数据" || {
  #   oc eval "
  #     const i = document.querySelector('input[placeholder=\"名称\"]');
  #     i.value = '测试数据';
  #     i.dispatchEvent(new Event('input', {bubbles: true}));
  #   "
  # }

  # 示例操作：断言
  # local result
  # result="$(eval_json "JSON.stringify({
  #   toast: document.querySelector('.el-message')?.innerText?.trim()
  # })")"
  # echo "  结果: ${result}"

  # 示例操作：截图
  screenshot "step-result"

  # ─── 操作步骤结束 ───

  log_step "done" "✅ 操作完成"
  screenshot "final"
}

main "$@"

# 捕获错误时截图
trap 'screenshot "unexpected-error"' EXIT
