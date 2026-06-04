# OpenCLI 双会话操作流程

## 环境准备

### Chrome 多用户隔离（强制）

> **不同 session 名不等于 cookie 隔离。** `opencli browser perm-a` 和 `opencli browser perm-b` 只是不同 tab，共享同一 Chrome profile 的 cookie。
>
> 真正的隔离需要 **不同 Chrome 用户**，通过 `--profile` 全局 flag 指定。

### 人工门禁：检测 Chrome 用户数

执行双会话 E2E 前，必须先运行：

```bash
opencli doctor
```

检查 `Profiles:` 部分：

| 结果 | 行为 |
|------|------|
| **≥ 2 个 profile** | ✅ 继续，按下方步骤分配 profile |
| **只有 1 个 profile** | ❌ **停下来，反馈用户**：需要在 Chrome 中创建一个新用户（`设置 → 用户 → 添加`），并在新用户窗口安装 OpenCLI 扩展 |

### 创建第二个 Chrome 用户

```
1. Chrome → 右上角用户图标 → "添加"
2. 给新用户命名（如 "E2E-Test" 或 "other"）
3. 在新窗口安装 OpenCLI 扩展
4. 运行 opencli doctor → 应看到 2 个 profile
5. （可选）用 opencli profile rename <id> <别名> 给 profile 起别名
```

### 分配 profile

```bash
# 给两个 profile 起别名
opencli profile rename <id1> admin-profile
opencli profile rename <id2> test-profile
```

### 凭据

| 角色 | 账号 | 密码 | Chrome 用户 | 用途 |
|------|------|------|-----------|------|
| admin | admin@system.local | 123456 | admin-profile | 配置角色权限 |
| test | 13813815913 | 123456 | test-profile | 验证权限生效 |
| 测试角色 | 权限测试角色 | — | — | test 用户所属角色 |

## 双会话命令格式

```bash
# 所有命令必须带 --profile 区分 Chrome 用户
opencli --profile admin-profile browser perm-a <command>
opencli --profile test-profile browser perm-b <command>
```

**不需要两个终端。** 同一终端交替发命令即可，`--profile` 底层走不同 Chrome 用户目录，cookie/sessionStorage 完全隔离。

## Session A：Admin 操作序列

```bash
# 1. 打开登录页
opencli --profile admin-profile browser perm-a open http://localhost:8080/cloud/login

# 2. 填写并登录
opencli --profile admin-profile browser perm-a fill --role textbox --name "手机号/邮箱地址" "admin@system.local"
opencli --profile admin-profile browser perm-a fill --role textbox --name "密码" "123456"
opencli --profile admin-profile browser perm-a click --role button --name "登录"

# 3. 等待跳转
opencli --profile admin-profile browser perm-a wait time 5

# 4. 导航到角色管理
opencli --profile admin-profile browser perm-a open http://localhost:8080/cloud/Apex/system/role

# 5. 编辑"权限测试角色"（eval 定位）
opencli --profile admin-profile browser perm-a eval "
  var rows=document.querySelectorAll('.el-table__row');
  for(var i=0;i<rows.length;i++){
    if(rows[i].innerText.includes('权限测试角色')){
      rows[i].querySelector('[role=button]').click(); break;
    }
  }
"

# 6. 切换到菜单权限 Tab
opencli --profile admin-profile browser perm-a click --role tab --name "菜单权限"

# 7. 树全选 + 功能项全选（eval）
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

# 8. 保存
opencli --profile admin-profile browser perm-a click --role button --name "确 定"
```

## Session B：Test 用户验证序列

```bash
# 1. 打开登录页（在另一个 Chrome 用户中）
opencli --profile test-profile browser perm-b open http://localhost:8080/cloud/login

# 2. 清空 sessionStorage
opencli --profile test-profile browser perm-b eval "sessionStorage.clear()"

# 3. 填写并登录
opencli --profile test-profile browser perm-b fill --role textbox --name "手机号/邮箱地址" "13813815913"
opencli --profile test-profile browser perm-b fill --role textbox --name "密码" "123456"
opencli --profile test-profile browser perm-b click --role button --name "登录"

# 4. 等待跳转
opencli --profile test-profile browser perm-b wait time 5

# 5. 验证登录态
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
# ⚠️ permsMap 在 userInfo 内部，不要查 sessionStorage.getItem('permsMap')
```

