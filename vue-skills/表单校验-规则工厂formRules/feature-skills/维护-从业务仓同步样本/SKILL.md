---
name: 维护-从业务仓同步样本
description: 同步 skill 样本、formRules 样本对齐、apex 改了 formRules 更新 skill、业务仓 formRules drift。按用户提供的 apex_dev/microfb 路径，以 apex 为真源覆盖 skill 成品并跑 sync-samples；microfb 仅 diff 报告。
---

# 维护-从业务仓同步样本

父级：[`../../SKILL.md`](../../SKILL.md)。**不**改业务仓库源码；**不**改 locale。

## 何时使用

- 用户说 **apex / microfb 的 formRules 变了，要更新 skill 样本**
- 需要 **dry-run** 看 skill `template/.../formRules.ts` 与 apex 是否 drift
- 落地会话后要把 [`apex_dev/src/utils/formRules.ts`](../../../../apex_dev/src/utils/formRules.ts) 对齐进 skill

## 何时不要使用

- 用户要改 **apex_dev / microfb 业务源码** → 在业务仓改，不走本 feature
- 用户要 **补 zh_CN / i18n** → 非本套件
- 仅 **盘点下一表单项** → [`盘点-推荐下一表单字段`](../盘点-推荐下一表单字段/SKILL.md)
- 用户在 skill 内 **手改样本** 且未动业务仓 → 只需 `node scripts/sync-samples.js`

## 真源策略

| 仓库 | 角色 |
|------|------|
| **apex_dev** | **唯一**覆盖 skill 成品 `template/sample-nebula/after/formRules.ts` |
| **microfb** | 与 apex **对比报告**；命名差异见 [`password-pair-model.md`](../../references/password-pair-model.md)；**不**写入 skill |

## 输入契约

| 字段 | 必填 | 说明 |
|------|------|------|
| `apexDevRoot` | 否* | 业务仓根目录；可覆盖 config |
| `microfbRoot` | 否 | 用于 diff 报告 |
| `mode` | 否 | `dryRun`（默认） / `apply` |

\* 未提供时使用 [`references/sample-source.config.json`](../../references/sample-source.config.json)（从 [`sample-source.config.example.json`](../../references/sample-source.config.example.json) 复制并填本机路径）。

## 执行步骤

| Step | 动作 | 命令 / 产出 |
|------|------|-------------|
| **S1** | 确认/生成 `references/sample-source.config.json` | 含 `canonicalRepo.root`、`compareRepos[].root` |
| **S2** | dry-run | skill 根目录：`node scripts/sync-from-repos.js --dry-run` 或 `--apex <path> [--microfb <path>]` |
| **S3** | 检查点 | 有 drift 且 `mode=apply` → **必须**用户确认后再 apply |
| **S4** | apply | `node scripts/sync-from-repos.js --apply`（复制 apex → skill + `sync-samples.js`） |
| **S5** | 交付 | 变更文件列表；microfb vs apex 摘要；`sync-samples: OK` 输出 |

### 从 .cursor 仓库根（可选）

```bash
cd path/to/nebula/.cursor
npm run formrules:sync-from-repos -- --dry-run
npm run formrules:sync-from-repos -- --apply
```

## 验收

- [ ] skill 目标与 apex `formRules.ts` hash 一致（apply 后）
- [ ] `node scripts/sync-samples.js` exit 0
- [ ] microfb 差异仅在报告中，skill 成品未从 microfb 复制
- [ ] 未改 `locales/*.json`、未改业务仓（除非用户另开任务）

## 参考

- 配置示例：[`sample-source.config.example.json`](../../references/sample-source.config.example.json)
- 脚本：[`scripts/sync-from-repos.js`](../../scripts/sync-from-repos.js)
- 样本维护：[`scripts/README.md`](../../scripts/README.md)
