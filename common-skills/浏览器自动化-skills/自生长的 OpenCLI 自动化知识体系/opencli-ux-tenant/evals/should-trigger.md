# should-trigger — 应该触发本 skill 的场景

## 全流程回归

```text
用户: "帮我跑一下租户管理的测试"
→ 触发 full_flow → 判断执行场景 → 执行全流程
```

```text
用户: "在 cloud 环境测一下租户创建和删除"
→ 触发 full_flow，targetProfile=cloud → 判断执行场景 → 执行全流程
```

## 仅清理租户

```text
用户: "帮我删掉测试租户 tenant0529"
→ 触发 delete_only → 判断执行场景 → 执行搜索删除
```

## 环境自检

```text
用户: "帮我看看租户测试的环境是不是好的"
→ 触发 preflight → 判断执行场景 → bash run-e2e.sh --check
```

## 失败诊断

```text
用户: "跑失败了，报错 opencli doctor"
→ 触发 diagnose → 诊断失败原因 → 查 common-failures.md → 建议修复
```
