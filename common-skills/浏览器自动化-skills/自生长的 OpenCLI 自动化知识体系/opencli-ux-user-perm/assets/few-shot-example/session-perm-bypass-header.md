# Few-shot：isOwner bypass + Header 个人中心 OpenCLI 验收

> 2026-06-02 · admin@system.local · localhost:8080 · 登录后**不 reload**

## 用户 prompt

「用 OpenCLI 测一下登录后个人中心是否出现，并查 isOwner bypass 为什么失效。」

## Agent 应做

1. `opencli doctor`
2. 打开 `/cloud/login`，必要时清空 `sessionStorage.userInfo`
3. `state` → ref 登录 → 等待跳转
4. eval session：`isOwner === true`
5. 点击用户下拉 → eval：`profileVisible: true`（**未** `location.reload()`）
6. 若失败：读 `perm-bypass-isOwner-pitfalls.md` 区分 session 缺失 vs computed 缓存

## 关键输出示例

```json
{"url":"http://localhost:8080/cloud/Apex/dashboard","isOwner":true,"username":"admin"}
{"profileVisible":true,"logoutVisible":true}
```

## 勿做

- 对 `open browser` 加 `--format json`（不支持）
- 登录后用 reload 验收 Header（会掩盖 computed 缓存 bug）
- 用邮箱推断 bypass（必须以 `isOwner===true` 为准）
