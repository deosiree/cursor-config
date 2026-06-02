#!/usr/bin/env bash
#===============================================================================
# 登录脚本：打开登录页 → 填写凭证 → 验证码处理 → 提交 → 断言已登录
#
# 用法：
#   bash login.sh                           # local 环境（默认）
#   bash login.sh --profile cloud           # 远程 cloud 环境
#   bash login.sh --profile local --skip-login  # 跳过登录（仅校验）
#
# 依赖：opencli browser 会话，config/ux-test.config.json
# 来源：自生长的OpenCLI自动化知识体系/opencli-ux-user-perm/
#===============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

# 提取 --profile / --skip-login（剩余参数消费）
parse_args_profile "$@"

load_profile "${UX_PROFILE_ARG:-}" || exit 1
require_opencli

log_step "0" "profile=${UX_PROFILE} login=${LOGIN_URL}"

# ---- 跳过登录 ----
if [[ "$SKIP_LOGIN" -eq 1 ]]; then
  url_now="$(oc_plain get url 2>/dev/null | tr -d '\r\n' || true)"
  if [[ "$url_now" == *"/login"* ]]; then
    die "--skip-login 但当前页面仍在登录页，请先登录或 bind"
  fi
  log_step "skip" "跳过登录，当前 URL: $url_now"
  assert_logged_in
  exit 0
fi

log_step "1" "打开登录页: ${LOGIN_URL}"
oc_plain open "$LOGIN_URL" >/dev/null
sleep 2

# 检查已登录
url_after_open="$(oc_plain get url 2>/dev/null | tr -d '\r\n' || true)"
if [[ "$url_after_open" != *"/login"* ]]; then
  log_step "auth" "已处于登录态，跳过填表: $url_after_open"
  assert_logged_in
  exit 0
fi

# 验证码处理（auto / manual / bind-only）
handle_captcha_mode

log_step "2" "填写账号: ${USERNAME}"
oc_plain fill --role textbox --name "账号" "$USERNAME" >/dev/null 2>&1 || {
  oc_plain eval "document.querySelector('input')?.value='$USERNAME'" >/dev/null
}

log_step "3" "填写密码"
oc_plain fill --role textbox --name "密码" "$PASSWORD" >/dev/null 2>&1 || {
  oc_plain eval "
    const i = document.querySelector('input[type=password]');
    if(i) { i.value='$PASSWORD'; i.dispatchEvent(new Event('input',{bubbles:true})); }
  " >/dev/null
}
sleep 1

log_step "4" "点击登录"
oc_plain click --role button --name "登录" >/dev/null 2>&1 || {
  oc_plain eval "
    const btn = [...document.querySelectorAll('button')].find(b=>b.innerText.includes('登录'));
    if(btn) btn.click();
  " >/dev/null
}

# 轮询等待跳离登录页（替代 sleep 3，网络波动时更可靠）
wait_leave_login 60

echo ""
echo "✅ 登录完成: session=${SESSION}"
