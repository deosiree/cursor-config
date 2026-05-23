# Few-shot：盘点推荐输出（形态样本）

**形态参考**（非执行依赖）：某次全仓扫描的归档数字；落地时以**当前** `repoRoot` 扫描为准，**不**绑定特定 monorepo 子目录名。

## 归档示例（历史湿跑，仅供对照输出格式）

| 项 | 值 |
|----|-----|
| formFieldCoverage | totalProps **81** / factoryWired **28** / needsWork **53** / **35%** |
| topRecommendation | `ApiConfigDialog.vue` · `apiUrl` · `inlineDuplicated` · **pathLike** · score **92** |
| 备选 | `PermissionConfigDialog.perm`(86)、`MenuFormDialog.perm`(84) |
| landingStatus | `in_progress` |

**下一项实施注意**：API 路径用 `createApiPathRules`：**允许 `?`/`#` 拼参**、**禁止 Vue 动态段 `:`**、`validateMax` **512**；合并见 [`formRules.routePath.fragment.ts`](../../template/sample-nebula/after/formRules.routePath.fragment.ts)。

## 输入

```text
repoRoot: ./my-app
moduleHint: 菜单
只盘点，不改代码
```

## 输出（节选）

### 推荐下一项

- **componentPath**: `src/views/system/menu/components/ApiConfigDialog.vue`
- **prop**: `apiUrl`
- **fieldLabel**: API地址
- **coverageStatus**: `inlineDuplicated`
- **suggestedRuleStyle**: `pathLike`
- **recommendScore**: 92
- **why**: 与同模块 `MenuFormDialog.routePath` 同属路径语义；当前仅「必填 + 必须以 `/` 开头」，未复用 `createRoutePathRules` / 分段校验；阶段 A3 可复用现有 pathLike 工厂与单测矩阵。

### 备选

| prop | componentPath | score | 说明 |
|------|---------------|-------|------|
| perm | PermissionConfigDialog.vue | 85 | `name` 已 factoryWired，`perm` 仅必填 |
| perm | MenuFormDialog.vue（功能类型） | 82 | 同语义，与上可一批 pattern |
| deviceTypeName | deviceType/index.vue | 70 | 适合 nameIdentifier，跨模块 |

### 覆盖度（moduleHint=菜单，示意）

```text
formFieldCoverage:
  totalProps: 18
  factoryWired: 4
  needsWork: 14
  coveragePercent: 22
landingStatus: in_progress
```

### 建议 fields[]（复制到父 skill）

```text
componentPath: src/views/system/menu/components/ApiConfigDialog.vue
fields:
  - prop: apiUrl
    fieldLabel: API地址
    ruleStyle: pathLike
    ui.maxlength: 64
    constraints.allowParamSuffix: true
```

## 反例（不应在本 few-shot 中做的事）

- 直接修改 `ApiConfigDialog.vue` 或 `formRules.ts`（属父 skill 阶段 A/B）
- 补 `zh_CN.json`
