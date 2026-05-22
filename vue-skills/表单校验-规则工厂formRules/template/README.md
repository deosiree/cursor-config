# Template 说明

## sample-nebula/after（P2：完整可参考实现）

优先对照 [`sample-nebula/after/README.md`](sample-nebula/after/README.md)：

- **pathLike**：`formRules.routePath.fragment.ts`（含完整 `validateRoutePathSyntax` 分段循环）
- **nameIdentifier**：`formRules.name.fragment.ts`（含 `createNameValidator` 校验链）
- **单测**：`formRules.routePath.test.fragment.ts`
- **页面接入**：`MenuFormDialog.wire.fragment.vue`

片段摘自 nebula `apex_dev` 一次落地形态，**仅作实现参考**，不含版本号绑定。

## 新项目迁移

1. 替换 import 为探测到的 `rulesModule`
2. 按 [`project-discovery.md`](../references/project-discovery.md) 选择 `i18nKey` 或 `plainText`
3. 勿拷贝无关工厂；合并时去重模块级常量（`INVISIBLE_REGEX` 等）

## mvp/

未知规则最小骨架：[`mvp/validator-skeleton.ts`](mvp/validator-skeleton.ts)，无 locale、无业务绑定。
