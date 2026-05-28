# pathLike 风格模型

## 语义

以 `/` 开头的路径模板；分段校验；允许业务在**静态段后缀**拼接 `?` / `#` 查询或锚点模板（如 `/user?`、`/list?from=menu`）。

参考：RFC 3986（path 在 `?`/`#` 处结束）、Vue Router 动态段须占满单段且以 `:` 开头。

结构索引：[`formRules-module-map.md`](formRules-module-map.md)。messageKey 约束：[`message-key-constraints.md`](message-key-constraints.md)。

## 整路径规则（先于分段）

由 `chkPathCore`、`chkPathFrag` 统一实现（`validateRoutePathSyntax` / `validateApiPathSyntax` 共用）。

- 非空；长度 ≤ `PATH_MAX_LENGTH.routePath` 或 `PATH_MAX_LENGTH.apiPath`；超长见 message-key-constraints + 下表
- 禁止协议头、`//` 开头、空格、不可见字符
- 必须以 `/` 开头；除根路径 `/` 外禁止尾部 `/`
- **片段符**：禁止 `??`、`##`、`?#`、`#?`；至多各一个 `?` 与 `#`；若有则 `?` 在 `#` 前

## 分段规则（推荐：黑名单 → 白名单 continue → 兜底）

for 循环内结构（nebula apex_dev@80da1ae 后）：先全员黑名单，再白名单 `continue`，最后 `fail("路径段格式不对")`。

| 阶段 | route | API | 原子 / 说明 |
|------|-------|-----|-------------|
| 黑名单 | ✓ | ✓ | `chkSegVoid` — 空段、尾 `/` |
| 黑名单 | ✓ | ✓ | `chkSegLead` — 段首 `?#&=` |
| 黑名单 | ✓ | ✓ | `chkSegIllegalChars` |
| 黑名单 | ✓ | — | `chkSegLead({ onlyDigitUnderscoreLead: true })` |
| 黑名单 | — | ✓ | `chkSegApiColon` — 禁止 `:` |
| 白名单 | ✓ | — | `chkSegRouteColon` — Vue 动态段 → continue |
| 白名单 | ✓ | ✓ | 纯静态段正则 → continue |
| 白名单 | ✓ | ✓ | `chkSegFrag` — 拼参后缀 → continue |
| 兜底 | ✓ | ✓ | `fail("路径段格式不对")` |

旧顺序（白名单后再 `chkSegIllegalChars`）与上表语义等价；新顺序可读性更好。

## 动态段正则（整段）

```text
^:[a-zA-Z_][a-zA-Z0-9_]*(\([^)]+\))?[*+]?\??$
```

## 拼参后缀段正则

```text
^[a-zA-Z][a-zA-Z0-9_-]*[?#][a-zA-Z0-9\-._~/?#&=*+()]*$
```

## 消息 key 表（见 message-key-constraints + 下表）

| key | 场景 |
|-----|------|
| 路径不可为空 | 空 |
| `{label}超过{maxLength}字`（bind：`label=路径`） | 超长，展示如 `路径超过64字` |
| 必须以/开头 | 无 leading / |
| 不要以/结尾 | 尾部 / |
| 不要以//开头 | 协议式 // |
| 不要使用协议头 | http: |
| 不要包含空格 | 含空白 |
| 不要连续斜杠 | 空段 |
| 段首不要片段符 | /?xxx |
| 段中不要用冒号 | user:id# |
| 动态段不要接#? | :id# |
| 动态参数名无效 | /: |
| 拼参格式不对 | 非法拼参段 |
| 路径段格式不对 | 兜底 |
| 包含非法字符 | 段内字符白名单外 |
| 片段符不要连用 | `??` `##` `?#` `#?` |
| 不要用多个? | 整条路径多个 `?` |
| 不要用多个# | 整条路径多个 `#` |
| 问号要在#前 | `#` 出现在首个 `?` 之前 |

异步「路径已存在」留在页面层组合 validator，本风格只提供语法规则工厂。

## formRules.ts 分层与导出面（v3）

| 分区 | 内容 | 对外 export |
|------|------|-------------|
| §1 常量与类型 | 分段 regex、`PATH_SCHEME_RE`、`PATH_MAX_LENGTH` | `PATH_MAX_LENGTH`（`routePath` / `apiPath`）等 |
| §2 工具函数 | 非校验器纯函数 | `trimFieldOnBlur`、`normName`、`asRuleArray` 等 |
| §3 规则工厂 | `chkPath*` / `chkSeg*`、聚合 `validate*`、`wrapPathSyntaxValidator` | **不 export** 原子/聚合；页面用 `createRoutePathRules` / `createApiPathRules` |
| §4 预定义规则集 | `createRoutePathRules`、`createApiPathRules` | `FormItemRule[]` 工厂 |

单测经 `createRoutePathRules()[0].validator` / `createApiPathRules()[0].validator`，不直接 import `validate*`。
