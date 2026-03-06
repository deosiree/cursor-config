---
name: vite-proxy-v2-debug
description: Use when Vite dev requests to /dev-api return 404 Route Not Found, v2 auth/captcha cannot be reached, root page opens blank due to base mismatch, or ts/js duplicate modules break enum exports in nebula.
---

# 目标

快速定位并修复 `nebula` 子应用（`microfb`/`apex_dev`）本地联调时的代理错配与模块解析问题，避免“前端路径正确但网关 404 / 页面空白 / 运行时导出丢失”反复出现。

## 适用信号

1. 浏览器请求是 `/dev-api/seccenter/v2/auth/captcha`，仍返回 `{"error_msg":"404 Route Not Found"}`。
2. 前端已开启 v2 开关，但行为像仍走 v1。
3. 修改了 `vite.config.js` 却看不到对应日志或行为变化。
4. 同目录同时存在 `vite.config.ts` 与 `vite.config.js`。
5. `localhost:8081/` 直接打开空白页，但切到 `/cloud` 后才恢复。
6. 控制台报错：`does not provide an export named 'DeviceEnum'`（或 `LanguageEnum` 等）。

## 固定排查顺序

1. 确认唯一配置源
   - 只保留一个 vite 配置文件（建议 `.js`）。
   - `package.json` 的 `dev/build/preview` 显式加 `--config vite.config.js`。
2. 确认代理规则生效方式
   - 不依赖 `router(req)` 做动态分流。
   - 使用“多前缀代理”显式路由：`/dev-api/seccenter/v2/auth` 等前缀直达 v2，`/dev-api` 兜底到 v1。
3. 确认 rewrite 与目标路径一致
   - 转发前统一移除 `/dev-api`。
   - 若仍 404，检查网关是否要求额外前缀（如 `/api`）。
4. 证据校验
   - 浏览器 Network 看 `Request URL` 与响应头 `Server`。
   - 若显示 `APISIX` 且 404，说明已到网关但路由未命中。
5. 基座/打开路径校验（apex_dev 常见）
   - 对齐 `router` history base 与 vite dev base。
   - 开发态 `server.open` 必须打开到 base 路径（如 `/cloud`），否则打开根路径会空白。
6. 模块解析冲突校验（高频）
   - 检查 `src` 下是否存在同名 `*.ts` 与 `*.js`（尤其 `enums`）。
   - 若 `const enum` 对应的 `.js` 只剩 `export {}`，运行时一定会报“无该导出”。

## 推荐实现（nebula）

1. 代理实现统一用“多前缀显式代理”，不要依赖 `router(req)`：
   - `${baseApi}/seccenter/v2/auth` -> `VITE_APP_BASE_URL_V2`
   - `${baseApi}/seccenter/internal/auth` -> `VITE_APP_BASE_URL_V2`
   - `${baseApi}/seccenter/v2/menu|user|role|device` -> `VITE_APP_BASE_URL_V2`
   - `${baseApi}` -> `VITE_APP_BASE_URL`（兜底）
2. `rewrite` 固定为去掉 `baseApi` 前缀。
3. `VITE_MOCK_DEV_SERVER=false` 时不依赖 mock 插件。
4. `apex_dev` 开发态建议：
   - `base` 设为 `/cloud`（或由 `VITE_DEV_BASE_URL` 控制）。
   - `server.open` 指向同一个 base（避免打开 `/` 空白）。
5. 为避免 `ts/js` 同名冲突：
   - `resolve.extensions` 优先 `.ts` 再 `.js`。
   - 清理 `src/enums/**` 下历史 `*.js` 与 `*.js.map` 产物。

## 输出模板

1. 根因
   - `<配置加载/代理规则/网关路由/基座错位/ts-js冲突>`
2. 修复
   - `<改动文件 + 关键改动>`
3. 验证
   - `<至少一条请求证据 + 一条配置证据 + 一条页面打开路径证据>`
