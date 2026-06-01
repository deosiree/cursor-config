---
name: 租户管理UX自动化测试
description: 当需要基于 OpenCLI browser 对 nebula 租户管理做 CRUD 全流程自动化验证时使用。支持登录、创建、搜索校验、删除、环境自检和失败诊断。
---

# 目标

基于 OpenCLI browser 驱动 Chrome 浏览器，自动完成 nebula 租户管理模块的端到端验证：**登录 → 打开租户页 → 新增 → 填写表单 → 关联项目 → 提交 → 搜索校验 → 删除 → 空列表校验**。

## 何时使用

- 需要在 local / cloud / t-cloud 等环境做租户 CRUD 回归验证
- 需要先登录 microfb 再操作租户页
- 需要诊断自动化测试失败原因（截屏 + DOM dump）

## 何时不要使用

- 只需要手动登录一次，不需要自动化流程
- 业务需求和租户管理无关
- 没有 Chrome 或 OpenCLI 可用

## 输入契约

尽量提供：
- `targetProfile` — 用哪个环境（local / cloud / t-cloud / ip-47 / phone-user）
- `targetTenant` — 租户名（可选，默认 tenant0529）
- `skipLogin` — 是否已登录
- `flowScope` — 全流程（1-10）还是仅删除（7-10）

## RED — 先识别失败基线

1. 典型用户需求："帮我测一下租户创建好不好使" / "跑一下租户回归"
2. 当前套件容易漏掉：
   - 远程环境密码未配置（CHANGE_ME）
   - 图形验证码/MFA 导致登录阻塞
   - 目标环境无 `test_plat` 项目
3. 误触发 / 不触发主要原因：
   - 用户只想要手动指导，而非自动化执行
   - 环境未准备好（服务未启动、opencli doctor 未通过）
4. 产物结构最不稳定的部分：
   - 远程环境连通性（网络/VPN）
   - 验证码处理策略（auto/manual/bind-only）

## GREEN — 任务分类与路由

### 任务分类

| 类型 | 对应场景 |
|------|---------|
| `full_flow` | 全流程：登录 + 创建 + 校验 + 删除 |
| `delete_only` | 仅删除：搜索已有租户 → 删除 → 确认 |
| `preflight` | 自检：诊断环境配置，不执行测试 |
| `diagnose` | 排查：查看 screenshots/ 目录分析失败原因 |

### 路由

- `preflight` → `[[intention-skills/判断执行场景/SKILL.md]]` → 执行 `bash run-e2e.sh --check`
- `full_flow` → `[[intention-skills/判断执行场景/SKILL.md]]` → `[[feature-skills/执行全流程/SKILL.md]]`
- `delete_only` → `[[intention-skills/判断执行场景/SKILL.md]]` → `[[feature-skills/执行搜索删除/SKILL.md]]`
- `diagnose` → `[[intention-skills/诊断失败原因/SKILL.md]]` → `[[feature-skills/诊断与清理/SKILL.md]]`

## REFACTOR

- SKILL.md 开始承载执行细节 → 应下沉到 feature-skills
- 新增 profile 时需要同步更新 intention-skills 的判断逻辑
- 脚本常见失败没有沉淀到 template/before/ 失效态模板
- intention-skills 节点偏少（仅 2 个），可考虑补充「评估是否可重试」节点

## 执行前确认步骤（必过）

在路由到任何 feature-skill 前，依次确认：

- [ ] **Profile 确认**：目标环境是 `{targetProfile}`，确认无误？
- [ ] **密码检查**：远程环境的 password 已覆盖（非 CHANGE_ME）？
- [ ] **opencli doctor 通过**：Chrome 桥接正常？
- [ ] **操作范围**：`{flowScope}` — 确认是这个范围？
- [ ] **租户名确认**：将要操作 `{tenantName}`，是这个名字？
- [ ] **风险确认**：（删除操作时）该租户的数据将被删除，确认继续？

任何一项未确认 → 停下来，列出未通过项，请用户确认后再执行。

## 人工门禁（强制停止）

以下情况必须先停下来，不允许自行决策：

- 目标 profile 的密码未配置（仍为 CHANGE_ME）
- 用户要求"修一下"但没说具体改什么（需先明确需求）
- 用户同时要求跑测试和改业务代码（应拆为两个任务）
- OpenCLI 未安装或 doctor 未通过
- 截图目录 screenshots/ 不存在（无法诊断失败）
- 远程环境不通（curl 超时或连接拒绝）

## 输出契约

每轮输出：
- `currentProfile` — 当前使用的 profile
- `flowResult` — 执行结果（通过 / 失败 / 部分）
- `failures` — 失败步骤及原因
- `screenshots` — 关联截图路径（如有失败）
- `nextAction` — 下一步建议（重试 / 换 profile / 查配置）

## 使用示例

```text
使用 租户管理UX自动化测试 跑一下 cloud 环境的全流程，租户名用 tenant-test-01
→ preflight → full_flow → 输出测试结果

使用 租户管理UX自动化测试 清理已存在的 tenant0529
→ delete_only → 确认删除成功
