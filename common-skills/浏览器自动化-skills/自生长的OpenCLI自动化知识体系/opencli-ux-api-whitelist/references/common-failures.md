# 常见失败对照

| 现象 | 原因 | 处理 |
|------|------|------|
| bind 到 about:blank | 未在 p2ejw7ww 窗口选已登录标签 | 先打开 8080 菜单页再 `bind` |
| 点击白名单 not_found | 无 `sys:menu:whitelist` | 合并 `docs/menu/0604_菜单白名单权限补丁.yaml` |
| seed inserted 0 | 未登录 / Cookie 未带 | 确认 8080 基座已登录 |
| 脚本跑 294s+ | 验证码 + 长 Sleep | `-BindOnly` |
| hasVerticalScroll false | 用旧 scroll-eval（body-wrapper） | 用 `opencli-whitelist-scroll-eval-oneline.js` |
| stderr 终止脚本 | `$ErrorActionPreference=Stop` | 改为 `Continue` |
| `run-e2e.ps1` 未 bind 却 open 登录页 | 脚本内用 `$args` 覆写自动变量，`-BindOnly` 未传入子脚本 | 用 `@mainSwitches` 显式传参 |
| opencli 只打印 Usage | `Invoke-Oc` 参数名 `$Args` 与 PS 保留变量冲突 | 改为 `$OcCommandArgs` |
