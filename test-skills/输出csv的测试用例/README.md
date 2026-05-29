# 输出 CSV 测试用例

Agent skill 套件：将 Vitest `test.ts` 与模块配置沉淀为测试系统可导入 CSV。

## 目录

| 路径 | 说明 |
|------|------|
| `SKILL.md` | Agent 主入口 |
| `scripts/generate_test_csv.py` | 通用：config + cases → CSV |
| `scripts/csv_to_test_config.py` | 参考 CSV → config.json |
| `scripts/bootstrap_menu_cases.py` | 从 `docs/问题单/0529/generate_menu_unit_csv.py` 迁移 cases |
| `configs/` | 模块 config / cases |
| `intention-skills/` | 基于test.ts生成、沉淀模块配置 |
| `feature-skills/` | api/gateway 撰写、darwin拓展发现 |

## 快速开始（菜单样本）

```bash
cd .cursor/test-skills/输出csv的测试用例
python scripts/generate_test_csv.py --config configs/menu-unit-gateway.config.json
```

输出：`docs/问题单/0529/menu-unit-gateway.csv`（若文件被占用，可用 `--output template/menu-unit-gateway/sample-output.csv`）

## 新模块三步

1. `沉淀模块配置` → `configs/tenant-unit.config.json`
2. `基于test.ts生成` → `configs/tenant-unit.cases.json`
3. `generate_test_csv.py` → CSV

## 与 nebula-skills 关系

- 本目录：`.cursor/test-skills`（测试用例产出）
- 业务 skill：`.cursor/nebula-skills`
- 由触发词区分，不重复存放

## 历史样本

- `docs/问题单/0529/generate_menu_unit_csv.py`：会话期单文件脚本，已由本套件 `configs/` + `scripts/` 取代

## 自然语言怎么用（必读）

在 agent 对话里直接说需求即可，不必记命令。Agent 会读本目录 `SKILL.md` 并路由到对应子 skill。

### 怎么触发本 skill

在消息里带上下面任一说法（中英文均可）：

- 「用 **输出 csv 测试用例** skill …」
- 「把 test.ts **整理成测试系统 CSV** / **录入测试系统**」
- 「**test.ts 转 CSV**，正向反向写在预期结果」
- 「**沉淀模块配置**，生成 config.json」

未点名 skill 时，只要语义是「单元测试 → 可导入 CSV 用例」，也会匹配本套件。

### 你要准备什么（一句话清单）

| 你想做的事 | 建议在对话里说明 |
|-----------|------------------|
| 从 test 文件生成用例 | 仓库路径（如 `apex_dev`）、`*.test.ts` 路径或 glob |
| 新模块第一次接入 | **模块 ID**、**模块名**、**输出 CSV 路径**、**固定默认值**（见下表） |
| 已有 config/cases，只要 CSV | `config` 路径，或说「用 menu-unit-gateway 配置生成」 |
| 参考旧 CSV 推断默认值 | 参考文件路径，如 `docs/问题单/模板/tenant.csv` |

### 新模块：自然语言里建议写清的字段

**模块标识（moduleId）** — 用于文件名，建议英文短横线，例如：

- `tenant-unit`、`role-unit`、`menu-unit-gateway`

**输出目录 / 输出文件（outputPath）** — 相对 nebula 仓库根，例如：

- `docs/问题单/0529/tenant-unit.csv`
- `docs/问题单/模板/` 下仅作表头参考时用 `docs/问题单/模板/tenant.csv`

**固定默认值（写入 config 的 fieldDefaults）** — 可直接口述，例如：

| 口述示例 | 写入 CSV 列 |
|---------|------------|
| 子系统是 8 | 子系统 → `8` |
| 模块名是租户管理 | 模块名 → `租户管理` |
| 创建人员惠岩 | 创建人员 → `惠岩` |
| 标签 1、执行方式 4、最新结果 0 | 标签 / 执行方式 / 最新结果 |
| 用例等级 0、用例类型 0、develop 填 0 | 用例等级 / 用例类型 / develop结果 |
| 用例 ID 和功能集合留空 | 用例ID、功能集合 → 空 |

