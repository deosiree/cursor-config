#!/usr/bin/env bash
#===============================================================================
# OpenCLI 租户管理 UX 自动化测试 — 公共函数库
# 功能：OpenCLI 包装、断言、日志、失败自动截屏 + DOM dump
#
# 来源：.cursor/test-skills/opencli-ux-tenant/
# 注意：本文件由 login.sh / tenant-create-delete.sh 等 source 加载
#===============================================================================

UX_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/config.sh
source "${UX_LIB_DIR}/config.sh"

set -euo pipefail

#===============================================================================
# 依赖检查
#===============================================================================

# 检查命令是否安装，缺失则报错退出
# @param $1  命令名（如 opencli / jq / python3）
# @param $2  安装提示文字（可选）
require_cmd() {
  local cmd="$1"
  local hint="${2:-}"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "缺少命令: $cmd ${hint}" >&2
    exit 1
  fi
}

# 检查 opencli 是否安装且 browser 桥接正常
# 依赖：require_cmd
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

# 输出步骤日志（空行 + 双箭头标签）
# @param $1  步骤编号/标签，如 "1" / "auth" / "data"
# @param $2  步骤描述文字
log_step() {
  echo ""
  echo "==> [$1] $2"
}

# 致命错误退出，自动保存现场（截屏 + URL + 页面关键 DOM）
# 保存到 screenshots/die-{时间戳}.png + .txt
# @param $*  错误描述
# @exit 1
die() {
  local msg="$*"
  echo "ERROR: ${msg}" >&2
  # 自动保存失败现场供后续排查
  if command -v oc_plain >/dev/null 2>&1 && [[ -n "${SESSION:-}" ]]; then
    local ts
    ts="$(date +%Y%m%d-%H%M%S 2>/dev/null || echo fail)"
    mkdir -p "${UX_SUITE_ROOT:-.}/screenshots"
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/die-${ts}.png" >/dev/null 2>&1 || true
    {
      echo "=== FAILURE: ${msg} ==="
      echo "时间: $(date 2>/dev/null || echo unknown)"
      echo "Profile: ${UX_PROFILE:-unknown}"
      oc_plain get url 2>/dev/null || echo "URL: 不可获取"
      oc_plain eval 'document.title' 2>/dev/null || echo "标题: 不可获取"
      oc_plain eval 'document.querySelector(".el-dialog")?.innerText?.slice(0,500) || "无弹窗"' 2>/dev/null || true
    } > "${UX_SUITE_ROOT}/screenshots/die-${ts}.txt" 2>/dev/null || true
    echo "  -> 现场已保存: screenshots/die-${ts}.png + .txt" >&2
  fi
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
  local timeout="${1:-30000}"
  set +e
  opencli browser "$SESSION" wait text "密码登录" --timeout 5000 >/dev/null 2>&1
  set -e
  oc_plain click --role tab --name "密码登录" >/dev/null 2>&1 || true

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
  die "登录超时（${timeout}ms 内未离开 /login）"
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
#   manual    — 暂停等待人工输入（120s 超时，超时则报错）
#   bind-only — 提示人工绑定后退出
handle_captcha_mode() {
  case "${CAPTCHA_MODE}" in
    auto)
      if has_captcha_visible; then
        die "检测到图形验证码，请将 profile.captchaMode 改为 manual 或 bind-only，或关闭验证码"
      fi
      ;;
    skip)
      ;;
    manual)
      if has_captcha_visible; then
        echo ""
        echo "请在浏览器中输入图形验证码，完成后按 Enter 继续...（120s 超时）"
        read -r -t 120 _ || die "等待验证码输入超时（120s），请重试或切换 captchaMode"
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

# 解析 opencli eval 输出中的 JSON 对象
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

