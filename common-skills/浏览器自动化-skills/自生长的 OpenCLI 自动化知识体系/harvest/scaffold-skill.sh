#!/usr/bin/env bash
#===============================================================================
# scaffold-skill.sh — 创建完整子 skill 骨架（12+ 文件）
#
# 用法：
#   bash scaffold-skill.sh -n "配网批量上传" \
#     -s nebula-ux -p local \
#     -P "帮我把配网文件批量上传到 10 个设备"
#
# 创建结构：
#   new-scene-name/
#   ├── SKILL.md
#   ├── README.md
#   ├── config/
#   │   ├── ux-test.config.json
#   │   └── ux-test.config.local.json.example
#   ├── references/
#   │   └── common-failures.md
#   ├── lib/
#   │   ├── common.sh
#   │   └── config.sh
#   ├── login.sh
#   ├── run-e2e.sh
#   ├── evals/
#   │   ├── should-trigger.md
#   │   ├── should-not-trigger.md
#   │   ├── test-prompts.json
#   │   └── darwin-baseline-report.md
#   ├── screenshots/
#   ├── template/
#   │   ├── before/常见失败.md
#   │   └── after/全流程通过.md
#   ├── intention-skills/README.md
#   └── feature-skills/README.md
#
# 来源：自生长的OpenCLI自动化知识体系/harvest/
#===============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KNOWLEDGE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATES_DIR="${SCRIPT_DIR}/templates"
REF_SKILL="${KNOWLEDGE_ROOT}/opencli-ux-tenant"  # 参考实现

set -euo pipefail

# ---- 默认值 ----
SKILL_NAME=""
SESSION_NAME=""
PROFILE="local"
SOURCE_PROMPT=""
DATE="$(date +%Y-%m-%d)"

# ---- 解析参数 ----
while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--name) SKILL_NAME="$2"; shift 2 ;;
    -s|--session) SESSION_NAME="$2"; shift 2 ;;
    -p|--profile) PROFILE="$2"; shift 2 ;;
    -P|--prompt) SOURCE_PROMPT="$2"; shift 2 ;;
    -h|--help)
      echo "用法: bash scaffold-skill.sh [选项]"
      echo "  -n, --name NAME    子 skill 名称（如「配网批量上传」）"
      echo "  -s, --session NAME 来源 OpenCLI session 名"
      echo "  -p, --profile NAME 来源 profile（默认 local）"
      echo "  -P, --prompt TEXT  触发此子 skill 的用户请求原文"
      exit 0
      ;;
    *) echo "未知参数: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$SKILL_NAME" ]]; then
  echo "❌ 缺少 -n/--name 参数" >&2; exit 1
fi

# ---- 路径计算 ----
DIR_NAME="opencli-ux-$(echo "$SKILL_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"
SKILL_DIR="${KNOWLEDGE_ROOT}/${DIR_NAME}"

if [[ -d "$SKILL_DIR" ]]; then
  echo "❌ 目录已存在: ${SKILL_DIR}" >&2
  exit 1
fi

echo ""
echo "=== 创建子 skill: ${DIR_NAME} ==="

# ---- 创建目录结构 ----
mkdir -p "${SKILL_DIR}"/{config,references,lib,evals,screenshots,template/{before,after},intention-skills,feature-skills}

# ---- 1. SKILL.md ----
cat > "${SKILL_DIR}/SKILL.md" <<SKILLEOF
---
name: ${SKILL_NAME}
description: 基于 OpenCLI 实现 ${SKILL_NAME} 的浏览器自动化。当需要 ${CONDITIONS:-${SKILL_NAME}} 时使用。
tags:
  - 浏览器自动化
  - OpenCLI
  - ${SKILL_NAME}
should-trigger:
  - prompt 含 ${SKILL_NAME} + OpenCLI / 浏览器 / 自动化
should-not-trigger:
  - 不涉及浏览器操作 / 无 OpenCLI 环境
session_origin:
  session: "${SESSION_NAME}"
  profile: "${PROFILE}"
  date: "${DATE}"
  source_prompt: "${SOURCE_PROMPT}"
---

# ${SKILL_NAME} — OpenCLI 自动化

