---
name: 编排-指定分类保留还原
description: 当 rollbackMode=keep_classify_restore 时，从服务器/all-databases dump 抽出单库，临时库保留指定分类子树+闭包后灌入本机，再打完好单库备份。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql, keep_classify_restore]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

从 **verify 绿** 的 dump（常为服务器 `--all-databases`）还原本机库，**仅保留**指定部门下命名分类的子树及其产品/词条/译文闭包。

## 何时触发

- `分析-回滚模式判定` 输出 `rollbackMode=keep_classify_restore`
- 口令示例：「用服务器备份还原通用平台部的 mon-cn-1.9.0 和 develop」

## 输入 / 前置条件

| 参数 | 说明 | 默认 |
|------|------|------|
| `DumpPath` | 源 dump（all-databases 或已抽出单库） | 必填 |
| `Department` | 部门名 | `通用平台部`（脚本内 UTF-8 默认；可用 `-`） |
| `ClassifyNames` | 分类名列表 | `mon-cn-1.9.0`,`develop` |
| `Force` | 破坏性确认 | 必须 |

## 执行顺序

```text
1. verify-dump-encoding          → 失败则中止
2. 若 all-databases              → extract-database-from-all-dump（禁止直灌）
3. rewrite_dump_database         → USE→临时库 + 消毒 @OLD_TIME_ZONE=NULL 尾部
4. 可选 pre_keep_classify 备份本机
5. 导入临时库 translationtool_import_full
6. inspect-classify-keep         → 两分类必须命中，否则中止
7. keep_classify_ops apply        → 子树+闭包 prune
8. mysqldump 临时库 → restore-database → translationtool
9. DROP 临时库；backup after_keep_mon_cn_develop
10. inspect 对照 before/after
```

脚本：[`../../scripts/restore-keep-classifies.ps1`](../../scripts/restore-keep-classifies.ps1)

```powershell
$skill = "…\translateTool-skills\db-回滚数据库"
$root  = "…\translationtool"
& "$skill\scripts\restore-keep-classifies.ps1" -ProjectRoot $root `
  -DumpPath "$root\db\backup-scripts-and-latest\mysqlBackup\backup-….sql" `
  -ClassifyNames @("mon-cn-1.9.0","develop") -Department "-" -Force
```

## 人工门禁

| 条件 | 动作 |
|------|------|
| 未 `-Force` / 用户未确认会替换本机库 | 禁止执行 |
| 分类名在 dump 中不存在 | **中止**，不灌半残库 |
| dump 为 all-databases | 必须 extract；禁止 `restore-database.ps1` 直吃整文件 |

## 边界

- **不做**：Windows 复刻 `mysqldump >`；静默删备份；自动 scp 多节点。
- 配置表（user/role/menu/…）随单库全量保留；业务树只留 keep 闭包。
- `-SkipImport`：仅当临时库已完整导入、需从 prune 续跑时使用。