# 步骤 7/10：在租户列表搜索框输入关键词并点击「搜索」
tenant_list_search() {
  local keyword="$1"
  log_step "search" "搜索关键词: ${keyword}"
  set +e
  oc_plain eval "(function(){
    const kw = '${keyword}';
    const setNative = (input, value) => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      if (desc && desc.set) desc.set.call(input, value);
      else input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const root = document.querySelector('.tenant-manage') || document.body;
    const input = root.querySelector('.search-input input')
      || [...root.querySelectorAll('input')].find(i => (i.placeholder||'').includes('租户名'));
    if (!input) return JSON.stringify({ ok: false, reason: 'no-input' });
    setNative(input, kw);
    const btn = [...root.querySelectorAll('button')].find(
      b => (b.innerText||'').trim() === '搜索' && !b.disabled
    );
    if (btn) { btn.click(); return JSON.stringify({ ok: true, method: 'button' }); }
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
    return JSON.stringify({ ok: true, method: 'enter' });
  })()" >/dev/null 2>&1
  set -e
  sleep 2
}

# 清空租户列表搜索框并刷新（步骤 10 结束后收尾）
tenant_clear_search() {
  log_step "cleanup" "清除搜索框并刷新列表"
  set +e
  oc_plain eval "(function(){
    const setNative = (input, value) => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      if (desc && desc.set) desc.set.call(input, value);
      else input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const root = document.querySelector('.tenant-manage') || document.body;
    const input = root.querySelector('.search-input input')
      || [...root.querySelectorAll('input')].find(i => (i.placeholder||'').includes('租户名'));
    if (!input) return JSON.stringify({ ok: false, reason: 'no-input' });
    setNative(input, '');
    const clearBtn = input.closest('.el-input')?.querySelector('.el-input__clear');
    if (clearBtn) clearBtn.click();
    const searchBtn = [...root.querySelectorAll('button')].find(
      b => (b.innerText||'').trim() === '搜索' && !b.disabled
    );
    if (searchBtn) searchBtn.click();
    return JSON.stringify({ ok: true });
  })()" >/dev/null 2>&1
  set -e
  sleep 2
}

wait_tenant_table_idle() {
  sleep "${1:-2}"
}

# 读取当前表格中匹配关键词的租户行
get_tenant_table_matches() {
  local keyword="$1"
  oc_plain eval "(function(){
    const kw = '${keyword}';
    const isEmpty = !!document.querySelector('.tenant-table .el-table__empty-block');
    const rows = [...document.querySelectorAll('.tenant-table .el-table__body tbody tr')]
      .filter(tr => tr.querySelector('td') && tr.offsetParent !== null && !tr.classList.contains('el-table__row--level'));
    const names = rows.map(tr => {
      const nameCell = tr.querySelector('td:nth-child(2)') || tr.cells[1];
      return nameCell ? nameCell.innerText.trim() : '';
    }).filter(Boolean);
    const hit = names.filter(n => n.includes(kw));
    return JSON.stringify({
      count: hit.length,
      names: hit,
      totalVisibleRows: rows.length,
      isEmpty,
      keyword: kw
    });
  })()" 2>/dev/null
}

# 读取匹配行数（不触发搜索）
_tenant_match_count() {
  local keyword="$1"
  local raw json
  raw="$(get_tenant_table_matches "$keyword" || true)"
  json="$(echo "$raw" | extract_eval_json 2>/dev/null || echo "")"
  if [[ -z "$json" ]]; then
    echo "-1"
    return 1
  fi
  echo "$json" | "${UX_PYTHON_BIN:-python}" -c "import sys,json; print(json.load(sys.stdin).get('count',-1))"
}

#===============================================================================
# 断言：搜索租户名并校验列表行数
#===============================================================================

