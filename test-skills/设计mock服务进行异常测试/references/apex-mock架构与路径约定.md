# apex_dev Mock 架构与路径约定

## 技术栈

- **插件**：`vite-plugin-mock-dev-server`（已在 `vite.config.ts` 注册，**勿改 vite**）
- **开关**：`.env.development.local` → `VITE_MOCK_DEV_SERVER=true`
- **加载规则**：`mock/**/*.mock.ts` 在开关为 `true` 时自动加载
- **错误形态**：HTTP **200** + `{ code: 非0, message }` → axios 业务 reject → `handleApiError` toast

> 判断 mock 是否命中：看 Response JSON 的 `code`，**不是** HTTP 状态码。

## API 路径（forward 前缀）

apex 经 microfb 路由通道转发，真实请求路径形如：

```text
/dev-api/forward/seccenter/v2/user/list
```

mock 文件内 `url` 应写 **相对 base** 的路径（插件会拼 `VITE_APP_BASE_API`）：

```typescript
url: "forward/seccenter/v2/user/list"
```

**不要**写 committed mock 里的 `seccenter/v2/...`（无 `forward/` 时可能匹配不到）。

## Windows path.join 坑

`mock/base.ts` 用 `path.join` 拼 URL，在 Windows 会产生反斜杠，导致 mock 不匹配。

**csv-error 类 mock** 应使用正斜杠自定义 `defineMock`：

```typescript
import { createDefineMock } from "vite-plugin-mock-dev-server";

const defineMock = createDefineMock((mock) => {
  const base = String(import.meta.env.VITE_APP_BASE_API || "/dev-api").replace(/\/$/, "");
  const rel = String(mock.url || "").replace(/^\/+/, "");
  mock.url = `${base}/${rel}`;
});
```

## 8080 vs 8081

| 访问方式 | API 去向 | Mock |
|----------|----------|------|
| `localhost:8080/cloud/...`（microfb，mock 关） | 8080 proxy → syncloud | **否** |
| `localhost:8080/cloud/...`（microfb，mock 开） | 8080 vite mock | **是**（基座用例，见 [[手工自测流程-8080基座mock.md]]） |
| `localhost:8081/cloud/...`（apex 直连） | 8081 vite mock | **是**（子应用用例） |

子应用 axios `baseURL: /dev-api` 为相对路径，在基座页面下打到 8080，**不会**经过 apex 8081 mock。

## 基座 vs 子应用（决策表）

| 信号 | profile | 入口 |
|------|---------|------|
| CSV 环境含 `microfb :8080` + 登录/刷新侧栏菜单 | `microfb` | 8080 |
| 页面在 `/cloud/Apex/...` 子应用内 | `apex_dev` | 8081 |
| 同调 `menu/tree` 但 toast 不同 | 看触发网关：`microfb/menu.gateway` vs `apex_dev/menu.gateway` | 见上 |

## 场景切换

- 文件：`.mock-shared/error-scenario.json` → `{ "active": "3545" }`
- mock `body()` 内读 `active`，分支返回错误或成功数据
- 改 JSON 后 **刷新浏览器**，一般无需重启 dev

## 文件命名

| 模式 | 说明 |
|------|------|
| `mock/csv-error.mvp.mock.ts` | MVP 批次，多场景单文件 |
| `mock/csv-error-{domain}.mock.ts` | ≥8 用例时按模块拆分 |

均在 `.gitignore` 中（本地自测产物）。

## 定位 API 源码

1. 从用例步骤推断页面（用户管理 / 角色管理 …）
2. 查 `src/views/` 组件调用的 `src/api/*.api.ts`
3. 跟 `route-channel` / `forward` 拼出完整 mock `url`
4. 确认 method（多为 `POST`）
