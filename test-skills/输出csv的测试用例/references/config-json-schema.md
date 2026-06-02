# config.json / cases.json 说明

## 两个生成路径的适用场景

| 路径 | 脚本 | 产出 | 适用场景 |
|------|------|------|----------|
| **独立 CSV** | `generate_test_csv.py` | `docs/问题单/{MMDD}/{moduleId}.csv`（按模块命名） | API/网关 test.ts 自动生成、有 config.json 的模块 |
| **领域追加 CSV** | `append_ui_cases_to_csv.py` | `docs/问题单/{MMDD}/{domain}.csv`（按领域聚合） | 手工/口述 UI 用例、无 test.ts，追加到已有领域 CSV |

**选型规则**：
- 有 `*.test.ts` → `generate_test_csv.py`（独立 CSV，每个模块一个文件）
- 无 test.ts、仅口述/源码阅读 → `append_ui_cases_to_csv.py`（追加到领域 CSV）
- 已有 config.json + cases.json → 若来自 test.ts 用 `generate_test_csv.py`；若手工编写用 `append_ui_cases_to_csv.py`

---

## config.json

| 字段 | 必填 | 说明 |
|------|------|------|
| moduleId | 是 | 模块标识，如 `menu-unit-gateway` |
| repoRoot | 是 | 相对 skill 根，指向 nebula 仓库根，通常 `../../..` |
| csvTemplatePath | 是 | 相对 repoRoot，提供 CSV 表头 |
| outputPath | 是 | 相对 repoRoot，输出 CSV |
| casesFile | 是 | 相对 skill 根，用例 JSON |
| fieldDefaults | 是 | 除用例行外的列默认值 |

示例：`configs/_schema.config.example.json`

## cases.json

```json
{
  "moduleId": "menu-unit-gateway",
  "cases": [
    {
      "name": "用例标题",
      "precondition": "前置条件",
      "steps": "1. 步骤一\n2. 步骤二",
      "expected": "正向：...\n反向：...",
      "remark": "source.test.ts > it(\"...\")"
    }
  ]
}
```

## 生成命令

```bash
cd .cursor/test-skills/输出csv的测试用例
python scripts/generate_test_csv.py --config configs/<module>.config.json
```

## UI 追加模式（append_ui_cases_to_csv.py）

不依赖 `config.json`；用 `cases.json` + `--domain` + `--date` 追加到 `docs/问题单/{MMDD}/`。

```bash
python scripts/append_ui_cases_to_csv.py \
  --domain role \
  --date 0601 \
  --cases configs/role-ui-tab.cases.json
```

| 行为 | 说明 |
|------|------|
| 输出文件不存在 | 从 `docs/问题单/模板/{domain}.csv` **整表复制** 再追加 |
| 输出文件已存在 | 保留全部已有行，**仅末尾追加** |
| 功能集合 | 新增行强制留空 |
| develop结果 | 默认等于 **0**（未执行状态） |
| domain 映射 | 见 `references/domain-template-map.md` |

cases.json 可含 `fieldDefaultsOverrides`；也可用 `--overrides-json '{"创建人员":"惠岩"}'`。

## 逆向生成 config

```bash
python scripts/csv_to_test_config.py \
  --reference-csv ../../../docs/问题单/模板/menu.csv \
  --module-id <moduleId> \
  --output-config configs/<moduleId>.config.json
```

自然语言覆盖：`--overrides-json '{"模块名":"xx","创建人员":"xx"}'`（PowerShell 易失败 → 用 `--overrides-file`）

## 执行异常与回退

| 场景 | 处理 |
|------|------|
| 写 CSV PermissionError / 文件占用 | 提示关闭占用；临时输出 `template/{moduleId}/sample-output.csv` 验条数 |
| cases 缺失或为空 | 停止生成，回到 `基于test.ts生成` |
| repoRoot 无效 | 修正为 skill 根 `../../..` 或记入 `missingFacts` |
| `--overrides-json` 解析失败 | 改用 `--overrides-file` |
| 仅 expectTypeOf | 跳过 CSV，记入 `skippedTests` |

失败时勿覆盖用户已确认的 cases/config。
