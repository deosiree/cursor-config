#!/usr/bin/env bash
# OpenCLI 菜单管理 UX 自动化 — 公共函数库（项目切换、弹窗表单、路由路径判重断言）。

UX_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/config.sh
source "${UX_LIB_DIR}/config.sh"
OPENCLI_KBS_LIB="$(cd "${UX_LIB_DIR}/../.." && pwd)/lib"
# shellcheck source=../../lib/resolve-opencli-context.sh
source "${OPENCLI_KBS_LIB}/resolve-opencli-context.sh"

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
  local msg="$*"
  echo "ERROR: ${msg}" >&2
  if command -v oc_plain >/dev/null 2>&1 && [[ -n "${SESSION:-}" ]]; then
    local ts
    ts="$(date +%Y%m%d-%H%M%S 2>/dev/null || echo fail)"
    mkdir -p "${UX_SUITE_ROOT:-.}/screenshots"
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/die-${ts}.png" >/dev/null 2>&1 || true
    {
      echo "=== FAILURE: ${msg} ==="
      oc_plain get url 2>/dev/null || true
      get_menu_form_state 2>/dev/null || true
    } > "${UX_SUITE_ROOT}/screenshots/die-${ts}.txt" 2>/dev/null || true
    echo "  -> 现场已保存: screenshots/die-${ts}.png + .txt" >&2
  fi
  exit 1
}

oc_plain() {
  opencli_oc_args "$@" 2>&1
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

# 登录页「登录」按钮：优先 .login-submit-btn，避免误点语言菜单等同名 button
click_login_submit() {
  set +e
  local result
  result="$(oc_plain eval "(function(){
    const btn = document.querySelector('button.login-submit-btn')
      || [...document.querySelectorAll('button')].find(
        b => (b.innerText || '').replace(/\\s+/g, '').trim() === '登录'
          && b.classList.contains('login-submit-btn')
      )
      || [...document.querySelectorAll('button')].find(
        b => (b.innerText || '').replace(/\\s+/g, '').trim() === '登录'
          && !!b.closest('.login-form, form, [class*=login]')
      );
    if (!btn) return JSON.stringify({ ok: false, reason: 'no-login-btn' });
    btn.click();
    return JSON.stringify({ ok: true });
  })()" 2>/dev/null | extract_eval_json 2>/dev/null || true)"
  set -e
  if [[ -z "$result" ]] || ! echo "$result" | grep -q '"ok": true'; then
    oc_plain click --role button --name "登录" >/dev/null 2>&1 || die "无法点击登录按钮"
  fi
}

open_menu_manage_page() {
  log_step "nav" "打开菜单管理: ${MENU_URL}"
  oc_plain open "$MENU_URL" >/dev/null
  oc_plain wait text "菜单列表" --timeout 20000 >/dev/null 2>&1 || true
  sleep 2
}

get_selected_project_label() {
  oc_plain eval "(function(){
    const el = document.querySelector('.project-select .el-select__selected-item span')
      || document.querySelector('.project-select span');
    return (el?.textContent || '').trim();
  })()" 2>/dev/null | tr -d '\r\n'
}

select_menu_project() {
  local name="$1"
  log_step "project" "切换项目: ${name}"
  set +e
  oc_plain click --css ".project-select .el-select" >/dev/null 2>&1
  oc_plain click --role combobox >/dev/null 2>&1
  set -e
  sleep 1
  set +e
  oc_plain click --role option --name "$name" >/dev/null 2>&1
  local rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    oc_plain eval "(function(){
      const opt = [...document.querySelectorAll('[role=option]')].find(
        o => (o.innerText || '').includes('${name}')
      );
      if (!opt) return JSON.stringify({ ok: false });
      opt.click();
      return JSON.stringify({ ok: true });
    })()" >/dev/null || die "无法选择项目: ${name}"
  fi
  sleep 2
  local current
  current="$(get_selected_project_label)"
  if [[ "$current" != *"$name"* ]]; then
    die "项目切换失败，当前显示: ${current:-<空>}"
  fi
}

close_menu_dialog_if_open() {
  set +e
  oc_plain keys Escape >/dev/null 2>&1
  sleep 1
  set -e
}

open_menu_create_dialog() {
  log_step "dialog" "打开新增菜单弹窗"
  close_menu_dialog_if_open
  set +e
  local result
  result="$(oc_plain eval "(function(){
    const btn = [...document.querySelectorAll('button')].find(x => x.innerText.trim() === '新增');
    if (!btn) return JSON.stringify({ ok: false, reason: 'no-add-btn' });
    btn.click();
    return JSON.stringify({ ok: true });
  })()" 2>/dev/null | extract_eval_json 2>/dev/null || true)"
  set -e
  if [[ -z "$result" ]] || ! echo "$result" | grep -q '"ok": true'; then
    die "未能点击「新增」按钮"
  fi
  oc_plain wait text "路由路径" --timeout 15000 >/dev/null 2>&1 || die "新增弹窗未出现（无「路由路径」字段）"
  sleep 1
}

fill_menu_name() {
  local name="$1"
  set +e
  oc_plain fill "input[placeholder='请输入名称']" "$name" >/dev/null 2>&1
  local rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    die "无法填写菜单名称"
  fi
}

fill_menu_route_path() {
  local path="$1"
  set +e
  oc_plain fill "input[maxlength='64']" "$path" >/dev/null 2>&1
  local rc=$?
  set -e
  if [[ $rc -ne 0 ]]; then
    die "无法填写路由路径"
  fi
}

blur_menu_route_path() {
  set +e
  oc_plain click "input[maxlength='64']" >/dev/null 2>&1
  set -e
  sleep 3
}

