# sample-nebula / after

| 文件 | 说明 |
|------|------|
| **`formRules.ts`** | **唯一编辑入口**（人类通读 / 绿场复制） |
| `formRules.*.fragment.ts` | **AUTO-GENERATED** — 改 `formRules.ts` 后运行 `node scripts/sync-samples.js`，勿手改 |
| `formRules.routePath.test.fragment.ts` | 单测（skill 内相对 import fragment） |
| `MenuFormDialog.wire.fragment.vue` | 页面接入样板 |

维护说明：[`../../../scripts/README.md`](../../../scripts/README.md)
