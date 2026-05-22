# 规则风格注册表

一种稳定、可复用的校验语义 = 一个 `ruleStyle` + 一个 feature-skill（或子文档）。

## 已注册风格

| ruleStyle | 典型字段 | feature-skill | 核心 API 形态 |
|-----------|----------|---------------|----------------|
| `factoryGeneric` | 邮箱、手机、密码、验证码、必选下拉 | 新增-规则工厂与通用校验 | `requiredRule`、`patternRule`、`createXxxRules` |
| `nameIdentifier` | 用户名、租户名、角色名、菜单名、权限名 | 配置-多语言标识符命名规则 | `createNameValidator`、`normName`、`trimNameOnBlur` |
| `pathLike` | 路由 path、redirect path | 配置-路径类规则 | `validateXxxPathSyntax`、`createXxxPathRules`、`trimXxxOnBlur` |
| `pageWireOnly` | 任意已有工厂字段 | 接入-页面表单字段规则 | `:rules`、`@blur`、submit 规范化 |
| `unknown` | 未登记语义 | 编排-未知规则MVP与落地 | MVP validator → 评估是否升级为新风格 |

## 新增风格 checklist

1. 在本文档增加一行 `ruleStyle` 与判定信号
2. 新建 `feature-skills/配置-<风格名>规则/SKILL.md`（或 `新增-` 前缀若偏工厂）
3. 父 `SKILL.md` 路由表增一行
4. 增加 `references/<风格>-model.md`（分段/状态机/消息表）
5. 增加 `assets/few-shot-example/<风格>-sample.md`（代码片段即可，不写版本号）
6. 可选：`template/sample-nebula/` 片段

**禁止**把新风格长期堆在「未知」分支。
