---
session: dual-e2e
profile: 龙虾 (admin) + other (test)
date: 2026-06-06
task: "菜单管理权限双会话 E2E 验证 — 8 场景覆盖全部功能项依赖关系"
---

## 关键命令序列

```bash
# 双会话隔离
opencli --profile 龙虾 browser adm open http://localhost:8080/cloud/Apex/system/role
opencli --profile other browser tst open http://localhost:8080/cloud/Apex/system/menu

# 角色编辑：搜索树节点 → 清空 → 勾选目标 → 保存
opencli --profile 龙虾 browser adm click --role tab --name "菜单权限"
opencli --profile 龙虾 browser adm fill --role textbox --name "请输入关键字进行搜索" "菜单管理"
opencli --profile 龙虾 browser adm check --role checkbox --name "导入菜单"
opencli --profile 龙虾 browser adm click --role button --name "确 定"

# 验证
opencli --profile other browser tst eval "
  var u=JSON.parse(sessionStorage.getItem('userInfo')||'{}');
  JSON.stringify({permissions:u.permissions, toolbarButtons:visible});
"
```

## 踩坑记录

- `sessionStorage.getItem('permsMap')` 永远 null → permsMap 在 userInfo 内部
- `eval + classList.contains('is-checked')` 判断复选框不可靠 → 用 `check`/`uncheck` 命令
- 不同 session 名 ≠ cookie 隔离 → 必须 `--profile` 不同 Chrome 用户
- 自定义树组件用 `.node-label` 而非 `.el-tree-node__label`
- "清空"→勾选 比遍历判断状态快 3x+
- `find`→`click <ref>` 比 `click --role menuitem --name` 可靠（下拉未展开时匹配不到）

## 沉淀决策

- [x] 公共模式与反模式.md：新增 P9-P14 + A9-A11
- [x] 场景-双会话权限E2E.md：新建
- [x] SKILL.md 路由表：新增双会话权限E2E
- [x] gen-perms-apis skill：dual-session-procedures.md 重写为 `--profile` 模式
