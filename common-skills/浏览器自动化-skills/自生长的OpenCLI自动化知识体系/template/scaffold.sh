#!/usr/bin/env bash
# OpenCLI 自动化脚本脚手架 — 从模板生成新脚本
# 用法: bash scaffold.sh <脚本名>
# 示例: bash scaffold.sh daily-report-export

set -euo pipefail

TEMPLATE_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE_FILE="${TEMPLATE_DIR}/新脚本模板.sh"
OUTPUT_DIR="$(pwd)"

if [[ $# -lt 1 ]]; then
  echo "用法: bash scaffold.sh <脚本名>"
  echo "示例: bash scaffold.sh daily-report-export"
  echo ""
  echo "将在当前目录生成 <脚本名>.sh"
  exit 1
fi

SCRIPT_NAME="$1"
OUTPUT_FILE="${OUTPUT_DIR}/${SCRIPT_NAME}.sh"

if [[ ! -f "$TEMPLATE_FILE" ]]; then
  echo "❌ 未找到模板文件: ${TEMPLATE_FILE}"
  exit 1
fi

if [[ -f "$OUTPUT_FILE" ]]; then
  echo "⚠️  文件已存在: ${OUTPUT_FILE}"
  echo "   请先删除或指定其他名称"
  exit 1
fi

# 复制模板并替换占位符
sed "s/__SCRIPT_NAME__/${SCRIPT_NAME}/g" "$TEMPLATE_FILE" > "$OUTPUT_FILE"
chmod +x "$OUTPUT_FILE"

echo "✅ 已生成: ${OUTPUT_FILE}"
echo ""
echo "下一步："
echo "  1. 编辑 ${SCRIPT_NAME}.sh，修改 SESSION / BASE_URL / 操作步骤"
echo "  2. 确保 opencli doctor 通过"
echo "  3. bash ${SCRIPT_NAME}.sh"
