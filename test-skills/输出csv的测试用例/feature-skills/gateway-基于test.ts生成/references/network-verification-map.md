# Network 请求体验证对照

## 常见断言 → 测试步骤

| 代码断言 | UI/Network 验证方式 |
|---------|-------------------|
| `expect(payload.projectId).toBe("51")` | F12 Network → 查看 create/update 请求体 projectId 字段 |
| `expect(payload.isVisible).toBe(false)` | F12 Network → 查看请求体 isVisible |
| `expect(result).toEqual({...})` | 表单回显 → 查看各字段值与预期一致 |
| `expect(localStorage.getItem).toHaveBeenCalledWith("key")` | F12 Application → localStorage 查看 key |
| `expect(spy).toHaveBeenCalledWith(...)` | 根据 spy 目标选择验证方式 |

## 正向/反向用例设计

| 断言形态 | 预期格式 |
|---------|---------|
| `toBe("51")` | `正向：projectId 为 "51"` |
| `toBeNull()` | `反向：projectId 仍为 PROJECT--51` |
| `toBe(true)` vs `toBe(false)` | `正向：开关为开/true` / `反向：开关为关/false` |
| `toHaveLength(n)` | `正向：列表含 n 项` |

## 注意

- 不写 `expect` 或 `assert` 到步骤描述中
- 步骤用 UI 语言：进入/点击/查看/F12 Network
