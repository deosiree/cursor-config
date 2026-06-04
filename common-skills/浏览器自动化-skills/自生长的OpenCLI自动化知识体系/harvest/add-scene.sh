#!/usr/bin/env bash
#===============================================================================
# add-scene.sh — 一键注册新场景到自生长知识体系
#
# 用法：
#   bash add-scene.sh -n "配网批量上传" -s nebula-ux -p local \
#     -P "帮我把配网文件批量上传到 10 个设备" \
#     -c "opencli browser nebula-ux open ..." \
#     -C "需要批量上传文件到设备 Web 管理页"
#
# 功能：
#   1. 在 references/ 创建场景文件（从模板）
#   2. 更新 SKILL.md 路由规则表（插入新行）
#   3. 更新 test-prompts.json（追加条目）
#
# 来源：自生长的OpenCLI自动化知识体系/harvest/
#===============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KNOWLEDGE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATES_DIR="${SCRIPT_DIR}/templates"
SKILL_MD="${KNOWLEDGE_ROOT}/SKILL.md"
TEST_PROMPTS="${KNOWLEDGE_ROOT}/test-prompts.json"

set -euo pipefail

# ---- 默认值 ----
SCENE_NAME=""
SESSION_NAME=""
PROFILE=""
SOURCE_PROMPT=""
CORE_COMMANDS=""
CONDITIONS=""
INPUT_DESC="URL / 操作步骤"
INPUT_EXAMPLE="URL=http://device-admin.local"
OUTPUT_DESC="操作结果（成功/失败）+ 截图"
OUTPUT_EXAMPLE="已上传 10/10 个设备"
EDGE_CASE="页面加载超时 → 重试 3 次"
PITFALL="设备 Web 管理页未认证 → 先用 login 流程"

# ---- 解析参数 ----
while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--name) SCENE_NAME="$2"; shift 2 ;;
    -s|--session) SESSION_NAME="$2"; shift 2 ;;
    -p|--profile) PROFILE="$2"; shift 2 ;;
    -P|--prompt) SOURCE_PROMPT="$2"; shift 2 ;;
    -c|--commands) CORE_COMMANDS="$2"; shift 2 ;;
    -C|--condition) CONDITIONS="$2"; shift 2 ;;
    --input-desc) INPUT_DESC="$2"; shift 2 ;;
    --input-example) INPUT_EXAMPLE="$2"; shift 2 ;;
    --output-desc) OUTPUT_DESC="$2"; shift 2 ;;
    --output-example) OUTPUT_EXAMPLE="$2"; shift 2 ;;
    --edge-case) EDGE_CASE="$2"; shift 2 ;;
    --pitfall) PITFALL="$2"; shift 2 ;;
    -h|--help)
      echo "用法: bash add-scene.sh [选项]"
      echo ""
      echo "必填:"
      echo "  -n, --name NAME         场景名称（如「配网批量上传」）"
      echo "  -s, --session SESSION   OpenCLI session 名（如 nebula-ux）"
      echo "  -P, --prompt TEXT       触发此场景的用户请求原文"
      echo "  -c, --commands TEXT     核心 OpenCLI 命令（多行用 \\n 分隔）"
      echo "  -C, --condition TEXT    触发条件描述"
      echo ""
      echo "可选:"
      echo "  -p, --profile PROFILE   Profile（默认 local）"
      echo "  --input-desc / --input-example / --output-desc / --output-example"
      echo "  --edge-case / --pitfall"
      echo "  -h, --help              显示本帮助"
      exit 0
      ;;
    *) echo "未知参数: $1（使用 -h 查看帮助）" >&2; exit 1 ;;
  esac
done

# ---- 必填检查 ----
if [[ -z "$SCENE_NAME" || -z "$SESSION_NAME" || -z "$SOURCE_PROMPT" || -z "$CORE_COMMANDS" || -z "$CONDITIONS" ]]; then
  echo "❌ 缺少必填参数。使用 -h 查看帮助。" >&2
  exit 1
fi

PROFILE="${PROFILE:-local}"
DATE="$(date +%Y-%m-%d)"
SCENE_FILENAME="场景-${SCENE_NAME}.md"
SCENE_PATH="${KNOWLEDGE_ROOT}/references/${SCENE_FILENAME}"

# 转义单引号（模板填充用）
escape() { echo "$1" | sed "s/'/\\\\'/g"; }

ESCAPED_NAME="$(escape "$SCENE_NAME")"
ESCAPED_SESSION="$(escape "$SESSION_NAME")"
ESCAPED_PROFILE="$(escape "$PROFILE")"
ESCAPED_PROMPT="$(escape "$SOURCE_PROMPT")"
ESCAPED_COND="$(escape "$CONDITIONS")"
ESCAPED_CMDS="$(escape "$CORE_COMMANDS")"
ESCAPED_INPUT_D="$(escape "$INPUT_DESC")"
ESCAPED_INPUT_E="$(escape "$INPUT_EXAMPLE")"
ESCAPED_OUTPUT_D="$(escape "$OUTPUT_DESC")"
ESCAPED_OUTPUT_E="$(escape "$OUTPUT_EXAMPLE")"
ESCAPED_EDGE="$(escape "$EDGE_CASE")"
ESCAPED_PIT="$(escape "$PITFALL")"

