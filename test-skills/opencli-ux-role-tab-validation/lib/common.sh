#!/usr/bin/env bash
# OpenCLI 包装、断言与角色弹窗 helper。

UX_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/config.sh
source "${UX_LIB_DIR}/config.sh"

set -euo pipefail

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

log_step() {
  echo ""
  echo "==> [$1] $2"
}

die() {
  echo "ERROR: $*" >&2
  exit 1
}

oc_plain() {
  opencli browser "$SESSION" "$@" 2>&1
}

parse_args_profile() {
  UX_PROFILE_ARG=""
  SKIP_LOGIN=0
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
      *)
        shift
        ;;
    esac
  done
}

assert_logged_in() {
  local url
  url="$(oc_plain get url | tr -d '\r\n')"
  if [[ "$url" == *"/login"* ]]; then
    die "仍在登录页: $url"
  fi
  log_step "auth" "已离开登录页: $url"
}

wait_leave_login() {
  set +e
  oc_plain click --role tab --name "密码登录" >/dev/null 2>&1 || true
  set -e
  set +e
  for _ in $(seq 1 60); do
    local url
    url="$(oc_plain get url | tr -d '\r\n')"
    if [[ "$url" != *"/login"* ]]; then
      set -e
      return 0
    fi
    sleep 1
  done
  set -e
  die "登录超时（60s 内未离开 /login）"
}

has_captcha_visible() {
  local state
  state="$(oc_plain state 2>/dev/null || true)"
  echo "$state" | grep -q "图形验证码\|请输入图形验证码\|captcha" && return 0
  return 1
}

handle_captcha_mode() {
  case "${CAPTCHA_MODE}" in
    auto)
      if has_captcha_visible; then
        die "检测到图形验证码，请将 profile.captchaMode 改为 manual 或 bind-only"
      fi
      ;;
    manual)
      if has_captcha_visible; then
        echo ""
        echo "请在浏览器中输入图形验证码，完成后按 Enter 继续..."
        read -r _
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

extract_eval_json() {
  "${UX_PYTHON_BIN:-python}" -c "
import sys, json, re
raw = sys.stdin.read()
matches = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', raw, re.S)
if not matches:
    sys.exit(1)
print(matches[-1])
"
}

fill_by_placeholder() {
  local placeholder="$1"
  local value="$2"
  set +e
  oc_plain fill --role textbox --name "$placeholder" "$value" >/dev/null 2>&1
  local rc=$?
  if [[ $rc -ne 0 ]]; then
    oc_plain type --role textbox --name "$placeholder" "$value" >/dev/null 2>&1
    rc=$?
  fi
  set -e
  if [[ $rc -ne 0 ]]; then
    die "无法填写输入框: ${placeholder}"
  fi
}

click_button() {
  local name="$1"
  oc_plain click --role button --name "$name" >/dev/null
}

click_dialog_footer_button() {
  local label="$1"
  set +e
  oc_plain eval "(function(){
    const label = '${label}'.replace(/\\s+/g, '');
    const footer = document.querySelector('.el-dialog .dialog-footer')
      || document.querySelector('.el-dialog__footer')
      || document.querySelector('.el-dialog');
    if (!footer) return JSON.stringify({ ok: false, reason: 'no-footer' });
    const btn = [...footer.querySelectorAll('button')].find(
      b => (b.innerText || '').replace(/\\s+/g, '').trim() === label
    );
    if (!btn) return JSON.stringify({ ok: false, reason: 'no-btn', label });
    btn.click();
    return JSON.stringify({ ok: true, label });
  })()" >/dev/null 2>&1
  local rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    click_button "$label"
  fi
}

click_dialog_confirm() {
  click_dialog_footer_button "确定"
}

click_dialog_cancel() {
  click_dialog_footer_button "取消"
}

# 读取角色编辑弹窗 Tab 与表单校验状态
get_role_dialog_state() {
  oc_plain eval "(function(){
    const dialog = document.querySelector('.el-dialog');
    if (!dialog) return JSON.stringify({ ok: false, reason: 'no-dialog' });
    const activeTab = dialog.querySelector('.el-tabs__item.is-active')?.innerText?.trim() || '';
    const errorEl = dialog.querySelector('.el-form-item.is-error .el-form-item__error');
    const title = dialog.querySelector('.el-dialog__title')?.innerText?.trim() || '';
    const toasts = [...document.querySelectorAll('.el-message, .el-notification')]
      .map(el => (el.innerText || '').trim())
      .filter(Boolean);
    return JSON.stringify({
      ok: true,
      activeTab,
      formError: !!errorEl,
      errorText: errorEl?.innerText?.trim() || '',
      dialogOpen: dialog.offsetParent !== null,
      title,
      toasts
    });
  })()" 2>/dev/null || true
}

