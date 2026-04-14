---
name: route-scatter-check
description: Use when modifying route-related code (router, guard, menu redirect, activeRule, base path) and you need a structured scan to find hardcoded route/path scatter before merge.
---

# 目标
在路由相关改动中，快速发现并收束“路径硬编码散点”，降低“路由正确但组件不渲染/登录回跳错乱/微应用不激活”的回归风险。

## 适用场景
1. 修改 `router`、`permission guard`、`menu`、`micro app activeRule`、`history base`。
2. 新增或调整登录回跳（`/login?redirect=`）与默认首页逻辑。
3. 修复 `/manage`、`/Apex`、`/Opsdeck`、`/DevelopCenter` 等前缀兼容问题。
4. 合并前需要确认没有新增 route 字面量散点。

## 执行步骤
1. 确认本次规范常量来源（例如 `constants/route-paths.ts`、`constants/navigation-paths.ts`、`constants/micro-app.ts`）。
2. 全局扫描运行时代码中的路径字面量（排除 `dist/node_modules/构建产物/测试`）。
3. 将命中项标注为：`运行时逻辑`、`注释/文案`、`兼容归一化逻辑`、`样式选择器`。
4. 仅对 `运行时逻辑` 做收束改造：改为常量或统一网关函数。
5. 复测最小关键路径：登录回跳、首页落点、子应用挂载、历史前缀兼容。
6. 输出剩余散点清单（含保留理由），避免“假收敛”。

## 建议扫描命令
```powershell
rg -n --hidden --glob '!**/node_modules/**' --glob '!**/dist/**' --glob '!**/cloud/**' --glob '!**/.git/**' --glob '!**/__tests__/**' "(/login|/Apex|/Opsdeck|/DevelopCenter|/manage|/redirect/|subapp-container)" microfb/src apex_dev/src
```

## 输出要求
1. 用 `P0/P1` 分级输出命中项，`P0` 必须是运行时散点。
2. 每个命中项提供证据文件与行号。
3. 每次都给“已收束 / 保留不收束”的二分结果。
4. 附最小回归结果（命令 + 是否通过）。

