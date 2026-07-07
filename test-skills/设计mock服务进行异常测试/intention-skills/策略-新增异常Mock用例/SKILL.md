---
name: 策略-新增异常Mock用例
description: 编排从 CSV 到 mock 端点、registry、用例 README、场景 JSON 与手工自测门禁的完整交付。
---

# 策略：新增异常 Mock 用例

## 何时触发

- 分析表已就绪，需落地 mock + 文档
- 用户要求为 CSV 中异常 UI 用例写 mock 自测

## 执行步骤（顺序）

1. → [[../分析-CSV异常用例/SKILL.md]]（若尚无分析表）
2. 确认 `.gitignore` 含 [[../../references/gitignore与本地产物约定.md]] 条目
3. → [[../../feature-skills/维护-error-scenario/SKILL.md]] 注册新 `active` 值
4. → [[../../feature-skills/撰写-mock端点/SKILL.md]] 追加 mock 分支
5. → [[../../feature-skills/撰写-cases_registry条目/SKILL.md]]
6. → [[../../feature-skills/撰写-用例README/SKILL.md]] 每 case 一个 `automation/{id}.md`
7. 更新 `mock/README.md` 用例表一行（不扩写 workflow）
8. 若 `hytests/docs/workflow.md` 不存在，从 [[../../references/手工自测流程-8081注入权限.md]] 生成
9. → [[../../feature-skills/质量-手工自测门禁/SKILL.md]]
10. 若 `allowDarwin` → [[../../feature-skills/darwin质量评估与迭代/SKILL.md]]

## perm_status: pending_human

- mock + curl 步骤可交付
- 浏览器步骤在 README 标 **blocked**
- 等人类确认权限后再改 registry / README

## 输出

- `mock/csv-error*.mock.ts` 增量
- `.mock-shared/error-scenario.json` 注释或文档更新
- `hytests/cases_registry.yaml` 增量
- `hytests/docs/automation/{id}.md` × N
- `mock/README.md` 索引更新

## 使用示例

```text
targetRepoProfile=apex_dev，csvPath=异常处理_已筛选.csv，为全部行写 mock 与自测 README。
```
