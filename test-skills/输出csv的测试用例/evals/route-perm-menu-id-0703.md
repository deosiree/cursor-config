# route-perm-menu-id-0703 导出记录

- **日期**：2026-07-03
- **来源**：菜单 ID 跨应用路由鉴权（microfb 下发 menuId + apex/opsdeck path/menuId 解析）
- **cases**：`configs/route-perm-menu-id-0703.cases.json`（10 条）
- **CSV**：`docs/问题单/0703/route-perm-menu-id-0703.csv`
- **生成命令**：

```bash
cd test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/route-perm-menu-id-0703.cases.json \
  --template ../../../../Repertory/Sieyuan/nebula/docs/问题单/模板/menu.csv \
  --output ../../../../Repertory/Sieyuan/nebula/docs/问题单/0703/route-perm-menu-id-0703.csv \
  --force
```

## 覆盖场景

| 用例 | 功能集合 | 验证点 |
|------|----------|--------|
| 路由变化后-globalState自动携带activeMenuContext | 菜单上下文 | afterEach 统一下发（侧栏/TagsView/后退/刷新） |
| 同path不同菜单-按menuId区分鉴权scope | 路由权限解析 | 381 vs 3117 等同 path 多菜单 |
| path唯一候选-无menuId仍可正常鉴权 | 路由权限解析 | 单候选短路 |
| path多候选有menuId-精确命中routeProjectMap节点 | 路由权限解析 | node.id === menuId |
| path多候选无menuId-OR宽松放行且同path仅告警一次 | 异常处理 | OR + 通知去重 |
| v-hasPerm指令-随当前菜单scope控制按钮显隐 | 页面权限 | directive + matchRoutePerm |
| checkHasPerm脚本调用-与v-hasPerm判定一致 | 页面权限 | 业务零改动 |
| opsdeck子应用-menuId路由鉴权与apex行为一致 | 路由权限解析 | opsdeck 对齐 |
| 普通租户-双项目导入菜单-构造path唯一参数不唯一对照 | 路由权限解析 | 双项目导入 + path 唯一/query 不唯一 + perm 唯一 |
| 同perm标识-双路由scope-新增删除权限隔离 | 页面权限 | A 无新增 / B 无删除；同 perm 按 scope 隔离（已手动验证） |