get_menu_form_state() {
  oc_plain eval "(function(){
    const overlay = [...document.querySelectorAll('.el-overlay')].find(
      o => getComputedStyle(o).display === 'block'
    );
    const dlg = overlay?.querySelector('.el-dialog');
    if (!dlg) {
      return JSON.stringify({ ok: false, reason: 'no-visible-dialog' });
    }
    const errors = [...dlg.querySelectorAll('.el-form-item__error')]
      .map(e => (e.textContent || '').trim())
      .filter(Boolean);
    const routeVal = dlg.querySelector('input[maxlength=\"64\"]')?.value || '';
    const nameVal = dlg.querySelector('input[placeholder=\"请输入名称\"]')?.value || '';
    return JSON.stringify({
      ok: true,
      dialogOpen: true,
      routeVal,
      nameVal,
      errors,
      routeError: errors.find(e => e.includes('路由路径') || e.includes('路径')) || errors[0] || ''
    });
  })()"
}

assert_menu_route_error_contains() {
  local expected="$1"
  local tag="${2:-route-dup}"
  local raw state
  raw="$(get_menu_form_state 2>/dev/null || true)"
  state="$(echo "$raw" | extract_eval_json 2>/dev/null || true)"
  if [[ -z "$state" ]]; then
    mkdir -p "${UX_SUITE_ROOT}/screenshots"
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-${tag}.png" >/dev/null 2>&1 || true
    die "无法读取菜单表单状态 (${tag})"
  fi
  if ! echo "$state" | grep -q "$expected"; then
    mkdir -p "${UX_SUITE_ROOT}/screenshots"
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-${tag}.png" >/dev/null 2>&1 || true
    die "断言失败 (${tag})：期望错误含「${expected}」，实际: ${state}"
  fi
  log_step "assert" "${tag} PASS: 含「${expected}」"
}

assert_menu_route_no_duplicate_error() {
  local tag="${1:-route-no-dup}"
  local raw state
  raw="$(get_menu_form_state 2>/dev/null || true)"
  state="$(echo "$raw" | extract_eval_json 2>/dev/null || true)"
  if [[ -z "$state" ]]; then
    die "无法读取菜单表单状态 (${tag})"
  fi
  if echo "$state" | grep -q "${DUP_ERROR_TEXT}"; then
    mkdir -p "${UX_SUITE_ROOT}/screenshots"
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-${tag}.png" >/dev/null 2>&1 || true
    die "断言失败 (${tag})：不应出现「${DUP_ERROR_TEXT}」，实际: ${state}"
  fi
  log_step "assert" "${tag} PASS: 无项目内路由路径重复错误"
}

generate_menu_test_name() {
  echo "${MENU_NAME_PREFIX}$(date +%H%M%S 2>/dev/null || echo test)"
}

# 读取当前 Tab 表格中的路由路径列（第 3 列，0-based index 2）
get_table_route_paths() {
  oc_plain eval "(function(){
    const rows = [...document.querySelectorAll('table tbody tr')];
    const paths = rows.map(r => {
      const tds = [...r.querySelectorAll('td')];
      return (tds[2]?.innerText || '').trim();
    }).filter(Boolean);
    return JSON.stringify({ ok: true, paths, count: paths.length });
  })()"
}

# 按路由路径打开行内「编辑」弹窗（OperationColumn / 直接按钮）
open_menu_edit_dialog_by_route_path() {
  local path="$1"
  log_step "dialog" "编辑菜单（routePath=${path}）"
  close_menu_dialog_if_open
  set +e
  local result
  result="$(oc_plain eval "(function(){
    const path = '${path}';
    const rows = [...document.querySelectorAll('table tbody tr')];
    const row = rows.find(r => [...r.querySelectorAll('td')].some(
      td => (td.innerText || '').trim() === path
    ));
    if (!row) return JSON.stringify({ ok: false, reason: 'row-not-found', path });
    const edit = [...row.querySelectorAll('button, .el-button, span')].find(
      el => (el.innerText || '').replace(/\\s+/g, '').trim() === '编辑'
        && el.closest('button, .el-button, [role=button]')
    );
    const clickTarget = edit?.closest('button, .el-button, [role=button]') || edit;
    if (!clickTarget) {
      const more = [...row.querySelectorAll('button')].find(
        b => /更多/.test(b.innerText || '') || b.className.includes('more')
      );
      if (more) {
        more.click();
        const item = [...document.querySelectorAll('.el-dropdown-menu__item')].find(
          el => (el.innerText || '').trim() === '编辑'
        );
        if (item) { item.click(); return JSON.stringify({ ok: true, mode: 'dropdown' }); }
      }
      return JSON.stringify({ ok: false, reason: 'edit-not-found' });
    }
    clickTarget.click();
    return JSON.stringify({ ok: true, mode: 'direct' });
  })()" 2>/dev/null | extract_eval_json 2>/dev/null || true)"
  set -e
  if [[ -z "$result" ]] || ! echo "$result" | grep -q '"ok": true'; then
    die "未能打开编辑弹窗（path=${path}）: ${result:-unknown}"
  fi
  oc_plain wait text "路由路径" --timeout 15000 >/dev/null 2>&1 || die "编辑弹窗未出现"
  sleep 1
}

# 诊断：菜单页 + 可选弹窗状态（不写断言，供排障脚本输出）
dump_menu_page_diagnostic() {
  log_step "diag" "菜单页诊断快照"
  oc_plain get url 2>/dev/null || true
  get_selected_project_label 2>/dev/null || true
  get_table_route_paths 2>/dev/null || true
  get_menu_form_state 2>/dev/null || true
}