# 搜索指定租户名并断言行数，创建后 (expected=1) 使用指数退避轮询
# @param $1  搜索关键词（租户名）
# @param $2  期望行数（1=创建后应有结果，0=删除后应为空）
# @param $3  最大重试次数（默认：expected=1 时 15 次，expected=0 时 1 次）
# @return 0-断言通过，1-断言失败
assert_tenant_list_count() {
  local keyword="$1"
  local expected="$2"
  local max_tries="${3:-1}"
  local try count names json raw

  if [[ "$expected" == "1" ]]; then
    max_tries="${3:-15}"
  fi

  for ((try = 1; try <= max_tries; try++)); do
    log_step "search" "第 ${try}/${max_tries} 次：搜索「${keyword}」"
    tenant_list_search "$keyword"
    count="$(_tenant_match_count "$keyword" 2>/dev/null || echo "-1")"

    if [[ "$count" == "$expected" ]]; then
      raw="$(get_tenant_table_matches "$keyword" 2>/dev/null || true)"
      json="$(echo "$raw" | extract_eval_json 2>/dev/null || echo "{}")"
      names="$(echo "$json" | "${UX_PYTHON_BIN:-python}" -c "import sys,json; print(','.join(json.load(sys.stdin).get('names',[])))" 2>/dev/null || echo "")"
      if [[ "$expected" == "1" ]]; then
        log_step "assert" "搜索「${keyword}」有且仅有 1 条: ${names}"
      else
        log_step "assert" "搜索「${keyword}」列表为空，已确认删除"
      fi
      return 0
    fi

    if [[ "$try" -lt "$max_tries" ]]; then
      # 指数退避：第 1 次等 1s，第 2 次等 2s，第 3 次等 4s…
      local wait_time=$((2 ** (try - 1)))
      echo "  当前 ${count} 条，期望 ${expected} 条，${wait_time}s 后重试…" >&2
      sleep "$wait_time"
    fi
  done

  raw="$(get_tenant_table_matches "$keyword" 2>/dev/null || true)"
  echo "断言失败: 搜索「${keyword}」期望 ${expected} 条，最后实际 ${count} 条" >&2
  echo "详情: ${raw}" >&2
  oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-tenant-list-count.png" 2>/dev/null || true
  return 1
}

#===============================================================================
# 等待辅助：创建/删除后等待列表刷新
#===============================================================================

# 创建提交后等待弹窗消失并回到列表页
wait_after_tenant_created() {
  log_step "wait" "等待创建完成并回到列表"
  set +e
  oc_plain wait text "新增租户成功" --timeout 20000 >/dev/null 2>&1
  for _ in $(seq 1 20); do
    local dlg
    dlg="$(oc_plain eval "document.querySelector('.el-dialog') ? 'yes' : 'no'" 2>/dev/null | tr -d '[:space:]' || echo yes)"
    if [[ "$dlg" != "yes" ]]; then
      break
    fi
    sleep 1
  done
  set -e
  sleep 1
  oc_plain open "$TENANT_URL" >/dev/null 2>&1 || true
  sleep 2
  oc_plain wait text "租户列表" --timeout 15000 >/dev/null 2>&1 || true
  sleep 1
}

