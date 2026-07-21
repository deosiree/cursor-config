---
name: 对照可迁移能力
description: 对照 references/可迁移能力.md 勾 P0–P2 缺口，输出 gapChecklist。触发词：对照能力、缺口清单、P0 P1 P2。
---

# 对照可迁移能力

## 输入

- `discoveryTable.existingHarness`
- `mode`：`none` | `legacy` | `audit-only`
- SSOT：`[[../../references/可迁移能力.md]]`

## 步骤

1. 逐条能力标 `有|无|部分`  
2. `none`：P0 全「无」的 action=新建；P1 默认建议审查导览+质量 Loop  
3. `legacy`/`audit-only`：仅「无|部分」写 action；「有」action 为空  
4. 不把样例特例行加入清单  

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 清单过期 | 提示走同步 skill 收益 | 仍按现表勾，注明版本风险 |
| 把业务规则当能力勾选 | 删除该行 | 交提炼条目节点 |

## 输出

```yaml
gapChecklist:
  - { capability: "P0-宪法", status: "有|无|部分", action: "" }
```