role_dialog_is_open() {
  local raw json
  raw="$(get_role_dialog_state || true)"
  json="$(echo "$raw" | extract_eval_json 2>/dev/null || echo "")"
  if [[ -z "$json" ]]; then
    echo "false"
    return 0
  fi
  echo "$json" | "${UX_PYTHON_BIN:-python}" -c "
import sys, json
d = json.load(sys.stdin)
print('true' if d.get('dialogOpen') else 'false')
"
}

assert_role_dialog_tab() {
  local expected_tab="$1"
  local case_id="${2:-assert-tab}"
  local raw json actual
  local try max_tries=5
  for ((try = 1; try <= max_tries; try++)); do
    sleep 1
    raw="$(get_role_dialog_state || true)"
    json="$(echo "$raw" | extract_eval_json 2>/dev/null || echo "")"
    if [[ -z "$json" ]]; then
      continue
    fi
    actual="$(echo "$json" | "${UX_PYTHON_BIN:-python}" -c "import sys,json; print(json.load(sys.stdin).get('activeTab',''))")"
    if [[ "$actual" == *"$expected_tab"* ]]; then
      log_step "assert" "[${case_id}] activeTab=${actual}"
      return 0
    fi
    if [[ "$try" -lt "$max_tries" ]]; then
      echo "  [${case_id}] 第 ${try} 次: 当前 Tab「${actual}」，期望「${expected_tab}」，重试…" >&2
    fi
  done
  echo "断言失败 [${case_id}]: 期望 Tab「${expected_tab}」，实际「${actual}」" >&2
  echo "详情: ${json}" >&2
  oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-${case_id}.png" 2>/dev/null || true
  return 1
}

assert_role_form_error() {
  local expected_substr="$1"
  local case_id="${2:-assert-error}"
  local raw json form_error error_text
  sleep 1
  raw="$(get_role_dialog_state || true)"
  json="$(echo "$raw" | extract_eval_json 2>/dev/null || echo "")"
  if [[ -z "$json" ]]; then
    echo "无法读取弹窗状态: ${raw}" >&2
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-${case_id}.png" 2>/dev/null || true
    return 1
  fi
  form_error="$(echo "$json" | "${UX_PYTHON_BIN:-python}" -c "import sys,json; print(json.load(sys.stdin).get('formError', False))")"
  error_text="$(echo "$json" | "${UX_PYTHON_BIN:-python}" -c "import sys,json; print(json.load(sys.stdin).get('errorText',''))")"
  if [[ "$form_error" != "True" && "$form_error" != "true" ]]; then
    echo "断言失败 [${case_id}]: 期望表单错误，但未发现 is-error" >&2
    echo "详情: ${json}" >&2
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-${case_id}.png" 2>/dev/null || true
    return 1
  fi
  if [[ "$error_text" != *"$expected_substr"* ]]; then
    echo "断言失败 [${case_id}]: 期望错误含「${expected_substr}」，实际「${error_text}」" >&2
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-${case_id}.png" 2>/dev/null || true
    return 1
  fi
  log_step "assert" "[${case_id}] formError=${error_text}"
  return 0
}

assert_role_dialog_closed() {
  local case_id="${1:-assert-closed}"
  sleep 2
  local open
  open="$(role_dialog_is_open | tr -d '[:space:]')"
  if [[ "$open" == "true" ]]; then
    echo "断言失败 [${case_id}]: 期望弹窗已关闭，但仍打开" >&2
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-${case_id}.png" 2>/dev/null || true
    return 1
  fi
  log_step "assert" "[${case_id}] 弹窗已关闭"
  return 0
}

assert_toast_contains() {
  local expected_substr="$1"
  local case_id="${2:-assert-toast}"
  local raw json toasts joined
  sleep 1
  raw="$(get_role_dialog_state || true)"
  json="$(echo "$raw" | extract_eval_json 2>/dev/null || echo "{}")"
  joined="$(echo "$json" | "${UX_PYTHON_BIN:-python}" -c "
import sys, json
d = json.load(sys.stdin)
print('|'.join(d.get('toasts', [])))
" 2>/dev/null || echo "")"
  if [[ "$joined" != *"$expected_substr"* ]]; then
    set +e
    oc_plain wait text "$expected_substr" --timeout 5000 >/dev/null 2>&1
    local rc=$?
    set -e
    if [[ $rc -ne 0 ]]; then
      echo "断言失败 [${case_id}]: 未找到 toast「${expected_substr}」" >&2
      oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-${case_id}.png" 2>/dev/null || true
      return 1
    fi
  fi
  log_step "assert" "[${case_id}] toast 含「${expected_substr}」"
  return 0
}

