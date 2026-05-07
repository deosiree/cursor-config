---
name: vite-preview-proxy-debug
description: 排查 Vite `build/preview` 与代理串包问题，覆盖 `base=/cloud`、`preview.proxy`、`VITE_APP_BASE_API=/`、本地产物与远端基座混用等场景。
---

# 目标
快速判断“preview 看到的不是本地 build 产物”究竟是产物旧、代理吞路由，还是本机网络链路接管，并给出最小修复方案。

## 执行步骤
1. 核对源码入口与磁盘产物是否一致。
2. 抓取 `preview` 实际返回的 `index.html` 和入口 chunk，确认是否命中本地新 hash。
3. 检查 `vite.config.ts` 中 `server.proxy` 与 `preview.proxy` 的边界。
4. 若 `VITE_APP_BASE_API="/"`，确认是否为本地静态资源配置了 bypass 白名单。
5. 检查 `VITE_APP_PORT` 是否缺失，避免 `preview.port` 变成 `NaN`。
6. 若配置无误但返回仍异常，再排查本机代理/VPN/透明网关。

## 输出要求
1. 必须先给出根因分类：
   - `本地产物问题`
   - `preview 代理问题`
   - `环境/网络接管问题`
2. 必须给出证据：
   - 源码入口
   - 磁盘产物 hash
   - 实际响应 hash 或响应头
3. 修复建议优先最小改动，避免回滚整份 `vite.config.ts`。
4. 若需要改配置，必须同时给出验证命令。

## 最小修复原则
1. `dev` 与 `preview` 的代理职责分离。
2. `preview` 如果要联调远端接口，必须保证本地 `base` 路径始终走本地 build 产物。
3. API 前缀为 `/` 时，优先加 bypass，而不是直接全局禁用代理。
4. 端口配置缺失时，优先补默认值，再决定是否在 `.env.*` 中显式声明。

## 常见结论模板
1. 本地 build 是新的，但 `preview` 的 `/cloud` 被代理到远端，导致 UI 看起来像旧基座。
2. `preview` 需要“本地 UI + 远端接口”时，应使用 `preview.proxy + bypass(/cloud/**)`。
3. `ERR_SOCKET_BAD_PORT` 通常不是 Vite 本身坏掉，而是环境变量缺失导致端口解析为 `NaN`。

## 推荐验证命令
```powershell
pnpm run build
pnpm run preview
curl.exe -i http://127.0.0.1:4173/cloud/index.html
curl.exe -i http://127.0.0.1:4173/<api-path>
```
