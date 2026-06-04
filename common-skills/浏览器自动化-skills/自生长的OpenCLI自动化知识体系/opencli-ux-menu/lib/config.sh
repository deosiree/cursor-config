#!/usr/bin/env bash
# 加载 ux-test 配置与 profile，导出 MENU_URL、项目与路由路径测试数据。

UX_SUITE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UX_CONFIG_DIR="${UX_SUITE_ROOT}/config"
UX_CONFIG_MAIN="${UX_CONFIG_DIR}/ux-test.config.json"
UX_CONFIG_LOCAL="${UX_CONFIG_DIR}/ux-test.config.local.json"

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

_merge_json_files() {
  local base="$1"
  local overlay="$2"
  if [[ ! -f "$base" ]]; then
    echo "config not found: $base" >&2
    return 1
  fi
  if [[ -f "$overlay" ]]; then
    if command -v jq >/dev/null 2>&1; then
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
      return 1
    fi
  else
    cat "$base"
  fi
}

load_ux_config() {
  local merged
  merged="$(_merge_json_files "$UX_CONFIG_MAIN" "$UX_CONFIG_LOCAL")" || return 1
  UX_CONFIG_JSON="$merged"
  export UX_CONFIG_JSON
}

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
    name = data.get("defaultProfile", "local-subapp")
profiles = data.get("profiles", {})
if name not in profiles:
    print(f"未知 profile: {name}（可用: {', '.join(profiles.keys())}）", file=sys.stderr)
    sys.exit(1)
p = profiles[name]
md = data.get("menuData", {})
base = p["baseUrl"].rstrip("/")
login_path = p.get("loginPath", "/cloud/login")
menu_path = data.get("menuPath", "/cloud/Apex/system/menu")
fields = {
    "SESSION": data.get("sessionName", "p2ejw7ww"),
    "OPENCLI_CHROME_PROFILE": data.get("opencliChromeProfile", data.get("sessionName", "p2ejw7ww")),
    "BASE_URL": base,
    "LOGIN_PATH": login_path,
    "MENU_PATH": menu_path,
    "LOGIN_URL": base + login_path,
    "MENU_URL": base + menu_path,
    "AUTH_MODE": p.get("authMode", "login"),
    "ACCOUNT": p["account"],
    "PASSWORD": p["password"],
    "CAPTCHA_MODE": p.get("captchaMode", "auto"),
    "PROJECT_DUP": md.get("projectDuplicateIn", "test0415"),
    "PROJECT_CROSS": md.get("projectCrossProject", "test0601"),
    "ROUTE_PATH_DUP": md.get("duplicateRoutePath", "/opencli/dup0415"),
    "DUP_ERROR_TEXT": md.get("duplicateErrorText", "当前项目下的路由路径已存在"),
    "MENU_NAME_PREFIX": md.get("testMenuNamePrefix", "ux_menu_dup_"),
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

  return 0
}
