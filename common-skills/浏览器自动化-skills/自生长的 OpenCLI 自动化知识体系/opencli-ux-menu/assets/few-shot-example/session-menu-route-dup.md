# Few-shot：菜单路由路径按项目判重 OpenCLI 会话

> 2026-06-01 · admin@system.local · test0415 / test0601 · 判重文案「当前项目下的路由路径已存在」

## 背景

`MenuFormDialog` 原先用 `getRoutes({})` 做**全局** routePath 判重；改为 `getRoutes({ projectId })` 后，需验证同项目拒、跨项目允。

## 有效命令序列（8081 子应用）

```bash
SESSION=nebula-ux
MENU_URL=http://localhost:8081/cloud/Apex/system/menu

opencli browser $SESSION open "$MENU_URL"
# 切换 test0415
opencli browser $SESSION click --css ".project-select .el-select"
opencli browser $SESSION click --role option --name "test0415"

# 打开新增弹窗
opencli browser $SESSION eval "document.querySelectorAll('button').forEach(b=>{if(b.innerText.trim()==='新增')b.click()})"
opencli browser $SESSION wait text "路由路径" --timeout 15000

# 填写 + blur
opencli browser $SESSION fill "input[placeholder='请输入名称']" "dup0415"
opencli browser $SESSION fill "input[maxlength='64']" "/opencli/dup0415"
opencli browser $SESSION click "input[maxlength='64']"
# 等待 3s 后读错误 → 「当前项目下的路由路径已存在」

# 切换 test0601，相同路径 → errors 为空
opencli browser $SESSION keys Escape
opencli browser $SESSION click --role option --name "test0601"
# ... 同上填写 ...
# → 无重复错误
```

## 实测结论

| 场景 | 结果 |
|------|------|
| test0415 + `/opencli/dup0415` | PASS：显示「当前项目下的路由路径已存在」 |
| test0601 + `/opencli/dup0415` | PASS：无重复错误 |
| 8080 自动登录 | FAIL：需 `login-submit-btn` 或 bind |
| `/0522` 等数字段首路径 | 语法错误优先，测不到判重 |

## 沉淀物

- 子 skill：`opencli-ux-menu/`（TC1~TC3、PS 脚本、诊断、feature-skills）
- 脚本：`menu-route-dup-check.sh`、`run-e2e.ps1`、`diagnose-menu-page.ps1`
- 文档：`references/element-plus-overlay-pattern.md`、`routePath-validation-layers.md`
