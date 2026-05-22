# 表单校验-规则工厂 formRules

跨项目可复用的 **Vue + Element Plus 表单校验** agent 套件：在集中式 `formRules`（或等价模块）中扩展规则工厂，并在目标表单组件上接入。

## 解决什么问题

- 校验逻辑散落在各页面，重复 `required` / `pattern` / 自定义 validator
- 名称、路径等字段需要统一语义（trim、提交规范化、分段 path）
- 新字段不知道应扩展现有工厂还是新建一种「规则风格」

## 职责边界

| 包含 | 不包含 |
|------|--------|
| `formRules.ts` 工厂与 validator | `zh_CN.json` / `en_US.json` 维护 |
| 页面 `:rules` / `@blur` / submit 规范化 | 批量 `$t` / i18n-server 迁移 |
| 单测矩阵 | 非表单业务逻辑 |

## Agent 结构

```text
SKILL.md（父级：定位 + 风格路由 + 验收）
├── feature-skills/盘点-推荐下一表单字段      ← 只读扫描，推进全仓覆盖
├── feature-skills/新增-规则工厂与通用校验
├── feature-skills/配置-多语言标识符命名规则
├── feature-skills/配置-路径类规则
├── feature-skills/接入-页面表单字段规则
└── feature-skills/编排-未知规则MVP与落地
```

**持续落地闭环**：`repoRoot`（+ 可选 `moduleHint`）→ 盘点推荐下一项 → 父 skill 实施 → 再盘点，直至 `formFieldCoverage.needsWork === 0`。

## 输入方式（无需填写仓库名）

- **推荐**：`componentPath: src/views/.../XxxForm.vue`
- **或**：`repoRoot` + `moduleHint`（由 agent 搜索组件，多命中时确认）

## 样本说明

`template/sample-nebula/` 与 `assets/few-shot-example/` 中的代码片段来自 nebula `apex_dev` 的一次实现，**仅作形态参考**；落地时以当前仓库的 `rulesModule` 与项目约定为准。

## 推荐顺序

不确定改哪一项时：先 **盘点-推荐下一表单字段** → 再读父级 `SKILL.md`（Step 1–5）→ **多字段**：按 `ruleStyle` 去重，阶段 A 扩展 rules 模块 → 阶段 B 页面接入 → 对照 few-shot / template → `vitest` + `eslint`。
