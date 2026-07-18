---
name: 执行-产品挂载词条
description: 当需要把验数词条写入并归属到指定产品（含用户-产品绑定）时使用。
version: 1.0.0
tags: [工作台验数播种, translateTool-skills, product]
metadata:
  darwin:
    parent_skill: 工作台验数播种
---

# 核心任务

确保测试用户能看见产品，且 `t_entry_info` 的 `product_id` / `classify_id` 指向该产品（或产品分类树约定）。

## 何时触发

- `编排-工作台验数就绪` 步骤 3
- 用户：「给产品 admin 增加词条」

## 输入 / 前置条件

- `productId`（已确认存在）
- `entryMatrix` 或种子 SQL
- `userId` / 登录名（本地常用 `admin`）
- 表顺序：[[../../references/表写入顺序与关联.md]]

## 执行清单

1. **用户-产品绑定** `t_user_product`：`read=1`、`write=1`（无则 INSERT）
2. **词条归属**：`t_entry_info.product_id = productId`；`classify_id` 与产品约定一致（admin 产品种子常用 productId 同值）
3. 若用种子：执行 `seed-verify-syk-admin-product.sql` 中 entry + translate 段（可与步骤 4 同脚本）

```powershell
& "<skillRoot>\scripts\apply-workbench-verify-seed.ps1" -ProjectRoot "<ProjectRoot>" -SeedProfile syk_glossary
```

## 失败模式

| 触发 | 一线修复 | 仍失败 |
|------|----------|--------|
| 产品 id 在库中不存在 | 回分析节点核对 | 请用户先在 UI 建产品 |
| 用户看不到产品 | 补 `t_user_product` | 查部门/权限菜单 |
| 词条挂错 product_id | UPDATE 为 verifyTarget.productId | Human Loop |

## 输出 productMountResult

| 字段 | 说明 |
|------|------|
| `productId` | |
| `userProductBound` | bool |
| `entryIds` | 已挂产品的词条 id 列表 |

## 边界

- 不单独完成「进翻译阶段」（缺 relation / entry_state=3 时仍可能列表异常）→ 必须接步骤 4
- 不创建新产品实体（产品须已存在）

## 使用示例

```text
产品 a2128cfc-…（名 admin）挂上 4 条 VERIFY/SYK 词条，并绑定 admin 用户。
```
