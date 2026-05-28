# Template 说明

**唯一编辑入口**：[`sample-nebula/after/formRules.ts`](sample-nebula/after/formRules.ts)（pathLike / name / pwdPair；真源 `apex_dev/src/utils/formRules.ts`）。

**维护命令**（在 skill 根目录执行）：

```bash
node scripts/sync-samples.js
```

分步或说明见 [`../scripts/README.md`](../scripts/README.md)。

## 双轨：成品 vs 片段

| 类型 | 文件 | 谁用 |
|------|------|------|
| **成品快照** | `formRules.ts` | 人类通读；绿场复制起点 |
| **AUTO-GENERATED 片段** | `formRules.*.fragment.ts` | agent 增量对照；由 extract 生成，勿手改 |

结构索引：[`references/formRules-module-map.md`](../references/formRules-module-map.md)。

## sample-nebula/after

| 文件 | 用途 |
|------|------|
| `formRules.ts` | 完整成品 |
| `formRules.routePath.fragment.ts` | pathLike（extract 生成） |
| `formRules.name.fragment.ts` | nameIdentifier（extract 生成） |
| `formRules.routePath.test.fragment.ts` | 单测 runner |
| `formRules.pwdPair.fragment.ts` | pwdPair + `pwdPlcyTip`（extract 生成） |
| `formRules.pwdConfirm.test.fragment.ts` | 密码对单测 |
| `PwdPairForm.wire.fragment.vue` | pwdPair 页面接入（无 tips） |
| `PwdPolicyTip.apex.wire.fragment.vue` | apex：label 旁 tooltip |
| `PwdPolicyTip.microfb.wire.fragment.vue` | microfb：标题下副标题 |
| `ForgotPwdWithTips.wire.fragment.vue` | microfb：ForgotStepPanel + policy tips |
| `MenuFormDialog.wire.fragment.vue` | 页面接入 |
| `formRules.factory.fragment.ts` | 通用工厂示意（手写） |

## mvp/

[`mvp/validator-skeleton.ts`](mvp/validator-skeleton.ts)
