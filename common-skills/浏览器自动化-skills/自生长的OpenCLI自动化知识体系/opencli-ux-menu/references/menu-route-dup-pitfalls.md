# 菜单路由路径判重 — OpenCLI 踩坑清单

> 来源：2026-06-01 菜单按项目判重功能 OpenCLI 实测会话。

## 环境与入口

| 项 | 推荐 | 说明 |
|----|------|------|
| 访问地址 | `http://localhost:8081/cloud/Apex/system/menu` | 8081 子应用可直连，无需基座登录 |
| 基座 8080 | `http://localhost:8080/cloud/login` | `admin@system.local` / `123456`；OpenCLI 自动登录曾卡在 login 页 |
| 账户 | `admin@system.local` | 与 tenant/user-perm skill 一致 |
| 测试项目 | `test0415`、`test0601` | 同项目拒 / 跨项目允 |
| Session | **`nebula-menu-ux`** | 与 tenant/user-perm 的 `nebula-ux` 隔离，防抢标签 |

**profile 建议**：菜单判重默认用 `local-subapp`（`authMode: none`）；8080 基座用 **`bash bind-and-run.sh`**（人工登录 → bind → TC1~TC3）。

## Element Plus 弹窗（append-to-body）

| 现象 | 原因 | 处理 |
|------|------|------|
| `state` 里 `role=dialog` 无子节点 | 弹窗 teleport 到 body，`state` 预算内未展开 | 用 `eval` 找 `display:block` 的 `.el-overlay` |
| `find --role textbox` 只有搜索框 | 弹窗未真正打开或已关闭 | `eval` 点击「新增」+ `wait text "路由路径"` |
| `fill` 后表单仍报「不能为空」 | 仅改 DOM 未触发 Vue v-model | 优先 `opencli fill "input[placeholder='请输入名称']"` |

**读表单错误**：

```javascript
const overlay = [...document.querySelectorAll('.el-overlay')].find(
  o => getComputedStyle(o).display === 'block'
);
const errors = [...overlay.querySelectorAll('.el-form-item__error')].map(e => e.textContent.trim());
```

## 登录页

| 现象 | 处理 |
|------|------|
| `click --role button --name "登录"` 后仍停留在 `/login` | 误点到语言菜单等同名 button；改用 `button.login-submit-btn`（见 `click_login_submit`） |
| 8080 登录失败 | 改用 8081 `local-subapp`，或 `opencli browser nebula-ux bind` 绑定已手动登录标签 |

## 项目切换

```bash
opencli browser nebula-ux click --css ".project-select .el-select"
opencli browser nebula-ux click --role option --name "test0415"
```

切换后等待菜单树 reload（约 2s），缓存按 `projectId` 隔离（前端 5s TTL）。

## 路由路径校验分层

1. **语法**（`createRoutePathRules`）：如「段首不要为数字」—— `/0522` 会在唯一性校验前被拦截
2. **唯一性**（`ensureRoutePathUnique`）：blur 后异步，文案「当前项目下的路由路径已存在」

**测判重**请用语法合法路径，如 `/opencli/dup0415`，并确保该路径在 test0415 中已存在。

## PowerShell 注意

- `opencli browser eval` 的参数若含引号，易被 PowerShell 拆参；脚本内用 bash，或 `$js='...'` 单变量传入
- Windows 无 bash 时可逐条执行 README 中的 opencli 命令

## 断言时序

- blur 后 **等待 3~4s** 再读 `.el-form-item__error`（`getRoutes({ projectId })` 为异步）
- 失败时：`screenshot` + `get_menu_form_state` 转储

## 相关源码

- [`MenuFormDialog.vue`](../../../../apex_dev/src/views/system/menu/components/MenuFormDialog.vue)
- [`menu/index.vue`](../../../../apex_dev/src/views/system/menu/index.vue)
