---
name: 沉淀模块配置
description: 从参考 CSV 或自然语言固定默认值，生成模块 config.json，供 generate_test_csv.py 复用。
---

# 沉淀模块配置

## 何时触发

- 新模块第一次接入本 skill，尚无 `{module}.config.json`
- 用户口述「子系统 8、模块名租户管理、创建人员惠岩」等固定列
- 用户提供参考 CSV（模板或已有用例表），需推断 `fieldDefaults`

## 输入契约

- `moduleId`：如 `tenant-unit`
- **二选一或组合**：
  - `referenceCsvPath`：参考 CSV（常用 `docs/问题单/模板/*.csv`）
  - `naturalLanguageDefaults`：自然语言描述的固定列
- 可选：`outputPath`、`casesFile` 路径

## GREEN 工作流

### 路径 A：参考 CSV（脚本）

```bash
python scripts/csv_to_test_config.py \
  --reference-csv <repo>/docs/问题单/模板/menu.csv \
  --module-id <moduleId> \
  --output-config configs/<moduleId>.config.json \
  --overrides-json '{"模块名":"租户管理","创建人员":"惠岩","子系统":"8"}'
```

脚本会：

- 读取表头
- 对非用例列统计众数 → `fieldDefaults`
- `用例ID`、`功能集合` 等强制留空

### 路径 B：自然语言（Agent 撰写）

从用户口述解析并写入 `fieldDefaults`，对齐 `[[../../references/csv-field-convention.md]]`：

| 口述示例 | 字段 |
|---------|------|
| 标签 1 | 标签 |
| 执行方式 4 | 执行方式 |
| 创建人员惠岩 | 创建人员 |
| 子系统 8 | 子系统 |
| 模块名菜单管理 | 模块名 |
| develop 填 0 | develop结果 |

合并路径 A 的推断结果与路径 B 的覆盖，写出完整 `configs/{moduleId}.config.json`。

### config 必备字段

见 `[[../../references/config-json-schema.md]]`。`casesFile` 可先指向空 cases 占位，待 `基于test.ts生成` 填充。

## 输出契约

- `configs/{moduleId}.config.json`
- `inferredFromCsv`：哪些列来自众数推断
- `overriddenByNl`：哪些列来自自然语言覆盖
- 提示下一步：撰写 cases 或运行 `generate_test_csv.py`

## 换模块复用

1. 本 skill → `tenant-unit.config.json`
2. `基于test.ts生成` → `tenant-unit.cases.json`
3. `generate_test_csv.py` → 无需新 Python 生成脚本
