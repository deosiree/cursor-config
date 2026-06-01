# SecCenter API 路径（microfb 开发环境）

基座 `microfb/.env.development`：`VITE_APP_BASE_API=/dev-api`

## 规则

| 类型 | 前缀 | 示例 |
|------|------|------|
| 业务 API（经网关转发） | `/dev-api/forward/seccenter/v2` | `POST /user/list`、`/user/create`、`/user/delete` |
| 认证/直连 | `/dev-api/direct/seccenter/v2` | `POST /auth/loginSetting` |

**错误**：`/dev-api/seccenter/v2/...`（缺 `forward`/`direct`）

## 响应体

```javascript
// 统一解析
const data = json.result !== undefined ? json.result : json.data !== undefined ? json.data : json;
// 业务成功：json.code === 0（若存在 code 字段）
```

## 本会话用到的接口

| 方法 | 路径 | 用途 |
|------|------|------|
| POST | `/role/list` | 取默认角色 id |
| POST | `/user/create` | 邮箱激活(2) / 密码直设(1) |
| POST | `/user/list` | 分页列表 |
| POST | `/user/delete` | 单用户删除 |
| POST | `/auth/loginSetting` | 密码传输加密公钥 |

## Cookie

所有 `fetch` 须 `credentials: 'include'`，依赖已登录 session。

## 密码直设

1. `loginSetting.encryptPasswordInTransit === true` 时用 JSEncrypt + `encryptPasswordPubKey`
2. 否则明文传入 `password` 字段