# 步骤 8：搜索结果行 → 更多 → 删除（不点工具栏批量删除）
tenant_click_row_delete_menu() {
  local name="$1"
  local out

  log_step "delete" "定位租户行并打开「更多」: ${name}"
  out="$(oc_plain eval "(function(){
    const target = '${name}';
    const rows = [...document.querySelectorAll('.tenant-table .el-table__body tbody tr')];
    for (const tr of rows) {
      const nameCell = tr.querySelector('td:nth-child(2)') || tr.cells[1];
      const rowName = nameCell ? nameCell.innerText.trim() : '';
      if (!rowName.includes(target)) continue;
      const more = tr.querySelector('.operation-column-more-trigger')
        || [...tr.querySelectorAll('button')].find(b => (b.innerText||'').includes('更多'));
      if (!more) return JSON.stringify({ ok: false, reason: 'no-more', rowName });
      more.click();
      return JSON.stringify({ ok: true, rowName });
    }
    return JSON.stringify({ ok: false, reason: 'row-not-found' });
  })()" 2>/dev/null || true)"

  echo "$out" | extract_eval_json | "${UX_PYTHON_BIN:-python}" -c "
import sys, json
d = json.load(sys.stdin)
if not d.get('ok'):
    print(d.get('reason','fail'), file=sys.stderr)
    sys.exit(1)
" || {
    echo "未找到可删除的租户行: ${name}" >&2
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-tenant-delete-row.png" 2>/dev/null || true
    return 1
  }

  sleep 1

  log_step "delete" "点击下拉菜单「删除」"
  out="$(oc_plain eval "(function(){
    const items = [
      ...document.querySelectorAll('.operation-column-more-popper .el-dropdown-menu__item'),
      ...document.querySelectorAll('.el-dropdown-menu .el-dropdown-menu__item'),
    ];
    const del = items.find(el => {
      const t = (el.innerText||'').trim();
      return t === '删除' || (t.includes('删除') && !t.includes('批量'));
    });
    if (!del) {
      return JSON.stringify({
        ok: false,
        reason: 'no-delete-item',
        labels: items.map(i => (i.innerText||'').trim()).filter(Boolean)
      });
    }
    del.click();
    return JSON.stringify({ ok: true });
  })()" 2>/dev/null || true)"
  echo "$out" | _parse_eval_json || {
    echo "未能点击操作列「删除」: ${out}" >&2
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-tenant-delete-menu.png" 2>/dev/null || true
    return 1
  }
  sleep 1
  return 0
}

# 步骤 9：删除确认弹窗 → 确定 → 等待删除成功
tenant_confirm_delete_dialog() {
  log_step "delete" "等待并确认删除弹窗"
  oc_plain wait text "确定删除租户" --timeout 12000 >/dev/null 2>&1 || true

  local out
  out="$(oc_plain eval "(function(){
    const box = document.querySelector('.el-message-box');
    if (!box) return JSON.stringify({ ok: false, reason: 'no-message-box' });
    const btn = [...box.querySelectorAll('.el-button')].find(
      b => (b.innerText||'').trim() === '确定'
    );
    if (!btn) return JSON.stringify({ ok: false, reason: 'no-confirm-btn' });
    btn.click();
    return JSON.stringify({ ok: true });
  })()" 2>/dev/null || true)"
  echo "$out" | _parse_eval_json || {
    echo "未能在弹窗中点击「确定」: ${out}" >&2
    oc_plain screenshot "${UX_SUITE_ROOT}/screenshots/fail-tenant-delete-confirm.png" 2>/dev/null || true
    return 1
  }

  sleep 2
  oc_plain wait text "删除成功" --timeout 25000 >/dev/null 2>&1 || true
  wait_tenant_table_idle 10
  return 0
}

tenant_delete_via_row_menu() {
  local name="$1"
  tenant_click_row_delete_menu "$name" || return 1
  tenant_confirm_delete_dialog || return 1
}

