# Element Plus append-to-body 弹窗 — OpenCLI 通用模式

> 菜单 `MenuFormDialog`、角色弹窗等均适用。来源：2026-06-01 菜单判重 OpenCLI 会话。

## 现象

| 工具 | 结果 |
|------|------|
| `browser state` | `role=dialog` 节点存在但**无子节点** |
| `find --role textbox` | 只能找到页面搜索框，找不到弹窗 input |
| `querySelectorAll('[role=dialog]')` | `offsetWidth/Height = 0`（未显示） |
| `querySelectorAll('.el-overlay')` | 仅 `display:block` 的那层有内容 |

## 推荐流程

```bash
# 1. eval 触发业务按钮（比 click ref 更稳）
opencli browser $SESSION eval "
  [...document.querySelectorAll('button')].find(b => b.innerText.trim() === '新增')?.click()
"

# 2. 条件等待字段文案
opencli browser $SESSION wait text "路由路径" --timeout 15000

# 3. fill 用 CSS 指向 overlay 内 input（OpenCLI 会在整页 query）
opencli browser $SESSION fill \"input[placeholder='请输入名称']\" \"test\"
opencli browser $SESSION fill \"input[maxlength='64']\" \"/opencli/test\"

# 4. 读错误：只扫 display:block 的 overlay
opencli browser $SESSION eval "
  (() => {
    const o = [...document.querySelectorAll('.el-overlay')].find(
      x => getComputedStyle(x).display === 'block'
    );
    return JSON.stringify([...o.querySelectorAll('.el-form-item__error')].map(e => e.textContent.trim()));
  })()
"
```

## 反模式

- 依赖 `state` 里的 dialog ref 去 `click` / `fill` — 常为空心节点
- `eval` 里 `document.forms[0].submit()` — Vue 拦截，无效
- blur 后立即断言 — 菜单判重 `getRoutes({ projectId })` 异步，需 **3~4s**

## 代码落点

- 封装：[`lib/common.sh`](../lib/common.sh) — `open_menu_create_dialog`、`get_menu_form_state`
- 诊断：[`scripts/diagnose-menu-page.ps1`](../scripts/diagnose-menu-page.ps1)
