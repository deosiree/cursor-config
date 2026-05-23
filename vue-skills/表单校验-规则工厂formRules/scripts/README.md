# formRules skill 维护脚本

在 **skill 根目录**执行（`表单校验-规则工厂formRules/`）。

| 命令 | 作用 |
|------|------|
| **`node scripts/sync-samples.js`** | **推荐**：extract + verify 一步完成 |
| `node scripts/extract-fragments.js` | 从 `formRules.ts` 重生成 `*.fragment.ts` |
| `node scripts/verify-template-sync.js` | 校验 fragment 与成品一致 + 文档 grep 门禁 |

**唯一编辑入口**：`template/sample-nebula/after/formRules.ts`（pathLike / name 相关改动）。

**何时跑**：改完 skill 样本 `formRules.ts` 后、提交 PR 前；agent 勿手改 AUTO-GENERATED fragment。

契约定义：[`template-sync.manifest.json`](template-sync.manifest.json)。
