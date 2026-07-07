---
name: 质量-手工自测门禁
description: curl 快验 + 8081 浏览器 checklist；权限 pending 时仅跑 curl 门禁。
---

# Feature：质量-手工自测门禁

## 何时触发

- mock + README 交付前强制检查

## 门禁清单

### G1 — 环境

- [ ] `.env.development.local` 含 `VITE_MOCK_DEV_SERVER=true`
- [ ] `pnpm dev` 监听 profile `devPort`（默认 8081）

### G2 — curl mock 命中

对每个新用例：

```bash
curl -X POST "http://localhost:{devPort}{apiBasePath}/{mock_path}" ...
```

- [ ] `active` 设为该用例 `scenario_active` 时 `code === mock_error_code`
- [ ] 其他 `active` 时该端点不返回该错误（或返回成功 mock）

### G3 — 文档

- [ ] 每 case 有 `automation/{id}.md`
- [ ] workflow 存在且含 7 节固定章节（见 [[../../references/手工自测流程-8081注入权限.md]]）
- [ ] 用例 README **未**重复粘贴完整注入脚本

### G4 — 浏览器（perm_status: ok 时）

- [ ] 8081 URL 可访问（已注入权限）
- [ ] UI 预期与 CSV 一致（toast / 不白屏 / 弹窗不关）
- [ ] Network 中 `code` 为 mock 错误码

### G4-blocked — perm_status: pending_human

- [ ] README 标 blocked
- [ ] registry `perm_status: pending_human`
- [ ] **不**宣称浏览器门禁通过

## 失败处理

| 失败 | 动作 |
|------|------|
| curl 返回 code:0 | 查 forward 路径、env 开关、端口 |
| 页面真实数据 | 确认非 8080 |
| 权限页 | 执行 workflow 第 4 节或等人类确认 perms |

## 输出

```yaml
qualityReport:
  passed: true|false
  curlChecks: [{ case_id, ok }]
  browserChecks: [{ case_id, ok|blocked|skipped }]
  violations: []
```

## 使用示例

```text
对 3545/3570/3571 跑 curl 三场景切换门禁。
```
