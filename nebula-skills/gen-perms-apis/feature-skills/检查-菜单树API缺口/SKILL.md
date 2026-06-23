---
name: 检查-菜单树API缺口
description: 按默认6模块（首页/租户/用户/角色/安全配置/菜单管理）对比 apex_dev 源码真实 API 与菜单树 YAML，输出 P0/P1 缺口报告。触发词：检查菜单API缺口、全局检查API、gen-perms-api-gap、菜单树API遗漏、按范围检查API。个人中心默认排除（白名单）。
---

# 检查-菜单树API缺口

## TL;DR

1. **默认走脚本**：`node scripts/check-menu-api-gap.node.js --repo <apex_dev> --menu <菜单树.yaml> --scope default --out <report.md>`
2. 脚本 exit `0`=无 P0；`1`=有 P0；`2`=输入错误
3. 个人中心 `/Apex/profile` **不检查**（全局白名单）
4. 与 `扫描源码权限点与API` 区分：本 skill = **轻量 diff 报告**；全量扫描 = 完整盘点文档

## RED

没有本 skill 时最容易错在：

1. 只查 `v-hasPerm` 挂点，漏掉 **create 提交链路**（如 `role/create` 已配但 `assignMenuPermissions` 未配）
2. 用 regex 切 YAML 导致 perm 串块、误报/漏报
3. 把个人中心纳入检查，与白名单策略冲突
4. 以菜单树现有绑定为真源，而非源码真实调用
5. 查到 gateway 即停，未追到 `/seccenter/v2/*` 业务路径

## 输入契约

| 参数 | 默认 | 说明 |
|------|------|------|
| `targetRepo` | `apex_dev` | 只读 apex_dev |
| `menuTreeYaml` | `docs/menu/菜单树_0623_platform.yaml` | nebula 根相对或绝对路径 |
| `focusModules` / `--scope` | `default` | 见 `[[references/scope-defaults.md]]` |
| `excludeRoutes` | `/Apex/profile` | 白名单页面 |

## GREEN：执行顺序

### Step 1 — 跑脚本（确定性 diff）

> **pnpm 环境**：`yaml` 非 apex_dev 直接依赖时，脚本从 `node_modules/.pnpm/yaml@*/` 加载。

```bash
cd feature-skills/检查-菜单树API缺口
node scripts/check-menu-api-gap.node.js \
  --repo F:/Documents/Repertory/Sieyuan/nebula/apex_dev \
  --menu F:/Documents/Repertory/Sieyuan/nebula/docs/menu/菜单树_0623_platform.yaml \
  --scope default \
  --out F:/Documents/Repertory/Sieyuan/nebula/apex_dev/docs/plans/菜单树API缺口检查_<YYYYMMDD>.md
```

### Step 2 — 脚本失败 fallback

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| `yaml` 包找不到 | 在 `targetRepo` 执行 `npm install` | 报告 blocker，**禁止**宣称无遗漏 |
| page route 未找到 | 核对菜单树是否已导入该 page | 写入报告「待人工确认」 |
| gateway 未映射 | 查 `scripts/check-menu-api-gap.node.js` 的 `GATEWAY_API_MAP` 补映射后重跑 | agent 手工反查 api-backtrace-rules |
| P0 出现 | 对照 `[[references/cross-perm-patterns.md]]` 建议归属 perm | 生成 YAML 补丁建议，不擅自改菜单树 |

### Step 3 — agent 语义补全（脚本之后）

1. 对 P0 项给出 **建议归属 perm** + 源码锚点（文件:行）
2. 对 P1 stale `/api/v2/*` 给出删除建议
3. 对 `unmappedGateway` 列表评估是否需扩展映射表

### Step 4 — 输出

- Markdown 报告 → `<targetRepo>/docs/plans/菜单树API缺口检查_<date>.md`
- 结构参考 `[[template/sample-run/gap-report.md]]`

### Step 5 — 新需求手动补 API

脚本报 P0 或开发新功能后，按 `[[references/manual-add-api.md]]`：

1. 反查 views → gateway → 业务 URL
2. 按 `v-hasPerm` / 提交链路决定挂哪个 perm
3. 改菜单树 YAML 的 `apis[]`（或新建 function）
4. dry_run 导入 → 重跑脚本 → 测试账号验证

## 结果分级

| 级别 | 定义 | 动作 |
|------|------|------|
| **P0** | 源码有调用，该 page 下所有 function 均未收录此 API | 必须补菜单树 |
| **P1** | 菜单含 `/api/v2/*` 等前端未用 stale 路径 | 建议删除 |
| **INFO** | API 已收录但 perm 归属可优化 | 可选调整 |

## 跨 perm 模式

详见 `[[references/cross-perm-patterns.md]]`。常见：`sys:role:add` 需 create + assignMenuPermissions + assignDevices + menu/tree；`sys:user:query` 需 list + config/security/detail + role/list。

## 🔴 CHECKPOINT

- 脚本 exit `1`（有 P0）→ **停止**，输出补丁建议，等用户确认后再改 YAML
- 发现新的跨 perm 模式 → 更新 `cross-perm-patterns.md` 与 `GATEWAY_API_MAP`

## 反例黑名单（禁止）

| # | 不要做 | 替代 |
|---|--------|------|
| 1 | 用 regex 从 YAML 切 perm 块 | 用脚本 yaml 树解析 |
| 2 | 检查 `/Apex/profile` | 默认 exclude，除非用户显式要求 |
| 3 | 以菜单树为真源 | 以源码 gateway→api 为真源 |
| 4 | 脚本失败仍输出「无遗漏」 | 报告 blocker |
| 5 | 跳过 gateway 层反查 | 三类链路见 `[[../../references/api-backtrace-rules.md]]` |

## 与 sibling skill 边界

| skill | 何时用 |
|-------|--------|
| **本 skill** | 已知菜单树 + 默认 6 模块，快速 diff |
| `扫描源码权限点与API` | 尚无盘点文档，需全路由递归梳理 |
| `设计权限点与API映射` | 需新建 perm 粒度决策 |
| `菜单管理功能项依赖链验证` | 菜单 E2E 运行时验证 |

## 使用示例

```text
用默认 6 模块检查 apex_dev 与 菜单树_0623_platform.yaml，个人中心跳过。
```

```text
只检查角色管理和用户管理两个模块的 API 缺口。
```

预期：`--scope 角色管理,用户管理`
