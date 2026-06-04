# 菜单导入 API 参考

## 导入端点

```
POST {apiBase}/menu/project/import
Content-Type: application/json

{
  "menuTree": <菜单树对象>,
  "dry_run": true | false
}
```

## Dry Run

```json
{
  "menuTree": { ... },
  "dry_run": true
}
```

- 仅验证不写入
- 检查 ID 有效性、字段完整性、层级关系
- 成功时返回验证通过信息
- 失败时返回具体错误（ID 无效 / 字段缺失 / 重复 code）

## 正式导入

```json
{
  "menuTree": { ... },
  "dry_run": false
}
```

- dry_run 通过后再执行
- 写入数据库
- 建议备份当前菜单树后再操作

## 常见错误

| 错误 | 根因 | 修复 |
|------|------|------|
| `菜单 xxx 的 ID 无效: 0` | function 缺少 id | 通过 API 查询/创建获取 ID 后回填 |
| `[100000]未知错误` | 通用后端错误 | 检查 dry_run 响应的详细错误信息 |
| `code 重复` | 同 code 的 function 已存在 | 检查是否与已有树冲突 |
| 导入成功但菜单不显示 | 角色未分配新 perm | 进入角色管理勾选新 perm |
| 导入成功但某节点不显示 | `parent_id: null`，节点失去父子关联 | 检查并回填 `parent_id` 为父节点真实 ID |