fill_tenant_create_step1() {
  local tenant_name="$1"
  local owner_user="$2"
  local owner_pwd="$3"
  local phone="$4"
  local email="$5"

  oc_plain eval "(function(){
    const dialog = document.querySelector('.el-dialog') || document.body;
    const setNative = (input, value) => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      if (desc && desc.set) desc.set.call(input, value);
      else input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const setByLabel = (labelPart, value) => {
      const items = [...dialog.querySelectorAll('.el-form-item')];
      for (const item of items) {
        const label = item.querySelector('.el-form-item__label, label');
        const text = (label && label.innerText) ? label.innerText.trim() : '';
        if (!text.includes(labelPart)) continue;
        if (labelPart === '密码' && text.includes('确认')) continue;
        const input = item.querySelector('input:not([type=hidden]), textarea');
        if (input) { setNative(input, value); return true; }
      }
      return false;
    };
    const pickActivation = () => {
      const items = [...dialog.querySelectorAll('.el-form-item')];
      for (const item of items) {
        const label = item.querySelector('.el-form-item__label, label');
        if (!label || !label.innerText.includes('激活方式')) continue;
        const sel = item.querySelector('.el-select');
        if (sel) { sel.click(); return true; }
      }
      return false;
    };
    const r = {
      tenant: setByLabel('租户名', '${tenant_name}'),
      user: setByLabel('用户名', '${owner_user}'),
      phone: setByLabel('手机号码', '${phone}'),
      email: setByLabel('邮箱', '${email}'),
      activation: pickActivation(),
    };
    return JSON.stringify(r);
  })()" >/dev/null 2>&1 || true
  sleep 1
  oc_plain click --role option --name "密码直设" >/dev/null 2>&1 \
    || oc_plain eval "(function(){
      const o = [...document.querySelectorAll('.el-select-dropdown__item')].find(x => (x.innerText||'').includes('密码直设'));
      if (o) { o.click(); return 'ok'; }
      return 'miss';
    })()" >/dev/null 2>&1 || true
  sleep 1
  oc_plain eval "(function(){
    const dialog = document.querySelector('.el-dialog') || document.body;
    const setNative = (input, value) => {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      if (desc && desc.set) desc.set.call(input, value);
      else input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const setByLabel = (labelPart, value) => {
      const items = [...dialog.querySelectorAll('.el-form-item')];
      for (const item of items) {
        const label = item.querySelector('.el-form-item__label, label');
        const text = (label && label.innerText) ? label.innerText.trim() : '';
        if (!text.includes(labelPart)) continue;
        if (labelPart === '密码' && text.includes('确认')) continue;
        const input = item.querySelector('input[type=password], input');
        if (input) { setNative(input, value); return true; }
      }
      return false;
    };
    return JSON.stringify({
      pwd: setByLabel('密码', '${owner_pwd}'),
      confirm: setByLabel('确认密码', '${owner_pwd}'),
    });
  })()" >/dev/null 2>&1 || true
}

wait_dialog_text() {
  local text="$1"
  local tries="${2:-20}"
  local i
  for ((i = 0; i < tries; i++)); do
    if oc_plain state 2>/dev/null | grep -q "$text"; then
      return 0
    fi
    sleep 1
  done
  return 1
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

# 点击创建租户对话框 footer 内按钮（避免点到页面其它「确定/下一步」）
click_dialog_footer_button() {
  local label="$1"
  set +e
  oc_plain eval "(function(){
    const label = '${label}';
    const footer = document.querySelector('.el-dialog .dialog-footer')
      || document.querySelector('.el-dialog__footer')
      || document.querySelector('.el-dialog');
    if (!footer) return JSON.stringify({ ok: false, reason: 'no-footer' });
    const btn = [...footer.querySelectorAll('button')].find(
      b => (b.innerText || '').trim() === label
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

click_dialog_next() {
  click_dialog_footer_button "下一步"
}

click_dialog_confirm() {
  click_dialog_footer_button "确定"
}

_parse_eval_json() {
  "${UX_PYTHON_BIN:-python}" -c "
import sys, json, re
raw = sys.stdin.read()
m = re.search(r'\{[^{}]*\}', raw, re.S)
if not m:
    sys.exit(1)
d = json.loads(m.group(0))
sys.exit(0 if d.get('ok') else 1)
"
}

select_project_by_name() {
  local project="$1"
  local out
  out="$(oc_plain eval "(function(){
    const name = '${project}';
    const dialog = document.querySelector('.el-dialog') || document.body;
    const rows = [...dialog.querySelectorAll('.tenant-project-step tr, .el-table__body tbody tr')];
    for (const tr of rows) {
      if (!tr.innerText.includes(name)) continue;
      const cb = tr.querySelector('.el-checkbox:not(.is-disabled) input, .el-checkbox__original');
      if (cb && !cb.checked) {
        (tr.querySelector('.el-checkbox') || cb).click();
        return JSON.stringify({ ok: true, project: name });
      }
      if (tr.querySelector('.el-checkbox.is-checked')) {
        return JSON.stringify({ ok: true, project: name, already: true });
      }
    }
    return JSON.stringify({ ok: false, project: name });
  })()" 2>/dev/null || true)"
  echo "$out" | _parse_eval_json || return 1
}

