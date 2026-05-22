---
name: 编排-未知规则MVP与落地
description: 未命中已注册 ruleStyle 时：Web 调研 → Plan → template/mvp 最小实现 → 评估是否升级为新 feature。
---

# 编排-未知规则MVP与落地

父级：[`../../SKILL.md`](../../SKILL.md)。`ruleStyle=unknown` 或父路由未命中。

## 流程

```text
记录约束 → Web 调研 → 输出 Plan（用户确认）→ MVP 代码 → 单测 → 评估是否新风格
```

## RED

记录：

- `componentPath` / 字段 prop
- 用户规则描述（长度、字符集、跨字段关系）
- `messageStrategy`
- **明确不改 locale**（除非用户另行要求）

**绿场仓库**（尚无 `formRules.ts`）：仍走本 skill（`unknown`），**先 Plan 再建模块**；勿因「要加 pattern」直接走 `factoryGeneric` 跳过 Plan。

## Web 调研清单

按字段类型选读：

- Element Plus Form Validation
- Vue Router route matching（若像 path）
- RFC 3986 URI path（若像 URL/path）
- 项目内是否已有类似 validator

## Plan 模板（必须先 Plan）

```markdown
## 规则语义
## ruleStyle 建议（新建或归入已有）
## 改动文件（禁止默认含 locale）
## API 设计（函数名、导出）
## 消息 key 表（≤12 字）
## 测试矩阵
```

## GREEN：MVP

1. 从 [`template/mvp/validator-skeleton.ts`](../../template/mvp/validator-skeleton.ts) 拷贝骨架
2. 在 `rulesModule` 实现最小 `validateXxx` + `createXxxRules`
3. 页面接入走 **接入-页面表单字段规则**
4. 单测 3–5 条

## REFACTOR：是否升级

若可复用 → 按 [`扩展-新规则风格.md`](../../references/扩展-新规则风格.md) 登记并拆 feature。

## 验收

- [ ] 先 Plan 后改码
- [ ] Plan 文件清单无 locale
- [ ] MVP 有单测
