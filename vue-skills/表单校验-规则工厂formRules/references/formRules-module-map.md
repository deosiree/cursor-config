# formRules.ts 模块地图

扩展或阅读集中式 rules 模块（如 `apex_dev/src/utils/formRules.ts`）前的结构索引。**实现以仓库源码为准**；本文档描述分区、导出面与路径原子编排。

messageKey 规则见 [`message-key-constraints.md`](message-key-constraints.md)。

## 文件头分区（§1–§4）

```text
§1 常量与类型（规则常量 | 业务常量）
§2 工具函数（仅 export 非校验器纯函数）
§3 规则工厂（通用 | 名称 builder | 路径原子 | 路径聚合 | 路径 Element 校验器）
§4 预定义规则集（通用字段 | 名称字段 | 组合字段 | routePath | apiUrl）
```

## 对外 export（页面 / 单测常用）

| 类别 | 保留 export |
|------|-------------|
| 工具 | `asRuleArray`、`collectFormValidationErrors`、`formatValidationMessages`、`normName`、`trimFieldOnBlur` |
| 工厂 | `requiredRule`、`patternRule`、`createNameValidator`、各 `create*Rules` |
| 常量 | `NameFieldKind`、`NAME_MAX_LENGTH`、`ROUTE_PATH_MAX_LENGTH`、`API_PATH_MAX_LENGTH` |

**不 export**（模块内私有）：`createRuleFail`、`chkPath*`、`chkSeg*`、`validateRoutePathSyntax`、`validateApiPathSyntax`、`createRoutePathValidator`、`createApiPathValidator`。

## createRuleFail(bind?)

模块内工厂，名称/路径校验共用：

```ts
function createRuleFail(bind?: Record<string, unknown>): RuleFail
```

- 有 `bind` 或 `extra` 时：`t(messageKey, { ...bind, ...extra })`
- 否则：`t(messageKey)`
- 超长统一：`fail("{label}超过{maxLength}字")`（见 message-key-constraints）

## RULE_TRIGGER

```ts
const RULE_TRIGGER: FormItemRule["trigger"] = ["blur", "change"];
```

预定义 `create*Rules` 与名称 validator 共用，避免分散写 `["blur", "change"]`。

## 路径校验原子

### 整路径（先于分段）

| 函数 | 职责 |
|------|------|
| `chkPathCore` | 非空、超长、协议头、`/`、`//`、空白、不可见字符 |
| `chkPathFrag` | 整路径 `?`/`#` 连用、个数、顺序 |

### 分段（for 循环内）

| 函数 | 职责 |
|------|------|
| `chkSegVoid` | 空段、尾 `/` |
| `chkSegLead` | 段首 `?#&=`；可选 `{ onlyDigitUnderscoreLead: true }`（route 尾链） |
| `chkSegRouteColon` | route：Vue 动态段；含 `:` 处理完 → `true` |
| `chkSegApiColon` | API：禁 `:` 动态段 |
| `chkSegFrag` | 段内 `?#` 拼参后缀；合法 → `true` |
| `chkSegIllegalChars` | 段内字符白名单外 → `包含非法字符` |

常量：`ROUTE_PATH_SEGMENT_ILLEGAL_CHAR_RE`、`API_PATH_SEGMENT_ILLEGAL_CHAR_RE` 等见 §1 规则常量。

## 聚合编排（for 循环清单）

**route**（`validateRoutePathSyntax`，模块内私有）：

```text
chkSegVoid → chkSegLead → chkSegRouteColon? → static? → chkSegFrag? → chkSegIllegalChars → chkSegLead(onlyDigitUnderscoreLead) → 路径段格式不对
```

**API**（`validateApiPathSyntax`）：

```text
chkSegVoid → chkSegLead → chkSegApiColon → static? → chkSegFrag? → chkSegIllegalChars → 路径段格式不对
```

页面只使用 `createRoutePathRules()` / `createApiPathRules()`；失焦 trim 用 `trimFieldOnBlur`。

## 单测约定

不直接 import `validate*`。经预定义规则取 validator：

```ts
const validator = createRoutePathRules()[0].validator!;
// 或 createApiPathRules()[0].validator!
```

pathLike 矩阵断言稳定 `error.message`；超长展示如 `路径超过64字`（模板 + bind）。

## 相关文档

- 分段语义与 message 表：[`route-path-segment-model.md`](route-path-segment-model.md)
- 名称风格：[`name-identifier-model.md`](name-identifier-model.md)
- 风格路由：[`rule-style-registry.md`](rule-style-registry.md)
