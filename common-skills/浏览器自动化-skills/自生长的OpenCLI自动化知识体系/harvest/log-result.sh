#!/usr/bin/env bash
# log-result.sh — 自动追加实跑结果到 evals/实跑记录.tsv
#
# 用法（在 run-e2e.sh / role-tab-validation.sh 的 EXIT trap 中调用）：
#   bash ../harvest/log-result.sh "PASS" "TC1~TC4 全通过" "opencli-ux-role-tab-validation"
# 第三个参数可选：skill 名，省略时自动从 pwd 检测
#
# RESULT: PASS / FAIL / PARTIAL
# NOTES:  可选，简短的通过条件或踩坑

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KNOWLEDGE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TSV_PATH="${KNOWLEDGE_ROOT}/evals/实跑记录.tsv"
RESULT="${1:-PARTIAL}"
NOTES="${2:-}"
SKILL="${3:-}"

# 自动检测 skill 名（未通过参数提供时）
if [[ -z "$SKILL" ]]; then
  CWD_SKILL="$(basename "$(pwd)" 2>/dev/null || echo "")"
  if echo "$CWD_SKILL" | grep -q "^opencli-ux-"; then
    SKILL="$CWD_SKILL"
  else
    SKILL="$(basename "$(pwd)")"
  fi
fi

# 自动检测 env
ENV="${UX_PROFILE:-local}"

# 自动补日期
DATE="$(date +%Y-%m-%d)"

# 如果 TSV 不存在，写入表头
if [[ ! -f "$TSV_PATH" ]]; then
  echo -e "date\tskill\tresult\tenv\tnotes" > "$TSV_PATH"
fi

# 追加一行
echo -e "${DATE}\t${SKILL}\t${RESULT}\t${ENV}\t${NOTES}" >> "$TSV_PATH"
echo "✅ 实跑已记录: ${SKILL} ${RESULT} (${ENV})"
