#!/usr/bin/env bash
#===============================================================================
# 配置加载模块 — 用户管理 UX
# 功能：加载 ux-test.config.json，合并本地覆盖配置，导出账号/URL/会话参数
#
# 来源：自生长的OpenCLI自动化知识体系/opencli-ux-user-perm/
# 注意：本文件由 common.sh 自动 source，不直接入口调用
#===============================================================================

SUITE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_DIR="${SUITE_ROOT}/config"
CONFIG_MAIN="${CONFIG_DIR}/ux-test.config.json"
CONFIG_LOCAL="${CONFIG_DIR}/ux-test.config.local.json"

#===============================================================================
# Python 解释器探测
#===============================================================================
_resolve_python() {
  if [[ -n "${UX_PYTHON:-}" ]] && "$UX_PYTHON" -c "import sys" >/dev/null 2>&1; then
    echo "$UX_PYTHON"
    return 0
  fi
  for candidate in python3 python /f/anaconda3/python.exe /c/Python312/python.exe; do
    if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c "import sys" >/dev/null 2>&1; then
      echo "$candidate"
      return 0
    fi
  done
  echo "未找到可用的 Python（可设置 UX_PYTHON=/path/to/python）" >&2
  return 1
}

PYTHON_BIN="$(_resolve_python)" || exit 1

#===============================================================================
# JSON 配置合并
#===============================================================================
_merge_json() {
  local base="$1"
  local overlay="$2"
  if [[ ! -f "$base" ]]; then
    echo "config not found: $base" >&2
    return 1
  fi
  if [[ ! -f "$overlay" ]]; then
    cat "$base"
    return 0
  fi
  if command -v jq >/dev/null 2>&1; then
    # 深合并：后面的覆盖前面的对应层级
    jq -s 'reduce .[] as $item ({}; . * $item)' "$base" "$overlay"
  else
    "$PYTHON_BIN" -c "
import json, sys
a = json.load(open('$base'))
b = json.load(open('$overlay'))
def deep_merge(d, s):
    for k in s:
        if k in d and isinstance(d[k], dict) and isinstance(s[k], dict):
            deep_merge(d[k], s[k])
        else:
            d[k] = s[k]
deep_merge(a, b)
json.dump(a, sys.stdout)
"
  fi
}

#===============================================================================
# 解析 --profile / --skip-login 参数（从 $@ 中提取并消费）
# 设置全局变量 UX_PROFILE_ARG / SKIP_LOGIN，调用后 $@ 不再包含已消费参数
#===============================================================================
parse_args_profile() {
  local args=()
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
        args+=("$1")
        shift
        ;;
    esac
  done
  set -- "${args[@]}"
}

#===============================================================================
# 加载 profile 并导出环境变量
# 调用后导出：LOGIN_URL、SESSION、USERNAME、PASSWORD、CAPTCHA_MODE、USER_LIST_URL
#===============================================================================
load_profile() {
  local profile_name="${1:-${UX_PROFILE_ARG:-local}}"
  local merged_json
  merged_json="$(_merge_json "$CONFIG_MAIN" "$CONFIG_LOCAL")" || return 1

  export UX_PROFILE="$profile_name"
  export SESSION="$(echo "$merged_json" | "$PYTHON_BIN" -c "import json,sys; print(json.load(sys.stdin).get('session','nebula-ux'))")"
  export LOGIN_URL="$(echo "$merged_json" | "$PYTHON_BIN" -c "
import json,sys
c=json.load(sys.stdin)
p=c['profiles'].get('$profile_name', c['profiles'].get('local',{}))
print(p.get('loginUrl','http://localhost:8080/cloud/login'))
")"
  export BASE_URL="$(echo "$merged_json" | "$PYTHON_BIN" -c "
import json,sys
c=json.load(sys.stdin)
p=c['profiles'].get('$profile_name', c['profiles'].get('local',{}))
print(p.get('baseUrl','http://localhost:8080'))
")"
  export USERNAME="$(echo "$merged_json" | "$PYTHON_BIN" -c "
import json,sys
c=json.load(sys.stdin)
u=c['users'].get('$profile_name', c['users'].get('local',{}))
print(u.get('username','admin@system.local'))
")"
  export PASSWORD="$(echo "$merged_json" | "$PYTHON_BIN" -c "
import json,sys
c=json.load(sys.stdin)
u=c['users'].get('$profile_name', c['users'].get('local',{}))
print(u.get('password','CHANGE_ME'))
")"
  export CAPTCHA_MODE="$(echo "$merged_json" | "$PYTHON_BIN" -c "
import json,sys
c=json.load(sys.stdin)
u=c['users'].get('$profile_name', c['users'].get('local',{}))
print(u.get('captchaMode','auto'))
")"
  export USER_LIST_URL="$(echo "$merged_json" | "$PYTHON_BIN" -c "
import json,sys
c=json.load(sys.stdin)
p=c['profiles'].get('$profile_name', c['profiles'].get('local',{}))
print(p.get('userListUrl','http://localhost:8080/cloud/Apex/system/user'))
")"

  # 密码未配置拦截
  if [[ "$PASSWORD" == "CHANGE_ME" ]]; then
    echo "❌ 密码仍为 CHANGE_ME，请写入 config/ux-test.config.local.json" >&2
    echo "   参考: config/ux-test.config.local.json.example" >&2
    exit 1
  fi
}
