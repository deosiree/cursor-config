# Template 说明

**实现以仓库 `src/utils/formRules.ts` 为准**（如 `apex_dev/src/utils/formRules.ts`）。本目录仅保留编排与接入示意，避免与真源再次分叉。

结构索引：[`references/formRules-module-map.md`](../references/formRules-module-map.md)。

## sample-nebula/after

| 片段 | 用途 |
|------|------|
| `formRules.routePath.fragment.ts` | pathLike 对外 API + 聚合调用链注释（非完整 validate） |
| `formRules.routePath.test.fragment.ts` | 经 `createRoutePathRules()[0].validator` 的 runner |
| `formRules.name.fragment.ts` | nameIdentifier 接入要点（trimFieldOnBlur、超长模板） |
| `MenuFormDialog.wire.fragment.vue` | 页面 blur / rules / submit |
| `formRules.factory.fragment.ts` | 工厂分区指针（链 map） |

详见 [`sample-nebula/after/README.md`](sample-nebula/after/README.md)。

## 新项目迁移

1. 替换 import 为探测到的 `rulesModule`
2. 按 [`project-discovery.md`](../references/project-discovery.md) 选择 `i18nKey` 或 `plainText`
3. 勿拷贝无关工厂；合并时去重模块级常量

## mvp/

未知规则最小骨架：[`mvp/validator-skeleton.ts`](mvp/validator-skeleton.ts)，无 locale、无业务绑定。
