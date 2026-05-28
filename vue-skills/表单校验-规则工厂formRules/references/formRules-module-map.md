# formRules.ts 模块地图

集中式 rules 模块的结构索引。**完整成品**见 [`template/sample-nebula/after/formRules.ts`](../template/sample-nebula/after/formRules.ts)；**增量改码**见同目录 `*.fragment.ts`。

messageKey 规则见 [`message-key-constraints.md`](message-key-constraints.md)。密码对见 [`password-pair-model.md`](password-pair-model.md)。

## 文件头分区（§1–§4）

```text
§1 常量与类型（规则常量 | 业务常量 | 密码对类型）
§2 工具函数（仅 export 非校验器纯函数）
§3 规则工厂（通用 | 名称 builder | 路径原子 | 路径聚合 | 路径 Element 校验器）
§4 预定义规则集（通用字段 | 名称字段 | 组合字段 | 密码对 pwdPair | routePath | apiUrl）
```

## 对外 export（页面 / 单测常用）

| 类别 | 保留 export |
|------|-------------|
| 工具 | `asRuleArray`、`collectFormValidationErrors`、`formatValidationMessages`、`normName`、`trimFieldOnBlur` |
| 工厂 | `requiredRule`、`patternRule`、`createNameValidator`、各 `create*Rules` |
| 密码对 | `pwdPair`（microfb：`pwdConfirmPair`）、`PwdCtx`/`PwdPolicy`/`PwdPairOpt`；辅助 `pwdMinRules`/`cfmPwdRules` 可 export |
| 常量 | `NameFieldKind`、`NAME_MAX_LENGTH`、`PATH_MAX_LENGTH`（`routePath` / `apiPath`） |

**不 export**：`appendPwdSync`、`createRuleFail`、`chkPath*`、`chkSeg*`、`validateRoutePathSyntax`、`validateApiPathSyntax`。

**不 export 默认策略常量**：用 `options?.policy ?? { minLength: 6 }` 内联。

## createRuleFail(bind?)

模块内工厂，名称/路径校验共用（略，见旧版）。

## trigger 约定

预定义规则 **内联** `trigger: ["blur", "change"]`；**不**维护模块级 `RULE_TRIGGER` 常量（nebula 样本已对齐 microfb）。

## 路径长度常量

```ts
export type PathFieldKind = "routePath" | "apiPath";
export const PATH_MAX_LENGTH: Record<PathFieldKind, number> = {
  routePath: 64,
  apiPath: 512,
};
```

页面 `:maxlength` 用 `PATH_MAX_LENGTH.apiPath` 等；**勿**再 export `ROUTE_PATH_MAX_LENGTH` / `API_PATH_MAX_LENGTH` 双常量。

## 路径校验原子

（整路径 / 分段原子表同前，略）

## 聚合编排（for 循环 — 黑名单 → 白名单 continue → 兜底）

**route**（`validateRoutePathSyntax`）：

```text
// 黑名单（全员）
chkSegVoid → chkSegLead → chkSegIllegalChars → chkSegLead(onlyDigitUnderscoreLead)
// 白名单（命中 continue）
chkSegRouteColon → static regex → chkSegFrag
// 兜底
fail("路径段格式不对")
```

**API**（`validateApiPathSyntax`）：

```text
chkSegVoid → chkSegLead → chkSegApiColon → chkSegIllegalChars
→ static regex → chkSegFrag → fail("路径段格式不对")
```

页面只使用 `createRoutePathRules()` / `createApiPathRules()`。

## 密码对 §4

唯一出口 `pwdPair(ctx, { policy })` → `{ password, confirmPassword }`。

- 策略由网关 `getPwdPolicy` 注入；默认 `{ minLength: 6 }` 内联
- `appendPwdSync` 私有；password 变更时 `nextTick` → `validateField(confirmProp)`
- 页面动态 `computed` rules 须 `:validate-on-rule-change="false"`

片段：[`formRules.pwdPair.fragment.ts`](../template/sample-nebula/after/formRules.pwdPair.fragment.ts)

## 单测约定

- pathLike：经 `createRoutePathRules()[0].validator`
- pwdPair：[`formRules.pwdConfirm.test.fragment.ts`](../template/sample-nebula/after/formRules.pwdConfirm.test.fragment.ts)

## 相关文档

- 分段语义：[`route-path-segment-model.md`](route-path-segment-model.md)
- 密码对：[`password-pair-model.md`](password-pair-model.md)
- 名称风格：[`name-identifier-model.md`](name-identifier-model.md)
- 风格路由：[`rule-style-registry.md`](rule-style-registry.md)
