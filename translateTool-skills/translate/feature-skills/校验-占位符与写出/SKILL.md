---
name: 校验-占位符与写出
description: 当翻译批次完成后，需要核对占位符完整性、备注1与输出文件是否可交付时使用。
---

# 核心任务

验收翻译产物：占位符、列结构、输出路径，并汇总错误。

## 何时触发

- `执行-中译英` / `执行-英译俄` / `pipeline` 完成后

## 检查清单

1. 源列未改（zh2en：词条；en2ru：英文翻译；pipeline：词条保留）
2. 目标列已填（zh2en→英文；en2ru/pipeline→俄文；pipeline 还应有英文）
3. `%1/%2/{}` 等未拆写、未丢失（对比 `validateTranslation` / 备注1）
4. en2ru/pipeline：存在 `{原名}_RU机翻.csv` 或 `.xlsx`
5. 试跑通过率：含占位符条目校验失败率 = 0 才建议全量；总体 `errors.length === 0` 为优
6. 并发：日志可见 `[DAG波次]`；失败时应出现并发减半提示
7. **防错位**：完成后立刻调度 `[[../验证-译后防错位/SKILL.md]]`（历史毒行否证 + 拒写门禁）

### 试跑验收样例（qt通用语言 · limit 20）

```text
mode=en2ru
filled_ru=20
errors=0
output=..._RU机翻.xlsx
placeholder_spotcheck: '%1'/'%2' 留在俄文中
```

判定：`acceptanceReport.pass = true` → 可向用户请求全量确认（仍 🔴 CHECKPOINT）。

## 输出

- `acceptanceReport`：pass / fail、失败 id 列表、是否建议全量

## 失败处理

| 触发 | 一线 | 兜底 |
|------|------|------|
| 占位符失败率过高 | 调 prompt / 减小 batch | 人工改失败行后 `--force` 重跑 |
| 无输出文件 | 检查 outputDir 权限 | 换输出目录重跑 |

## 边界

- 不重新翻译整库；只验收与建议下一步。
