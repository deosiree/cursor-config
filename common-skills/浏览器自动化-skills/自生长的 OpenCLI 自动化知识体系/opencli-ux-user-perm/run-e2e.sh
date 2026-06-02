#!/usr/bin/env bash
#===============================================================================
# E2E 入口：用户管理全流程 — 登录/预检 → 种子用户 → 操作列诊断 → 批量清理
#
# 用法：
#   bash run-e2e.sh                                    # local 全流程
#   bash run-e2e.sh --profile cloud                    # cloud 环境全流程
#   bash run-e2e.sh --flow seed_users                  # 仅创建种子用户
#   bash run-e2e.sh --flow perm_diagnose               # 仅操作列诊断
#   bash run-e2e.sh --flow cleanup --keep 5            # 清理到 5 人
#   bash run-e2e.sh --profile local --skip-login       # 已登录，跳过登录
#   bash run-e2e.sh --check                            # 自检模式
#
# Flow 说明:
#   full          登录 → 种子用户 → 操作列诊断（默认）
#   preflight     仅登录预检 + 权限检查
#   seed_users    创建种子用户（邮箱 + 密码直设）
#   perm_diagnose 操作列权限诊断（需先有他人用户）
#   cleanup       批量清理用户到 N 人
#
# 依赖：opencli browser、config/ux-test.config.json
# 来源：自生长的OpenCLI自动化知识体系/opencli-ux-user-perm/
#===============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

# ---- 默认值 ----
FLOW="full"
KEEP_COUNT=10
CHECK_MODE=0

# ---- 参数解析（共参由 parse_args_profile 消费，剩余为 flow/keep/check） ----
parse_args_profile "$@"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --flow|-f)
      FLOW="${2:-full}"
      shift 2
      ;;
    --keep|-k)
      KEEP_COUNT="${2:-10}"
      shift 2
      ;;
    --check|-c)
      CHECK_MODE=1
      shift
      ;;
    -h|--help)
      echo "用法: $0 [选项]"
      echo ""
      echo "选项:"
      echo "  --profile NAME, -p NAME  profile 名称（默认 local，见 config/ux-test.config.json）"
      echo "  --skip-login             跳过登录，复用已有 browser session"
      echo "  --flow MODE, -f MODE     执行模式：full / preflight / seed_users / perm_diagnose / cleanup"
      echo "  --keep N, -k N           清理时保留用户数（默认 10）"
      echo "  --check, -c              自检模式：输出配置概览 + 环境诊断，不执行测试"
      echo "  -h, --help               显示本帮助"
      echo ""
      echo "示例:"
      echo "  bash run-e2e.sh                          # local 全流程"
      echo "  bash run-e2e.sh -p cloud -f seed_users   # cloud 仅创建种子用户"
      echo "  bash run-e2e.sh -f cleanup -k 5          # 清理到 5 人"
      echo "  bash run-e2e.sh --check                  # 自检"
      exit 0
      ;;
    *)
      echo "未知参数: $1（使用 -h 查看帮助）" >&2
      exit 1
      ;;
  esac
done

export UX_PROFILE="${UX_PROFILE_ARG:-${UX_PROFILE:-}}"

# ---- 自检模式 ----
if [[ "$CHECK_MODE" -eq 1 ]]; then
  echo "=== 自检 ==="
  echo "profile: ${UX_PROFILE:-local}"
  echo "flow: $FLOW"
  echo "keepCount: $KEEP_COUNT"
  echo "skipLogin: $SKIP_LOGIN"
  echo ""
  require_opencli
  echo "✅ opencli: $(opencli --version 2>/dev/null || echo ok)"
  echo "config: ${CONFIG_MAIN}"
  echo "config.local: ${CONFIG_LOCAL}"
  echo "scripts:"
  ls -1 "${SCRIPT_DIR}/scripts/" 2>/dev/null || echo "  (none)"
  echo ""
  echo "✅ 自检完成"
  exit 0
fi

# ---- 加载配置 ----
load_profile "${UX_PROFILE_ARG:-}" || exit 1
require_opencli

# ---- 默认登录（除非 --skip-login）- ----
if [[ "$SKIP_LOGIN" -eq 0 ]] && [[ "$FLOW" != "preflight" ]]; then
  bash "${SCRIPT_DIR}/login.sh" --profile "${UX_PROFILE}" || die "登录失败"
  echo ""
fi

SCRIPTS_DIR="${SCRIPT_DIR}/scripts"

# ---- Flow 路由 ----
case "$FLOW" in
  preflight)
    log_step "preflight" "预检：检查用户管理页可访问 + perm 状态"
    oc_plain open "$USER_LIST_URL" >/dev/null
    sleep 2
    oc_plain eval "
      JSON.stringify({
        url: location.href,
        title: document.title,
        hasTable: !!document.querySelector('.el-table'),
        hasAddBtn: !!document.querySelector('button:has(.el-icon-plus), button:contains(新增)')
      });
    "
    ;;

  seed_users)
    log_step "seed_users" "创建种子用户（邮箱 + 密码直设）"
    eval_script "${SCRIPTS_DIR}/create-seed-users.js" "创建种子用户"
    ;;

  perm_diagnose)
    log_step "perm_diagnose" "操作列权限诊断"
    if [[ -f "${SCRIPTS_DIR}/diagnose-op-column.js" ]]; then
      eval_script "${SCRIPTS_DIR}/diagnose-op-column.js" "操作列诊断"
    else
      echo "⚠️ diagnose-op-column.js 未就绪，使用 references 对照排查"
      echo "   参考: references/permission-op-column-pitfalls.md"
    fi
    ;;

  cleanup)
    log_step "cleanup" "批量清理用户到 ${KEEP_COUNT} 人"
    echo "⚠️  请确认当前租户: ${UX_PROFILE}"
    echo "    保留规则: 本人 + owner + 最新 ${KEEP_COUNT} 人"
    echo "    按 Enter 继续，Ctrl+C 取消..."
    read -r
    KEEP="${KEEP_COUNT}" eval_script "${SCRIPTS_DIR}/cleanup-users-to-n.js" "批量清理"
    ;;

  full|*)
    log_step "full" "全流程：种子用户 → 操作列诊断"
    eval_script "${SCRIPTS_DIR}/create-seed-users.js" "创建种子用户"
    echo ""
    if [[ -f "${SCRIPTS_DIR}/diagnose-op-column.js" ]]; then
      eval_script "${SCRIPTS_DIR}/diagnose-op-column.js" "操作列诊断"
    else
      echo "⚠️ diagnose-op-column.js 未就绪，可后续单独运行"
    fi
    ;;
esac

echo ""
echo "✅ flow=${FLOW} 完成（profile=${UX_PROFILE}）"
