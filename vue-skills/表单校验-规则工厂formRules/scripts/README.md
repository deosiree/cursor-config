# formRules skill 维护脚本

在 **skill 根目录**执行（`表单校验-规则工厂formRules/`），或从 **`.cursor` 仓库根**用 `npm run formrules:*`。

| 命令 | 作用 |
|------|------|
| **`node scripts/sync-samples.js`** | **推荐**：extract + verify 一步完成 |
| `node scripts/sync-from-repos.js --dry-run` | 对比 apex vs skill 样本；microfb 仅报告 |
| `node scripts/sync-from-repos.js --apply` | 复制 apex `formRules.ts` → skill，再 sync-samples |
| `node scripts/extract-fragments.js` | 从 `formRules.ts` 重生成 `*.fragment.ts` |
| `node scripts/verify-template-sync.js` | 校验 fragment 与成品一致 + 文档 grep 门禁 |

**唯一编辑入口**：`template/sample-nebula/after/formRules.ts`（pathLike / name / pwdPair；业务真源 `apex_dev/src/utils/formRules.ts`）。

**何时跑 sync-samples**：手改 skill 样本后；`sync-from-repos --apply` 之后；提交 `.cursor` 时若 staged 含样本路径则 **pre-commit 自动跑**。

**勿手改** AUTO-GENERATED `formRules.*.fragment.ts`。

契约：[`template-sync.manifest.json`](template-sync.manifest.json)。业务仓路径：[`references/sample-source.config.example.json`](../references/sample-source.config.example.json) → 复制为 `sample-source.config.json`（已 gitignore）。

---

## .cursor 仓库 pre-commit（防漏跑）

Git 根为 `nebula/.cursor`。首次安装：

```bash
cd path/to/nebula/.cursor
npm install
npm run formrules:install-hook
```

提交时若 staged 包含本 skill 的 `formRules.ts`、`formRules.*.fragment.ts` 或 `template-sync.manifest.json`，钩子会执行 `sync-samples.js` 并 restage 更新后的 fragment。

实现：`pre-commit-skill-samples.js`（由 [`.husky/pre-commit`](../../../.husky/pre-commit) 调用）。

---

## 业务仓 → skill（真源 apex）

```bash
# skill 根目录
node scripts/sync-from-repos.js --dry-run
node scripts/sync-from-repos.js --apply --apex "F:/path/to/apex_dev" --microfb "F:/path/to/microfb"

# 或 .cursor 根
npm run formrules:sync-from-repos -- --dry-run
```

Agent 流程见 [`feature-skills/维护-从业务仓同步样本`](../feature-skills/维护-从业务仓同步样本/SKILL.md)。
