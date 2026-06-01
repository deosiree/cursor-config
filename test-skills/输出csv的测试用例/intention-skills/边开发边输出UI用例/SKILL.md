---
name: 边开发边输出UI用例
description: 在开发过程中将 UI 交互结论沉淀为测试系统可导入的 CSV 用例。追加写入，不覆盖已有 API 行。
---

# 边开发边输出 UI 用例

## Task

将开发中验收的 UI 交互行为（如弹窗 Tab 校验、表单联动、权限灰禁）沉淀为测试系统 CSV 行，追加到已有问题单文件。

## Input（RED 最少字段）

| 字段 | 默认 | 说明 |
|------|------|------|
| `domain` | 从模块名/路径推断，否则追问 | 如 role/menu/tenant，对应 `domain-template-map.md` |
| `date` | 当天 MMDD | 输出目录 `docs/问题单/{date}/` |
| `cases` | — | 本轮新增用例列表（名称+前置条件+步骤+预期） |
| `创建人员` | 惠岩 | 可覆盖 |
| `模块名` | 从 domain 映射推断，可覆盖 | 如「角色管理」 |

## Output

- `output_path`：最终 CSV 路径
- `appended_count`：追加条数
- `is_new`：是否首次从模板复制
- 若模板不存在 → 报错 + 列出可用模板列表

## Boundary

- **模板不存在** → 不猜测文件名，列出 `docs/问题单/模板/` 下 CSV 请用户指定
- **功能集合强制留空** → 任何时候不写入该列
- **develop结果** → 默认等于预期结果
- **已有文件** → 不删行，仅追加
- **禁止**：写代码断言、Markdown 链接到步骤/预期

## 工作流（GREEN）

1. 按 `[[../../references/ui-interaction-test-case-rules.md]]` 撰写/校对 cases
2. **G2：Cases 预览**：展示 2 条样例 + 总条数，等待用户确认。用户说「跳过确认」可一次执行，须在回报中注明
3. 调用 `python scripts/append_ui_cases_to_csv.py --domain {domain} --date {date} --cases configs/{moduleId}.cases.json`
4. 回报：输出路径、追加条数、是否首次从模板复制

## Example

```text
用户说：「角色新增 Tab 校验失败要录入测试系统」
Agent 回应：
- 识别 domain=role, date=当天
- 撰写 4 条 UI 用例（空名跳转/合法提交/取消重置/Tab 阻断）
- 调用追加脚本
- 产出：docs/问题单/{MMDD}/role.csv（+4 行）
```

## 参考

- `[[../../references/ui-interaction-test-case-rules.md]]`
- `[[../../references/domain-template-map.md]]`
- `[[../../assets/few-shot-example/role-ui-tab-validation-csv.md]]`
