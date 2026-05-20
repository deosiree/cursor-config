# before（真实源码）

- **仓库**：`apex_dev`
- **基线提交**：`f734a7b84f7014b22fadde9444a5940e5c7adad3^`（`commit^`）
- **来源命令**：`git show f734a7b^:<path>`

## 文件清单

| 路径 | 说明 |
|------|------|
| `src/gateway/device/device.gateway.ts` | 无 `unbindAllByTenantId`；`getBind`/`deviceActivate` 直连 API；静态 `import TenantGateway` |
| `src/gateway/system/tenant/tenant.gateway.ts` | `deleteV2` 仅调用 `TenantAPI.deleteV2`；静态 `import ProjectGateway` |
| `src/views/tenant/index.vue` | 删除确认文案为「确定删除租户?」 |

阅读顺序：本目录 `SKILL.md` → 上表源码文件。
