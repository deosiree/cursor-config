# 编排-权限E2E测试 — 测试计划输出模板

## 测试目标

- `testGoal`
- `totalPerms`：<N> 个权限点
- `strategy`：逐个 / 批量 / 负向

## 测试计划

| 轮次 | 策略 | 勾选 perm | 取消 perm | 验证重点 |
|------|------|----------|----------|---------|
| 1 | 负向 | — | 全部 | 所有入口不可见/不可访问 |
| 2 | 逐个 | sys:dashboard:view | — | 首页正常渲染 |
| 3 | 逐个 | sys:tenant:query | — | 租户列表加载 |
| 4 | 批量 | sys:tenant:query, sys:tenant:add | — | 无交互干扰 |

## 每轮结果

| 轮次 | 通过 | 失败 | 跳过 | 备注 |
|------|------|------|------|------|
| 1 | 5 | 0 | 0 | 负向基线确认 |
| 2 | 1 | 0 | 0 | — |
| ... | | | | |

## CSV 落盘

- `csvPath`：<路径>
- `totalCases`：<N>
- `externalSkillUsed`：`输出csv的测试用例`

## 结论

- `overallStatus`：全部通过 / 部分失败 / 全部失败
- `failedPerms`：<失败 perm 清单>
- `recommendation`：<下一步建议>
