# 菜单管理 index.vue 简化 — 验证报告（2026-06-05）

## 改动范围

- 合并 `rootMenus` → 单一 `menuTableData`
- 提取 `menu-page-tree-helpers.ts`（过滤 / 删除 / Tab 子树读取）
- 删除死代码（`dataTableRef`、无效样式、注释列）
- `importDialog` / `whitelistDialog` 改为 `ref(false)`

## 自动化结果

| 层级 | 命令 | 结果 | 说明 |
|------|------|:----:|------|
| 单元 | `pnpm exec vitest run src/views/system/menu/composables/__tests__/menu-page-tree-helpers.test.ts` | **9/9 PASS** | 锁定「单 menuTableData」契约：过滤、删除、Tab/表格同源 |
| CSV 落盘 | `menu-index-ui` only | **8 行** | `docs/问题单/0605/menu-index-ui.csv`（`menu-perm-e2e` 见 0604，不重复） |
| OpenCLI 冒烟 | `node scripts/run-menu-index-smoke.node.js --bind-only` | **BLOCKED** | bind 到钉钉文档页；`eval` 报 extension attach 冲突 |

## OpenCLI 冒烟 — 重跑步骤

1. 在 **p2ejw7ww** Chrome 窗口打开并聚焦：`http://localhost:8080/cloud/Apex/system/menu`（已登录）
2. 可选：暂时禁用其它 Chrome 扩展（避免 `chrome-extension://` attach 冲突）
3. 执行：

```bash
cd .cursor/test-skills/输出csv的测试用例
node scripts/run-menu-index-smoke.node.js --bind-only
```

4. 双会话权限 E2E（8 场景）另需 **q5prwymq** profile 连接：

```bash
cd .cursor/nebula-skills/gen-perms-apis/feature-skills/菜单管理功能项依赖链验证/scripts
node run-all.node.js --only 4,6
```

## 冒烟断言项（对应 index.vue）

- `.project-select` 项目下拉
- `.search-input` 关键字搜索
- `.menu-tabs` PageTabShell
- `.data-table__content` 或 `.menu-empty-panel`
- `[data-testid="sys-menu-whitelist-btn"]` 白名单入口
- `.menu-list-refresh-tag` 绿/黄 Tag

## 结论

- **逻辑层**：单元测试已通过，本次简化未改变树过滤与 Tab 数据契约。
- **UI 层**：OpenCLI 待正确 bind 到 8080 菜单页后补跑；当前环境阻塞在 Chrome 标签与扩展冲突。
