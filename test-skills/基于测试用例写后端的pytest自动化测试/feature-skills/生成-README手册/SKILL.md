---
name: 生成-README手册
description: 运行 gen_readme.py 生成 Obsidian 兼容 README，含 H4-H6、实现位置行号与 automation_doc 嵌入。
---

# Feature：生成 README 手册

## 触发

- registry / marker / CSV 更新后
- `策略-仅生成README`
- MVP 或批量补测完成后的文档交付
- 新增或更新 `docs/automation/{case_id}.md`

## 必读

- [[../../references/readme-format-rules.md]]
- [[../../references/implementation-location-spec.md]]
- [[../../references/csv-hytests-workflow.md]] §gen_readme 契约
- [[../../references/case-report-terminal-spec.md]] §日志查看

## 执行

```bash
cd {targetRepo}/hytests
python scripts/gen_readme.py
```

黄金实现路径：`seccenter/hytests/scripts/gen_readme.py`（含 `load_automation_doc`）

## 生成器输入

| 源 | 用途 |
|----|------|
| CSV | 用例名称、步骤、前置、预期（预留字段1） |
| cases_registry.yaml | status、pytest、refs、note、**automation_doc** |
| test_*.py 扫描 | marker/def/class 行号 |
| docs/automation/{id}.md | 自动化节展开（Mermaid、断言表、日志说明） |

## registry：automation_doc

```yaml
- case_id: "9909"
  status: implemented
  pytest: test_mvp_menu_9909_9913.py::...
  automation_doc: docs/automation/9909.md
```

`gen_readme` 在「###### 运行命令」之后嵌入该文件内容。若未配置 registry 字段，则 fallback 读取 `docs/automation/{case_id}.md`（若存在）。

## docs/automation/{case_id}.md 结构

| H6 子节 | 内容 |
|---------|------|
| 测试数据（Arrange） | Mermaid flowchart + 造数表 |
| 执行流程（Act） | Mermaid sequenceDiagram |
| 断言清单（Assert） | 序号 / 代码意图 / CSV 预期 对照表 |
| 树签名或关键格式 | 可选 |
| 失败时如何读报错 | 常见 AssertionError 解读 |
| 终端验证摘要（case_report） | latest.log 路径、Cursor 面板说明 |

**禁止** HTML 包裹 Mermaid；H6 标题顶格。

## 输出结构（每条用例）

1. `#### [id] 名称`
2. `##### 元信息`（表格）
3. `##### 测试步骤与预期`（###### 前置/步骤/预期，无 HTML）
4. `##### 自动化测试`
   - ###### 状态
   - ###### 实现位置
   - ###### 运行命令
   - **（嵌入 automation_doc 各 H6 节）**
   - ###### 官方参考（若有 refs）
5. `##### 手动测试`（###### curl 验证）

## 生成后抽查

| case_id 类型 | 检查 |
|--------------|------|
| implemented | 实现位置含 `#L`、pytest node、JSON 顶格高亮 |
| implemented + automation_doc | 含 Mermaid、断言清单表、latest.log 说明 |
| pending | 有「待办」，无实现位置表 |
| blocked | 有实现位置 + 说明 blocked |
| 含 refs | 官方参考表含 `../tests/...#L` |

## 格式样例

- `seccenter/hytests/README.format-demo.md`
- [[../../assets/few-shot-example/seccenter菜单9909-9913/README-snippet.md]]

## 禁止修改方向

- 不要手工编辑 600KB README 后放弃 gen_readme（下次覆盖丢失）
- 格式修复应改 **gen_readme.py** 或 references，再重生成
- 不要把运行时日志写进 README（日志在 `.test-reports/`）

## 输出

```text
readmeGenReport:
  path: hytests/README.md
  caseCount: 450
  sizeKB: 635
  spotCheckIds: [155, 9909, 9971]
  automationDocsEmbedded: [9909, ...]
  formatViolations: []
```

## 使用示例

```text
registry 更新 automation_doc 后重生成 README，抽查 [9909] 含 Mermaid 与断言清单表。
```
