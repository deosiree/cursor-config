# 合并权限点到菜单树 — 输出模板

## 合并摘要

| 项目 | 数量 |
|------|------|
| 新增 page | <N> |
| 新增 function | <N> |
| 跳过重复 function | <N> |
| 保留已有节点 | 全部 |

## 新增节点清单

| 节点名 | 类型 | route_path / code | 来源 |
|--------|------|------------------|------|
| 状态管理 | page（hidden） | /Apex/_state | 补丁 |
| 个人中心 | page（hidden） | /Apex/profile | 补丁 |
| 查看首页 | function | sys:dashboard:view | 补丁 |

## 合并后菜单树

```yaml
# 完整菜单树 YAML
```
