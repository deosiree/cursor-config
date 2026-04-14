# Vite Preview 代理串包排障经验

## 适用场景
1. `pnpm run build` 后产物是新的，但 `pnpm run preview` 打开的页面仍是旧 UI。
2. 浏览器里出现旧 chunk 名，如 `Login.*.js`，而本地 `cloud/js` 里只有新 hash。
3. `preview` 下页面资源想走本地 build 产物，但 HTTP 接口又需要联调远端。
4. `base=/cloud` 且 `VITE_APP_BASE_API=/` 时，访问接口报：
   `The server is configured with a public base URL of /cloud...`

## 本次问题的错误链路
1. `microfb` 的本地产物是新的，`cloud/index.html` 和 `cloud/js/*.js` 也已经更新。
2. 但 `preview` 读取了生产环境变量，`VITE_APP_BASE_API=/`。
3. 这会让代理前缀覆盖整站路径，`/cloud` 也被误当成 API 请求代理到远端。
4. 结果表现成：
   - 页面 UI 看起来像“旧基座”
   - 源码面板里出现旧的 `Login.*.js`
   - 实际消费的是远端基座入口，而不是本地新 build

## 最终收敛方案
1. `server.proxy` 只承担本地开发代理。
2. `preview.proxy` 单独配置。
3. 当 `VITE_APP_BASE_API="/"` 时：
   - `/cloud` 与 `/cloud/**` 走本地 build 产物
   - 其他请求继续代理到远端
4. 给 `preview.port` 增加默认值兜底，避免生产环境没有 `VITE_APP_PORT` 时启动报 `NaN`。

## 关键代码点
1. `microfb/vite.config.ts`
   - `resolvePort`
   - `getUrlPathname`
   - `isLocalPreviewAssetRequest`
   - `preview.proxy`
2. `microfb/.env.production`
   - `VITE_APP_BASE=/cloud`
   - `VITE_APP_BASE_API=/`
3. `microfb/.env.development`
   - `VITE_APP_BASE_API=/dev-api`

## 排障判断顺序
1. 先看磁盘产物是否真的是新包。
2. 再看浏览器请求到的入口 HTML/JS hash 是否一致。
3. 若 `preview` 下 UI 仍旧，优先检查代理是否吞掉了 `/cloud`。
4. 若 `preview` 启动失败，检查端口变量是否缺失或为 `NaN`。
5. 若仍有环境差异，再排查本机代理/VPN/透明网关是否接管 localhost。

## 推荐验证命令
```powershell
pnpm run build
pnpm run preview
curl.exe -i http://127.0.0.1:4173/cloud/index.html
```

## 经验结论
1. `vite preview` 不是“纯静态文件服务器”的代名词，它同样会吃进配置文件里的 `preview.proxy`。
2. 当 API 前缀是 `/` 时，必须为本地静态资源留白名单，否则 preview 很容易退化成远端基座透传。
3. 想同时满足“本地 UI + 远端接口”，不要简单关掉 preview 代理，而要做“本地资源 bypass + 其余请求代理”。
