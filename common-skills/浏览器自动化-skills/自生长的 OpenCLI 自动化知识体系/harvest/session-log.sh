#!/usr/bin/env bash
#===============================================================================
# session-log.sh — 会话日志框架
#
# 每次 OpenCLI 会话结束后，将关键信息记录到 session-log/ 目录。
# 后续 harvest/add-scene.sh 可从此目录提取信息生成场景文件。
#
# 用法：
#   bash session-log.sh capture <session> <profile> <task-desc>  # 创建新日志
#   bash session-log.sh list                                      # 列出最近日志
#
# 来源：自生长的OpenCLI自动化知识体系/harvest/
#===============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KNOWLEDGE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${KNOWLEDGE_ROOT}/session-log"
TEMPLATE="${SCRIPT_DIR}/templates/session-log.md"

mkdir -p "$LOG_DIR"

set -euo pipefail

capture() {
  local session="$1"
  local profile="$2"
  local task_desc="$3"
  local date
  date="$(date +%Y-%m-%d_%H%M%S)"
  local logfile="${LOG_DIR}/${date}-${session}.md"

  if [[ ! -f "$TEMPLATE" ]]; then
    echo "❌ 模板不存在: ${TEMPLATE}" >&2
    exit 1
  fi

  sed \
    -e "s/__SESSION_NAME__/${session}/g" \
    -e "s/__PROFILE__/${profile}/g" \
    -e "s/__DATE__/${date}/g" \
    -e "s/__TARGET_URL__/${TARGET_URL:-未知}/g" \
    -e "s/__TASK_DESC__/${task_desc}/g" \
    -e "s/__COMMANDS__/${COMMANDS:-待补充}/g" \
    -e "s/__LOGIN_RESULT__/${LOGIN_RESULT:-未记录}/g" \
    -e "s/__TC1_RESULT__/${TC1_RESULT:-未记录}/g" \
    -e "s/__SCREENSHOT_PATH__/${SCREENSHOT_PATH:-未记录}/g" \
    -e "s/__PITFALLS__/${PITFALLS:-无}/g" \
    "$TEMPLATE" > "$logfile"

  echo "✅ 会话日志已保存: session-log/$(basename "$logfile")"
}

list_logs() {
  echo "=== 最近会话日志 ==="
  ls -1t "$LOG_DIR"/*.md 2>/dev/null | head -5 | while IFS= read -r f; do
    local name size
    name="$(basename "$f" .md)"
    size="$(wc -c < "$f" 2>/dev/null || echo 0)"
    echo "  ${name}  (${size}B)"
  done
  echo ""
  echo "共 $(ls -1 "$LOG_DIR"/*.md 2>/dev/null | wc -l) 条日志"
}

case "${1:-list}" in
  capture)
    if [[ $# -lt 4 ]]; then
      echo "用法: bash session-log.sh capture <session> <profile> <task-desc>" >&2
      exit 1
    fi
    capture "$2" "$3" "$4"
    ;;
  list)
    list_logs
    ;;
  *)
    echo "用法: bash session-log.sh {capture|list} [参数...]" >&2
    exit 1
    ;;
esac
