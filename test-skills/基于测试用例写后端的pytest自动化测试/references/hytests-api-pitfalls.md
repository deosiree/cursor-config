# hytests API 陷阱清单

> 黑盒 HTTP 集成测试中常见的「测试失败但业务正常」或「断言数据源不一致」问题。抽象为 checklist，适用于所有模块，不仅限于菜单。

## 使用方式

写断言或对比 DB 与导出结果前，先查本表；失败报错含 `DB=[]` 但 export 有数据时 **优先** 查第 1、2 节。

---

## 1. GetMenuTree 强制租户过滤

### 现象

- `POST /menu/project/export` 能导出菜单
- `POST /menu/tree` + `project_id` 返回 `tree: []`
- `tree_signature(DB)` 为空，YAML 签名有数据 → `Export tree mismatch DB=[] YAML=[...]`

### 原因

`GetMenuTree` Controller 会 **强制注入当前登录用户的 tenant_id**，再与 `tenant_projects` 关联表取交集。隔离测试项目（如 9998/9999）若未关联租户，`tree` 为空，但 export 仅按 `project_id` 查询仍有数据。

### 修复

| 场景 | 应用 API |
|------|----------|
| 按项目取菜单树（隔离项目） | `POST /menu/list` + `project_id` + `include_apis` |
| 用户侧菜单树（租户上下文） | `POST /menu/tree` |

hytests helper 约定：`get_menu_tree(session, project_id)` 内部调用 **`menu/list`**，勿用 `menu/tree` 验隔离项目。

### 自检

```bash
# list 应有数据，tree 可能为空
curl -b cookies.txt -X POST "$BASE/.../menu/list" -d '{"project_id":"9998"}'
curl -b cookies.txt -X POST "$BASE/.../menu/tree" -d '{"project_id":"9998"}'
```

---

## 2. import `menus: []` 不删除旧菜单

### 现象

- 多次跑测后导出 YAML 顶级菜单数暴增（如 14 个而非 2 个）
- `import_project(..., "menus: []")` 返回 `deletedCount: 0`

### 原因

后端 `ImportProjectMenuTree` 在 `len(export.Menus)==0` 时 **直接 return**，不执行全量替换删除。

### 修复

清空项目菜单采用 **export → 收集 id → 逆序 delete**（与官方 `tests/test_04_menu.py::_cleanup_isolated_project` 一致）：

```python
yaml_data = export_project(session, project_id, include_apis=False)
menu_ids = collect_menu_ids(parse_yaml(yaml_data).get("menus") or [])
for mid in reversed(menu_ids):
    session.post(DELETE_URL, json={"id": mid})
```

`clean_isolated_projects` fixture 前置清理 **必须抛错**，不可静默 `Warning` 吞掉。

---

## 3. 导出 YAML 与 DB 树对比数据源不一致

### 现象

签名对比偶发不一致，或一侧有 API 数量另一侧为 0。

### 修复

对比 `tree_signature` 时：

- DB 侧：`get_menu_tree(..., include_apis=True)`（即 `menu/list`）
- YAML 侧：`yaml_tree_signature(parse_yaml(export))`
- 两侧 `include_apis` 参数一致

---

## 4. unwrap_response 字段名

### 现象

`get_menu_tree` 返回 `[]`，但 HTTP 200。

### 检查

API 响应 `data` 内键名可能是 `menus`、`tree` 或 `items`。helper 应依次 fallback：

```python
result.get("menus") or result.get("tree") or result.get("items") or []
```

---

## 5. 隔离项目与官方 tests 项目 ID

| 用途 | project_id |
|------|------------|
| 官方 `tests/` 集成测试隔离写操作 | 常为 `9999`（见 `TestProjectMenuImportExport`） |
| hytests CSV 跨项目场景 | `.env.local` 的 `SECCENTER_TEST_PROJECT_A/B`（如 9998/9999） |

勿在 hytests 写操作中使用 `project_id=1`，避免破坏共享菜单与权限关联。

---

## 6. Gateway 路径前缀

远端 nginx 与本地 gateway 路径不同。统一用 `config.seccenter_url()` 构建 URL，勿硬编码 `/seccenter/v2/...` 或 `/forward/...`。

---

## 与 case_report 联动

陷阱修复后，在 `case_report.check` 的 `detail` 中写明数据源，便于读 log 时定位：

```python
case_report.check(
    "导出结构与 DB 菜单树一致",
    tree_match,
    f"DB节点={len(db_sig)} YAML节点={len(yaml_sig)} (menu/list)",
)
```

---

## 参考实现

- `seccenter/hytests/helpers/menu_helpers.py`：`get_menu_tree`、`clear_project_menus`
- `seccenter/tests/test_04_menu.py`：`TestProjectMenuImportExport`
