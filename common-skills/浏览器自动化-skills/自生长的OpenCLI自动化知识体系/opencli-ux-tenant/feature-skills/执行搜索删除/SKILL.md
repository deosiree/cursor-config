---
name: 执行搜索删除
description: 仅执行步骤 7-10：搜索已有租户 → 删除 → 再搜索确认。
---

# 核心任务

对已存在的租户执行：搜索定位 → 打开操作列"更多" → 删除 → 确认弹窗 → 空列表校验。

## 何时触发

- `intention-skills/判断执行场景` 输出 `selectedFlow=delete_only`
- 用户明确说"帮我删掉某个租户"或"清理测试数据"

## 输入 / 前置条件

- `selectedProfile` — 环境名
- `tenantName` — 要删除的租户名
- `confirmed` — 用户已确认删除操作
- 已登录 session（需提前执行 login.sh 或 `--skip-login`）
- 目标租户在列表中确实存在（否则步骤 7 断言会失败）

## 执行前二次确认

```text
⚠️ 即将在 {selectedProfile} 环境执行删除操作：
  租户名: {tenantName}
  操作:   搜索 → 删除 → 确认
这是一个 **不可逆的删除操作**！
确认继续？(y/N)
```

用户明确确认后才执行。这是数据安全门禁。

## 执行命令

```bash
cd opencli-ux-tenant

# 跳过登录，直接删除
bash tenant-search-delete.sh --profile <selectedProfile>

# 带登录（session 不存在时）
# 先执行 login.sh，再执行 tenant-search-delete.sh
bash login.sh --profile <selectedProfile>
bash tenant-search-delete.sh --profile <selectedProfile>
```

## 输出

- 标准输出：步骤 7-10 日志 + 最终断言结果
- 退出码：
  - `0` — 全部通过
  - `1` — 脚本内部错误
  - `2+` — 测试断言失败（步骤 7 或 10）
- 失败时：`screenshots/die-{时间戳}.png + .txt`

## 参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--profile NAME` | `local` | 环境配置名 |
| `--check` | - | 自检模式 |

## 边界

- 不负责创建租户（交给 `执行全流程`）
- 不负责诊断失败原因（交给 `诊断失败原因`）
- 如果租户不存在，步骤 7 断言会失败 → 路由到 `诊断失败原因`