open_role_manage_page() {
  log_step "nav" "打开角色管理页 ${ROLE_URL}"
  oc_plain open "$ROLE_URL" >/dev/null
  sleep 3
  oc_plain wait text "角色列表" --timeout 20000 >/dev/null 2>&1 || true
}

open_role_create_dialog() {
  log_step "ui" "打开新增角色弹窗"
  click_button "新增角色"
  sleep 2
  oc_plain wait text "新增角色" --timeout 15000 >/dev/null 2>&1 || true
  sleep 1
}

close_role_dialog_if_open() {
  set +e
  local open
  open="$(role_dialog_is_open | tr -d '[:space:]')"
  if [[ "$open" == "true" ]]; then
    click_dialog_cancel || click_dialog_footer_button "取消" || true
    sleep 1
  fi
  set -e
}

click_role_dialog_tab() {
  local tab_label="$1"
  log_step "ui" "切换 Tab: ${tab_label}"
  set +e
  oc_plain eval "(function(){
    const label = '${tab_label}';
    const dialog = document.querySelector('.el-dialog');
    if (!dialog) return JSON.stringify({ ok: false, reason: 'no-dialog' });
    const tab = [...dialog.querySelectorAll('.el-tabs__item')].find(
      t => (t.innerText || '').trim().includes(label)
    );
    if (!tab) return JSON.stringify({ ok: false, reason: 'no-tab', label });
    tab.click();
    return JSON.stringify({ ok: true, label });
  })()" >/dev/null 2>&1
  set -e
  sleep 1
}

fill_role_name() {
  local value="$1"
  log_step "ui" "填写角色名称: ${value}"
  set +e
  oc_plain eval "(function(){
    const value = '${value}';
    const dialog = document.querySelector('.el-dialog') || document.body;
    const setNative = (input, val) => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      if (desc && desc.set) desc.set.call(input, val);
      else input.value = val;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const items = [...dialog.querySelectorAll('.el-form-item')];
    for (const item of items) {
      const label = item.querySelector('.el-form-item__label, label');
      const text = (label && label.innerText) ? label.innerText.trim() : '';
      if (!text.includes('角色名称')) continue;
      const input = item.querySelector('input:not([type=hidden])');
      if (input) { setNative(input, value); return JSON.stringify({ ok: true }); }
    }
    return JSON.stringify({ ok: false, reason: 'no-role-name-input' });
  })()" >/dev/null 2>&1
  set -e
  sleep 0.5
}

clear_role_name() {
  fill_role_name ""
}

generate_role_test_name() {
  echo "${ROLE_NAME_PREFIX}$(date +%s)"
}

delete_role_by_name() {
  local role_name="$1"
  log_step "cleanup" "尝试删除测试角色: ${role_name}"
  set +e
  oc_plain eval "(function(){
    const target = '${role_name}';
    const rows = [...document.querySelectorAll('.role-list-table .el-table__body tbody tr, .data-table__content .el-table__body tbody tr')];
    for (const tr of rows) {
      const cells = tr.querySelectorAll('td');
      if (!cells.length) continue;
      const rowName = (cells[0]?.innerText || '').trim();
      if (!rowName.includes(target)) continue;
      const more = tr.querySelector('.operation-column-more-trigger')
        || [...tr.querySelectorAll('button')].find(b => (b.innerText||'').includes('更多'));
      if (more) {
        more.click();
        setTimeout(() => {
          const items = [...document.querySelectorAll('.el-dropdown-menu__item')];
          const del = items.find(el => (el.innerText||'').trim() === '删除');
          if (del) del.click();
        }, 300);
        return JSON.stringify({ ok: true, rowName });
      }
      const delBtn = [...tr.querySelectorAll('button')].find(b => (b.innerText||'').trim() === '删除');
      if (delBtn) { delBtn.click(); return JSON.stringify({ ok: true, rowName, direct: true }); }
      return JSON.stringify({ ok: false, reason: 'no-delete', rowName });
    }
    return JSON.stringify({ ok: false, reason: 'row-not-found' });
  })()" >/dev/null 2>&1
  sleep 1
  oc_plain eval "(function(){
    const items = [...document.querySelectorAll('.el-dropdown-menu__item')];
    const del = items.find(el => (el.innerText||'').trim() === '删除');
    if (del) { del.click(); return JSON.stringify({ ok: true }); }
    return JSON.stringify({ ok: false });
  })()" >/dev/null 2>&1 || true
  sleep 1
  oc_plain eval "(function(){
    const box = document.querySelector('.el-message-box');
    if (!box) return JSON.stringify({ ok: false });
    const btn = [...box.querySelectorAll('.el-button')].find(b => (b.innerText||'').trim() === '确定');
    if (btn) { btn.click(); return JSON.stringify({ ok: true }); }
    return JSON.stringify({ ok: false });
  })()" >/dev/null 2>&1 || true
  sleep 2
  set -e
}
