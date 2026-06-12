#!/usr/bin/env bash
# 动态解析 OpenCLI Chrome profile 与 browser session，bind 前校验 URL。
# 供各 opencli-ux-* 子 skill 的 lib/common.sh source 使用。

opencli_kbs_lib_dir() {
  cd "$(dirname "${BASH_SOURCE[0]}")" && pwd
}

# 列出已连接的 Chrome profile ID（每行一个，优先 default）
opencli_list_connected_profile_ids() {
  local line id
  while IFS= read -r line; do
    [[ "$line" == *"not connected"* ]] && continue
    [[ "$line" != *"connected"* ]] && continue
    id="$(sed -n 's/^[[:space:]]*\([^[:space:]]*\).*/\1/p' <<<"$line")"
    [[ -n "$id" && "$id" != "Connected" && "$id" != "Disconnected" ]] || continue
    if [[ "$line" == *"default"* ]]; then
      echo "$id"
      return 0
    fi
  done < <(opencli profile list 2>/dev/null || true)

  while IFS= read -r line; do
    [[ "$line" == *"not connected"* ]] && continue
    [[ "$line" != *"connected"* ]] && continue
    id="$(sed -n 's/^[[:space:]]*\([^[:space:]]*\).*/\1/p' <<<"$line")"
    [[ -n "$id" && "$id" != "Connected" && "$id" != "Disconnected" ]] && echo "$id" && return 0
  done < <(opencli profile list 2>/dev/null || true)

  return 1
}

opencli_is_profile_connected() {
  local want="$1"
  opencli profile list 2>/dev/null | grep -qE "^[[:space:]]*${want}[[:space:]].*connected" \
    && ! opencli profile list 2>/dev/null | grep -qE "^[[:space:]]*${want}[[:space:]].*not connected"
}

opencli_request_human_ids() {
  local reason="${1:-无法自动解析 OpenCLI 上下文}"
  echo "" >&2
  echo "❌ ${reason}" >&2
  echo "" >&2
  echo "请任选其一后重试：" >&2
  echo "  1. 在 Chrome 打开 OpenCLI 扩展，确保至少一个 profile 为 connected" >&2
  echo "  2. 运行: opencli profile list" >&2
  echo "  3. 将 connected 的 profile ID 告诉 Agent，或设置环境变量：" >&2
  echo "       export OPENCLI_CHROME_PROFILE=\"<profile-id>\"" >&2
  echo "       export OPENCLI_BROWSER_SESSION=\"<session-name>\"   # 可选，默认同 profile" >&2
  echo "  4. bind 前在对应 Chrome 窗口聚焦目标标签（勿聚焦 about:blank）" >&2
  echo "" >&2
  opencli profile list 2>/dev/null >&2 || true
  return 1
}

# 解析 Chrome profile：env > config（且 connected）> profile list 自动
opencli_resolve_chrome_profile() {
  local config_hint="${1:-}"

  if [[ -n "${OPENCLI_CHROME_PROFILE:-}" ]]; then
    if opencli_is_profile_connected "$OPENCLI_CHROME_PROFILE"; then
      echo "$OPENCLI_CHROME_PROFILE"
      return 0
    fi
    opencli_request_human_ids "环境变量 OPENCLI_CHROME_PROFILE=${OPENCLI_CHROME_PROFILE} 未 connected"
    return 1
  fi

  if [[ -n "$config_hint" ]]; then
    if opencli_is_profile_connected "$config_hint"; then
      echo "$config_hint"
      return 0
    fi
  fi

  local auto
  auto="$(opencli_list_connected_profile_ids)" || {
    opencli_request_human_ids "opencli profile list 中无 connected profile"
    return 1
  }
  echo "$auto"
}

# 解析 browser session：env > config sessionName > 与 profile 相同
opencli_resolve_browser_session() {
  local config_session="${1:-}"
  local profile_id="${2:-}"

  if [[ -n "${OPENCLI_BROWSER_SESSION:-}" ]]; then
    echo "$OPENCLI_BROWSER_SESSION"
    return 0
  fi

  if [[ -n "$config_session" ]]; then
    echo "$config_session"
    return 0
  fi

  if [[ -n "$profile_id" ]]; then
    echo "$profile_id"
    return 0
  fi

  opencli_request_human_ids "无法确定 browser session 名"
  return 1
}

# 设置 OPENCLI_CHROME_PROFILE / SESSION（幂等，已设置且 connected 则跳过）
opencli_ensure_context() {
  local config_session="${OPENCLI_CONFIG_SESSION_NAME:-}"
  local config_profile="${OPENCLI_CONFIG_CHROME_PROFILE:-}"

  if [[ -n "${OPENCLI_CHROME_PROFILE:-}" && -n "${SESSION:-}" ]]; then
    if opencli_is_profile_connected "$OPENCLI_CHROME_PROFILE"; then
      return 0
    fi
  fi

  local profile session
  profile="$(opencli_resolve_chrome_profile "$config_profile")" || return 1
  session="$(opencli_resolve_browser_session "$config_session" "$profile")" || return 1

  export OPENCLI_CHROME_PROFILE="$profile"
  export SESSION="$session"
}

opencli_oc_args() {
  opencli_ensure_context || return 1
  opencli --profile "$OPENCLI_CHROME_PROFILE" browser "$SESSION" "$@"
}

# bind 当前聚焦标签，拒绝 about:blank / chrome://
opencli_bind_with_url_check() {
  local url_pattern="${1:-}"
  local bind_out url

  opencli_ensure_context || return 1

  bind_out="$(opencli --profile "$OPENCLI_CHROME_PROFILE" browser "$SESSION" bind 2>&1)" || {
    opencli_request_human_ids "bind 命令失败"
    return 1
  }

  url="$(opencli --profile "$OPENCLI_CHROME_PROFILE" browser "$SESSION" get url 2>/dev/null | tr -d '\r\n')"
  if [[ -z "$url" || "$url" == "about:blank" || "$url" == chrome://* || "$url" == chrome-extension://* ]]; then
    opencli_request_human_ids "bind 到了无效页: ${url:-<empty>}，请先聚焦已登录的目标标签再 bind"
    return 1
  fi

  if [[ -n "$url_pattern" && "$url" != *"$url_pattern"* ]]; then
    echo "WARN: bind URL ($url) 不匹配期望 (*${url_pattern}*)" >&2
  fi

  echo "$url"
  return 0
}