## 逐权限验证命令

```bash
# 检查特定 perm
opencli --profile test-profile browser perm-b eval "checkHasPerm('sys:dashboard:view')"

# 检查页面守卫
opencli --profile test-profile browser perm-b open http://localhost:8080/cloud/Apex/tenant
opencli --profile test-profile browser perm-b wait time 2
opencli --profile test-profile browser perm-b eval "document.querySelector('#subapp-container')?.innerText?.substring(0,100)"

# 检查 Header 入口
opencli --profile test-profile browser perm-b eval "
  var dropdown=document.querySelector('[aria-haspopup=menu]');
  if(dropdown) dropdown.click();
  setTimeout(function(){
    var items=[...document.querySelectorAll('[role=menuitem]')].map(function(e){return e.innerText.trim();});
    return JSON.stringify({items:items});
  },500);
"
```

## 常见陷阱

| 陷阱 | 表现 | 修复 |
|------|------|------|
| 同一 Chrome profile | 两个 session 共享 cookie，只能登同一用户 | 使用 `--profile` 指定不同 Chrome 用户 |
| 只有一个 Chrome profile | `opencli doctor` 只显示 1 个 profile | **停下来，反馈用户创建第二个 Chrome 用户** |
| 未清空 sessionStorage | test 用户读到旧 userInfo | 登录前 `sessionStorage.clear()` |
| 未等待同步 | admin 保存后立即验证，权限未生效 | 保存后等 2 秒 + 确认 toast |
| test 用户也是 owner | `isOwner=true` 绕过所有 perm 检查 | 确认 test 用户 `isOwner=false` |
| `sessionStorage.getItem('permsMap')` | 永远返回 null | permsMap 在 `userInfo` 内部：`JSON.parse(sessionStorage.getItem('userInfo')).permsMap` |
| 登录后 `location.reload()` | 掩盖 computed 缓存不刷新的 bug | 登录后不要 reload，直接验证 |
| **功能项显示状态为"隐藏"** | **用户有 perm 但按钮不显示**，误判为"未授权" | **去菜单管理 → 对应页面节点 → 权限配置 → 检查功能项"显示状态"是否为"显示"** |
| **缺少查询权限** | **有 edit/delete 但行内操作按钮不可见** | **`sys:menu:query` 是行内操作的前提——没有它，树数据不加载，行内按钮不渲染** |

## 功能项显示状态检查（强制）

> **这是「有 perm 但按钮不显示」的根因之一。** 即使角色已授权、permissions 数组正确，如果功能项的显示状态为"隐藏"，前端 `checkHasPerm` 会因 `permsMap[perm].isVisible === false` 而返回 false，按钮不渲染。

### 检查步骤

```bash
# 1. admin 导航到菜单管理页
opencli --profile admin-profile browser perm-a open http://localhost:8080/cloud/Apex/system/menu

# 2. 在菜单树中找到目标页面节点 → 点击"权限配置"
# （需要先在树中定位节点，展开父级，找到目标行，点击"权限配置"按钮）

# 3. 在弹出的功能项列表中检查每个功能项的显示状态
opencli --profile admin-profile browser perm-a eval "
  var items = document.querySelectorAll('.function-perm-item,.perm-item,[class*=perm]');
  var result = [];
  items.forEach(function(item) {
    var name = item.querySelector('[class*=name],[class*=label]')?.innerText?.trim();
    var status = item.querySelector('[class*=status],[class*=switch]')?.innerText?.trim() ||
                 item.querySelector('.el-switch.is-checked') ? '显示' : '隐藏';
    if (name) result.push({ name: name, status: status });
  });
  JSON.stringify(result);
"
```

### 修复方法

如果功能项显示状态为"隐藏"：
1. 在菜单管理页找到对应页面节点
2. 点击"权限配置"
3. 将目标功能项的显示状态切换为"显示"
4. 保存
5. test 用户重新登录后验证
