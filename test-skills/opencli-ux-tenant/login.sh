#!/usr/bin/env bash
#===============================================================================
# 登录脚本：打开登录页 → 填写凭证 → 验证码处理 → 提交 → 断言已离开登录页
#
# 用法：
#   bash login.sh                           # local 环境（默认）
#   bash login.sh --profile cloud           # 远程 cloud 环境
#   bash login.sh --profile local --skip-login  # 跳过登录（仅校验）
#
# 依赖：opencli browser 会话，config/ux-test.config.json
# 来源：.cursor/test-skills/opencli-ux-tenant/
#===============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

parse_args_profile "$@"
load_profile "${UX_PROFILE_ARG:-}" || exit 1
require_opencli

log_step "0" "profile=${UX_PROFILE} login=${LOGIN_URL}"

# ---- bind-only 模式：仅提示手动绑定 ----
if [[ "${CAPTCHA_MODE}" == "bind-only" ]]; then
  echo "bind-only：请在 Chrome 打开 ${LOGIN_URL} 并登录，然后执行："
  echo "  opencli browser ${SESSION} bind"
  exit 0
fi

log_step "1" "打开登录页"
oc_plain open "$LOGIN_URL" >/dev/null
sleep 2

# 检查是否已登录（复用已有 session）
url_after_open="$(oc_plain get url 2>/dev/null | tr -d '\r\n' || true)"
if [[ "$url_after_open" != *"/login"* ]]; then
  log_step "auth" "已处于登录态，跳过填表: $url_after_open"
  assert_logged_in
  echo ""
  echo "登录成功 (profile=${UX_PROFILE}, session=${SESSION}, 复用会话)"
  exit 0
fi

log_step "2" "切换到密码登录"
oc_plain wait text "密码登录" --timeout 15000 >/dev/null 2>&1 || true
oc_plain click --role tab --name "密码登录" >/dev/null 2>&1 || true

log_step "3" "填写账号密码"
fill_by_placeholder "请输入手机号/邮箱地址" "$ACCOUNT"
fill_by_placeholder "请输入密码" "$PASSWORD"

# 处理验证码（auto / skip / manual / bind-only）
handle_captcha_mode

log_step "4" "点击登录"
click_button "登录"

log_step "5" "等待离开登录页（超时 30s）"
wait_leave_login 30000
assert_logged_in

echo ""
echo "登录成功 (profile=${UX_PROFILE}, session=${SESSION})"
