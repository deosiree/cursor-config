#!/usr/bin/env bash
# 8080 基座：人工登录当前 Chrome 标签 → bind → 跑菜单判重 TC1~TC3
#
# 用法：
#   bash bind-and-run.sh                    # 交互：提示登录后 Enter
#   bash bind-and-run.sh --already-bound    # 已 bind，直接跑用例

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

ALREADY_BOUND=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --already-bound)
      ALREADY_BOUND=1
      shift
      ;;
    *)
      shift
      ;;
  esac
done

load_profile "local" || exit 1
require_opencli

log_step "0" "session=${SESSION} bind-and-run profile=local"

if [[ "$ALREADY_BOUND" -eq 0 ]]; then
  echo ""
  echo "请在 Chrome 中："
  echo "  1. 打开 ${LOGIN_URL}"
  echo "  2. 使用 ${ACCOUNT} 登录成功（应离开 /login）"
  echo "  3. 保持该标签为当前活动标签"
  echo ""
  read -r -p "完成后按 Enter 执行 bind ... "
  log_step "bind" "opencli browser ${SESSION} bind"
  oc_plain bind || die "bind 失败：请确认 OpenCLI 扩展已连接且标签未关闭"
fi

log_step "menu" "打开菜单页 ${MENU_URL}"
oc_plain open "$MENU_URL" >/dev/null
sleep 2

url="$(oc_plain get url | tr -d '\r\n')"
if [[ "$url" == *"/login"* ]]; then
  die "bind 后仍在登录页: $url — 请重新登录并 bind"
fi

export SKIP_LOGIN=1
bash "${SCRIPT_DIR}/menu-route-dup-check.sh" --profile local --skip-login

echo ""
echo "bind-and-run 完成 (session=${SESSION})"