> 自生长自 \`${SESSION_NAME}\` (${DATE})。
> 来源请求: "${SOURCE_PROMPT}"

## 快速启动

\`\`\`bash
cd ${DIR_NAME}
bash run-e2e.sh --profile local
\`\`\`

## 输入契约

| 字段 | 说明 |
|------|------|
| \`targetProfile\` | \`local\` / \`cloud\`（见 config/ux-test.config.json） |

## 输出契约

- 见 \`evals/darwin-baseline-report.md\`

## 关联资产

- 主路由：[\`../SKILL.md\`](../SKILL.md)
- 参考实现：[\`../opencli-ux-tenant/\`](../opencli-ux-tenant/)
SKILLEOF
echo "  ✅ SKILL.md"

# ---- 2. README.md ----
cat > "${SKILL_DIR}/README.md" <<READMEEOF
# ${SKILL_NAME} — OpenCLI 自动化

> 自生长自 \`${SESSION_NAME}\` (${DATE})。

## 前置条件

\`\`\`bash
npm install -g @jackwener/opencli
opencli doctor
\`\`\`

## 快速开始

\`\`\`bash
cd ${DIR_NAME}
bash run-e2e.sh --profile local
\`\`\`
READMEEOF
echo "  ✅ README.md"

# ---- 3. config/ux-test.config.json ----
cat > "${SKILL_DIR}/config/ux-test.config.json" <<CONFIGEOF
{
  "defaultProfile": "local",
  "sessionName": "nebula-ux",
  "profiles": {
    "local": {
      "baseUrl": "http://localhost:8080",
      "loginPath": "/cloud/login",
      "account": "admin@system.local",
      "password": "123456",
      "captchaMode": "auto"
    }
  }
}
CONFIGEOF
echo "  ✅ config/ux-test.config.json"

# ---- 4. config/ux-test.config.local.json.example ----
cp "${REF_SKILL}/config/ux-test.config.local.json.example" "${SKILL_DIR}/config/" 2>/dev/null || \
  cat > "${SKILL_DIR}/config/ux-test.config.local.json.example" <<LOCALEOF
{
  "profiles": {
    "cloud": {
      "password": "YOUR_PASSWORD_HERE"
    }
  }
}
LOCALEOF
echo "  ✅ config/ux-test.config.local.json.example"

# ---- 5. lib/ 从参考 skill 复制基础文件 ----
if [[ -f "${REF_SKILL}/lib/common.sh" ]]; then
  # 复制并替换 SUITE_ROOT 变量
  sed "s/UX_SUITE_ROOT/SUITE_ROOT/g; s/UX_LIB_DIR/LIB_DIR/g" \
    "${REF_SKILL}/lib/common.sh" > "${SKILL_DIR}/lib/common.sh" 2>/dev/null || \
    cp "${REF_SKILL}/lib/common.sh" "${SKILL_DIR}/lib/common.sh"
fi
cp "${REF_SKILL}/lib/config.sh" "${SKILL_DIR}/lib/config.sh" 2>/dev/null || \
  cat > "${SKILL_DIR}/lib/config.sh" <<'LIBEOF'
#!/usr/bin/env bash
SUITE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_DIR="${SUITE_ROOT}/config"
CONFIG_MAIN="${CONFIG_DIR}/ux-test.config.json"
CONFIG_LOCAL="${CONFIG_DIR}/ux-test.config.local.json"
LIBEOF
echo "  ✅ lib/"

# ---- 6. login.sh（简化版） ----
cat > "${SKILL_DIR}/login.sh" <<LOGINEOF
#!/usr/bin/env bash
# 登录脚本 — ${SKILL_NAME}
# 自生长自 ${SESSION_NAME} (${DATE})

SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
source "\${SCRIPT_DIR}/lib/common.sh"

parse_args_profile "\$@"
load_profile "\${UX_PROFILE_ARG:-}" || exit 1
require_opencli

if [[ "\$SKIP_LOGIN" -eq 1 ]]; then
  assert_logged_in
  exit 0
fi

log_step "1" "打开登录页"
oc_plain open "\$LOGIN_URL" >/dev/null
sleep 2

url_after_open="\$(oc_plain get url 2>/dev/null | tr -d '\\r\\n' || true)"
if [[ "\$url_after_open" != *"/login"* ]]; then
  assert_logged_in
  exit 0
fi

handle_captcha_mode
fill_by_placeholder "请输入手机号/邮箱地址" "\$ACCOUNT"
fill_by_placeholder "请输入密码" "\$PASSWORD"
click_button "登录"
wait_leave_login
echo "✅ 登录完成: session=\${SESSION}"
LOGINEOF
chmod +x "${SKILL_DIR}/login.sh"
echo "  ✅ login.sh"

# ---- 7. run-e2e.sh（骨架） ----
cat > "${SKILL_DIR}/run-e2e.sh" <<RUNEOF
#!/usr/bin/env bash
# E2E 入口 — ${SKILL_NAME}
# 自生长自 ${SESSION_NAME} (${DATE})

set -euo pipefail
SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
source "\${SCRIPT_DIR}/lib/common.sh"

parse_args_profile "\$@"
load_profile "\${UX_PROFILE_ARG:-}" || exit 1
require_opencli

if [[ "\$SKIP_LOGIN" -eq 0 ]]; then
  bash "\${SCRIPT_DIR}/login.sh" --profile "\${UX_PROFILE}"
fi

# TODO: 在此添加测试逻辑
echo "⚠️  run-e2e.sh 骨架 — 请补充测试步骤"
RUNEOF
chmod +x "${SKILL_DIR}/run-e2e.sh"
echo "  ✅ run-e2e.sh"

# ---- 8. evals/ ----
cat > "${SKILL_DIR}/evals/should-trigger.md" <<TRIGGEREOF
# should-trigger — 应该触发本 skill 的场景

- \`${SKILL_NAME}\` + OpenCLI / 浏览器
TRIGGEREOF

cat > "${SKILL_DIR}/evals/should-not-trigger.md" <<NOTRIGGEREOF
# should-not-trigger — 不应触发本 skill 的场景

- 无浏览器环境
- 需求可被已有子 skill 覆盖
NOTRIGGEREOF

cat > "${SKILL_DIR}/evals/test-prompts.json" <<'PROMPTSEOF'
[]
PROMPTSEOF

cat > "${SKILL_DIR}/evals/darwin-baseline-report.md" <<DARWINEOF
# Darwin 基线评估报告 · ${SKILL_NAME}

> 评估日期：${DATE}
> 来源会话：\`${SESSION_NAME}\`

## 状态

- **SKILL.md**: ✅ 已创建
- **脚本**: ⏸ 骨架（待补充具体逻辑）
- **实测**: ⏸ 未实跑

**种子评分：待实跑后评估**
DARWINEOF
echo "  ✅ evals/"

# ---- 9. template/ ----
echo "# 执行前状态" > "${SKILL_DIR}/template/before/常见失败.md"
echo "# 全流程通过" > "${SKILL_DIR}/template/after/全流程通过.md"
echo "  ✅ template/"

# ---- 10. intention-skills/ / feature-skills/ README ----
echo "# intention-skills — 意图判断节点

| 意图 | 路由 |
|------|------|
| TODO | TODO |
" > "${SKILL_DIR}/intention-skills/README.md"

echo "# feature-skills — 子能力分层

| 能力 | SKILL.md |
|------|----------|
| TODO | TODO |
" > "${SKILL_DIR}/feature-skills/README.md"
echo "  ✅ intention-skills/ + feature-skills/"

# ---- 11. references/ ----
echo "# ${SKILL_NAME} — 常见失败原因

| 症状 | 原因 | 修复 |
|------|------|------|
| TODO | TODO | TODO |
" > "${SKILL_DIR}/references/common-failures.md"
echo "  ✅ references/"

# ---- 12. screenshots/.gitkeep ----
touch "${SKILL_DIR}/screenshots/.gitkeep"

echo ""
echo "🎉 子 skill 骨架已创建: ${SKILL_DIR}"
echo ""
echo "文件列表:"
find "${SKILL_DIR}" -type f | sort | sed 's/.*\///' | while IFS= read -r f; do
  echo "  - ${SKILL_DIR}/${f}"
done
echo ""
echo "下一步:"
echo "  1. 编辑 ${SKILL_DIR}/SKILL.md 补充路由规则和输入/输出契约"
echo "  2. 补充 ${SKILL_DIR}/run-e2e.sh 中的测试逻辑"
echo "  3. 运行: bash ../harvest/add-scene.sh ... 注册到路由表"
