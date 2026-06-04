# 场景：双会话权限 E2E 测试

> 自生长：2026-06-06 | 来源：gen-perms-apis E2E 验证

## 适用条件

- 需要 admin 配置角色权限后，用另一个测试用户验证 UI 表现
- 需要覆盖权限之间的依赖关系（如"查询"是行内操作的前提）
- 需要逐项验证每条功能权限的授权正确性

## 核心模式

### `--profile` 隔离

```bash
# admin 和 test 使用不同 Chrome 用户 → cookie 完全隔离
opencli --profile 龙虾 browser adm open http://localhost:8080/cloud/Apex/system/role
opencli --profile other browser tst open http://localhost:8080/cloud/Apex/system/menu
```

**前置门禁**：`opencli doctor` 必须 ≥2 个 Profiles。只有 1 个→停下来反馈用户。

### 角色配置流程（admin）

```bash
# 1. 编辑角色
opencli --profile 龙虾 browser adm eval "
  var rows=document.querySelectorAll('.el-table__row');
  for(var i=0;i<rows.length;i++){
    if(rows[i].innerText.includes('权限测试角色')){
      rows[i].querySelector('[role=button]').click(); break;
    }
  }
"

# 2. 菜单权限 Tab
opencli --profile 龙虾 browser adm click --role tab --name "菜单权限"

# 3. 搜索树节点
opencli --profile 龙虾 browser adm fill --role textbox --name "请输入关键字进行搜索" "菜单管理"
opencli --profile 龙虾 browser adm eval "
  document.querySelector('input[placeholder=\"请输入关键字进行搜索\"]')
    .dispatchEvent(new Event('input',{bubbles:true}));
  var el=[...document.querySelectorAll('.node-label')]
    .find(function(e){return e.textContent.trim()==='菜单管理'});
  if(el) el.click();
"

# 4. 清空 → 勾选目标（比遍历判断状态更快）
opencli --profile 龙虾 browser adm eval "
  document.querySelectorAll('.function-list-actions button')
    .forEach(function(b){if(b.innerText.trim()==='清空') b.click();});
"
opencli --profile 龙虾 browser adm check --role checkbox --name "导入菜单"
opencli --profile 龙虾 browser adm check --role checkbox --name "查询菜单树"

# 5. 保存
opencli --profile 龙虾 browser adm click --role button --name "确 定"
```

### 验证流程（test 用户）

```bash
# 登录后检查
opencli --profile other browser tst eval "
  var u=JSON.parse(sessionStorage.getItem('userInfo')||'{}');
  var btns=document.querySelectorAll('button:not([aria-hidden=true])');
  var visible=[...btns].filter(function(b){return b.offsetParent!==null})
    .map(function(b){return b.innerText?.trim()});
  JSON.stringify({
    permissions: u.permissions?.filter(function(p){return p.includes('menu')}),
    toolbarButtons: visible.filter(Boolean),
    treeText: document.querySelector('#subapp-container')?.innerText?.substring(0,200)
  });
"
# ⚠️ permsMap 在 userInfo 内部，不查 sessionStorage.getItem('permsMap')
```

## 关键依赖规则

| 目标验证 | 前置依赖 | 原因 |
|---------|---------|------|
| 行内"编辑"按钮 | `sys:menu:query` | 树数据依赖 query 加载 |
| 行内"删除"按钮 | `sys:menu:query` | 同上 |
| API配置可见 | `sys:menu:query` + `sys:menu:edit` | query→树→行内编辑→权限配置→API配置 |
| 所有功能按钮 | 显示状态="显示" | `checkHasPerm` 同时校验 `permsMap[perm].isVisible` |

## 引用

- gen-perms-apis 编排 skill：`.cursor/nebula-skills/gen-perms-apis/intention-skills/编排-权限E2E测试/`
- 双会话流程：`.cursor/nebula-skills/gen-perms-apis/feature-skills/OpenCLI双会话权限验证/references/dual-session-procedures.md`
- 权限依赖矩阵：`.cursor/nebula-skills/gen-perms-apis/intention-skills/编排-权限E2E测试/references/e2e-orchestration-strategy.md`
- 公共模式：[[公共模式与反模式.md]] §P9-P14, §A9-A11
