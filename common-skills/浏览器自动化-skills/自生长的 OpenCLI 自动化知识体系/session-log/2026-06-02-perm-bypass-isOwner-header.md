# 会话日志：权限后门 isOwner + Header 个人中心

> 2026-06-02 · microfb + apex_dev · admin@system.local / 123456 · 本地 8080

## 元数据

| 字段 | 值 |
|------|-----|
| Session | `nebula-perm-test` |
| Profile | `local`（基座 8080） |
| 日期 | 2026-06-02 |
| 目标 URL | `http://localhost:8080/cloud/login` → `/cloud/Apex/dashboard` |
| 任务描述 | 排查租户所有者 `isOwner` bypass 失效；验证 NavbarActions 登录后「个人中心」无需刷新 |

## 背景结论（源码 + 浏览器）

1. **bypass 条件**：`sessionStorage.userInfo.isOwner === true`（严格相等），与邮箱无关。
2. **登录 API 正常**：`POST /dev-api/direct/seccenter/v2/auth/login` 返回 `user.isOwner: true`。
3. **bypass 失效时**：新增 perm（如 `sys:dashboard:view`）未进角色 → 页面守卫拦截（如「暂无权限查看首页」）。
4. **Vue 响应式坑**：`NavbarActions` 的 `computed(() => checkHasPerm(...))` 不订阅 `userInfo`，登录后 session 已更新但下拉仍缺「个人中心」，需 `void userInfo.isOwner` 修复。
5. **登录页 Header**：`App.vue` 用 `v-show` 隐藏 Header，组件仍挂载，首屏会算一次权限。

## 关键命令序列

```bash
opencli doctor

# 1. 打开并清空旧 session（可选，测冷启动）
opencli browser nebula-perm-test open "http://localhost:8080/cloud/login"
opencli browser nebula-perm-test eval "sessionStorage.removeItem('userInfo'); localStorage.removeItem('userInfo'); 'cleared';"
opencli browser nebula-perm-test eval "location.reload()"

# 2. state 取登录框 ref（placeholder 定位）
opencli browser nebula-perm-test state
# → [19] 账号 input、[20] 密码 input

# 3. 登录（登录按钮用 --nth 消歧）
opencli browser nebula-perm-test type 19 "admin@system.local"
opencli browser nebula-perm-test type 20 "123456"
opencli browser nebula-perm-test click "button:has(span)" --nth 0

# 4. 断言 session（勿 reload）
opencli browser nebula-perm-test eval "(function(){
  const u=JSON.parse(sessionStorage.getItem('userInfo')||'null');
  return JSON.stringify({ url:location.href, isOwner:u?.isOwner, username:u?.username });
})()"

# 5. 模拟 checkHasPerm（含 bypass）
opencli browser nebula-perm-test eval "(function(){
  const u=JSON.parse(sessionStorage.getItem('userInfo')||'{}');
  const perms=u.permissions||u.perms||[];
  const bypass=u.isOwner===true;
  function check(p){
    if(bypass) return true;
    if(!perms.includes(p)) return false;
    return !!u.permsMap?.[p];
  }
  return JSON.stringify({
    bypass,
    tests:{
      'sys:profile:view':check('sys:profile:view'),
      'sys:dashboard:view':check('sys:dashboard:view')
    }
  });
})()"

# 6. Header 下拉：点 user-profile → 读 menuitem
opencli browser nebula-perm-test state   # 找 aria-haspopup=menu + admin 旁 ref
opencli browser nebula-perm-test click 8
opencli browser nebula-perm-test eval "(function(){
  const items=[...document.querySelectorAll('[role=menuitem]')].map(el=>(el.textContent||'').trim());
  return JSON.stringify({
    profileVisible: items.includes('个人中心'),
    logoutVisible: items.includes('退出登录')
  });
})()"

# 7. 负向：删掉 isOwner 后 hard reload → 首页应被拦
opencli browser nebula-perm-test eval "(function(){
  const u=JSON.parse(sessionStorage.getItem('userInfo'));
  delete u.isOwner;
  sessionStorage.setItem('userInfo', JSON.stringify(u));
  return 'tampered';
})()"
opencli browser nebula-perm-test eval "location.reload()"
# 等待后 eval：areaPreview 含「暂无权限查看首页」

# 8. 登录 API 响应（network detail）
opencli browser nebula-perm-test network --detail "POST localhost:8080/dev-api/direct/seccenter/v2/auth/login"
```

## 验证结果

| 检查项 | 结果 |
|--------|:----:|
| `opencli doctor` | PASS |
| 登录后 `isOwner===true` | PASS |
| 登录后**未 reload** 下拉含「个人中心」 | PASS（fix 后） |
| 点击「个人中心」→ `/cloud/Apex/profile` | PASS |
| 删除 `isOwner` + reload → 首页「暂无权限查看首页」 | PASS |
| `isOwner=false` 时 `sys:dashboard:view` | FAIL（预期，角色无此 perm） |

## 踩坑

| 现象 | 原因 | 处理 |
|------|------|------|
| `error: unknown option '--format'` | `open browser` 不支持 `-f/--format` | 直接执行，JSON  stdout 已够用 |
| `error: unknown option '--limit'` | `network` 无 `--limit` | 用 `network` + `grep` 或 `--detail` |
| `selector_ambiguous` 两个 button | 登录页「登录」「忘记密码？」 | `click "button:has(span)" --nth 0` |
| 登录后 UI 仍无「个人中心」但 session 有 isOwner | computed 未订阅 userInfo | 见 `perm-bypass-isOwner-pitfalls.md` |
| 半登录壳层（有菜单 + 登录表单） | Cookie 有效但 userInfo 不完整 | 清空 session 后重登 |
| `fetch /seccenter/...` 非 JSON | 路径缺 `/dev-api/direct` 前缀 | 跟 vite proxy 走 `/dev-api/direct/seccenter/v2/...` |

## 沉淀决策

- [x] 创建 `references/场景-权限与登录态诊断.md`
- [x] 创建 `opencli-ux-user-perm/references/perm-bypass-isOwner-pitfalls.md`
- [x] 创建 `opencli-ux-user-perm/feature-skills/权限后门与Header诊断/SKILL.md`
- [x] 更新 `references/公共模式与反模式.md`（P7/P8、A7/A8）
- [x] 更新底座 `SKILL.md` 路由表
- [ ] 未 scaffold 独立子 skill（命令序列可复用 user-perm + 场景文件）
