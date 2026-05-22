# sample-nebula / after — 编排与接入示意

**完整实现以仓库 `src/utils/formRules.ts` 为准。** 见 [`formRules-module-map.md`](../../../references/formRules-module-map.md)。

| 文件 | 用途 |
|------|------|
| `formRules.routePath.fragment.ts` | pathLike 对外 API + 聚合调用链注释 |
| `formRules.name.fragment.ts` | nameIdentifier 要点（trimFieldOnBlur、超长模板） |
| `formRules.routePath.test.fragment.ts` | 经 `createRoutePathRules()[0].validator` 的 runner |
| `MenuFormDialog.wire.fragment.vue` | 阶段 B：name + routePath + apiUrl 接入 |
| `formRules.factory.fragment.ts` | 通用工厂片段；path/name 见 map |

合并到目标仓库时：按 [`project-discovery.md`](../../../references/project-discovery.md) 调整 `@/` import。
