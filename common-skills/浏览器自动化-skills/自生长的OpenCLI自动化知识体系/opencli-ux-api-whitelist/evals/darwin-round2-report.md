# Darwin Round 2 — opencli-ux-api-whitelist

**日期**: 2026-06-04  
**状态**: keep  
**eval_mode**: partial_full_test（脚本链路已跑通；UI 断言依赖已登录菜单页 + 权限）

## 改动摘要

| 文件 | 改动 |
|------|------|
| `run-e2e.ps1` / `run-e2e.sh` | 一键入口（默认 BindOnly+SkipSeed） |
| `run-e2e.ps1` | 修复 `$args` 覆写导致 `-BindOnly` 丢失 |
| `scripts/test-api-whitelist-table-scroll.ps1` | `Invoke-Oc` 参数改为 `$OcCommandArgs`；doctor 直调；点击 fallback 改 eval（opencli v1.7 无 `--css`） |
| `SKILL.md` / `README.md` | 推荐 `.\run-e2e.ps1` |
| `references/common-failures.md` | 记录 PS `$args` / opencli Usage 踩坑 |

## full_test 实测（本机）

```powershell
.\run-e2e.ps1   # -BindOnly -SkipSeed
```

| 步骤 | 结果 |
|------|------|
| 传参 | ✅ 已带 `-BindOnly -SkipSeed`（修复后） |
| doctor | ✅ p2ejw7ww profile 连接 |
| bind | ⚠️ 初绑 `about:blank`，后 `open menu` 成功 |
| 点击白名单 | ❌ `semantic_not_found`（需 `sys:menu:whitelist` 或手动先开弹窗） |
| scroll eval | ❌ 无弹窗 → `rowCount: 0` |

结论：**脚本与 opencli 调用链已修复**；E2E 通过需用户在 p2ejw7ww 窗口先打开菜单页并具备白名单权限。

## 分数变化（Round1 → Round2）

| # | 维度 | R1 | R2 | Δ |
|---|------|----|----|---|
| 2 | 工作流 | 8 | 9 | +1（run-e2e 入口） |
| 5 | 可执行性 | 9 | 9 | 0（脚本修复属可靠性） |
| 6 | 资源整合 | 9 | 9 | 0 |
| 8 | 实测表现 | 8 | 8.5 | +0.5（partial full_test） |

| 总分 | R1 | R2 | Δ |
|------|----|----|---|
| **加权** | **82.4** | **84.3** | **+1.9** |

Round1→Round2 累计：**76.5 → 84.3（+7.8）**

## 触顶判断

Round2 单轮 Δ=+1.9 < 2 → **建议停止优化**（HL-4 触顶）。

## 用户侧通过清单

1. p2ejw7ww Chrome：手动登录 `http://localhost:8080/cloud/login`
2. 打开 `http://localhost:8080/cloud/Apex/system/menu`
3. 确认可见「白名单」按钮（`sys:menu:whitelist`）
4. `cd opencli-ux-api-whitelist` → `.\run-e2e.ps1` 或 `.\run-e2e.ps1 -Full`（插种前确认 🔴 门禁）
