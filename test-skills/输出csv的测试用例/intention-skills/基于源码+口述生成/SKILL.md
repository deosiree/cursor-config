---
name: 基于源码+口述生成
description: 无 test.ts 时，通过口述业务场景或阅读源码直接撰写 cases.json 并生成 CSV。
---

# 基于源码+口述生成测试用例

## Task

当用户没有 `*.test.ts` 文件，仅凭口述业务场景或前端源码（views/components）来撰写测试用例并生成 CSV。

## 何时触发

- 用户说「根据口述整理 XX 页面 UI 用例录入测试系统，没有 test 文件」
- 用户说「这个弹窗的交互逻辑写一下用例」
- darwin 信号 `intention_oral` 路由至此
- views/components 路径无法走 `基于test.ts生成`

## Input（RED 最少字段）

| 字段 | 来源 | 说明 |
|------|------|------|
| `moduleId` | 追问或推断 | 如 `role-ui-tab` |
| `模块名` | 追问 | 如「角色管理」 |
| `子系统` | 追问或默认 8 | — |
| `创建人员` | 追问或默认「惠岩」 | — |
| `outputPath` | 追问 | 如 `docs/问题单/{MMDD}/role.csv` |
| 业务场景描述 | 用户口述 | 或源码阅读结论 |

## Green 工作流

### 路径 A：口述场景（推荐）

1. **补全字段**：追问 `moduleId`、`模块名`、`outputPath`、`创建人员`（缺一则追问，不猜测）
2. **分类场景**：将口述碎片拆为独立用例，确保一条一个验证点
3. **撰写 cases**：按 `[[../../references/ui-interaction-test-case-rules.md]]` 转写为 `cases.json`
4. **G2：Cases 预览**：展示 2 条样例 + 总条数，等待用户确认。用户说「跳过确认」可一次执行，须注明
5. **走沉淀模块配置**：若有模板参考，先生成 `config.json`：
   ```bash
   python scripts/csv_to_test_config.py --reference-csv ... --module-id ... --output-config ...
   ```
6. **生成 CSV**：
   ```bash
   python scripts/generate_test_csv.py --config configs/{moduleId}.config.json
   ```
7. **质量自检**：`[[../../feature-skills/用例质量自检/SKILL.md]]`（path_type=ui）
8. **Darwin**：`[[../../feature-skills/darwin拓展发现/SKILL.md]]`

### 路径 B：源码阅读（进阶）

- 阅读 `src/views/**` 或 `src/components/**` 下的交互逻辑
- 提取弹窗状态、Tab 切换、表单校验、灰禁条件
- 转为 UI 交互 cases
- 后续步骤同路径 A 的 5-8

## Output

- `configs/{moduleId}.config.json`（若有模板参考）
- `configs/{moduleId}.cases.json`
- `{outputPath}` CSV

## Boundary

- **无模板参考** → 用 `template/menu.csv` 表头 + 口述 fieldDefaults
- **不可猜测**字段：`moduleId`、`模块名`、`outputPath` 必须显式确认
- **禁止**：凭空捏造业务逻辑（如不确定的 API 行为）

## Example

```text
用户：「根据口述整理租户管理页面 UI 用例录入测试系统，没有 test 文件」
Agent：
  追问 → moduleId=tenant-ui, 模块名=租户管理, outputPath=docs/问题单/0529/tenant-ui.csv
  口述场景 → 拆分 3 条用例（列表加载/搜索过滤/分页）
  撰写 cases.json → 走 config 生成 → 输出 CSV
```
