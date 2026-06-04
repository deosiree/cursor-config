---
name: 编排-权限E2E测试
description: OpenCLI 双会话权限 E2E 编排：通用 perm 循环+CSV 落盘；菜单管理 8 场景走 node 脚本。触发词：权限E2E、双会话测试、菜单管理e2e、perm落盘CSV。
---

# 编排-权限E2E测试

## 路由决策（先读）

| 用户意图 | 进入 |
|---------|------|
| 任意 perm 列表、要 CSV 落盘、多轮配置组合 | 本节点 **通用循环**（下方 GREEN） |
| 「菜单管理」「8 场景」「S1~S8」「功能项依赖链」 | `[[../../feature-skills/菜单管理功能项依赖链验证]]` → **`node scripts/run-all.node.js`** |
| 仅首次搭双 profile / 双登录 | `[[../../feature-skills/双会话OpenCLI环境初始化]]` |
| 单轮 admin 配角色 + test 验证（非菜单矩阵） | `[[../../feature-skills/OpenCLI双会话权限验证]]` |

## RED

- 没有本节点时，agent 容易把"配置→验证→落盘→换配置再验证"的循环压成一次性操作
- 常见失败：
  - admin 配置角色后未等待生效就切到 test 用户验证
  - test 用户未重新登录（sessionStorage 残留旧权限），验证结果不可信
  - 每轮权限配置之间未清理状态，上一轮的 perm 残留影响下一轮
  - 验证结果直接丢弃，未落盘为可审计的 CSV

## 输入契约

- `测试权限点列表`：必填（本轮要验证的 perm 清单）
- `admin 凭据`：默认 `admin@system.local / 123456`
- `test 用户凭据`：默认 `13813815913 / 123456`
- `测试角色名`：默认 `权限测试角色`
- `targetUrl`：默认 `http://localhost:8080`
- `CSV 输出路径`：必填

## GREEN

### 工作循环

每轮测试一个权限配置组合：

```
1. 决定本轮配置：从测试权限点列表中选择本轮要勾选的 perm
2. Session A：admin 登录 → 角色管理 → 为"权限测试角色"勾选/取消本轮 perm → 保存
3. Session B：test 用户清空 sessionStorage → 重新登录 → 逐页验证
4. 记录结果（通过/失败 + 实际行为）
5. 落盘 CSV
6. 决定是否继续下一轮
```

### 配置组合策略

| 策略 | 说明 |
|------|------|
| 逐个测试 | 每轮只配 1 个 perm，隔离验证 |
| 批量测试 | 每轮配 N 个 perm，验证交互影响 |
| 负向测试 | 全部取消 → 验证所有入口不可见 |

### 停止条件

- 所有测试权限点已完成验证
- 用户指定的轮数已到
- 连续 3 轮失败（排查环境问题）

## 输出契约

- `testPlan`：本轮测试计划（哪些 perm 被勾选/取消）
- `verificationResults`：逐 perm 验证结果
- `csvPath`：落盘的 CSV 路径
- `nextRoundDecision`：继续下一轮 or 停止

## REFACTOR

- 若 admin 配置后未等待就切 test 用户，补「配置保存后必须等 2 秒 + 确认 toast」的硬等待
- 若 test 用户未清空 sessionStorage 就登录，补「每次切用户前必须清空 sessionStorage」的强制步骤
- 若 CSV 落盘被跳过，补「每轮验证后必须立即落盘，不积累到最后一轮」的强制要求
- 若配置组合退化为全量勾选/全量取消（缺少中间态），补混合配置策略

## 使用示例

```text
我要对 sys:dashboard:view、sys:tenant:query、sys:tenant:add 三个权限点做 E2E 测试，
用 admin 在角色管理配置"权限测试角色"，然后用 13813815913 登录验证，结果落盘到 docs/问题单/0605/perm-e2e.csv。
```

```text
先全部取消"权限测试角色"的所有权限，验证负向用例，再逐个勾回验证正向用例。
```

```text
直接用菜单管理跑一遍 E2E 测试，8 个场景全过一遍。
```

---

### 菜单管理 8 场景（专用路径）

> 不要手搓 opencli 逐步点。**直接执行 node 脚本**（任何 skills-compatible agent 均可跑 shell）。

**自然语言触发**（交给 agent 读 skill 后执行）：

```text
直接用菜单管理跑一遍 E2E 测试，8 个场景全过一遍。
只运行场景 6（查询+编辑），验证编辑按钮和权限配置入口。
```

**命令（项目根或 skill 的 scripts/ 目录）**：

```bash
cd .cursor/nebula-skills/gen-perms-apis/feature-skills/菜单管理功能项依赖链验证/scripts
node run-all.node.js
node run-all.node.js --only 6,7,8
node run-e2e-scenario.node.js ../scenarios/08-query-edit-configapi.json
```

**前提**：双 profile 已连接；`localhost:8080` 运行中；「权限测试角色」已分配给 huiyan。

**引用链路**：

```
编排-权限E2E测试
  └→ OpenCLI双会话权限验证（通用策略：清空/重登/sessionStorage）
       └→ 菜单管理功能项依赖链验证（scenarios/ + node 脚本 + examples/）
```

场景矩阵与 JSON 契约见 `[[../../feature-skills/菜单管理功能项依赖链验证]]`（不在此重复）。