# ---- Step 1: 创建 references/ 场景文件 ----
echo ""
echo "==== Step 1: 创建 references/${SCENE_FILENAME} ===="
if [[ -f "$SCENE_PATH" ]]; then
  echo "⚠️  文件已存在: ${SCENE_PATH}"
  echo "   跳过创建（不会覆盖）"
else
  sed \
    -e "s/__SESSION_NAME__/${ESCAPED_SESSION}/g" \
    -e "s/__PROFILE__/${ESCAPED_PROFILE}/g" \
    -e "s/__DATE__/${DATE}/g" \
    -e "s/__SOURCE_PROMPT__/${ESCAPED_PROMPT}/g" \
    -e "s/__SCENE_NAME__/${ESCAPED_NAME}/g" \
    -e "s/__CONDITIONS__/${ESCAPED_COND}/g" \
    -e "s/__INPUT_DESC__/${ESCAPED_INPUT_D}/g" \
    -e "s/__INPUT_EXAMPLE__/${ESCAPED_INPUT_E}/g" \
    -e "s/__OUTPUT_DESC__/${ESCAPED_OUTPUT_D}/g" \
    -e "s/__OUTPUT_EXAMPLE__/${ESCAPED_OUTPUT_E}/g" \
    -e "s/__CORE_COMMANDS__/${ESCAPED_CMDS}/g" \
    -e "s/__EDGE_CASE_1__/${ESCAPED_EDGE}/g" \
    -e "s/__EDGE_HANDLING_1__/${ESCAPED_PIT}/g" \
    -e "s/__PITFALL_1__/${ESCAPED_PIT}/g" \
    "${TEMPLATES_DIR}/scene.md" > "$SCENE_PATH"
  echo "✅ 已创建: references/${SCENE_FILENAME}"
fi

# ---- Step 2: 更新 SKILL.md 路由规则表 ----
echo ""
echo "==== Step 2: 更新路由规则表 ===="
# 在「以上都不是」行之前插入新行
# 使用 Python 做精确的行插入
SKILL_TMP=$(mktemp)
"${KNOWLEDGE_ROOT}/lib/config.sh" 2>/dev/null || true  # source for PYTHON_BIN
PYTHON_BIN="${PYTHON_BIN:-python}"

# 查找「以上都不是」行号，在其前一行插入新路由行
CATCH_ALL_LINE="$("${PYTHON_BIN}" -c "
with open('${SKILL_MD}', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if '以上都不是' in line and '|' in line:
        print(i + 1)  # 1-indexed
        break
" 2>/dev/null || echo "")"

if [[ -n "$CATCH_ALL_LINE" ]]; then
  NEW_ROW="| **${SCENE_NAME}** | ${CONDITIONS} | → [[references/${SCENE_FILENAME}]] — 自生长（${DATE}） |"
  sed "${CATCH_ALL_LINE}i\\
${NEW_ROW}" "$SKILL_MD" > "$SKILL_TMP" && mv "$SKILL_TMP" "$SKILL_MD"
  echo "✅ 路由表已更新（在行 ${CATCH_ALL_LINE} 前插入）"
else
  echo "⚠️  未找到「以上都不是」行，请手动更新 SKILL.md 路由表"
  rm -f "$SKILL_TMP"
fi

# ---- Step 3: 更新 test-prompts.json ----
echo ""
echo "==== Step 3: 更新 test-prompts.json ===="
PROMPTS_TMP=$(mktemp)
NEW_ID=$("${PYTHON_BIN}" -c "
import json
with open('${TEST_PROMPTS}', 'r', encoding='utf-8') as f:
    data = json.load(f)
# 找到最大 id
max_id = max(item['id'] for item in data) if data else 0
print(max_id + 1)
" 2>/dev/null || echo "10")

ESCAPED_COND_FOR_JSON="${CONDITIONS}"
"${PYTHON_BIN}" -c "
import json
with open('${TEST_PROMPTS}', 'r', encoding='utf-8') as f:
    data = json.load(f)
data.append({
    'id': ${NEW_ID},
    'prompt': '${ESCAPED_PROMPT}',
    'expected': 'Agent 应匹配路由表 → 路由到 references/${SCENE_FILENAME} → 给出对应的 OpenCLI 命令'
})
with open('${TEST_PROMPTS}', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
" 2>/dev/null && echo "✅ test-prompts.json 已更新（id=${NEW_ID}）" || echo "⚠️  更新 test-prompts.json 失败"

rm -f "$SKILL_TMP" "$PROMPTS_TMP"

# ---- Step 4: auto-commit ----
echo ""
echo "==== Step 4: auto-commit ===="
SCRIPT_DIR="${SCRIPT_DIR}" bash "${SCRIPT_DIR}/git-commit.sh" \
  --type scene \
  --name "${SCENE_NAME}"

echo ""
echo "🎉 场景「${SCENE_NAME}」已注册完成"
echo ""
echo "下一步建议:"
echo "  - 验证路由: 检查 SKILL.md 路由表可命中新场景"
echo "  - 完善: 编辑 references/${SCENE_FILENAME} 补充更多边界细节"
echo "  - 可选: 如果产出了 ≥3 个脚本，运行 bash harvest/scaffold-skill.sh 创建子 skill"
