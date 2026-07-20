---
name: 替换-消费者引用
description: 在业务仓删除本地可复用核、改为 @nebula/ui 引用并升版。Use when 替换 GuardedSecretInput、升 @nebula/ui、删本地组件。
---

# 替换-消费者引用

## 何时使用

- 编排步 6：`consumers` 非空且库组件已可用（link 或已发版）

## 何时不要使用

- 业务壳（PwdField 等）→ **保留**，只换其对内核的引用
- 用户未授权改该业务仓 → STOP

## GREEN

1. `package.json`：`@nebula/ui` 版本对齐（link 时跟随本地；发版则 bump）。
2. grep 旧组件名 / 旧路径；模板改为 `NeSecretInput`（或目标名）。
3. 若宿主已 `app.use(NebulaUI)`，可去掉多余 import，直接用全局组件；按需 import 亦可。
4. 删除本地「核」文件；壳文件只改 import。
5. 跑该仓 `pnpm type-check`（或项目等价命令）。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| grep 仍有旧路径 | 清残留 | 列 `leftoverLocalRefs` 给人 |
| 类型找不到 Ne* | 确认导出与版本 | 重建 link + dist |
| 双仓并行冲突 | 拆两个 PR/commit | 先改一仓 |

## 输出

- `consumersUpdated[]`
- `leftoverLocalRefs[]`
- `typeCheckOk`

## 使用示例

```text
apex_dev 删除 GuardedSecretInput，改用 @nebula/ui 的 NeSecretInput；PwdField 留仓。
```
