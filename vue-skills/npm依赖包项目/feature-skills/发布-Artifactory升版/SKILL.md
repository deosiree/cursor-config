---
name: 发布-Artifactory升版
description: 准备 @nebula/ui 的 build、version、CHANGELOG 与 publish 命令；不擅自执行 publish。Use when 发版、Artifactory、npm publish、升版。
---

# 发布-Artifactory升版

## 何时使用

- `taskKind=publish`
- 发版前检查清单

## 🔴 CHECKPOINT · STOP

**禁止**在未经用户明确同意时执行 `npm publish` / `pnpm release`。

## GREEN（准备）

1. `CHANGELOG` 与 `package.json` version 已对齐。
2. `pnpm build` 成功；抽查 dist 含新组件。
3. 确认 `publishConfig.registry` 指向 Artifactory。
4. 输出给人执行的命令：

```bash
cd nebula-ui
pnpm build
npm publish
# 或 pnpm release
```

5. 列出消费者应 bump 的版本范围（如 `^1.0.4`）。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| publish 403 | 凭证/权限 | 人工找管理员 |
| 发错 registry | 核对 publishConfig | 勿用公网 npm |

## 输出

- `publishChecklist`
- `suggestedConsumerRange`
- `executedPublish`: 必须为 `false`（除非用户本轮授权）

## 使用示例

```text
准备发布 @nebula/ui 1.0.4，给出检查清单与命令，不要直接 publish。
```
