# 诊断失败原因

按现象查 `references/common-failures.md`，再收窄：

## 决策树

1. **OpenCLI / CDP**
   - disconnected → 勿 eval 内跳转
   - 找不到 DOM → bind / 换 API 脚本

2. **API**
   - 404 → `api-paths.md` forward/direct
   - BIZ → message + 重复数据

3. **权限 UI**
   - 无新增 → `sys:user:add` + 重登
   - 有 perm 无按钮 → 显示兜底 / isVisible
   - 只有编辑 → 他人行是否存在 + isCurrentUser

4. **数据**
   - 人数不对 → 分页 list + 租户是否一致

## 输出模板

```markdown
### 现象
### 已排除
### 根因
### 下一步（脚本/代码/重登）
```
