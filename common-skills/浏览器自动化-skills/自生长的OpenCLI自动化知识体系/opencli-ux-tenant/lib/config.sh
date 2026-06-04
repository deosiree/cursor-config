#!/usr/bin/env bash
#===============================================================================
# 配置加载模块
# 功能：加载 ux-test.config.json，合并本地覆盖配置，导出 LOGIN_URL / TENANT_URL / 账号 / 租户测试数据
#
# 来源：自生长的OpenCLI自动化知识体系/opencli-ux-tenant/
# 注意：本文件由 common.sh 自动 source，不直接入口调用
#===============================================================================

# 套件根目录（脚本所在目录的上级）
UX_SUITE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UX_CONFIG_DIR="${UX_SUITE_ROOT}/config"
UX_CONFIG_MAIN="${UX_CONFIG_DIR}/ux-test.config.json"
UX_CONFIG_LOCAL="${UX_CONFIG_DIR}/ux-test.config.local.json"

#===============================================================================
# Python 解释器探测
#===============================================================================
# Git Bash / Windows：WindowsApps 的 python3 常为占位符，需探测可用解释器
# 可以通过 UX_PYTHON 环境变量指定
ux_resolve_python() {
  if [[ -n "${UX_PYTHON:-}" ]] && "$UX_PYTHON" -c "import sys" >/dev/null 2>&1; then
    echo "$UX_PYTHON"
    return 0
  fi
  local candidate
  for candidate in python3 python /f/anaconda3/python.exe /c/Python312/python.exe; do
    if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c "import sys" >/dev/null 2>&1; then
      echo "$candidate"
      return 0
    fi
  done
  echo "未找到可用的 Python（可设置 UX_PYTHON=/path/to/python）" >&2
  return 1
}

UX_PYTHON_BIN="$(ux_resolve_python)" || exit 1

#===============================================================================
# JSON 配置合并（主配置 + 本地覆盖）
#===============================================================================
# 合并策略：主配置 → 本地覆盖（深合并）
# 工具优先级：jq（更快）→ Python（兼容）
# 如果本地覆盖文件不存在，直接输出主配置
_merge_json_files() {
  local base="$1"
  local overlay="$2"
  if [[ ! -f "$base" ]]; then
    echo "config not found: $base" >&2
    return 1
  fi
  if [[ -f "$overlay" ]]; then
    if command -v jq >/dev/null 2>&1; then
      # jq 深合并：后面的覆盖前面的
      jq -s 'reduce .[] as $item ({}; . * $item)' "$base" "$overlay"
    elif [[ -n "${UX_PYTHON_BIN:-}" ]]; then
      "$UX_PYTHON_BIN" - "$base" "$overlay" <<'PY'
import json, sys

def deep_merge(a, b):
    out = dict(a)
    for k, v in b.items():
        if k in out and isinstance(out[k], dict) and isinstance(v, dict):
            out[k] = deep_merge(out[k], v)
        else:
            out[k] = v
    return out

with open(sys.argv[1], encoding="utf-8") as f:
    data = json.load(f)
with open(sys.argv[2], encoding="utf-8") as f:
    data = deep_merge(data, json.load(f))
print(json.dumps(data, ensure_ascii=False))
PY
    else
      echo "需要 jq 或 python3 以合并 ux-test.config.local.json" >&2
      echo "  - 安装 jq: https://jqlang.github.io/jq/download/" >&2
      echo "  - 或设置 UX_PYTHON=/path/to/python3" >&2
      return 1
    fi
  else
    cat "$base"
  fi
}

# 加载并合并 ux-test.config.json 配置，结果存入 UX_CONFIG_JSON 环境变量
load_ux_config() {
  local merged
  merged="$(_merge_json_files "$UX_CONFIG_MAIN" "$UX_CONFIG_LOCAL")" || return 1
  UX_CONFIG_JSON="$merged"
  export UX_CONFIG_JSON
}

#===============================================================================
# Profile 加载
#===============================================================================

# 加载指定 profile 的配置，导出 LOGIN_URL / TENANT_URL / 账号 / 租户数据等环境变量
# 用法: load_profile [profileName]
# 如果 profileName 为空，使用 UX_PROFILE 环境变量或 defaultProfile
load_profile() {
  local name="${1:-}"
  load_ux_config || return 1

  if [[ -z "$name" ]]; then
    name="${UX_PROFILE:-}"
  fi

  export UX_CONFIG_JSON
  local exports
  exports="$("$UX_PYTHON_BIN" - "$name" <<'PY'
import json, os, sys

name = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] else ""
data = json.loads(os.environ["UX_CONFIG_JSON"])
if not name:
    name = data.get("defaultProfile", "local")
profiles = data.get("profiles", {})
if name not in profiles:
    print(f"未知 profile: {name}（可用: {', '.join(profiles.keys())}）", file=sys.stderr)
    sys.exit(1)
p = profiles[name]
td = data.get("tenantData", {})
base = p["baseUrl"].rstrip("/")
login_path = p["loginPath"]
tenant_path = p["tenantPath"]
fields = {
    "SESSION": data.get("sessionName", "nebula-ux"),
    "BASE_URL": base,
    "LOGIN_PATH": login_path,
    "TENANT_PATH": tenant_path,
    "LOGIN_URL": base + login_path,
    "TENANT_URL": base + tenant_path,
    "ACCOUNT": p["account"],
    "PASSWORD": p["password"],
    "CAPTCHA_MODE": p.get("captchaMode", "auto"),
    "TENANT_NAME": td.get("tenantName", ""),
    "OWNER_USER": td.get("ownerUser", ""),
    "OWNER_PASSWORD": td.get("ownerPassword", ""),
    "PHONE": td.get("phone", ""),
    "EMAIL": td.get("email", ""),
    "PROJECT_NAME": td.get("projectName", ""),
    "UX_PROFILE": name,
}
for k, v in fields.items():
    v = str(v).replace("'", "'\\''")
    print(f"export {k}='{v}'")
PY
)" || return 1

  eval "$exports"

  if [[ "${PASSWORD}" == "CHANGE_ME" ]]; then
    echo "profile「${UX_PROFILE}」密码仍为 CHANGE_ME，请在 config/ux-test.config.local.json 中覆盖 password" >&2
    return 1
  fi

  lock_tenant_test_identity

  return 0
}

#===============================================================================
# 租户测试数据锁定
#===============================================================================
# 整次 E2E 共用 config 中的固定租户数据（无随机后缀）
# 子 shell 继承 UX_TENANT_NAME，避免创建/搜索名不一致
lock_tenant_test_identity() {
  if [[ -n "${UX_TENANT_NAME:-}" ]]; then
    TENANT_NAME="$UX_TENANT_NAME"
    OWNER_USER="${UX_OWNER_USER:-$OWNER_USER}"
    PHONE="${UX_PHONE:-$PHONE}"
    EMAIL="${UX_EMAIL:-$EMAIL}"
  else
    export UX_TENANT_NAME="$TENANT_NAME"
    export UX_OWNER_USER="$OWNER_USER"
    export UX_PHONE="$PHONE"
    export UX_EMAIL="$EMAIL"
  fi
  export TENANT_NAME OWNER_USER PHONE EMAIL
}
