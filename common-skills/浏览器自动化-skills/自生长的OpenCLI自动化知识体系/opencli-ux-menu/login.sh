#!/usr/bin/env bash
# 仅登录：读取 profile，OpenCLI 打开登录页并提交凭证（登录按钮优先 .login-submit-btn）。

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

parse_args_profile "$@"
load_profile "${UX_PROFILE_ARG:-}" || exit 1
require_opencli

if [[ "${AUTH_MODE}" == "none" ]]; then
  echo "profile=${UX_PROFILE} authMode=none，跳过登录"
  exit 0
fi

log_step "0" "profile=${UX_PROFILE} login=${LOGIN_URL}"

if [[ "${CAPTCHA_MODE}" == "bind-only" ]]; then
  echo "bind-only：请在 Chrome 打开 ${LOGIN_URL} 并登录，然后执行："
  echo "  opencli browser ${SESSION} bind"
  exit 0
fi

log_step "1" "打开登录页"
oc_plain open "$LOGIN_URL" >/dev/null
sleep 2

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

handle_captcha_mode

log_step "4" "点击登录（login-submit-btn 优先）"
click_login_submit

log_step "5" "等待离开登录页"
wait_leave_login
assert_logged_in

echo ""
echo "登录成功 (profile=${UX_PROFILE}, session=${SESSION})"
