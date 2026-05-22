---
name: 新增-规则工厂与通用校验
description: 在 rules 模块新增或扩展 requiredRule、patternRule、createEmailRules 等通用 Element Plus 表单规则工厂。
---

# 新增-规则工厂与通用校验

父级：[`../../SKILL.md`](../../SKILL.md)。`ruleStyle=factoryGeneric`。

## 何时使用

- 需要 `required` + `pattern` / `min` 组合
- 邮箱、手机、密码、验证码、必选 ID 等**可参数化**规则集
- 与 `nameIdentifier` / `pathLike` **无关**的字段

## 何时不要使用

- 标识符命名黑白名单 → 配置-多语言标识符命名规则
- 分段 path → 配置-路径类规则
- 仅页面绑定已有 `createXxxRules` → 接入-页面表单字段规则

## RED

1. 确认 `rulesModule` 是否已有同类 `createXxxRules`（避免重复）
2. 确认 `messageStrategy`（见 [`project-discovery.md`](../../references/project-discovery.md)）
3. **禁止**把 locale 文件列入改动集

## GREEN

### 1. 基础工厂

```ts
export function requiredRule(message: string, triggerOrOptions?: string | RuleOptions): FormItemRule | FormItemRule[]
export function patternRule(pattern: RegExp, message: string, trigger?: string | string[]): FormItemRule
export function asRuleArray(rule: FormItemRule | FormItemRule[]): FormItemRule[]
```

### 2. 预定义规则集（按需新增）

| 工厂 | 典型语义 |
|------|----------|
| `createEmailRules` | 邮箱 pattern |
| `createEmailRequiredRules` | 必填 + 邮箱 |
| `createPhoneRules` / `createPhoneRequiredRules` | 手机 |
| `createPasswordRules` / `createPasswordWithMin6Rules` | 密码 |
| `createCaptchaRules` | 验证码 |
| `createConfirmPasswordRules(getPassword)` | 确认密码一致 |

常量：`EMAIL_PATTERN`、`PHONE_PATTERN`、`CAPTCHA_PATTERN` 与工厂同文件导出。

### 3. 消息

- 使用稳定中文 key 或直出文案（≤12 字）
- 若项目已有 `t("请输入正确的邮箱地址")`，新工厂沿用同一调用方式，**不**新增 locale 条目

### 4. 测试

- 在 `rulesModule` 同级 `__tests__` 增加用例：合法/非法各 1–2 条
- 断言 `error.message` 与预期 key/文案一致

## 参考

- few-shot：[`factory-generic-sample.md`](../../assets/few-shot-example/factory-generic-sample.md)
- template：[`template/sample-nebula/after/formRules.factory.fragment.ts`](../../template/sample-nebula/after/formRules.factory.fragment.ts)

## 验收

- [ ] 新工厂可被 tree-shaking 按需 import
- [ ] 未修改 locale 文件
- [ ] 单测 + `eslint` 通过
