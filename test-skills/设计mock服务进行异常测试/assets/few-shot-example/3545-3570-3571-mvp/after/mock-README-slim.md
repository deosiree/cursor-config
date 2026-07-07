# CSV 异常 UI Mock（本地）

> 完整自测流程：[`../hytests/docs/workflow.md`](../hytests/docs/workflow.md)

## 环境

`.env.development.local`：`VITE_MOCK_DEV_SERVER=true`  
场景切换：`.mock-shared/error-scenario.json` → `active`

## 用例索引

| 用例 ID | active | 页面（8081） | 说明 |
|---------|--------|--------------|------|
| 3545 | `3545` | `/cloud/Apex/system/user` | 用户列表失败 |
| 3570 | `3570` | `/cloud/Apex/system/role` | 角色创建业务错误 |
| 3571 | `3571` | `/cloud/Apex/system/role` | 角色列表失败 |

实现文件：`csv-error.mvp.mock.ts`（gitignored）
