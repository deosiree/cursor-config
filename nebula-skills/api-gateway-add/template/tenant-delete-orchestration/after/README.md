# after（真实源码）

- **仓库**：`apex_dev`
- **目标提交**：`f734a7b84f7014b22fadde9444a5940e5c7adad3`
- **提交说明**：`fix(gateway): 租户管理：删除租户的同时解绑租户的所有设备`
- **来源命令**：`git show f734a7b:<path>`

## 文件清单

| 路径 | 说明 |
|------|------|
| `src/gateway/device/device.gateway.ts` | 新增 `unbindAllByTenantId`；原子方法包 `handleGatewayError`；`TenantGateway` 改动态 import |
| `src/gateway/system/tenant/tenant.gateway.ts` | `deleteV2` 先解绑再删；`ProjectGateway` 改动态 import |
| `src/views/tenant/index.vue` | 确认文案与解绑行为对齐 |

阅读顺序：本目录 `SKILL.md` → 上表源码文件；细则见 `[[../../feature-skills]]` 与 `[[../../references/gateway-orchestration.md]]`。
