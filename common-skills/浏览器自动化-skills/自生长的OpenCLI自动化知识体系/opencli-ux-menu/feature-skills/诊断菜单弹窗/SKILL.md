# 诊断菜单弹窗

## 何时用

- `state` 有 dialog 但 fill 找不到 input
- 判重断言失败，不确定是语法还是唯一性
- 切换项目后表格/routePath 不符合预期

## 步骤

### 1. 一键诊断（Windows）

```powershell
cd opencli-ux-menu
.\scripts\diagnose-menu-page.ps1 -Profile local-subapp
```

### 2. bash

```bash
bash diagnose-menu-page.sh --profile local-subapp
```

### 3. 手动三连

```bash
opencli browser nebula-ux get url
opencli browser nebula-ux eval "JSON.stringify([...document.querySelectorAll('table tbody tr')].slice(0,5).map(...))"
opencli browser nebula-ux eval "/* get_menu_form_state 同款 JS，见 lib/common.sh */"
```

### 4. 截图

```bash
opencli browser nebula-ux screenshot screenshots/diag-$(date +%H%M%S).png
```

## 决策树

```
fill 失败？
  ├─ overlay display none → 重新 open_menu_create_dialog + wait「路由路径」
  ├─ 有语法错误 → 换 /opencli/xxx 路径（见 routePath-validation-layers.md）
  └─ 有判重错误 → 确认 projectId / 是否跨项目场景

8080 仍在 login？
  ├─ 用 login-submit-btn 或 bind
  └─ 或改 profile local-subapp
```

## 引用

- [`references/element-plus-overlay-pattern.md`](../../references/element-plus-overlay-pattern.md)
- [`references/menu-route-dup-pitfalls.md`](../../references/menu-route-dup-pitfalls.md)
