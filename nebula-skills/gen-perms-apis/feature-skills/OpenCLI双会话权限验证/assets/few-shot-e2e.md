# OpenCLI双会话权限验证 — few-shot 示例

> 一次完整的双会话验证流程示例，使用 `--profile` 实现 Chrome 用户级隔离。

## 前置检查

```bash
opencli doctor
# 必须看到 ≥ 2 个 Profiles。只有 1 个 → 停下来反馈用户。
# Profiles:
#   • admin-profile: connected v1.0.17
#   • test-profile: connected v1.0.17
```

## 触发

```text
本轮配置：勾选 sys:dashboard:view，取消 sys:tenant:query 和 sys:tenant:add。
用 OpenCLI 双会话验证。
```

## Session A（admin-profile：Admin）

```bash
# 打开登录页
opencli --profile admin-profile browser perm-a open http://localhost:8080/cloud/login

# 登录
opencli --profile admin-profile browser perm-a fill --role textbox --name "手机号/邮箱地址" "admin@system.local"
opencli --profile admin-profile browser perm-a fill --role textbox --name "密码" "123456"
opencli --profile admin-profile browser perm-a click --role button --name "登录"
opencli --profile admin-profile browser perm-a wait time 5

# 导航到角色管理 → 编辑"权限测试角色"
opencli --profile admin-profile browser perm-a open http://localhost:8080/cloud/Apex/system/role
opencli --profile admin-profile browser perm-a wait time 3
opencli --profile admin-profile browser perm-a eval "
  var rows=document.querySelectorAll('.el-table__row');
  for(var i=0;i<rows.length;i++){
    if(rows[i].innerText.includes('权限测试角色')){
      rows[i].querySelector('[role=button]').click(); break;
    }
  }
"

# 菜单权限 Tab → 勾选
opencli --profile admin-profile browser perm-a click --role tab --name "菜单权限"
opencli --profile admin-profile browser perm-a eval "
  // 树全选
  document.querySelector('.tree-action-buttons button').click();
  // 功能项全选
  var fn=['新增菜单','查询菜单树','API配置','导出菜单','导入菜单','编辑菜单','删除菜单'];
  document.querySelectorAll('.el-dialog .el-checkbox').forEach(function(c){
    var l=c.querySelector('.el-checkbox__label');
    if(l && fn.includes(l.innerText.trim()) && !c.classList.contains('is-checked')) c.click();
  });
"

# 保存
opencli --profile admin-profile browser perm-a click --role button --name "确 定"
```

## Session B（test-profile：Test User）

```bash
# 打开登录页 + 清空 sessionStorage
opencli --profile test-profile browser perm-b open http://localhost:8080/cloud/login
opencli --profile test-profile browser perm-b eval "sessionStorage.clear()"

# 登录
opencli --profile test-profile browser perm-b fill --role textbox --name "手机号/邮箱地址" "13813815913"
opencli --profile test-profile browser perm-b fill --role textbox --name "密码" "123456"
opencli --profile test-profile browser perm-b click --role button --name "登录"
opencli --profile test-profile browser perm-b wait time 5

# 验证
opencli --profile test-profile browser perm-b eval "
  var u=JSON.parse(sessionStorage.getItem('userInfo')||'{}');
  JSON.stringify({
    url:location.href,
    username:u.username,
    isOwner:u.isOwner,
    permissions:u.permissions,
    permsMapKeys:u.permsMap?Object.keys(u.permsMap):null
  });
"
// ⚠️ 不要查 sessionStorage.getItem('permsMap') — permsMap 在 userInfo 内部

# 逐 perm 验证
opencli --profile test-profile browser perm-b eval "checkHasPerm('sys:dashboard:view')"
opencli --profile test-profile browser perm-b eval "checkHasPerm('sys:tenant:query')"
opencli --profile test-profile browser perm-b eval "checkHasPerm('sys:tenant:add')"
```

## 验证结果

```json
{
  "round": 1,
  "config": {
    "granted": ["sys:dashboard:view"],
    "revoked": ["sys:tenant:query", "sys:tenant:add"]
  },
  "results": [
    {"perm": "sys:dashboard:view", "status": "pass", "actual": "首页正常渲染，checkHasPerm 返回 true"},
    {"perm": "sys:tenant:query", "status": "pass", "actual": "checkHasPerm 返回 false，租户页被拦截"},
    {"perm": "sys:tenant:add", "status": "pass", "actual": "checkHasPerm 返回 false，与 query 一致"}
  ]
}
```

## 关键点

| 要点 | 说明 |
|------|------|
| `--profile` | **必须带**，区分 Chrome 用户。不同 session 名只是 tab 区分。 |
| 单 profile 门禁 | `opencli doctor` 只有 1 个 profile → 停下来，让用户创建第二个 Chrome 用户 |
| permsMap 路径 | `userInfo.permsMap`，不是 `sessionStorage.permsMap` |
| 不 reload | 登录后直接验证，不 `location.reload()` |
