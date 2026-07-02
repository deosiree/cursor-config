# 基于测试用例写后端 pytest 自动化测试

← [[SKILL.md]] · 并列 skill：[[../输出csv的测试用例/SKILL.md]] · [[../写pytest集成测试/SKILL.md]]

从 **CSV 自测单** 驱动 `hytests/` pytest + **Obsidian 兼容 README**（含实现位置行号）。

黄金样本：`F:\Documents\Repertory\Sieyuan\nebula\seccenter\hytests`

---

## 自然语言怎么用（必读）

```text
使用 $基于测试用例写后端的pytest自动化测试：
- targetRepo: nebula/seccenter
- csvPath: docs/自测单/用例导出_云平台_安全平台___内测人：惠岩_20260702_131438.csv
- hytestsDir: seccenter/hytests
- caseIds: 9909-9913
- deliverables: all
- 需求: 参照 test_mvp_menu_9909_9913.py 写 MVP，更新 cases_registry.yaml，重生成 README；implemented 须 case_report + latest.log
```

### 字段对照

| 字段 | 含义 | 示例 |
|------|------|------|
| `targetRepo` | 仓库根 | `nebula/seccenter` |
| `csvPath` | CSV 自测单 | `docs/自测单/用例导出_*.csv` |
| `hytestsDir` | 自动化目录 | `seccenter/hytests` |
| `caseIds` | 用例 ID 范围 | `9909-9913` / `9919,9920` |
| `deliverables` | `pytest` / `registry` / `readme` / `all` | `all` |

---

## 三 skill 流水线

| 阶段 | Skill | 产物 |
|------|-------|------|
| 1 | [[../输出csv的测试用例/SKILL.md]] | `docs/自测单/*.csv` |
| 2 | **本 skill** | `hytests/test_*.py` + `cases_registry.yaml` + `README.md` |
| 3 | [[../写pytest集成测试/SKILL.md]] | `tests/test_*.py`（可作 `refs` 官方参考） |

---

## 目录结构（本 skill）

```
基于测试用例写后端的pytest自动化测试/
├── SKILL.md
├── README.md
├── references/           # 规范与契约
├── intention-skills/     # 分析 / MVP / 批量 / 仅 README
├── feature-skills/       # csv_case / case_report / registry / gen_readme / 覆盖率 / Darwin
├── assets/few-shot-example/seccenter菜单9909-9913/
├── template/hytests-MVP骨架/
├── template/case-report用例骨架/
└── evals/
```

---

## 脚本速查（在 targetRepo/hytests 执行）

```bash
cd seccenter/hytests
pip install -r requirements.txt
copy .env.local.example .env.local   # Gateway + 账号

# 跑已标记 CSV 的用例
pytest -m csv_case -v

# 跑单条（按 node 或 -k ID）
pytest test_mvp_menu_9909_9913.py::TestCsvMenuMvp9909_9913::test_csv_9909_export_project_menus_yaml -v
pytest -k 9909 -v

# 覆盖率：CSV ↔ registry ↔ marker
python scripts/csv_coverage.py

# 重生成 README（CSV + registry + 扫描 marker）
python scripts/gen_readme.py
```

生成器黄金实现：`seccenter/hytests/scripts/gen_readme.py`（本 skill 不复制整文件，见 [[references/csv-hytests-workflow.md]]）。

格式样例：`seccenter/hytests/README.format-demo.md`

---

## 可观测性（implemented 强制）

| 能力 | 说明 |
|------|------|
| `case_report` | CSV 步骤/预期对照 + YAML 预览 |
| `latest.log` | `hytests/.test-reports/latest.log` |
| 中文终端 | `plugins/pytest_zh_terminal.py` |
| `automation_doc` | `docs/automation/{id}.md` → README 嵌入 |

详见 [[references/case-report-terminal-spec.md]]、[[feature-skills/接入-用例验证摘要与中文终端/SKILL.md]]。  
Cursor 跑通后若只见「测试摘要」，**打开 latest.log** 看完整验证结果。

---

## 使用示例

**MVP 批次（菜单 9909–9913）**

```text
为 CSV 9909-9913 新建 test_mvp_menu_9909_9913.py，每条 @pytest.mark.csv_case，
更新 cases_registry status=implemented，refs 指向 tests/test_04_menu.py，最后 gen_readme。
```

**批量补鉴权**

```text
caseIds: 9919-9924，追加到 test_csv_auth.py / test_csv_whitelist.py 风格，
registry + README 一并更新。
```

**仅文档**

```text
deliverables: readme
确认 gen_readme.py 无 HTML details，重生成 README，抽查 [9909] JSON 块可高亮。
```

**blocked gRPC**

```text
caseIds: 9971-9976，写 @pytest.mark.blocked + pytest.skip，status=blocked，
README 仍要有实现位置行号。
```