未提到的列：有参考 CSV 时由脚本按众数推断；无参考时 Agent 按 `references/csv-field-convention.md` 补全。

---

## 使用示例（复制改字即可）

### 示例 1：菜单模块 — test.ts 一条龙（最常用）

```text
用「输出 csv 测试用例」skill：
仓库 apex_dev，把菜单相关 test.ts 整理成可导入测试系统的 CSV。
test 文件在 src/gateway/__tests__/menu*.test.ts 和 src/api/__tests__/menu*.test.ts。
模块 ID：menu-unit-gateway
模块名：菜单管理
输出到：docs/问题单/0529/menu-unit-gateway.csv
表头参考：docs/问题单/模板/menu.csv
固定默认值：子系统 8，创建人员惠岩，标签 1，执行方式 4，最新结果 0，
用例等级 0，用例类型 0，develop结果 0；用例ID、功能集合留空。
预期结果用「正向：」「反向：」，名称不要加正反向前缀。
```

Agent 预期产出：`configs/menu-unit-gateway.config.json`、`configs/menu-unit-gateway.cases.json`、最终 CSV。

---

### 示例 2：新模块 — 只先要 config（有参考 CSV + 口述默认值）

```text
用「输出 csv 测试用例」skill 沉淀模块配置：
新模块 ID：tenant-unit
参考 CSV：docs/问题单/模板/tenant.csv（只要表头和列默认值推断）
输出 CSV 路径：docs/问题单/0529/tenant-unit.csv
口述覆盖：模块名「租户管理」，子系统 8，创建人员惠岩，
标签 1，执行方式 4，develop结果 0，用例ID 和功能集合留空。
先写 configs/tenant-unit.config.json，cases 还没有。
```

---

### 示例 3：新模块 — 只口述默认值（无参考 CSV）

```text
用「输出 csv 测试用例」skill 为新模块写 config：
模块 ID：role-unit
模块名：角色管理
输出文件：docs/问题单/0529/role-unit.csv
表头与菜单相同：docs/问题单/模板/menu.csv
固定列：标签 1，执行方式 4，最新结果 0，创建人员 张三，
子系统 8，用例等级 0，用例类型 0，develop结果 0；
用例ID、功能集合、创建时间留空。
```

---

### 示例 4：config 和 cases 已有 — 只要生成 CSV

```text
用「输出 csv 测试用例」skill，根据
configs/tenant-unit.config.json
生成 CSV，不要改 cases。
```

本地也可自己执行：

```bash
cd .cursor/test-skills/输出csv的测试用例
python scripts/generate_test_csv.py --config configs/tenant-unit.config.json
```

指定输出到别的路径（例如文件被占用时）：

```bash
python scripts/generate_test_csv.py \
  --config configs/tenant-unit.config.json \
  --output docs/问题单/0529/tenant-unit-draft.csv
```

---

### 示例 5：只有 test.ts，模块信息一句带过

```text
整理 apex_dev 里 src/gateway/__tests__/tenant.gateway.test.ts，
输出 csv 测试用例，模块名租户管理，创建人员惠岩，
输出到 docs/问题单/0529/tenant-gateway.csv，子系统 8。
```

Agent 会补全未说的固定列，并走 gateway feature 撰写步骤与预期。

---

### 示例 6：目前不支持、会提示拓展（口述 UI 无 test）

```text
根据口述整理租户管理页面 UI 用例录入测试系统，没有 test 文件。
```

Agent 应暂停并走 `darwin拓展发现`，建议后续沉淀 `基于源码+口述生成` intention-skill。

---

## 对话 → 产物对照

```text
你的自然语言                    →  Agent / 脚本 产物
─────────────────────────────────────────────────────────
模块 ID + 输出路径 + 固定默认值   →  configs/{moduleId}.config.json
test.ts 路径 + 撰写规则          →  configs/{moduleId}.cases.json
「生成 CSV」                     →  {outputPath} 下的 .csv 文件
```

推荐顺序：**先 config → 再 cases（来自 test.ts）→ 最后 generate_test_csv.py**。
