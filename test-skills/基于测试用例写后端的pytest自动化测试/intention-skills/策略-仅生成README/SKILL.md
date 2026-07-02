---
name: 策略-仅生成README
description: 不改 pytest，只修复 gen_readme 格式或重生成 README.md。
---

# 策略：仅生成 README

## 何时触发

- `deliverables: readme`
- 用户反馈 Obsidian 代码块不渲染 / 大纲缺失
- pytest 与 registry 已就绪，手册过时

## 执行步骤

1. 读 [[../../references/readme-format-rules.md]] 核对禁止项
2. 检查 `scripts/gen_readme.py` 是否含 HTML `<details>` 或 ` ```text ` 步骤包裹
3. 确认 CSV_PATH、registry 路径正确
4. → [[../../feature-skills/生成-README手册/SKILL.md]] 执行生成
5. 抽查 3 条：pending（无实现位置）、implemented（有 #L 链接）、blocked
6. → [[../../feature-skills/质量-覆盖率自检/SKILL.md]] 的 README 格式项

## 常见修复

| 问题 | 修复 |
|------|------|
| JSON 不渲染 | 去掉 `<details>` 包裹 |
| 步骤无列表 | 不用 ` ```text `，改 H6 + 列表 |
| 实现位置缺失 | 确认 marker 存在后重跑 gen_readme |
| 行号不准 | 改 pytest 后必须重跑 gen_readme |

## 输出

- `README.md` 更新确认（大小、case 条数）
- 抽查 case_id 列表与截图/描述

## 使用示例

```text
deliverables: readme — 重跑 gen_readme，确保 [9909] JSON 高亮、实现位置含 L25/L26。
```
