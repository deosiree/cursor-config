#!/usr/bin/env bash
#===============================================================================
# git-commit.sh — 自生长后自动 git commit 的共享工具
#
# 被 add-scene.sh / scaffold-skill.sh / session-log.sh 在成功操作末尾调用。
# 每次调用只提交本次自生长产生的变更，生成可读的 commit message，
# 方便通过 git push 历史观察知识体系的生长过程。
#
# 用法（由宿主脚本调用）：
#   bash git-commit.sh --type scene --name "配网批量上传"
#   bash git-commit.sh --type skill --name "配网批量上传" --count 14
#   bash git-commit.sh --type log   --name "nebula-ux-2026-06-02"
#
# 环境变量（由宿主脚本设置，无需手动传入）：
#   SCRIPT_DIR — 指向 harvest/ 目录（自动计算 KNOWLEDGE_ROOT）
#
# 安全保证：
#   - git 不可用 → 静默跳过，exit 0
#   - 无可提交变更 → 静默跳过，exit 0
#   - 不阻塞宿主脚本流程
#
# 来源：自生长的OpenCLI自动化知识体系/harvest/
#===============================================================================

set -euo pipefail

# ---- 依赖检查 ----
if ! command -v git &>/dev/null; then
  echo "  ⏭️  git 不可用，跳过 auto-commit" >&2
  exit 0
fi

# ---- 路径计算 ----
# 宿主脚本需保证 SCRIPT_DIR 已设置（harvest/ 目录）
HARVEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KNOWLEDGE_ROOT="$(cd "${HARVEST_DIR}/.." && pwd)"

# Git 根目录 = KNOWLEDGE_ROOT/../../  = .cursor/
GIT_ROOT="$(cd "${KNOWLEDGE_ROOT}/../.." && pwd 2>/dev/null)" || {
  echo "  ⏭️  无法确定 git 根目录，跳过 auto-commit" >&2
  exit 0
}

# 知识体系相对于 git 根目录的路径（用于 git add）
K_RELATIVE="$(python -c "import os.path; print(os.path.relpath('${KNOWLEDGE_ROOT}', '${GIT_ROOT}'))" 2>/dev/null)" || \
K_RELATIVE="common-skills/浏览器自动化-skills/自生长的 OpenCLI 自动化知识体系"

# ---- 参数解析 ----
COMMIT_TYPE=""    # scene | skill | log
COMMIT_NAME=""    # 场景名 / skill 名 / session名
FILE_COUNT=""     # 可选，skill 的文件数

while [[ $# -gt 0 ]]; do
  case "$1" in
    --type)     COMMIT_TYPE="$2"; shift 2 ;;
    --name)     COMMIT_NAME="$2"; shift 2 ;;
    --count)    FILE_COUNT="$2";  shift 2 ;;
    --paths)    shift ;;  # 兼容参数，忽略（自动计算）
    --)         shift; break ;;
    -h|--help)
      echo "用法: bash git-commit.sh --type scene|skill|log --name NAME [--count N]"
      exit 0 ;;
    *)          shift ;;  # 忽略未知参数
  esac
done

if [[ -z "$COMMIT_TYPE" || -z "$COMMIT_NAME" ]]; then
  echo "  ⏭️  git-commit.sh: 缺少 --type 或 --name 参数，跳过" >&2
  exit 0
fi

# ---- 构造 commit message ----
DATE_TAG="$(date +%Y-%m-%d)"

case "$COMMIT_TYPE" in
  scene)
    COMMIT_MSG="🏗️ OpenCLI自生长: 新增场景「${COMMIT_NAME}」(${DATE_TAG})"
    ADD_PATHS=(
      "${K_RELATIVE}/references/场景-${COMMIT_NAME}.md"
      "${K_RELATIVE}/SKILL.md"
      "${K_RELATIVE}/test-prompts.json"
    )
    ;;
  skill)
    COUNT_SUFFIX=""
    [[ -n "$FILE_COUNT" ]] && COUNT_SUFFIX=" (${FILE_COUNT} 文件)"
    COMMIT_MSG="🌱 OpenCLI自生长: 新增子 skill「${COMMIT_NAME}」${COUNT_SUFFIX}(${DATE_TAG})"
    DIR_NAME="opencli-ux-$(echo "$COMMIT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"
    ADD_PATHS=(
      "${K_RELATIVE}/${DIR_NAME}"
    )
    ;;
  log)
    COMMIT_MSG="📝 OpenCLI自生长: 新增会话日志「${COMMIT_NAME}」(${DATE_TAG})"
    ADD_PATHS=(
      "${K_RELATIVE}/session-log"
    )
    ;;
  *)
    echo "  ⏭️  未知 commit 类型: ${COMMIT_TYPE}，跳过" >&2
    exit 0
    ;;
esac

# ---- 检查是否有变更 ----
# 先 git add --dry-run 检查是否有新文件/变更
HAS_CHANGES=0
for p in "${ADD_PATHS[@]}"; do
  # 检查路径是否存在（文件或目录）
  if [[ -e "${GIT_ROOT}/${p}" ]]; then
    # 检查 git 视角是否有变更
    GIT_STATUS="$(cd "$GIT_ROOT" && git status --porcelain -- "$p" 2>/dev/null)" || true
    if [[ -n "$GIT_STATUS" ]]; then
      HAS_CHANGES=1
    fi
  fi
done

if [[ "$HAS_CHANGES" -eq 0 ]]; then
  echo "  ⏭️  自生长产物无变更（或已提交），跳过 auto-commit" >&2
  exit 0
fi

# ---- 执行 commit ----
echo "  🔄 auto-commit: ${COMMIT_MSG}"

# git add（逐个路径，避免意外添加无关文件）
for p in "${ADD_PATHS[@]}"; do
  if [[ -e "${GIT_ROOT}/${p}" ]]; then
    cd "$GIT_ROOT" && git add -- "$p" 2>/dev/null || true
  fi
done

# git commit
cd "$GIT_ROOT" && git commit -m "$COMMIT_MSG" --quiet 2>/dev/null && {
  echo "  ✅ auto-commit 完成: ${COMMIT_MSG}"
} || {
  echo "  ⏭️  auto-commit 跳过（可能无变更或 commit 失败）" >&2
}

exit 0
