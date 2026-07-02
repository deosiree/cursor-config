# README 格式规范（Obsidian 兼容）

## 两条硬性规则

1. **禁止 HTML 标签**（`<details>` / `<summary>` 等）包裹内容 — Obsidian 在 HTML 块内 **不渲染** fenced code block。
2. **禁止**把步骤/预期放进 ` ```text ` 代码块 — Markdown 列表、加粗、链接会全部失效。

## 文档层级

| 层级 | 语法 | 用途 |
|------|------|------|
| H2 | `##` | 子系统（CSV「模块名」） |
| H3 | `###` | 功能集合 |
| H4 | `####` | 单条用例 `[序号] 名称` |
| H5 | `#####` | 元信息 / 测试步骤 / 自动化 / 手动 |
| H6 | `######` | 前置条件 / 操作步骤 / 预期 / curl / 实现位置 |

450+ 条用例靠 **大纲 H6 导航**，不靠折叠。

## 单条用例结构（正确）

```markdown
#### [156] 创建子菜单成功

##### 元信息

| 字段 | 值 |
|------|-----|
| 等级 | P0 |
| 涉及 API | `/seccenter/v2/menu/create` |

##### 测试步骤与预期

###### 前置条件

- 已存在顶级菜单 A

###### 操作步骤

1. 调用 `POST /seccenter/v2/menu/create`
2. 请求体如下：

```json
{
  "name": "M2",
  "type": "menu",
  "parent_id": "<A.id>",
  "project_id": "999"
}
```

###### 预期结果

- 创建成功
- `project_id` 继承 A 的 project_id

##### 自动化测试

###### 状态

已实现

###### 实现位置

| 项 | 值 |
|----|-----|
| 相对路径 | `hytests/test_mvp_menu_9909_9913.py` |
| 测试函数 | [`L26`](test_mvp_menu_9909_9913.py#L26) `test_csv_9909_...` |

###### 运行命令

```bash
cd seccenter/hytests
pytest test_mvp_menu_9909_9913.py -k 156 -v
```

###### 测试数据（Arrange） / 执行流程（Act） / 断言清单（Assert）

当 `cases_registry.yaml` 含 `automation_doc` 或存在 `docs/automation/{case_id}.md` 时，`gen_readme.py` 在运行命令之后嵌入以下内容（H6 顶格）：

- Mermaid 图（flowchart / sequenceDiagram）— **禁止** HTML 包裹
- 断言清单表（代码意图 ↔ CSV 预期）
- 终端验证摘要（`latest.log` 路径说明）

详见 [[case-report-terminal-spec.md]]、[[../assets/few-shot-example/seccenter菜单9909-9913/README-snippet.md]]。

##### 手动测试

###### curl 验证

```bash
export BASE="http://YOUR_GATEWAY:8000"
curl -b cookies.txt -X POST "$BASE/seccenter/v2/menu/create" ...
```
```

## POST 步骤解析规则（gen_readme）

CSV 中形如：

```text
POST /menu/create；数据：{"name":"M2",...}
```

应生成为：

1. `1. 调用 \`/seccenter/v2/menu/create\``
2. `2. 请求体如下：`
3. 顶格 ` ```json ` 块（**不缩进**在列表项内）

多行编号步骤（如 9909）保留 CSV 原序号。

## 预期结果来源

优先级：

1. CSV `预留字段1`
2. CSV `预期结果`
3. 步骤行内 `4. 预期结果：...`（提取后从步骤中移除）

## 错误 vs 正确

### 错误 1：HTML + 内部代码块

````markdown
<details><summary>测试步骤</summary>

```json
{"name": "M2"}
```

</details>
````

→ Obsidian 显示纯文本，无高亮。

### 错误 2：text 代码块

````markdown
```text
POST /menu/create；数据：{...}
```
````

→ 大纲无子结构，格式全失效。

### 正确

- 纯 Markdown 标题 H5/H6
- 仅 JSON / bash 用 fenced code
- 代码块 **顶格**（column 0）

## 样例文件

- `seccenter/hytests/README.format-demo.md`
- [[../assets/few-shot-example/seccenter菜单9909-9913/README-snippet.md]]
