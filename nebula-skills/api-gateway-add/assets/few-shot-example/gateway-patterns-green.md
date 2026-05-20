# GREEN 输出示例 — 通则一（多项目菜单导出）

**非租户域**，说明通则一同样适用。

## 1. 现状链路

- 页面勾选多 `projectId` → 需多个菜单树文件
- 契约已有单项目 `exportMenuTree`；`MenuGateway.exportMenuTree` 已为**原子**（内包 `handleGatewayError`）

## 2. 最小改动边界

- 优先不新增 swagger：新增**集成** gateway `exportMenuTreesByProjectIds`
- 若后端提供批量接口，再评估类型 A 新增 api

## 3. 四层改动清单

| 层 | 改动 |
|----|------|
| api | 无（循环调既有原子） |
| types | 可选 `MenuExportBatchQuery` |
| gateway | **集成** `exportMenuTreesByProjectIds`：for 循环 `await MenuGateway.exportMenuTree(...)`，**不**包整段 `handleGatewayError` |
| business | 调集成方法一次 |

## 4–6. 风险 / todolist

- 某一项目导出失败：由原子层 toast 并中断；已生成文件是否保留由产品定
- **禁止**在集成方法外包 `handleGatewayError` 且内部再调已包原子的 `exportMenuTree`

印证样本（通则一+二）：`[[../../template/tenant-delete-orchestration/]]`
