---
name: 基于源码+口述生成
description: 无 test.ts 时，通过口述或阅读 views 源码撰写 v2 UI cases.json，并用 generate_feature_csv.py 导出整文件 CSV。
---

# UI 交互用例生成（口述 / 源码）

## Task

无 `*.test.ts` 时，将口述业务场景或 `src/views/**` 源码结论转为 **v2 功能集合** `cases.json`，再 `generate_feature_csv.py` 整文件导出。

> **v1 追加路径已退役**（`append_ui_cases_to_csv.py`）。一律走路径 C。

## 何时触发

- 「根据口述整理 XX 页面 UI 用例录入测试系统，没有 test 文件」
- 「对照源码补充 UI 用例，导出 0616」
- darwin 信号 `intention_oral`
- views/components 无法走 `基于test.ts生成`

## Input（RED 最少字段）

| 字段 | 来源 | 说明 |
|------|------|------|
| `domain` | **必须追问** | role/menu/tenant/user/dashboard/securityConfig/login…见 `domain-template-map.md` |
| `date` / `outputPath` | 追问或默认 | 如 `docs/问题单/0616/tenant.csv` |
| `模块名` / `子系统` | 模板首行或追问 | v2 从领域模板取 |
| `创建人员` | 追问或默认「惠岩」 | — |
| 业务场景 | 口述或源码阅读 | — |

## 工作流（路径 C）

1. **补全 RED 字段**（缺一则追问，不猜测）
2. **分类场景**：一条用例一个用户可感知验证点；砍掉 F12/mock/内部 API 验证类用例
3. **撰写 cases**：`[[../../feature-skills/撰写UI交互cases/SKILL.md]]` v2 字段（`featureSet`、`direction`、`expected` 必填）
4. **G2 Cases 预览**：展示 2 条样例 + 总条数
5. **生成 CSV**（默认**增量导入**：测试系统不能更新时只导新用例）：
   ```bash
   python scripts/generate_feature_csv.py \
     --cases configs/{domain}.cases.json \
     --template ../../../docs/问题单/模板/{domain}.csv \
     --output ../../../docs/问题单/{date}/{domain}.csv \
     --only-new-from ../../../docs/问题单/{date}_v1/{domain}.csv \
     --force
   ```
   批量 → `regenerate_module_exports.py --only-new-from-dir docs/问题单/{date}_v1 --force`
6. **G4 质量自检**：`用例质量自检`（`path_type=ui-v2`）
7. **Darwin**：`darwin拓展发现`

若涉及 `testcases_export` 筛选迁移，优先 `[[../legacy-export迁移重组/SKILL.md]]`。

## Output

- `configs/{domain}.cases.json`
- `docs/问题单/{date}/{domain}.csv`（整文件覆盖；格式见 `csv-export-format-rules.md`）

## Boundary

- **domain 必须显式确认**
- **禁止**捏造 API 行为；用例须用户可感知
- **禁止**使用 `append_ui_cases_to_csv.py`（v1 已退役）

## Example

```text
用户：「租户三种激活方式各补一条用例，导出 0616，只导未导入的新增」
Agent：
  改 configs/tenant.cases.json → generate_feature_csv.py \
    --only-new-from ../../../docs/问题单/0616_v1/tenant.csv --force
```
