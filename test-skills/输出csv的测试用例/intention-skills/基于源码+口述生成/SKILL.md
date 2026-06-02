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
| `domain` | **必须追问** | 领域标识（role/menu/tenant/user/e2e/login/required），见 `domain-template-map.md` |
| `date` | 追问或当天 MMDD | 如 `0601`，决定输出目录 `docs/问题单/{date}/` |
| 业务场景描述 | 用户口述 | 或源码阅读结论 |

> ⚠️ **不再使用 `outputPath`**：手工/口述用例追加到领域 CSV，位置由 `domain` + `date` 决定。
> `outputPath` 遗留在 config.json 中的记录仅供历史参考，新增用例不走它。

## Green 工作流

### 路径 A：口述场景（推荐）

1. **补全字段**：追问 `moduleId`、`模块名`、`domain`、`date`、`创建人员`（缺一则追问，不猜测）
2. **分类场景**：将口述碎片拆为独立用例，确保一条一个验证点
3. **用户可感知过滤**：逐条检查用例是否为**用户可感知行为**（用户看得见/感受得到的效果）。以下类型的用例**砍掉**：
   - 验证 sessionStorage / localStorage 缓存结构（用户不关心内部存了什么）
   - 验证 API 请求体格式或请求路径（用户不关心请求了哪个接口）
   - 验证内部函数调用链路或代码路径（用户不关心代码怎么跑的）
   - 步骤含 F12、DevTools、mock、内部函数名（如 `loadUserPermsMap`）

   > 用例数量不是目标，有多少**有价值提取的用户可感知场景**就写多少条。
4. **撰写 cases**：按 `[[../../references/ui-interaction-test-case-rules.md]]` 转写为 `cases.json`
5. **G2：Cases 预览**：展示 2 条样例 + 总条数，等待用户确认。用户说「跳过确认」可一次执行，须注明
6. **生成 CSV**（追加到领域级 CSV，不生成独立文件）：
   ```bash
   python scripts/append_ui_cases_to_csv.py \
     --domain {domain} \
     --date {date} \
     --cases configs/{moduleId}.cases.json \
     --overrides-json '{"模块名":"{模块名}","创建人员":"{创建人员}","子系统":"{子系统}"}'
   ```
   - `domain` 决定追加到 `docs/问题单/{date}/{domain}.csv`（如 `menu` → `menu.csv`）
   - `--overrides-json` 从 RED 字段提取：`模块名`、`创建人员`、`子系统`
   - **`模块名`应与 domain 模板既有行保持一致**。如 `domain=menu` 时模板行模块名为`菜单管理`，`domain=role` 时为`角色管理`——Agent 在追问后应确认此值而非随意填写
   - 如果 cases.json 内嵌了 `fieldDefaultsOverrides`，优先用它合并
   - 若 `{domain}.csv` 尚不存在，自动从 `docs/问题单/模板/{domain}.csv` 读表头后只写新用例行（**不复制模板中的遗留数据行**）
7. **质量自检**：`[[../../feature-skills/用例质量自检/SKILL.md]]`（path_type=ui）
8. **Darwin**：`[[../../feature-skills/darwin拓展发现/SKILL.md]]`

### 路径 B：源码阅读（进阶）

- 阅读 `src/views/**` 或 `src/components/**` 下的交互逻辑
- 提取弹窗状态、Tab 切换、表单校验、灰禁条件
- 转为 UI 交互 cases
- 后续步骤同路径 A 的 5-7（即走 `append_ui_cases_to_csv.py`，不走 `generate_test_csv.py`）

## Output

- `configs/{moduleId}.cases.json`（可改后重新生成）
- `docs/问题单/{date}/{domain}.csv`（追加到领域 CSV，不生成独立文件）

> **不生成** `config.json`——手工/口述用例走 `append_ui_cases_to_csv.py` 追加到领域 CSV，
> 不需要 `generate_test_csv.py` 所需的独立 outputPath 配置。

## Boundary

- **domain 必须显式确认**（不猜测）：列出可用 domain（role/menu/tenant/user/e2e/login/required）请用户选
- **不可猜测**字段：`moduleId`、`模块名`、`domain` 必须显式确认
- **禁止**：凭空捏造业务逻辑（如不确定的 API 行为）
- **用例数量**：不是固定目标数，有多少有价值的用户可感知场景就写多少条
- **跨领域场景**：如果一条 cases.json 覆盖多个 domain（如菜单+用户），分两次调用 `append_ui_cases_to_csv.py` 分别追加

## Example

```text
用户：「根据口述整理租户管理页面 UI 用例录入测试系统，没有 test 文件」
Agent：
  追问 → moduleId=tenant-ui, 模块名=租户管理, domain=tenant, date=0529, 创建人员=惠岩
  口述场景 → 拆分 3 条用例（列表加载/搜索过滤/分页）
  撰写 cases.json → 调用 append_ui_cases_to_csv.py → 追加到 docs/问题单/0529/tenant.csv
```
